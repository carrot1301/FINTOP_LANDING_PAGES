// Khởi tạo các event listeners khi tài liệu được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Đóng modal khi click ra ngoài (vào lớp overlay mờ)
    const overlay = document.getElementById('pricing-modals');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePricingModal();
            }
        });
    }

    // Gắn sự kiện chọn gói PRO (PRO1, PRO2, PRO3)
    const proCards = document.querySelectorAll('.pro-package-card');
    proCards.forEach(card => {
        card.addEventListener('click', function() {
            // Xóa active cũ
            proCards.forEach(c => c.classList.remove('active'));
            // Thêm active mới
            this.classList.add('active');
            
            // Lấy data và cập nhật thông tin thanh toán
            const pkgValue = this.getAttribute('data-package'); // Vd: PRO1, PRO2, PRO3
            const months = this.getAttribute('data-months');
            
            // Cập nhật nội dung chuyển khoản mẫu
            const noteElement = document.getElementById('pro-payment-note');
            if (noteElement) {
                noteElement.innerHTML = `[HỌ TÊN]_[SỐ ĐIỆN THOẠI]_[GÓI ${pkgValue} - ${months} THÁNG]<br>
                <span style="color:#64748b; font-size:0.85em;">Ví dụ: NGUYỄN VĂN A 0862348886 ${pkgValue} ${months} THÁNG</span>`;
            }
        });
    });
});

/**
 * Mở modal hiển thị bảng giá tương ứng
 * @param {string} tier - Loại gói (standard, pro, vip, diamond)
 */
function openPricingModal(tier) {
    const overlay = document.getElementById('pricing-modals');
    const modals = document.querySelectorAll('.pricing-modal');
    
    // Ẩn tất cả các modal đang mở
    modals.forEach(m => m.classList.remove('active'));
    
    // Tìm modal tương ứng
    const targetModal = document.getElementById(`modal-${tier}`);
    
    if (overlay && targetModal) {
        overlay.classList.add('active');
        // Cho một khoảng delay nhỏ để animation CSS trượt mượt hơn
        setTimeout(() => {
            targetModal.classList.add('active');
        }, 10);
        
        // Vô hiệu hóa cuộn nền
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Đóng tất cả các modal bảng giá
 */
function closePricingModal() {
    const overlay = document.getElementById('pricing-modals');
    const modals = document.querySelectorAll('.pricing-modal');
    
    modals.forEach(m => m.classList.remove('active'));
    
    if (overlay) {
        setTimeout(() => {
            overlay.classList.remove('active');
            // Mở lại cuộn nền
            document.body.style.overflow = '';
        }, 300); // Khớp với transition trong CSS
    }
}

/**
 * Giả lập thông báo phê duyệt
 */
function submitProApproval() {
    alert("Yêu cầu phê duyệt thành công!\nThông tin phê duyệt của Anh/Chị sẽ được xử lý trong 1 - 3 ngày làm việc.");
    closePricingModal();
}

/**
 * Giả lập nút đăng ký
 */
function submitStandard() {
    alert("Đang chuyển hướng tới trang Đăng ký tài khoản...");
}

/**
 * Giả lập nút mở tài khoản / liên kết tài khoản
 */
function submitVIP(type) {
    if (type === 'open') {
        alert("Đang chuyển hướng tới trang Mở tài khoản Chứng khoán...");
    } else {
        alert("Đã gửi Yêu cầu liên kết tài khoản. Chúng tôi sẽ kiểm tra và phản hồi sớm.");
        closePricingModal();
    }
}
