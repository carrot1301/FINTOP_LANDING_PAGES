import { Injectable, UnauthorizedException, ForbiddenException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../../common/audit/audit.service';
import { HashUtil } from '../../common/utils/hash.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
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
  ) {}

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
          status: RECORD_STATUS.ACTIVE,
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
    };
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
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

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tierLevel: user.tierLevel,
      },
    };
  }

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
