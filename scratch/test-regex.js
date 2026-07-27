const fs = require('fs');
const html = `<tr>
    <td style="width:50%;height:150px;padding-left:30px;vertical-align: middle;">
       <div>
           <div>Tên khách hàng: sasdasd</div>
           <div>Số điện thoại : 0907753675</div>
           <div>Địa chỉ Email : phamtranphucan1002@gmail.com</div>
           <div>Địa chỉ : Thành phố Thủ Đức, Thành phố Hồ Chí Minh</div>
           <div>Ngày sinh : 2000-08-17</div>
           <div>Ngày gia nhập : 2026-05-12 10:56:32</div>
           <div>Thời gian đầu tư: 6 - 12 tháng</div>
           <div>Khẩu vị đầu tư : Linh hoạt kết hợp</div>
           <div>Công ty chứng khoán  : vps</div>
           <div>Số TKCK VPS (nếu có) : </div>
           <div>Loại tài khoản :  Thường </div>
           <div>Quyền truy cập : <span style="color:#ff7c00"> Khách hàng </span></div>
       </div>
    </td>
</tr>`;

const textContent = html
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/div>/gi, '\n')
  .replace(/<\/p>/gi, '\n')
  .replace(/<\/tr>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/[ \t]+/g, ' ')
  .trim();

const get = (pattern) => {
  const m = textContent.match(pattern);
  return m ? m[1].trim() : '';
};

// Use [ \t]* instead of \s* to prevent matching across newlines
console.log('Fixed Match 1:', JSON.stringify(get(/Số TKCK VPS \(nếu có\)[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Fixed Match 2:', JSON.stringify(get(/Số TKCK[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Fixed Company:', JSON.stringify(get(/Công ty chứng khoán[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Fixed Duration:', JSON.stringify(get(/Thời gian đầu tư[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Fixed Style:', JSON.stringify(get(/Khẩu vị đầu tư[ \t]*:[ \t]*([^\r\n:]*)/i)));
