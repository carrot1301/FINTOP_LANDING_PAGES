import { Injectable, UnauthorizedException, ForbiddenException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../../common/audit/audit.service';
import { MailService } from '../../common/mail/mail.service';
import { RedisService } from '../../common/redis/redis.service';
import { HashUtil } from '../../common/utils/hash.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { randomBytes, randomInt } from 'crypto';
import { RECORD_STATUS, AUDIT_SOURCE, ROLE_CODE } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  private async clearUserPermissionsCache(userId: number) {
    try {
      const cacheKey = `user:permissions:${userId}`;
      await this.redisService.getClient().del(cacheKey);
      this.logger.log(`Cleared permissions cache for user #${userId}`);
    } catch (err: any) {
      this.logger.error(`Failed to clear permissions cache for user #${userId}: ${err.message}`);
    }
  }

  generateRefreshToken(userId: number): string {
    const randomHex = randomBytes(40).toString('hex');
    const base64Id = Buffer.from(userId.toString()).toString('base64');
    return `${base64Id}:${randomHex}`;
  }

  async register(dto: RegisterDto, ipAddress: string, userAgent: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await HashUtil.hash(dto.password);

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          phone: dto.phone || null,
          dob: dto.dob ? new Date(dto.dob) : null,
          address: dto.address || null,
          investmentDuration: dto.investmentDuration || null,
          investmentStyle: dto.investmentStyle || null,
          stockCompany: dto.stockCompany || null,
          stockAccount: dto.stockAccount || null,
          referralId: dto.referralId || null,
          referralName: dto.referralName || null,
          status: RECORD_STATUS.ACTIVE,
          emailVerifiedAt: null, // Requires email verification
        },
      });

      const clientRole = await tx.role.findFirst({
        where: { code: ROLE_CODE.CLIENT },
      });

      if (clientRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: clientRole.id,
            assignedById: user.id,
          },
        });
      }

      return user;
    });

    // Generate and send verification OTP
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: newUser.id,
        code: otp,
        expiresAt,
      },
    });

    // Dev mode logging to help local testing when SMTP is delayed/blocked
    this.logger.log(`[DEV ONLY] Verification OTP for ${dto.email} is: ${otp}`);

    // Send OTP email (non-blocking)
    this.mailService.sendVerificationOTP(dto.email, otp, dto.fullName).catch((err) => {
      this.logger.error(`Failed to send verification email to ${dto.email}: ${err.message}`);
    });

    await this.auditService.log({
      userId: newUser.id,
      source: AUDIT_SOURCE.USER,
      action: 'USER_REGISTER',
      tableName: 'users',
      recordId: newUser.id.toString(),
      ipAddress,
      userAgent,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      verificationRequired: true,
    };
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      await this.logAuditFailedLogin(dto.email, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== RECORD_STATUS.ACTIVE) {
      throw new ForbiddenException('Account is disabled or locked');
    }

    const isPasswordValid = await HashUtil.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.logAuditFailedLogin(user.email, ipAddress, userAgent, user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification (allow existing users without emailVerifiedAt to pass)
    if (user.emailVerifiedAt === null && user.createdAt > new Date('2026-06-16')) {
      throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const refreshToken = this.generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: await HashUtil.hash(refreshToken),
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    await this.auditService.log({
      userId: user.id,
      source: AUDIT_SOURCE.USER,
      action: 'LOGIN_SUCCESS',
      tableName: 'users',
      recordId: user.id.toString(),
      ipAddress,
      userAgent,
    });

    // Evaluate max tierLevel based on roles
    const TIER_HIERARCHY_VALUES = {
      STANDARD: 1,
      SILVER: 2,
      GOLD: 3,
      DIAMOND: 4,
    };

    const ROLE_TIER_MAPPING = {
      SUPER_ADMIN: 'DIAMOND',
      CEO: 'DIAMOND',
      ASSISTANT_CEO: 'DIAMOND',
      ADMIN: 'DIAMOND',
      EDITOR_ADMIN: 'DIAMOND',
      SALE_ADMIN: 'DIAMOND',
      EXPERT: 'GOLD',
      EDITOR_PRO: 'GOLD',
      EDITOR: 'SILVER',
      SALE: 'SILVER',
      CLIENT_VIP: 'GOLD',
    };

    let maxUserTier: string = user.tierLevel;
    let maxUserLevel = TIER_HIERARCHY_VALUES[maxUserTier] || 1;

    if (user.userRoles && Array.isArray(user.userRoles)) {
      for (const ur of user.userRoles) {
        const mappedTier = ROLE_TIER_MAPPING[ur.role.code];
        if (mappedTier) {
          const mappedLevel = TIER_HIERARCHY_VALUES[mappedTier] || 1;
          if (mappedLevel > maxUserLevel) {
            maxUserLevel = mappedLevel;
            maxUserTier = mappedTier;
          }
        }
      }
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tierLevel: maxUserTier,
      },
    };
  }

  // ─────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.debug(`Forgot password requested for non-existent email: ${email}`);
      return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
    }

    // Rate limit: max 3 reset requests per hour
    const recentTokens = await this.prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentTokens >= 3) {
      this.logger.warn(`Rate limit exceeded for password reset: ${email}`);
      return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
    }

    // Generate token
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = await HashUtil.hash(rawToken);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minute expiry

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send reset email
    await this.mailService.sendPasswordResetEmail(email, rawToken, user.fullName);

    this.logger.log(`Password reset email sent to ${email}`);
    return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
  }

  // ─────────────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────────────

  async resetPassword(rawToken: string, newPassword: string) {
    // Find valid token by checking all unexpired, unused tokens
    const validTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    let matchedToken: any = null;
    for (const tokenRecord of validTokens) {
      if (await HashUtil.compare(rawToken, tokenRecord.token)) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Hash new password
    const passwordHash = await HashUtil.hash(newPassword);

    // Update password and mark token as used
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      });

      // Revoke all existing sessions for security
      await tx.userSession.updateMany({
        where: { userId: matchedToken.userId, isRevoked: false },
        data: { isRevoked: true },
      });
    });

    await this.auditService.log({
      userId: matchedToken.userId,
      source: AUDIT_SOURCE.USER,
      action: 'PASSWORD_RESET',
      tableName: 'users',
      recordId: matchedToken.userId.toString(),
    });

    this.logger.log(`Password reset successful for user ${matchedToken.userId}`);
    return { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' };
  }

  // ─────────────────────────────────────────────────────
  // EMAIL VERIFICATION
  // ─────────────────────────────────────────────────────

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email đã được xác thực trước đó.' };
    }

    // Find latest unused OTP for this user
    const otpRecord = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    // Check brute-force attempts
    if (otpRecord.attempts >= 5) {
      throw new ForbiddenException('Đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
    }

    // Increment attempts
    await this.prisma.emailVerificationToken.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify OTP code
    if (otpRecord.code !== code) {
      const remaining = 5 - otpRecord.attempts - 1;
      throw new BadRequestException(`Mã xác thực không đúng. Còn ${remaining} lần thử.`);
    }

    // Mark OTP as used and verify user email
    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    });

    // Send welcome email (non-blocking)
    this.mailService.sendWelcomeEmail(email, user.fullName).catch((err) => {
      this.logger.error(`Failed to send welcome email to ${email}: ${err.message}`);
    });

    await this.auditService.log({
      userId: user.id,
      source: AUDIT_SOURCE.USER,
      action: 'EMAIL_VERIFIED',
      tableName: 'users',
      recordId: user.id.toString(),
    });

    this.logger.log(`Email verified for user ${user.id}`);
    return { message: 'Xác thực email thành công! Vui lòng đăng nhập.' };
  }

  // ─────────────────────────────────────────────────────
  // RESEND VERIFICATION OTP
  // ─────────────────────────────────────────────────────

  async resendVerification(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      // Don't reveal whether email exists
      return { message: 'Nếu email tồn tại, mã xác thực mới đã được gửi.' };
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email đã được xác thực.' };
    }

    // Rate limit: max 3 OTPs per 5 minutes
    const recentOtps = await this.prisma.emailVerificationToken.count({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException('Đã gửi quá nhiều mã. Vui lòng đợi 5 phút.');
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt,
      },
    });

    // Dev mode logging to help local testing when SMTP is delayed/blocked
    this.logger.log(`[DEV ONLY] Verification OTP for ${email} is: ${otp}`);

    await this.mailService.sendVerificationOTP(email, otp, user.fullName);

    this.logger.log(`Verification OTP re-sent to ${email}`);
    return { message: 'Mã xác thực mới đã được gửi vào email.' };
  }

  // ─────────────────────────────────────────────────────
  // EXISTING METHODS (unchanged)
  // ─────────────────────────────────────────────────────

  async refresh(oldRefreshToken: string, ipAddress: string, userAgent: string) {
    const parts = oldRefreshToken.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid refresh token format');
    }
    const userIdString = Buffer.from(parts[0], 'base64').toString('ascii');
    const userId = parseInt(userIdString, 10);

    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const activeSessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedSession: any = null;
    for (const session of activeSessions) {
      if (await HashUtil.compare(oldRefreshToken, session.refreshToken)) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newRefreshToken = this.generateRefreshToken(userId);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.prisma.userSession.update({
      where: { id: matchedSession.id },
      data: {
        refreshToken: await HashUtil.hash(newRefreshToken),
        expiresAt: newExpiresAt,
        ipAddress,
        userAgent,
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== RECORD_STATUS.ACTIVE) {
      throw new UnauthorizedException('User account is invalid');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    await this.auditService.log({
      userId: user.id,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'REFRESH_TOKEN_ROTATED',
      tableName: 'user_sessions',
      recordId: matchedSession.id.toString(),
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number, refreshToken: string, ipAddress: string, userAgent: string) {
    const parts = refreshToken.split(':');
    if (parts.length !== 2) return;
    
    const activeSessions = await this.prisma.userSession.findMany({
      where: { userId, isRevoked: false },
    });

    for (const session of activeSessions) {
      if (await HashUtil.compare(refreshToken, session.refreshToken)) {
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { isRevoked: true },
        });

        await this.auditService.log({
          userId,
          source: AUDIT_SOURCE.USER,
          action: 'LOGOUT',
          tableName: 'user_sessions',
          recordId: session.id.toString(),
          ipAddress,
          userAgent,
        });
        break;
      }
    }

    await this.clearUserPermissionsCache(userId);
  }

  async logoutAll(userId: number, ipAddress: string, userAgent: string) {
    await this.prisma.userSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.USER,
      action: 'LOGOUT_ALL',
      tableName: 'user_sessions',
      ipAddress,
      userAgent,
    });

    await this.clearUserPermissionsCache(userId);
  }

  // ─────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────

  private generateOTP(): string {
    return String(randomInt(100000, 999999));
  }

  private async logAuditFailedLogin(email: string, ipAddress: string, userAgent: string, userId?: number) {
    await this.auditService.log({
      userId: userId || null,
      source: AUDIT_SOURCE.USER,
      action: 'LOGIN_FAILED',
      tableName: 'users',
      oldValues: { email },
      ipAddress,
      userAgent,
    });
  }
}
