import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, req: any): Promise<{
        id: number;
        email: string;
        fullName: string;
        verificationRequired: boolean;
    }>;
    login(loginDto: LoginDto, req: any): Promise<{
        accessToken: string;
        refreshToken: string;
        requirePasswordChange: boolean;
        user: {
            id: number;
            email: string;
            tierLevel: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    refresh(dto: RefreshDto, req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: any, dto: RefreshDto, req: any): Promise<void>;
    logoutAll(user: any, req: any): Promise<void>;
    lookupReferrer(code: string): Promise<{
        fullName: string;
    }>;
    getMe(user: any): Promise<{
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
    updateProfile(user: any, dto: any): Promise<{
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
}
