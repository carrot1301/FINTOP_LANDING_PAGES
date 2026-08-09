/**
 * test-all-accounts-login.js
 * ---------------------------------------------------
 * Script kiểm tra đăng nhập tất cả tài khoản trong hệ thống FinTop
 * và kiểm tra chức năng quên mật khẩu (forgot password).
 *
 * Kết quả sẽ được ghi ra console + file CSV.
 * ---------------------------------------------------
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.fintopdata.vn';
const DEFAULT_PASSWORD = 'FinTop@2026';

// ─── Danh sách tất cả các tài khoản (lấy từ DANH_SACH_TAI_KHOAN_FINTOP.md) ─── 
// Chỉ cần unique email (không lặp lại)
const ALL_ACCOUNTS = [
  // BAN ĐIỀU HÀNH & QUẢN TRỊ
  { id: 1,   email: 'admin@fintop.vn',                      name: 'Super Admin' },
  { id: 6,   email: 'tuannv7105@gmail.com',                  name: 'Nguyễn Văn Tuấn' },
  { id: 21,  email: 'ceo@fintop.vn',                         name: 'Nguyễn Thế Anh' },
  { id: 22,  email: 'assistant@fintop.vn',                   name: 'Trần Minh Hằng' },
  { id: 26,  email: 'sale.admin@fintop.vn',                  name: 'Đỗ Gia Bảo' },
  { id: 105, email: 'fintop.bashare@gmail.com',              name: 'Nguyễn Công Luật' },
  { id: 110, email: 'fintop.ba@gmail.com',                   name: 'FinTop_Admin' },
  { id: 111, email: 'thanhphuc.bf14@fintop.vn',              name: 'Nguyễn Thành Phúc' },
  { id: 113, email: 'khanhlinh.8043@fintop.vn',              name: 'Trần Khánh Linh (staff)' },
  { id: 114, email: 'tuannv.8043@fintop.vn',                 name: 'Nguyễn Văn Tuấn (staff)' },
  { id: 121, email: 'withna0610@gmail.com',                  name: 'Đào Thị Ngọc Anh' },
  { id: 122, email: 'khanhlinhtran10150@gmail.com',           name: 'Trần Khánh Linh' },
  { id: 130, email: 'hailedylan889@gmail.com',               name: 'Nguyễn Đình Hải' },
  { id: 134, email: 'thanhphucubqn@gmail.com',               name: 'Nguyễn Thành Phúc' },
  { id: 155, email: 'tuanmv7105@gmail.com',                  name: 'Nguyễn Văn Tuấn (2)' },
  { id: 156, email: 'doantri12343@gmail.com',                name: 'Đoàn Nguyên Trí' },

  // NHÂN SỰ & CHUYÊN VIÊN MÔI GIỚI
  { id: 10,  email: 'editor@fintop.vn',                      name: 'Vũ Quốc Việt' },
  { id: 14,  email: 'expert@fintop.vn',                      name: 'Vũ Việt Đức' },
  { id: 24,  email: 'editor.pro@fintop.vn',                  name: 'Lê Thu Trang' },
  { id: 27,  email: 'sale@fintop.vn',                        name: 'Hoàng Lan Anh' },
  { id: 112, email: 'hoaithu.5016@fintop.vn',                name: 'Hoài Thu Nguyễn' },
  { id: 116, email: 'dinhhai.6061@fintop.vn',                name: 'Nguyễn Đình Hải' },
  { id: 117, email: 'quocviet.bpj4@fintop.vn',               name: 'Trần Quốc Việt' },
  { id: 120, email: 'tthanhthao250604.fam@gmail.com',         name: 'Trần Thị Thanh Thảo' },
  { id: 123, email: 'hanhnm91@gmail.com',                    name: 'Nguyễn Minh Hạnh' },
  { id: 124, email: 'nhuquynhnguyen16102002@gmail.com',       name: 'Nguyễn Như Quỳnh' },
  { id: 125, email: 'nguyenduyan179202@gmail.com',            name: 'Nguyễn Duy An' },
  { id: 126, email: 'diuhoang517@gmail.com',                 name: 'Hoàng Thị Dịu' },
  { id: 127, email: 'duyhoangvu2692004@gmail.com',            name: 'Vũ Hoàng Duy' },
  { id: 128, email: 'leducvh02@gmail.com',                   name: 'Lê Đình Đức' },
  { id: 129, email: 'khangthuan07@gmail.com',                name: 'Nguyễn Thuận Khang' },
  { id: 131, email: 'dannhihht@gmail.com',                   name: 'Phan Nữ Đan Nhi' },
  { id: 132, email: 'nguyendat28112004@gmail.com',            name: 'nguyễn bách đạt' },
  { id: 133, email: 'viettb234@gmail.com',                   name: 'Trần Quốc Việt' },
  { id: 135, email: 'thugie79.93@gmail.com',                 name: 'Hoài Thu Nguyễn' },
  { id: 136, email: 'doanphuonghanhmthh@gmail.com',           name: 'Đoàn Phương Hạnh' },
  { id: 137, email: 'phuongwmai281103@gmail.com',             name: 'Nguyễn Lê Phương Mai' },
  { id: 138, email: 'ngoc.nt0899@gmail.com',                 name: 'Nguyễn Thị Ngọc' },
  { id: 139, email: 'nguyenmaithy04@gmail.com',               name: 'Nguyễn Mai Thy' },
  { id: 140, email: 'nstung234@gmail.com',                   name: 'Ngô Sơn Tùng' },
  { id: 141, email: 'giangthuy2711@gmail.com',               name: 'Nguyễn Thị Thùy Giang' },
  { id: 142, email: 'long2004ptit@gmail.com',                name: 'Vũ Thành Long' },
  { id: 143, email: 'hothinh338@gmail.com',                  name: 'Hồ Phú Thịnh' },
  { id: 144, email: 'olianbill2508@gmail.com',               name: 'Dang Nhu Ngoc' },
  { id: 145, email: 'phuonganh03ntt@gmail.com',              name: 'Nguyễn Thị Phương Anh' },
  { id: 146, email: 'la217112@gmail.com',                    name: 'Lã Yến Nhi' },
  { id: 147, email: 'dmnguyen12977@gmail.com',               name: 'Nguyên Minh Dương' },
  { id: 148, email: 'ntlieuxd2005@gmail.com',                name: 'Nguyễn Thị Liễu' },
  { id: 149, email: 'giangjojo2004@gmail.com',               name: 'Nguyễn Trường Giang' },
  { id: 150, email: 'lehatrang21102004@gmail.com',            name: 'Lê Hà Trang' },
  { id: 151, email: 'loanttp203@gmail.com',                  name: 'Trần Thị Phương Loan' },
  { id: 152, email: 'thungocph@gmail.com',                   name: 'Phạm Thị Ngọc Thu' },
  { id: 153, email: 'nguyentrinhthanh05012005@gmail.com',     name: 'Trịnh Thành Nguyễn' },
  { id: 154, email: 'tnam19884@gmail.com',                   name: 'Trần Tuấn Nam' },
  { id: 166, email: 'le217112@gmail.com',                    name: 'Lê Yến Nhi' },
  { id: 167, email: 'nguyentrungthanh05012005@gmail.com',     name: 'Trung Thành Nguyễn' },

  // KHÁCH HÀNG
  { id: 2,   email: 'user_silver@fintop.vn',                 name: 'Nguyễn Văn Bạc' },
  { id: 3,   email: 'user_gold@fintop.vn',                   name: 'Trần Thị Vàng' },
  { id: 4,   email: 'user_diamond@fintop.vn',                name: 'Phạm Minh Kim Cương' },
  { id: 5,   email: 'anhtuanzxc710@gmail.com',               name: 'nguyễn văn tuấn' },
  { id: 9,   email: 'api-test@fintop.vn',                    name: 'API Tester' },
  { id: 12,  email: 'alertuser@fintop.vn',                   name: 'Test Alert User' },
  { id: 13,  email: 'realtime@fintop.vn',                    name: 'Realtime Test User' },
  { id: 16,  email: 'anhtuan2k5zxc@gmail.com',               name: 'nguyễn văn tuấn (2)' },
  { id: 23,  email: 'editor.admin@fintop.vn',                name: 'Phạm Thanh Sơn' },
  { id: 30,  email: 'testuser@fintop.vn',                    name: 'Test User' },
  { id: 31,  email: 'phamtranphucan1002@gmail.com',           name: 'sasdasd' },
  { id: 32,  email: 'vnquyen88@gmail.com',                   name: 'Võ Ngọc Quyền' },
  { id: 33,  email: 'thuphuong21.rec@gmail.com',             name: 'Nguyễn Thị Thu Phương' },
  { id: 34,  email: 'quynhtrangtran3623@gmail.com',           name: 'Quynh Trang Tran' },
  { id: 35,  email: 'truongld.sacoland@gmail.com',           name: 'Lê đình trường' },
  { id: 36,  email: 'phamkhanhphuong0203@gmail.com',          name: 'Phương Phạm Khánh' },
  { id: 37,  email: 'tuanminh310820@gmail.com',              name: 'Phan Tuấn Minh' },
  { id: 38,  email: 'baongocqb55@gmail.com',                 name: 'Trần Hùng Long' },
  { id: 39,  email: 'duongthanhdatn@gmail.com',              name: 'DUONG THANH DAT NGUYEN' },
  { id: 40,  email: 'ltdung.cn4@gmail.com',                  name: 'Lê Thị Thanh Dung' },
  { id: 41,  email: 'chilong0126@gmail.com',                 name: 'Hoàng Chí Long' },
  { id: 42,  email: 'chuphuongg032@gmail.com',               name: 'Chu Mai Phương' },
  { id: 43,  email: 'wanghuy2712@gmail.com',                 name: 'Trần Quang Huy' },
  { id: 44,  email: 'phamtangthaonguyen@gmail.com',           name: 'Phạm Tăng Thảo Nguyên' },
  { id: 45,  email: 'anhdtp.tec@gmail.com',                  name: 'Đoàn thị phương anh' },
  { id: 46,  email: 'hovanlinh@yahoo.com',                   name: 'HỒ VĂN LĨNH' },
  { id: 47,  email: 'huongdn2008@gmail.com',                 name: 'Đặng Thị Ngọc Hương' },
  { id: 48,  email: 'dhung8039@gmail.com',                   name: 'Đỗ Minh Hưng' },
  { id: 49,  email: 'peinopie@gmail.com',                    name: 'Bùi Hương Giang' },
  { id: 50,  email: 'phamcongtuan1106@gmail.com',             name: 'Phạm Công Tuấn' },
  { id: 51,  email: 'vuhaphuong692@gmail.com',               name: 'Vũ Hà Phương' },
  { id: 52,  email: 'phuonganh2559@gmail.com',               name: 'Nguyễn Ngọc Phương Anh' },
  { id: 53,  email: 'nguyentoannam942003@gmail.com',          name: 'Nguyễn Toàn Nam' },
  { id: 54,  email: 'luongthevinh129bk@gmail.com',           name: 'Lương Thế Vinh' },
  { id: 55,  email: 'v11bbpp@gmail.com',                     name: 'Nguyen Duc Vinh' },
  { id: 56,  email: 'anhvh.qn@gmail.com',                    name: 'Vũ Hoàng Anh' },
  { id: 57,  email: 'namnghiahiep900@gmail.com',             name: 'nguyen van nam' },
  { id: 58,  email: 'tranthidiep2310@gmail.com',             name: 'Trần Điệp' },
  { id: 59,  email: 'huyentd03@gmail.com',                   name: 'Dương Thị Huyền' },
  { id: 60,  email: 'huytqbn@gmail.com',                     name: 'Trần Quang Huy' },
  { id: 61,  email: 'phamcuongthm@yahoo.com',                name: 'Phạm Cương' },
  { id: 62,  email: 'bang.hs1978@gmail.com',                 name: 'Hồ Sỹ Băng hồ' },
  { id: 63,  email: 'diepdanle0108@gmail.com',               name: 'Lê Dư Diệp Đan' },
  { id: 64,  email: 'hoangminh01122019@gmail.com',           name: 'Lê Hoàng Minh' },
  { id: 65,  email: 'sweet.huy110@gmail.com',                name: 'Duc Huy' },
  { id: 66,  email: 'hpnguyen1996@gmail.com',                name: 'Nguyễn Hồng Phương' },
  { id: 67,  email: 'minhvuong040194@gmail.com',             name: 'Trần Minh Vương' },
  { id: 68,  email: 'yahoo2k4@gmail.com',                    name: 'trần thành đạt' },
  { id: 69,  email: 'namanhdapchai@gmail.com',               name: '22121' },
  { id: 70,  email: 'congnc2@bidv.com.vn',                   name: 'Ngô Chí Công' },
  { id: 71,  email: 'nguyenthanhan6102004@gmail.com',         name: 'nguyễn thành an' },
  { id: 72,  email: 'hoangvu0108mr@gmail.com',               name: 'Hoàng Vũ' },
  { id: 73,  email: 'nguyencongluat092001@gmail.com',         name: 'luatnc' },
  { id: 74,  email: 'minhchienhn33@gmail.com',               name: 'minhchien87' },
  { id: 75,  email: 'ptu186204@gmail.com',                   name: 'Phạm Thanh Tú' },
  { id: 76,  email: 'xolano8558@gmail.com',                  name: 'ANH TUAN' },
  { id: 77,  email: 'ntminh0922@gmail.com',                  name: 'Minh Nguyen Thanh' },
  { id: 78,  email: 'lehatamduong@gmail.com',                name: 'Le ha tam duong' },
  { id: 79,  email: 'luongtuyen.271298@gmail.com',           name: 'Lương Đặng Bích Tuyền' },
  { id: 80,  email: 'maihoa.x9290@gmail.com',                name: 'Mai Thị Hoa' },
  { id: 81,  email: 'thuytrangle171024@gmail.com',           name: 'Lê Thị Thùy Trang' },
  { id: 82,  email: 'ttaikt505@gmail.com',                   name: 'Nguyễn Trọng Tài' },
  { id: 83,  email: 'sanhhen@gmail.com',                     name: 'Lucky' },
  { id: 84,  email: 'theloihau@gmail.com',                   name: 'Mr Tran' },
  { id: 85,  email: 'trinhthuyhien0202@gmail.com',           name: 'Trịnh Thúy Hiền' },
  { id: 86,  email: 'letham742002@gmail.com',                name: 'Lê Thị Thắm' },
  { id: 87,  email: 'xuanthu189@gmail.com',                  name: 'trần xuân thu' },
  { id: 88,  email: 'vuongtrangshiho@gmail.com',             name: 'Phạm Quang Huy' },
  { id: 89,  email: 'nguyenhuuhoang022021@gmail.com',         name: 'Hoang Nguyen Huu' },
  { id: 90,  email: 'ngolamthanh101@gmail.com',              name: 'Ngo Thanh' },
  { id: 91,  email: 'minhorigin2003@gmail.com',              name: 'Nguyễn Hoàng Nhật Minh' },
  { id: 92,  email: 'thuydungcpg@gmail.com',                 name: 'lê thuỳ dung' },
  { id: 93,  email: 'ngomaihien813hn@gmail.com',             name: 'Ngô Mai Hiên' },
  { id: 94,  email: 'myanhbui.vac@gmail.com',                name: 'Bùi Mỹ Anh' },
  { id: 95,  email: 'haitrongtran1@gmail.com',               name: 'Trần Trọng Hải' },
  { id: 96,  email: 'aiphuong88@gmail.com',                  name: 'Hà Thị Ái Phương' },
  { id: 97,  email: 'tuanlong95.nuce@gmail.com',             name: 'Nguyễn Tuấn Long' },
  { id: 98,  email: 'maitiendung210899@gmail.com',           name: 'Mai Tiến Dũng' },
  { id: 99,  email: 'haanh.n2211@gmail.com',                 name: 'Nguyễn Hà Anh' },
  { id: 100, email: 'tuancao.investor@gmail.com',            name: 'Cao Tuan' },
  { id: 101, email: 'linhdemons2006@gmail.com',              name: 'Trần Đức Huy' },
  { id: 102, email: 'thientu8d@gmail.com',                   name: 'Trần Thiện Tú' },
  { id: 103, email: 'thanhcaht38@gmail.com',                 name: 'Nguyễn Thị Thanh Ca' },
  { id: 108, email: 'linhkhantran1111@gmail.com',            name: 'nguyễn văn văn' },
  { id: 164, email: 'linhkhanhtran1111@gmail.com',           name: 'linh' },
  { id: 175, email: 'test_billing@fintop.vn',                name: 'Test User Billing' },
  { id: 178, email: 'test1@fintop.vn',                       name: 'Test 1' },
];

// ─── HTTP Helpers ───

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseData) });
        } catch {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ───

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  KIỂM TRA ĐĂNG NHẬP TẤT CẢ TÀI KHOẢN HỆ THỐNG FINTOP DATA');
  console.log(`  API: ${API_BASE}`);
  console.log(`  Thời gian: ${new Date().toLocaleString('vi-VN')}`);
  console.log(`  Tổng số tài khoản: ${ALL_ACCOUNTS.length}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const results = [];
  let successCount = 0;
  let emailNotVerifiedCount = 0;
  let invalidCredentialsCount = 0;
  let disabledCount = 0;
  let otherErrorCount = 0;

  // ─── PHASE 1: Test Login tất cả tài khoản ───
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 1: TEST ĐĂNG NHẬP TẤT CẢ TÀI KHOẢN                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  for (let i = 0; i < ALL_ACCOUNTS.length; i++) {
    const acc = ALL_ACCOUNTS[i];
    const idx = String(i + 1).padStart(3, ' ');
    
    try {
      const res = await postJson(`${API_BASE}/auth/login`, {
        email: acc.email,
        password: DEFAULT_PASSWORD,
      });

      let status = '';
      let detail = '';

      if (res.status === 200 && res.body.accessToken) {
        status = '✅ OK';
        detail = `userId=${res.body.user?.id}, tier=${res.body.user?.tierLevel}`;
        successCount++;
      } else if (res.status === 403) {
        const msg = res.body.message || '';
        if (msg === 'EMAIL_NOT_VERIFIED') {
          status = '❌ EMAIL_NOT_VERIFIED';
          detail = 'Email chưa xác thực → cần verify hoặc set emailVerifiedAt';
          emailNotVerifiedCount++;
        } else if (msg.includes('disabled') || msg.includes('locked')) {
          status = '🔒 DISABLED/LOCKED';
          detail = msg;
          disabledCount++;
        } else {
          status = `⚠️  403: ${msg}`;
          detail = JSON.stringify(res.body).slice(0, 100);
          otherErrorCount++;
        }
      } else if (res.status === 401) {
        status = '🔑 INVALID_CREDENTIALS';
        detail = 'Sai mật khẩu hoặc email không tồn tại';
        invalidCredentialsCount++;
      } else {
        status = `⚠️  HTTP ${res.status}`;
        detail = JSON.stringify(res.body).slice(0, 100);
        otherErrorCount++;
      }

      results.push({ ...acc, status, detail, httpStatus: res.status });
      console.log(`[${idx}/${ALL_ACCOUNTS.length}] ${acc.email.padEnd(45)} ${status}  ${detail}`);

    } catch (err) {
      const status = `💥 ERROR: ${err.message}`;
      results.push({ ...acc, status, detail: err.message, httpStatus: 0 });
      console.log(`[${idx}/${ALL_ACCOUNTS.length}] ${acc.email.padEnd(45)} ${status}`);
      otherErrorCount++;
    }

    // Rate-limit: đợi 200ms giữa mỗi request
    await sleep(200);
  }

  // ─── PHASE 2: Test Forgot Password cho 5 tài khoản mẫu ───
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 2: TEST CHỨC NĂNG QUÊN MẬT KHẨU (FORGOT PASSWORD)  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const forgotTestAccounts = [
    'khanhlinhtran10150@gmail.com',
    'tuannv7105@gmail.com',
    'fintop.ba@gmail.com',
    'testuser@fintop.vn',
    'nonexistent-test-xyz@fintop.vn',  // email không tồn tại
  ];

  const forgotResults = [];

  for (const email of forgotTestAccounts) {
    try {
      const res = await postJson(`${API_BASE}/auth/forgot-password`, { email });
      const ok = res.status === 200;
      const detail = typeof res.body === 'object' ? (res.body.message || JSON.stringify(res.body)) : res.body;
      forgotResults.push({ email, httpStatus: res.status, message: detail });
      console.log(`  [Forgot] ${email.padEnd(45)} HTTP ${res.status}  ${ok ? '✅' : '❌'}  ${detail}`);
    } catch (err) {
      forgotResults.push({ email, httpStatus: 0, message: err.message });
      console.log(`  [Forgot] ${email.padEnd(45)} 💥 ERROR  ${err.message}`);
    }
    await sleep(300);
  }

  // ─── SUMMARY ───
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  📊 TỔNG KẾT KẾT QUẢ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Tổng tài khoản test:        ${ALL_ACCOUNTS.length}`);
  console.log(`  ✅ Đăng nhập thành công:     ${successCount}`);
  console.log(`  ❌ Email chưa xác thực:      ${emailNotVerifiedCount}`);
  console.log(`  🔑 Sai mật khẩu/không TT:    ${invalidCredentialsCount}`);
  console.log(`  🔒 Bị khóa/vô hiệu:         ${disabledCount}`);
  console.log(`  ⚠️  Lỗi khác:                ${otherErrorCount}`);
  console.log('═══════════════════════════════════════════════════════════════════');

  // ─── Liệt kê chi tiết tài khoản bị lỗi EMAIL_NOT_VERIFIED ───
  const unverified = results.filter(r => r.status.includes('EMAIL_NOT_VERIFIED'));
  if (unverified.length > 0) {
    console.log(`\n📋 DANH SÁCH TÀI KHOẢN BỊ LỖI EMAIL_NOT_VERIFIED (${unverified.length}):`);
    console.log('─'.repeat(80));
    for (const r of unverified) {
      console.log(`  ID=${String(r.id).padStart(3)}  ${r.email.padEnd(45)}  ${r.name}`);
    }
  }

  // ─── Liệt kê tài khoản sai mật khẩu ───
  const invalidCreds = results.filter(r => r.status.includes('INVALID_CREDENTIALS'));
  if (invalidCreds.length > 0) {
    console.log(`\n📋 DANH SÁCH TÀI KHOẢN SAI MẬT KHẨU / KHÔNG TỒN TẠI (${invalidCreds.length}):`);
    console.log('─'.repeat(80));
    for (const r of invalidCreds) {
      console.log(`  ID=${String(r.id).padStart(3)}  ${r.email.padEnd(45)}  ${r.name}`);
    }
  }

  // ─── Lưu kết quả ra CSV ───
  const csvPath = path.join(__dirname, 'login-test-results.csv');
  const csvHeader = 'ID,Email,Name,HTTP Status,Result,Detail\n';
  const csvRows = results.map(r =>
    `${r.id},"${r.email}","${r.name}",${r.httpStatus},"${r.status}","${(r.detail || '').replace(/"/g, '""')}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');
  console.log(`\n📁 Kết quả chi tiết đã lưu vào: ${csvPath}`);
}

main().catch(console.error);
