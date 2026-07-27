const fs = require('fs');
const html = `<tr>
                    <td style="width:50%;height:150px;padding-left:30px;vertical-align: middle;" onclick="{select_row(this);}">
                       <div>
                           <div>Tên khách hàng: Võ Ngọc Quyền</div>
                           <!-- <div>ID nhân sự : <span style="color:#ffb200"></span> </div> -->
                           <div>Số điện thoại : 0938173599</div>
                           <div>Địa chỉ Email : vnquyen88@gmail.com</div>
                           <div>Địa chỉ : Hcm</div>
                           <div>Ngày sinh : 1988-08-15</div>
                           <div>Ngày gia nhập : 2026-04-23 14:38:33</div>
                           <div>Thời gian đầu tư: 
                                                   </div>

                           <div>Khẩu vị đầu tư : 
                                                        Lướt sóng ngắn hạn
                                                       </div>
                           <div>Công ty chứng khoán  : vps</div>
                           <div>Số TKCK VPS (nếu có) : 473599</div>
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

console.log('textContent:', JSON.stringify(textContent));

const get = (pattern) => {
  const m = textContent.match(pattern);
  return m ? m[1].trim() : '';
};

console.log('Match Duration:', JSON.stringify(get(/Thời gian đầu tư[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Match Style:', JSON.stringify(get(/Khẩu vị đầu tư[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Match Company:', JSON.stringify(get(/Công ty chứng khoán[ \t]*:[ \t]*([^\r\n:]*)/i)));
console.log('Match Account:', JSON.stringify(get(/Số TKCK VPS \(nếu có\)[ \t]*:[ \t]*([^\r\n:]*)/i) || get(/Số TKCK[ \t]*:[ \t]*([^\r\n:]*)/i)));
