"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    config;
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    fromAddress;
    frontendUrl;
    constructor(config) {
        this.config = config;
        this.frontendUrl = this.config.get('FRONTEND_URL', 'https://fintop-frontend-staging.onrender.com');
        const resendApiKey = this.config.get('RESEND_API_KEY', '');
        const brevoApiKey = this.config.get('BREVO_API_KEY', '');
        if (resendApiKey) {
            this.fromAddress = this.config.get('RESEND_FROM', 'FinTop DATA <no-reply@fintopdata.vn>');
            this.logger.log('Resend API key configured — emails will be sent via Resend HTTPS API.');
            this.transporter = null;
        }
        else if (brevoApiKey) {
            const fromName = this.config.get('BREVO_FROM_NAME', 'FinTop DATA');
            const fromEmail = this.config.get('BREVO_FROM_EMAIL', 'fintop.bashare@gmail.com');
            this.fromAddress = `${fromName} <${fromEmail}>`;
            this.logger.log('Brevo API key configured — emails will be sent via Brevo HTTPS API.');
            this.transporter = null;
        }
        else {
            const host = this.config.get('SMTP_HOST', 'smtp.gmail.com');
            const port = this.config.get('SMTP_PORT', 587);
            const user = this.config.get('SMTP_USER', '');
            const pass = this.config.get('SMTP_PASS', '');
            this.fromAddress = this.config.get('SMTP_FROM', `FinTop DATA <${user}>`);
            if (!user || !pass) {
                this.logger.warn('Neither Resend, Brevo API Key nor SMTP credentials configured — emails will be logged but not sent.');
                this.transporter = null;
            }
            else {
                this.transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                });
                this.transporter.verify().then(() => {
                    this.logger.log(`SMTP connected: ${host}:${port} as ${user}`);
                }).catch((err) => {
                    this.logger.error(`SMTP connection failed: ${err.message}`);
                });
            }
        }
    }
    async sendPasswordResetEmail(email, token, fullName) {
        const resetLink = `${this.frontendUrl}/reset-password/?token=${encodeURIComponent(token)}`;
        const subject = 'Dữ liệu chứng khoán FinTop DATA';
        const html = this.buildPasswordResetTemplate(fullName, resetLink);
        return this.sendMail(email, subject, html);
    }
    async sendVerificationOTP(email, code, fullName) {
        const subject = 'Dữ liệu chứng khoán FinTop DATA';
        const html = this.buildOTPTemplate(fullName, code);
        return this.sendMail(email, subject, html);
    }
    async sendWelcomeEmail(email, fullName) {
        const subject = '🎉 Chào mừng bạn đến với FinTop DATA!';
        const html = this.buildWelcomeTemplate(fullName);
        return this.sendMail(email, subject, html);
    }
    async sendMail(to, subject, html) {
        const resendApiKey = this.config.get('RESEND_API_KEY', '');
        if (resendApiKey) {
            return this.sendMailViaResend(to, subject, html, resendApiKey);
        }
        const brevoApiKey = this.config.get('BREVO_API_KEY', '');
        if (brevoApiKey) {
            return this.sendMailViaBrevo(to, subject, html, brevoApiKey);
        }
        if (!this.transporter) {
            this.logger.warn(`[DRY RUN] Email to ${to}: ${subject}`);
            this.logger.debug(`[DRY RUN] HTML body length: ${html.length}`);
            return true;
        }
        try {
            const replyTo = this.config.get('MAIL_REPLY_TO', 'fintopdata.info@gmail.com');
            const bcc = this.config.get('MAIL_BCC', 'fintopdata.info@gmail.com');
            const info = await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                replyTo,
                ...(bcc ? { bcc } : {}),
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${info.messageId}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to}: ${err.message}`);
            return false;
        }
    }
    async sendMailViaResend(to, subject, html, apiKey) {
        try {
            this.logger.log(`Sending email to ${to} via Resend HTTPS API...`);
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: this.fromAddress,
                    to: [to],
                    subject,
                    html,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || `HTTP status ${response.status}`);
            }
            this.logger.log(`Email sent to ${to} via Resend successfully: ${data.id}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to} via Resend: ${err.message}`);
            return false;
        }
    }
    async sendMailViaBrevo(to, subject, html, apiKey) {
        const fromName = this.config.get('BREVO_FROM_NAME', 'FinTop DATA');
        const fromEmail = this.config.get('BREVO_FROM_EMAIL', 'fintop.bashare@gmail.com');
        const replyTo = this.config.get('MAIL_REPLY_TO', 'fintopdata.info@gmail.com');
        const bccEmail = this.config.get('MAIL_BCC', 'fintopdata.info@gmail.com');
        try {
            this.logger.log(`Sending email to ${to} via Brevo HTTPS API...`);
            const bodyPayload = {
                sender: {
                    name: fromName,
                    email: fromEmail,
                },
                to: [
                    {
                        email: to,
                    },
                ],
                replyTo: {
                    email: replyTo,
                },
                subject,
                htmlContent: html,
            };
            if (bccEmail) {
                bodyPayload.bcc = [
                    {
                        email: bccEmail,
                    },
                ];
            }
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(bodyPayload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || `HTTP status ${response.status}`);
            }
            this.logger.log(`Email sent to ${to} via Brevo successfully: ${data.messageId}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to} via Brevo: ${err.message}`);
            return false;
        }
    }
    buildPasswordResetTemplate(fullName, resetLink) {
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="https://raw.githubusercontent.com/carrot1301/FINTOP_LANDING_PAGES/main/assets/images/fintop-logo.png" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 8px;">Xin chào <strong style="color:#c4b5fd;">${this.escapeHtml(fullName)}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tạo mật khẩu mới:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(139,92,246,0.3);">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">⏱ Link có hiệu lực trong <strong>30 phút</strong>.</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
      <div style="border-top:1px solid rgba(100,116,139,0.2);padding-top:16px;margin-top:16px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Nếu gặp sự cố, bạn vui lòng phản hồi lại email này hoặc liên hệ hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
    }
    buildOTPTemplate(fullName, code) {
        const digits = code.split('');
        const digitBoxes = digits.map(d => `<span style="display:inline-block;width:42px;height:52px;line-height:52px;text-align:center;font-size:26px;font-weight:800;color:#c4b5fd;background:rgba(139,92,246,0.12);border:2px solid rgba(139,92,246,0.3);border-radius:10px;margin:0 4px;letter-spacing:2px;">${d}</span>`).join('');
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="https://raw.githubusercontent.com/carrot1301/FINTOP_LANDING_PAGES/main/assets/images/fintop-logo.png" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;">XÁC THỰC TÀI KHOẢN</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 8px;">Xin chào <strong style="color:#c4b5fd;">${this.escapeHtml(fullName)}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">Mã xác thực tài khoản FinTop DATA của bạn:</p>
      <div style="text-align:center;margin:28px 0 32px;">${digitBoxes}</div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">⏱ Mã có hiệu lực trong <strong>10 phút</strong>.</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      <div style="border-top:1px solid rgba(100,116,139,0.2);padding-top:16px;margin-top:16px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Nếu gặp sự cố xác thực, bạn vui lòng phản hồi lại email này hoặc liên hệ hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
    }
    buildWelcomeTemplate(fullName) {
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="https://raw.githubusercontent.com/carrot1301/FINTOP_LANDING_PAGES/main/assets/images/fintop-logo.png" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:48px;">🎉</span>
      </div>
      <p style="color:#e2e8f0;font-size:16px;line-height:1.7;margin:0 0 8px;text-align:center;">Chào mừng <strong style="color:#c4b5fd;">${this.escapeHtml(fullName)}</strong>!</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;text-align:center;">Tài khoản FinTop DATA của bạn đã được xác thực thành công.</p>
      <div style="background:rgba(139,92,246,0.08);border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid rgba(139,92,246,0.15);">
        <p style="color:#c4b5fd;font-size:14px;font-weight:700;margin:0 0 12px;">Bạn có thể:</p>
        <ul style="color:#94a3b8;font-size:13px;line-height:2;margin:0;padding-left:18px;">
          <li>Tra cứu dữ liệu cổ phiếu</li>
          <li>Xem phân tích AI & báo cáo thị trường</li>
          <li>Theo dõi tín hiệu chuyên gia</li>
          <li>Nâng cấp hội viên GOLD/DIAMOND</li>
        </ul>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${this.frontendUrl}/index.html" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(139,92,246,0.3);">
          Bắt đầu khám phá
        </a>
      </div>
      <div style="border-top:1px solid rgba(100,116,139,0.2);padding-top:16px;margin-top:24px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Cần hỗ trợ? Bạn vui lòng phản hồi lại email này hoặc gọi hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
    }
    isConfigured() {
        const resendApiKey = this.config.get('RESEND_API_KEY', '');
        const brevoApiKey = this.config.get('BREVO_API_KEY', '');
        return !!resendApiKey || !!brevoApiKey || !!this.transporter;
    }
    getStatus() {
        const resendApiKey = this.config.get('RESEND_API_KEY', '');
        const brevoApiKey = this.config.get('BREVO_API_KEY', '');
        const hasResend = !!resendApiKey;
        const hasBrevo = !!brevoApiKey;
        const hasSmtp = !!this.transporter;
        let provider = 'none';
        let host = '(not set)';
        let user = '(not set)';
        if (hasResend) {
            provider = 'resend';
            host = 'api.resend.com';
            user = '***configured***';
        }
        else if (hasBrevo) {
            provider = 'brevo';
            host = 'api.brevo.com';
            user = this.config.get('BREVO_FROM_EMAIL', 'fintop.bashare@gmail.com');
        }
        else if (hasSmtp) {
            provider = 'smtp';
            host = this.config.get('SMTP_HOST', '(not set)');
            user = '***configured***';
        }
        return {
            status: (hasResend || hasBrevo || hasSmtp) ? 'up' : 'down',
            configured: hasResend || hasBrevo || hasSmtp,
            provider,
            host,
            user,
            frontendUrl: this.frontendUrl,
        };
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map