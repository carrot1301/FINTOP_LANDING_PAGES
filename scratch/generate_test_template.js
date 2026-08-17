const fs = require('fs');

function buildPasswordResetTemplate(fullName, resetLink) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dữ liệu chứng khoán FinTop DATA</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#0f0a1e;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#0f0a1e;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:linear-gradient(145deg,#1a1432,#0d0b1a);border-radius:16px;border:1px solid rgba(139,92,246,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;">
          <!-- HEADER WITH LOGO -->
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;">
              <div style="display:inline-block;padding:12px;background:rgba(139,92,246,0.15);border-radius:50%;border:1px solid rgba(139,92,246,0.4);margin-bottom:12px;">
                <img src="https://fintopdata.vn/assets/images/fintop-logo-circle-icon.png" width="60" height="60" alt="FinTop DATA" style="display:block;width:60px;height:60px;border:0;outline:none;text-decoration:none;">
              </div>
              <div style="font-size:22px;font-weight:800;letter-spacing:1px;color:#ffffff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin-bottom:4px;">
                FinTop <span style="color:#c4b5fd;">DATA</span>
              </div>
              <div style="width:60px;height:3px;background:linear-gradient(90deg,#8b5cf6,#6366f1);margin:12px auto 0;border-radius:4px;"></div>
            </td>
          </tr>

          <!-- CONTENT BODY -->
          <tr>
            <td style="padding:0 32px 32px;">
              <h2 style="color:#ffffff;font-size:18px;font-weight:700;margin-top:0;margin-bottom:20px;text-align:center;letter-spacing:0.5px;text-transform:uppercase;">
                Yêu cầu đặt lại mật khẩu
              </h2>
              
              <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 12px;">
                Xin chào <strong style="color:#c4b5fd;">${fullName}</strong>,
              </p>
              
              <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FinTop DATA. Nhấn nút bên dưới để tiến hành tạo mật khẩu mới:
              </p>
              
              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(139,92,246,0.4);">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;text-align:center;">
                ⏱ Link có hiệu lực trong <strong>30 phút</strong>.
              </p>
              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;text-align:center;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
              </p>
              
              <!-- FOOTER -->
              <div style="border-top:1px solid rgba(100,116,139,0.25);padding-top:20px;margin-top:20px;text-align:center;">
                <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 8px;">
                  Nếu gặp sự cố, bạn vui lòng phản hồi lại email này (<a href="mailto:fintopdata.info@gmail.com" style="color:#c4b5fd;text-decoration:none;">fintopdata.info@gmail.com</a>) hoặc liên hệ hotline: <strong>086.234.8886</strong>
                </p>
                <p style="color:#475569;font-size:11px;margin:0;">
                  © 2026 FinTop DATA — Kỷ Nguyên Đầu Tư Mới
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const testHtml = buildPasswordResetTemplate('Nguyễn Văn Tuấn', 'https://fintopdata.vn/reset-password/?token=xyz123');
fs.writeFileSync('./scratch/test_reset_template.html', testHtml);
console.log('Saved test_reset_template.html');
