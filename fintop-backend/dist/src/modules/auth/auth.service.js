"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const audit_service_1 = require("../../common/audit/audit.service");
const mail_service_1 = require("../../common/mail/mail.service");
const redis_service_1 = require("../../common/redis/redis.service");
const hash_util_1 = require("../../common/utils/hash.util");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    auditService;
    mailService;
    redisService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, auditService, mailService, redisService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.auditService = auditService;
        this.mailService = mailService;
        this.redisService = redisService;
    }
    async clearUserPermissionsCache(userId) {
        try {
            const cacheKey = `user:permissions:${userId}`;
            await this.redisService.getClient().del(cacheKey);
            this.logger.log(`Cleared permissions cache for user #${userId}`);
        }
        catch (err) {
            this.logger.error(`Failed to clear permissions cache for user #${userId}: ${err.message}`);
        }
    }
    generateRefreshToken(userId) {
        const randomHex = (0, crypto_1.randomBytes)(40).toString('hex');
        const base64Id = Buffer.from(userId.toString()).toString('base64');
        return `${base64Id}:${randomHex}`;
    }
    async register(dto, ipAddress, userAgent) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email, deletedAt: null },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const passwordHash = await hash_util_1.HashUtil.hash(dto.password);
        const newUser = await this.prisma.$transaction(async (tx) => {
            let brokerId = null;
            if (dto.referralId) {
                const refCode = dto.referralId.trim();
                let broker = await tx.user.findFirst({
                    where: { staffCode: { equals: refCode, mode: 'insensitive' }, deletedAt: null },
                    select: { id: true }
                });
                if (!broker) {
                    broker = await tx.user.findFirst({
                        where: { team: { code: { equals: refCode, mode: 'insensitive' } }, deletedAt: null },
                        select: { id: true }
                    });
                }
                if (!broker) {
                    broker = await tx.user.findFirst({
                        where: { department: { code: { equals: refCode, mode: 'insensitive' } }, deletedAt: null },
                        select: { id: true }
                    });
                }
                if (!broker) {
                    const numericId = parseInt(refCode, 10);
                    if (!isNaN(numericId)) {
                        broker = await tx.user.findUnique({
                            where: { id: numericId },
                            select: { id: true }
                        });
                    }
                }
                if (broker) {
                    brokerId = broker.id;
                }
            }
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
                    brokerId: brokerId,
                    status: client_1.RECORD_STATUS.ACTIVE,
                    emailVerifiedAt: null,
                },
            });
            const clientRole = await tx.role.findFirst({
                where: { code: client_1.ROLE_CODE.CLIENT },
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
        const otp = this.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        await this.prisma.emailVerificationToken.create({
            data: {
                userId: newUser.id,
                code: otp,
                expiresAt,
            },
        });
        this.logger.log(`[DEV ONLY] Verification OTP for ${dto.email} is: ${otp}`);
        this.mailService.sendVerificationOTP(dto.email, otp, dto.fullName).catch((err) => {
            this.logger.error(`Failed to send verification email to ${dto.email}: ${err.message}`);
        });
        await this.auditService.log({
            userId: newUser.id,
            source: client_1.AUDIT_SOURCE.USER,
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
    async login(dto, ipAddress, userAgent) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== client_1.RECORD_STATUS.ACTIVE) {
            throw new common_1.ForbiddenException('Account is disabled or locked');
        }
        const isPasswordValid = await hash_util_1.HashUtil.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            await this.logAuditFailedLogin(user.email, ipAddress, userAgent, user.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isFirstLogin = user.emailVerifiedAt === null;
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
        const refreshToken = this.generateRefreshToken(user.id);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshToken: await hash_util_1.HashUtil.hash(refreshToken),
                ipAddress,
                userAgent,
                expiresAt,
            },
        });
        await this.auditService.log({
            userId: user.id,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'LOGIN_SUCCESS',
            tableName: 'users',
            recordId: user.id.toString(),
            ipAddress,
            userAgent,
        });
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
        let maxUserTier = user.tierLevel;
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
        if (isFirstLogin) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerifiedAt: new Date() },
            });
        }
        return {
            accessToken,
            refreshToken,
            requirePasswordChange: isFirstLogin,
            user: {
                id: user.id,
                email: user.email,
                tierLevel: maxUserTier,
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user) {
            this.logger.debug(`Forgot password requested for non-existent email: ${email}`);
            return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
        }
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
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const hashedToken = await hash_util_1.HashUtil.hash(rawToken);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt,
            },
        });
        await this.mailService.sendPasswordResetEmail(email, rawToken, user.fullName);
        this.logger.log(`Password reset email sent to ${email}`);
        return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
    }
    async resetPassword(rawToken, newPassword) {
        const validTokens = await this.prisma.passwordResetToken.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });
        let matchedToken = null;
        for (const tokenRecord of validTokens) {
            if (await hash_util_1.HashUtil.compare(rawToken, tokenRecord.token)) {
                matchedToken = tokenRecord;
                break;
            }
        }
        if (!matchedToken) {
            throw new common_1.BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
        }
        const passwordHash = await hash_util_1.HashUtil.hash(newPassword);
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: matchedToken.userId },
                data: { passwordHash },
            });
            await tx.passwordResetToken.update({
                where: { id: matchedToken.id },
                data: { usedAt: new Date() },
            });
            await tx.userSession.updateMany({
                where: { userId: matchedToken.userId, isRevoked: false },
                data: { isRevoked: true },
            });
        });
        await this.auditService.log({
            userId: matchedToken.userId,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'PASSWORD_RESET',
            tableName: 'users',
            recordId: matchedToken.userId.toString(),
        });
        this.logger.log(`Password reset successful for user ${matchedToken.userId}`);
        return { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' };
    }
    async verifyEmail(email, code) {
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user) {
            throw new common_1.BadRequestException('Email không tồn tại.');
        }
        if (user.emailVerifiedAt) {
            return { message: 'Email đã được xác thực trước đó.' };
        }
        const otpRecord = await this.prisma.emailVerificationToken.findFirst({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otpRecord) {
            throw new common_1.BadRequestException('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
        }
        if (otpRecord.attempts >= 5) {
            throw new common_1.ForbiddenException('Đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
        }
        await this.prisma.emailVerificationToken.update({
            where: { id: otpRecord.id },
            data: { attempts: { increment: 1 } },
        });
        if (otpRecord.code !== code) {
            const remaining = 5 - otpRecord.attempts - 1;
            throw new common_1.BadRequestException(`Mã xác thực không đúng. Còn ${remaining} lần thử.`);
        }
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
        this.mailService.sendWelcomeEmail(email, user.fullName).catch((err) => {
            this.logger.error(`Failed to send welcome email to ${email}: ${err.message}`);
        });
        await this.auditService.log({
            userId: user.id,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'EMAIL_VERIFIED',
            tableName: 'users',
            recordId: user.id.toString(),
        });
        this.logger.log(`Email verified for user ${user.id}`);
        return { message: 'Xác thực email thành công! Vui lòng đăng nhập.' };
    }
    async resendVerification(email) {
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user) {
            return { message: 'Nếu email tồn tại, mã xác thực mới đã được gửi.' };
        }
        if (user.emailVerifiedAt) {
            return { message: 'Email đã được xác thực.' };
        }
        const recentOtps = await this.prisma.emailVerificationToken.count({
            where: {
                userId: user.id,
                createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
            },
        });
        if (recentOtps >= 3) {
            throw new common_1.BadRequestException('Đã gửi quá nhiều mã. Vui lòng đợi 5 phút.');
        }
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
        this.logger.log(`[DEV ONLY] Verification OTP for ${email} is: ${otp}`);
        await this.mailService.sendVerificationOTP(email, otp, user.fullName);
        this.logger.log(`Verification OTP re-sent to ${email}`);
        return { message: 'Mã xác thực mới đã được gửi vào email.' };
    }
    async refresh(oldRefreshToken, ipAddress, userAgent) {
        const parts = oldRefreshToken.split(':');
        if (parts.length !== 2) {
            throw new common_1.UnauthorizedException('Invalid refresh token format');
        }
        const userIdString = Buffer.from(parts[0], 'base64').toString('ascii');
        const userId = parseInt(userIdString, 10);
        if (isNaN(userId)) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const activeSessions = await this.prisma.userSession.findMany({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gt: new Date() },
            },
        });
        let matchedSession = null;
        for (const session of activeSessions) {
            if (await hash_util_1.HashUtil.compare(oldRefreshToken, session.refreshToken)) {
                matchedSession = session;
                break;
            }
        }
        if (!matchedSession) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const newRefreshToken = this.generateRefreshToken(userId);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        await this.prisma.userSession.update({
            where: { id: matchedSession.id },
            data: {
                refreshToken: await hash_util_1.HashUtil.hash(newRefreshToken),
                expiresAt: newExpiresAt,
                ipAddress,
                userAgent,
            },
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status !== client_1.RECORD_STATUS.ACTIVE) {
            throw new common_1.UnauthorizedException('User account is invalid');
        }
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
        await this.auditService.log({
            userId: user.id,
            source: client_1.AUDIT_SOURCE.SYSTEM,
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
    async logout(userId, refreshToken, ipAddress, userAgent) {
        const parts = refreshToken.split(':');
        if (parts.length !== 2)
            return;
        const activeSessions = await this.prisma.userSession.findMany({
            where: { userId, isRevoked: false },
        });
        for (const session of activeSessions) {
            if (await hash_util_1.HashUtil.compare(refreshToken, session.refreshToken)) {
                await this.prisma.userSession.update({
                    where: { id: session.id },
                    data: { isRevoked: true },
                });
                await this.auditService.log({
                    userId,
                    source: client_1.AUDIT_SOURCE.USER,
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
    async logoutAll(userId, ipAddress, userAgent) {
        await this.prisma.userSession.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'LOGOUT_ALL',
            tableName: 'user_sessions',
            ipAddress,
            userAgent,
        });
        await this.clearUserPermissionsCache(userId);
    }
    generateOTP() {
        return String((0, crypto_1.randomInt)(100000, 999999));
    }
    async updateProfile(userId, dto) {
        const allowedFields = [
            'fullName',
            'dob',
            'phone',
            'address',
            'investmentDuration',
            'investmentStyle',
            'stockCompany',
            'stockAccount',
            'company',
            'position',
            'paymentProofUrl',
        ];
        const updateData = {};
        for (const key of allowedFields) {
            if (dto[key] !== undefined) {
                if (key === 'dob' && dto[key]) {
                    updateData[key] = new Date(dto[key]);
                }
                else {
                    updateData[key] = dto[key];
                }
            }
        }
        if (dto.password) {
            updateData.passwordHash = await hash_util_1.HashUtil.hash(dto.password);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
                subscriptions: {
                    where: {
                        status: 'ACTIVE',
                        endDate: { gt: new Date() },
                    },
                    include: {
                        plan: true,
                    },
                    orderBy: {
                        endDate: 'desc',
                    },
                    take: 1,
                },
                team: true,
                department: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const roles = user.userRoles.map((ur) => ur.role.code);
        const permissions = new Set();
        for (const ur of user.userRoles) {
            for (const rp of ur.role.permissions) {
                permissions.add(`${rp.permission.module}:${rp.permission.action}`);
            }
        }
        const TIER_HIERARCHY_VALUES = { STANDARD: 1, SILVER: 2, GOLD: 3, DIAMOND: 4 };
        const ROLE_TIER_MAPPING = {
            SUPER_ADMIN: 'DIAMOND', CEO: 'DIAMOND', ASSISTANT_CEO: 'DIAMOND',
            ADMIN: 'DIAMOND', EDITOR_ADMIN: 'DIAMOND', SALE_ADMIN: 'DIAMOND',
            EXPERT: 'GOLD', EDITOR_PRO: 'GOLD', EDITOR: 'SILVER', SALE: 'SILVER',
            CLIENT_VIP: 'GOLD',
        };
        let maxUserTier = user.tierLevel;
        let maxUserLevel = TIER_HIERARCHY_VALUES[maxUserTier] || 1;
        for (const role of roles) {
            const mappedTier = ROLE_TIER_MAPPING[role];
            if (mappedTier) {
                const mappedLevel = TIER_HIERARCHY_VALUES[mappedTier] || 1;
                if (mappedLevel > maxUserLevel) {
                    maxUserLevel = mappedLevel;
                    maxUserTier = mappedTier;
                }
            }
        }
        const { passwordHash, userRoles, subscriptions, ...safeUser } = user;
        return {
            ...safeUser,
            tierLevel: maxUserTier,
            roles,
            permissions: Array.from(permissions),
        };
    }
    async lookupReferrer(code) {
        if (!code) {
            throw new common_1.BadRequestException('ID người giới thiệu không được để trống');
        }
        let user = await this.prisma.user.findFirst({
            where: {
                staffCode: {
                    equals: code,
                    mode: 'insensitive'
                },
                deletedAt: null
            },
            select: { fullName: true }
        });
        if (!user) {
            user = await this.prisma.user.findFirst({
                where: {
                    team: {
                        code: {
                            equals: code,
                            mode: 'insensitive'
                        }
                    },
                    deletedAt: null
                },
                select: { fullName: true }
            });
        }
        if (!user) {
            user = await this.prisma.user.findFirst({
                where: {
                    department: {
                        code: {
                            equals: code,
                            mode: 'insensitive'
                        }
                    },
                    deletedAt: null
                },
                select: { fullName: true }
            });
        }
        if (!user) {
            const numericId = parseInt(code, 10);
            if (!isNaN(numericId)) {
                user = await this.prisma.user.findUnique({
                    where: { id: numericId },
                    select: { fullName: true }
                });
            }
        }
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người giới thiệu');
        }
        return { fullName: user.fullName };
    }
    async logAuditFailedLogin(email, ipAddress, userAgent, userId) {
        await this.auditService.log({
            userId: userId || null,
            source: client_1.AUDIT_SOURCE.USER,
            action: 'LOGIN_FAILED',
            tableName: 'users',
            oldValues: { email },
            ipAddress,
            userAgent,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_service_1.AuditService,
        mail_service_1.MailService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map