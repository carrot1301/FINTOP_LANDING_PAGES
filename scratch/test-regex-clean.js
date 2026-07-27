const fs = require('fs');

const quyenHtml = `<tr>
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

const sasdasdHtml = `<tr>
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

function parse(html) {
  // First collapse all whitespace/newlines inside HTML
  const collapsed = html.replace(/\s+/g, ' ');

  const textContent = collapsed
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

  const tdMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
  let manager = '';
  if (tdMatches && tdMatches.length >= 4) {
    manager = tdMatches[3]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  return {
    fullName: get(/Tên khách hàng[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Tên[ \t]*:[ \t]*([^\r\n]*)/i),
    phone: get(/Số điện thoại[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Số điện thoai[ \t]*:[ \t]*([^\r\n]*)/i),
    email: get(/Địa chỉ Email[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Email[ \t]*:[ \t]*([^\r\n]*)/i),
    address: get(/Địa chỉ[ \t]*:[ \t]*([^\r\n]*)/i),
    dob: get(/Ngày sinh[ \t]*:[ \t]*([^\r\n]*)/i),
    joinDate: get(/Ngày gia nhập[ \t]*:[ \t]*([^\r\n]*)/i),
    investmentDuration: get(/Thời gian đầu tư[ \t]*:[ \t]*([^\r\n]*)/i),
    investmentStyle: get(/Khẩu vị đầu tư[ \t]*:[ \t]*([^\r\n]*)/i),
    stockCompany: get(/Công ty chứng khoán[ \t]*:[ \t]*([^\r\n]*)/i),
    stockAccount: get(/Số TKCK VPS \(nếu có\)[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Số TKCK[ \t]*:[ \t]*([^\r\n]*)/i),
    tierLevel: get(/Loại tài khoản[ \t]*:[ \t]*([^\r\n]*)/i),
    role: get(/Quyền truy cập[ \t]*:[ \t]*([^\r\n]*)/i),
    manager: manager || '-',
  };
}

console.log('Quyen:', parse(quyenHtml));
console.log('Sasdasd:', parse(sasdasdHtml));
