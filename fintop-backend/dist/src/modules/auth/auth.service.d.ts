import { PrismaService } from '../../common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../../common/audit/audit.service';
import { MailService } from '../../common/mail/mail.service';
import { RedisService } from '../../common/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface JwtPayload {
    sub: number;
    email: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly auditService;
    private readonly mailService;
    private readonly redisService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, auditService: AuditService, mailService: MailService, redisService: RedisService);
    private clearUserPermissionsCache;
    generateRefreshToken(userId: number): string;
    register(dto: RegisterDto, ipAddress: string, userAgent: string): Promise<{
        id: number;
        email: string;
        fullName: string;
        verificationRequired: boolean;
    }>;
    login(dto: LoginDto, ipAddress: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
        requirePasswordChange: boolean;
        user: {
            id: number;
            email: string;
            tierLevel: string;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(rawToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyEmail(email: string, code: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    refresh(oldRefreshToken: string, ipAddress: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number, refreshToken: string, ipAddress: string, userAgent: string): Promise<void>;
    logoutAll(userId: number, ipAddress: string, userAgent: string): Promise<void>;
    private generateOTP;
    updateProfile(userId: number, dto: any): Promise<{
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string | null;
        dob: Date | null;
        address: string | null;
        investmentDuration: string | null;
        investmentStyle: string | null;
        stockCompany: string | null;
        stockAccount: string | null;
        referralId: string | null;
        referralName: string | null;
        avatarUrl: string | null;
        paymentProofUrl: string | null;
        emailVerifiedAt: Date | null;
        brokerId: number | null;
        departmentId: number | null;
        teamId: number | null;
        riskTaste: import("@prisma/client").$Enums.RISK_TASTE | null;
        legacyTier: string | null;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        company: string | null;
        position: string | null;
        joinDate: Date | null;
        sortOrder: number | null;
        staffCode: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getUserProfile(userId: number): Promise<{
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        roles: import("@prisma/client").$Enums.ROLE_CODE[];
        permissions: string[];
        department: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
        } | null;
        team: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            departmentId: number;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            leaderId: number | null;
        } | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        phone: string | null;
        dob: Date | null;
        address: string | null;
        investmentDuration: string | null;
        investmentStyle: string | null;
        stockCompany: string | null;
        stockAccount: string | null;
        referralId: string | null;
        referralName: string | null;
        avatarUrl: string | null;
        paymentProofUrl: string | null;
        emailVerifiedAt: Date | null;
        brokerId: number | null;
        departmentId: number | null;
        teamId: number | null;
        riskTaste: import("@prisma/client").$Enums.RISK_TASTE | null;
        legacyTier: string | null;
        company: string | null;
        position: string | null;
        joinDate: Date | null;
        sortOrder: number | null;
        staffCode: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    lookupReferrer(code: string): Promise<{
        fullName: string;
    }>;
    private logAuditFailedLogin;
}
