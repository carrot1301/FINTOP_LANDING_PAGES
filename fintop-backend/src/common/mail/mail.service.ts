import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const LOGO_URL = 'https://fintopdata.vn/assets/images/LogoFinTop_notbg.jpg';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://fintopdata.vn');

    const resendApiKey = this.config.get<string>('RESEND_API_KEY', '');
    const brevoApiKey = (this.config.get<string>('BREVO_API_KEY', '') || '').replace(/['"\r\n\s]/g, '').trim();

    // Always try to initialize SMTP transporter as fallback
    const smtpHost = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = this.config.get<number>('SMTP_PORT', 587);
    const smtpUser = this.config.get<string>('SMTP_USER', 'fintop.bashare@gmail.com');
    const smtpPass = this.config.get<string>('SMTP_PASS', '');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      this.transporter.verify().then(() => {
        this.logger.log(`SMTP fallback ready: ${smtpHost}:${smtpPort} as ${smtpUser}`);
      }).catch((err) => {
        this.logger.warn(`SMTP fallback connection failed: ${err.message}`);
      });
    } else {
      this.transporter = null as any;
    }

    this.fromAddress = 'FinTop DATA <fintopdata.info@gmail.com>';

    if (resendApiKey) {
      this.logger.log('Resend API key configured — emails will be sent via Resend HTTPS API.' + (this.transporter ? ' SMTP fallback available.' : ''));
    } else if (brevoApiKey) {
      this.logger.log('Brevo API key configured — emails will be sent via Brevo HTTPS API.' + (this.transporter ? ' SMTP fallback available.' : ''));
    } else if (this.transporter) {
      this.logger.log(`SMTP configured as primary email provider: ${smtpHost}:${smtpPort}`);
    } else {
      this.logger.warn('Neither Resend, Brevo API Key nor SMTP credentials configured — emails will be logged but not sent.');
    }
  }

  // ─────────────────────────────────────────────────────
  // PASSWORD RESET EMAIL
  // ─────────────────────────────────────────────────────

  async sendPasswordResetEmail(email: string, token: string, fullName: string): Promise<boolean> {
    const resetLink = `${this.frontendUrl}/reset-password/?token=${encodeURIComponent(token)}`;

    const subject = 'Dữ liệu chứng khoán FinTop DATA';
    const html = this.buildPasswordResetTemplate(fullName, resetLink);

    return this.sendMail(email, subject, html);
  }

  // ─────────────────────────────────────────────────────
  // EMAIL VERIFICATION OTP
  // ─────────────────────────────────────────────────────

  async sendVerificationOTP(email: string, code: string, fullName: string): Promise<boolean> {
    const subject = 'Dữ liệu chứng khoán FinTop DATA';
    const html = this.buildOTPTemplate(fullName, code);

    return this.sendMail(email, subject, html);
  }

  // ─────────────────────────────────────────────────────
  // WELCOME EMAIL
  // ─────────────────────────────────────────────────────

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const subject = '🎉 Chào mừng bạn đến với FinTop DATA!';
    const html = this.buildWelcomeTemplate(fullName);

    return this.sendMail(email, subject, html);
  }

  // ─────────────────────────────────────────────────────
  // CORE SEND METHOD
  // ─────────────────────────────────────────────────────

  private async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const resendApiKey = this.config.get<string>('RESEND_API_KEY', '');
    if (resendApiKey) {
      const ok = await this.sendMailViaResend(to, subject, html, resendApiKey);
      if (ok) return true;
      this.logger.warn(`Resend failed for ${to}, falling back to Brevo...`);
    }

    const brevoApiKey = (this.config.get<string>('BREVO_API_KEY', '') || '').replace(/['"\r\n\s]/g, '').trim();
    if (brevoApiKey) {
      const ok = await this.sendMailViaBrevo(to, subject, html, brevoApiKey);
      if (ok) return true;
      this.logger.warn(`Brevo failed for ${to}, falling back to SMTP...`);
    }

    // SMTP fallback (or primary if no API provider configured)
    if (!this.transporter) {
      this.logger.warn(`[DRY RUN] Email to ${to}: ${subject}`);
      this.logger.debug(`[DRY RUN] HTML body length: ${html.length}`);
      return true; // Pretend success in dev mode
    }

    try {
      const replyTo = 'fintopdata.info@gmail.com';
      const bcc = this.config.get<string>('MAIL_BCC', 'fintopdata.info@gmail.com');
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        replyTo,
        ...(bcc ? { bcc } : {}),
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to} via SMTP fallback: ${info.messageId}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${to} via SMTP: ${err.message}`);
      return false;
    }
  }

  private async sendMailViaResend(to: string, subject: string, html: string, apiKey: string): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${to} via Resend HTTPS API...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FinTop DATA <fintopdata.info@gmail.com>',
          to: [to],
          subject,
          html,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data?.message || `HTTP status ${response.status}`);
      }

      this.logger.log(`Email sent to ${to} via Resend successfully: ${data.id}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${to} via Resend: ${err.message}`);
      return false;
    }
  }

  private async sendMailViaBrevo(to: string, subject: string, html: string, apiKey: string): Promise<boolean> {
    const fromName = 'FinTop DATA';
    const fromEmail = 'fintopdata.info@gmail.com';
    const replyTo = 'fintopdata.info@gmail.com';
    const bccEmail = this.config.get<string>('MAIL_BCC', 'fintopdata.info@gmail.com');
    try {
      this.logger.log(`Sending email to ${to} via Brevo HTTPS API (from: ${fromEmail})...`);

      const bodyPayload: any = {
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

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data?.message || `HTTP status ${response.status}`);
      }

      this.logger.log(`Email sent to ${to} via Brevo successfully: ${data.messageId}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${to} via Brevo: ${err.message}`);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────
  // HTML TEMPLATES
  // ─────────────────────────────────────────────────────

  private buildPasswordResetTemplate(fullName: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${LOGO_URL}" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 8px;">Xin chào <strong style="color:#c4b5fd;">${this.escapeHtml(fullName)}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FinTop DATA. Nhấn nút bên dưới để tạo mật khẩu mới:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(139,92,246,0.3);">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">⏱ Link có hiệu lực trong <strong>30 phút</strong>.</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
      <div style="border-top:1px solid rgba(100,116,139,0.2);padding-top:16px;margin-top:16px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Nếu gặp sự cố, bạn vui lòng phản hồi lại email này (<a href="mailto:fintopdata.info@gmail.com" style="color:#c4b5fd;text-decoration:none;">fintopdata.info@gmail.com</a>) hoặc liên hệ hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildOTPTemplate(fullName: string, code: string): string {
    const digits = code.split('');
    const digitBoxes = digits.map(d =>
      `<span style="display:inline-block;width:42px;height:52px;line-height:52px;text-align:center;font-size:26px;font-weight:800;color:#c4b5fd;background:rgba(139,92,246,0.12);border:2px solid rgba(139,92,246,0.3);border-radius:10px;margin:0 4px;letter-spacing:2px;">${d}</span>`
    ).join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${LOGO_URL}" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;">XÁC THỰC TÀI KHOẢN</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 8px;">Xin chào <strong style="color:#c4b5fd;">${this.escapeHtml(fullName)}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">Mã xác thực tài khoản FinTop DATA của bạn:</p>
      <div style="text-align:center;margin:28px 0 32px;">${digitBoxes}</div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">⏱ Mã có hiệu lực trong <strong>10 phút</strong>.</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      <div style="border-top:1px solid rgba(100,116,139,0.2);padding-top:16px;margin-top:16px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Nếu gặp sự cố xác thực, bạn vui lòng phản hồi lại email này (<a href="mailto:fintopdata.info@gmail.com" style="color:#c4b5fd;text-decoration:none;">fintopdata.info@gmail.com</a>) hoặc liên hệ hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildWelcomeTemplate(fullName: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${LOGO_URL}" alt="FinTop DATA" style="max-height:60px;display:inline-block;vertical-align:middle;margin-bottom:8px;">
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
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Cần hỗ trợ? Bạn vui lòng phản hồi lại email này (<a href="mailto:fintopdata.info@gmail.com" style="color:#c4b5fd;text-decoration:none;">fintopdata.info@gmail.com</a>) hoặc gọi hotline: 086.234.8886</p>
        <p style="color:#475569;font-size:11px;margin:0;">© 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
  }

  // ─────────────────────────────────────────────────────
  // DIAGNOSTIC METHODS
  // ─────────────────────────────────────────────────────

  /** Returns true if SMTP, Resend or Brevo credentials are configured */
  isConfigured(): boolean {
    const resendApiKey = this.config.get<string>('RESEND_API_KEY', '');
    const brevoApiKey = (this.config.get<string>('BREVO_API_KEY', '') || '').replace(/['"\r\n\s]/g, '').trim();
    return !!resendApiKey || !!brevoApiKey || !!this.transporter;
  }

  /** Returns mail sender status info for health checks */
  getStatus(): { status: 'up' | 'down'; configured: boolean; provider: 'resend' | 'brevo' | 'smtp' | 'none'; host: string; user: string; frontendUrl: string } {
    const resendApiKey = this.config.get<string>('RESEND_API_KEY', '');
    const brevoApiKey = (this.config.get<string>('BREVO_API_KEY', '') || '').replace(/['"\r\n\s]/g, '').trim();
    const hasResend = !!resendApiKey;
    const hasBrevo = !!brevoApiKey;
    const hasSmtp = !!this.transporter;

    let provider: 'resend' | 'brevo' | 'smtp' | 'none' = 'none';
    let host = '(not set)';
    let user = '(not set)';

    if (hasResend) {
      provider = 'resend';
      host = 'api.resend.com';
      user = '***configured***';
    } else if (hasBrevo) {
      provider = 'brevo';
      host = 'api.brevo.com';
      user = 'fintopdata.info@gmail.com';
    } else if (hasSmtp) {
      provider = 'smtp';
      host = this.config.get<string>('SMTP_HOST', '(not set)');
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

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
