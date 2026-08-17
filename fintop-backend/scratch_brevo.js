const dotenv = require('dotenv');
dotenv.config();

async function sendTestEmail() {
  const apiKey = (process.env.BREVO_API_KEY || '').replace(/['"\r\n\s]/g, '').trim();

  const logoUrl = 'https://fintopdata.vn/assets/images/fintop-logo-circle-icon.png';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0a1e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
    <tr><td style="padding:40px 32px 32px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;padding:12px;background:rgba(139,92,246,0.15);border-radius:50%;border:1px solid rgba(139,92,246,0.4);margin-bottom:12px;">
          <img src="${logoUrl}" width="60" height="60" alt="FinTop DATA" style="display:block;width:60px;height:60px;border:0;outline:none;text-decoration:none;margin:0 auto;">
        </div>
        <div style="font-size:22px;font-weight:800;letter-spacing:1px;color:#ffffff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin-bottom:4px;">
          FinTop <span style="color:#c4b5fd;">DATA</span>
        </div>
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</h2>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 8px;">Xin chào <strong style="color:#c4b5fd;">Nguyễn Văn Tuấn</strong>,</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FinTop DATA. Nhấn nút bên dưới để tạo mật khẩu mới:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://fintopdata.vn/reset-password/?token=test" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(139,92,246,0.3);">
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

  const bodyPayload = {
    sender: {
      name: 'FinTop DATA',
      email: 'fintopdata.info@gmail.com',
    },
    to: [
      {
        email: 'fintopdata.info@gmail.com',
      },
    ],
    replyTo: {
      email: 'fintopdata.info@gmail.com',
    },
    subject: 'Dữ liệu chứng khoán FinTop DATA',
    htmlContent: htmlContent,
  };

  try {
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
    console.log('HTTP Status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

sendTestEmail();
