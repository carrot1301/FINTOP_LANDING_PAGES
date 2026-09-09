import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly config;
    private readonly logger;
    private transporter;
    private readonly fromAddress;
    private readonly frontendUrl;
    constructor(config: ConfigService);
    sendPasswordResetEmail(email: string, token: string, fullName: string): Promise<boolean>;
    sendVerificationOTP(email: string, code: string, fullName: string): Promise<boolean>;
    sendWelcomeEmail(email: string, fullName: string): Promise<boolean>;
    private sendMail;
    private sendMailViaResend;
    private sendMailViaBrevo;
    private buildPasswordResetTemplate;
    private buildOTPTemplate;
    private buildWelcomeTemplate;
    isConfigured(): boolean;
    getStatus(): {
        status: 'up' | 'down';
        configured: boolean;
        provider: 'resend' | 'brevo' | 'smtp' | 'none';
        host: string;
        user: string;
        frontendUrl: string;
    };
    private escapeHtml;
}
