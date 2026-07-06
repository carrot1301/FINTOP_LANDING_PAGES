// ============================================================
// HƯỚNG DẪN SỬ DỤNG:
// 1. Mở trình duyệt, đăng nhập vào https://fintopdata.vn/login
//    với tk: tuannv7105@gmail.com / pass: tuantuan2k5ZXC
//
// 2. Vào trang QUẢN TRỊ NHÂN SỰ: https://fintopdata.vn/system/staff/index
//    Mở Console (F12 → Console), dán đoạn code sau và Enter:
// ============================================================

// --- SCRIPT 1: TRÍCH XUẤT DỮ LIỆU NHÂN SỰ ---
(function() {
  const rows = document.querySelectorAll('table tbody tr');
  const data = [];
  rows.forEach(row => {
    const text = row.innerText;
    if (!text.includes('Địa chỉ Email')) return;
    
    const get = (label) => {
      const m = text.match(new RegExp(label + '\\s*:\\s*([^\\n]+)'));
      return m ? m[1].trim() : '';
    };
    
    data.push({
      fullName: get('Tên'),
      staffCode: get('ID nhân sự'),
      phone: get('Số điện thoại') || get('Số điện thoai'),
      email: get('Địa chỉ Email'),
      address: get('Địa chỉ'),
      dob: get('Ngày sinh'),
      role: get('Quyền truy cập'),
    });
  });
  
  // Copy to clipboard
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert(`Đã copy ${data.length} bản ghi nhân sự vào clipboard!\nHãy dán (Ctrl+V) vào file scratch/staff_data.json`);
  });
  console.log('Staff Data:', data);
  console.log('JSON:', json);
})();

// ============================================================
// 3. Dán kết quả vào file: scratch/staff_data.json
//
// 4. Vào trang QUẢN TRỊ KHÁCH HÀNG: https://fintopdata.vn/system/client/index
//    Mở Console (F12 → Console), dán đoạn code sau và Enter:
// ============================================================

// --- SCRIPT 2: TRÍCH XUẤT DỮ LIỆU KHÁCH HÀNG ---
// LƯU Ý: Nếu có phân trang, cần chạy script này trên MỖI TRANG
// rồi gộp kết quả lại.
(function() {
  const rows = document.querySelectorAll('table tbody tr');
  const data = [];
  rows.forEach(row => {
    const text = row.innerText;
    if (!text.includes('Địa chỉ Email')) return;
    
    const get = (label) => {
      const m = text.match(new RegExp(label + '\\s*:\\s*([^\\n]+)'));
      return m ? m[1].trim() : '';
    };
    
    data.push({
      fullName: get('Tên khách hàng'),
      phone: get('Số điện thoại') || get('Số điện thoai'),
      email: get('Địa chỉ Email'),
      address: get('Địa chỉ'),
      dob: get('Ngày sinh'),
      joinDate: get('Ngày gia nhập'),
      investmentDuration: get('Thời gian đầu tư'),
      investmentStyle: get('Khẩu vị đầu tư'),
      stockCompany: get('Công ty chứng khoán'),
      stockAccount: get('Số TKCK VPS \\(nếu có\\)') || get('Số TKCK'),
      tierLevel: get('Loại tài khoản'),
      role: get('Quyền truy cập'),
    });
  });
  
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert(`Đã copy ${data.length} bản ghi khách hàng vào clipboard!\nHãy dán (Ctrl+V) vào file scratch/client_data.json`);
  });
  console.log('Client Data:', data);
  console.log('JSON:', json);
})();

// ============================================================
// 5. Dán kết quả vào file: scratch/client_data.json
//
// 6. Sau khi có cả 2 file JSON, chạy lệnh:
//    node scratch/import-data.js
// ============================================================
