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
        card.addEventListener('click', function () {
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

            // Cập nhật nội dung chuyển khoản tự động ở Bước 2
            updateTransferNote();
        });
    });

    // Gắn sự kiện tự động cập nhật nội dung chuyển khoản khi nhập họ tên / SĐT
    const proFullNameInput = document.getElementById('proFullName');
    const proPhoneInput = document.getElementById('proPhone');

    if (proFullNameInput) {
        proFullNameInput.addEventListener('input', updateTransferNote);
    }
    if (proPhoneInput) {
        proPhoneInput.addEventListener('input', updateTransferNote);
    }
});

/**
 * Tự động cập nhật nội dung chuyển khoản dựa trên họ tên, SĐT, gói PRO đã chọn
 */
function updateTransferNote() {
    const nameVal = (document.getElementById('proFullName')?.value || '').trim().toUpperCase();
    const phoneVal = (document.getElementById('proPhone')?.value || '').trim();
    const activeCard = document.querySelector('.pro-package-card.active');
    const pkgValue = activeCard ? activeCard.getAttribute('data-package') : 'PRO1';
    const months = activeCard ? activeCard.getAttribute('data-months') : '3';

    const transferNoteInput = document.getElementById('proTransferNote');
    if (transferNoteInput) {
        if (nameVal || phoneVal) {
            // Format standard for transfer note
            const safeName = nameVal.replace(/[^A-Z0-9 ]/g, '');
            const safePhone = phoneVal.replace(/[^0-9]/g, '');
            transferNoteInput.value = `${safeName || '[HO TEN]'} ${safePhone || '[SDT]'} ${pkgValue} ${months} THANG`;
        } else {
            transferNoteInput.value = '';
            transferNoteInput.placeholder = `Ví dụ: NGUYEN VAN A 0862348886 ${pkgValue} ${months} THANG`;
        }
    }
}

/**
 * Xử lý xem trước ảnh chuyển khoản khi upload
 */
function handleReceiptPreview(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
        input.value = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (PNG, JPG, JPEG).');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const placeholder = document.getElementById('proUploadPlaceholder');
        const preview = document.getElementById('proUploadPreview');
        const img = document.getElementById('proReceiptImg');

        if (placeholder) placeholder.style.display = 'none';
        if (preview) {
            preview.style.display = 'flex';
        }
        if (img) {
            img.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Xóa ảnh chuyển khoản đã upload
 */
function removeReceiptPreview() {
    const input = document.getElementById('proReceiptUpload');
    const placeholder = document.getElementById('proUploadPlaceholder');
    const preview = document.getElementById('proUploadPreview');
    const img = document.getElementById('proReceiptImg');

    if (input) input.value = '';
    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (img) img.src = '';
}

/**
 * Mở modal hiển thị bảng giá tương ứng
 * @param {string} tier - Loại gói hoặc ID/Name của gói từ backend
 */
function openPricingModal(tier) {
    let resolvedTier = String(tier).toLowerCase();

    // Mapping: Dynamic package IDs/names to frontend modal IDs
    if (resolvedTier === '76' || resolvedTier === 'standard' || resolvedTier === 'free') {
        resolvedTier = 'standard';
    } else if (resolvedTier === '102' || resolvedTier.includes('silver') || resolvedTier.includes('bạc') || resolvedTier === 'pro') {
        resolvedTier = 'pro';
    } else if (resolvedTier === '96' || resolvedTier === '97' || resolvedTier === '103' || resolvedTier.includes('gold') || resolvedTier.includes('vàng') || resolvedTier === 'vip') {
        resolvedTier = 'vip';
    } else if (resolvedTier === '104' || resolvedTier.includes('diamond') || resolvedTier.includes('kim cương') || resolvedTier === 'diamond') {
        resolvedTier = 'diamond';
    } else {
        // Dynamic lookup from globally exposed MEMBERSHIP_DATA if present
        const memberships = window.MEMBERSHIP_DATA || (typeof MEMBERSHIP_DATA !== 'undefined' ? MEMBERSHIP_DATA : []);
        if (Array.isArray(memberships)) {
            const found = memberships.find(p => String(p.id) === resolvedTier || String(p.name).toLowerCase() === resolvedTier);
            if (found) {
                const level = String(found.tierLevel || '').toUpperCase();
                if (level === 'STANDARD' || level === 'FREE') resolvedTier = 'standard';
                else if (level === 'SILVER' || level === 'PRO') resolvedTier = 'pro';
                else if (level === 'GOLD' || level === 'VIP') resolvedTier = 'vip';
                else if (level === 'DIAMOND') resolvedTier = 'diamond';
            }
        }
    }

    // Fallback safe modal ID
    if (!['standard', 'pro', 'vip', 'diamond'].includes(resolvedTier)) {
        resolvedTier = 'standard';
    }

    const overlay = document.getElementById('pricing-modals');
    const modals = document.querySelectorAll('.pricing-modal');
    
    // Ẩn tất cả các modal đang mở
    modals.forEach(m => m.classList.remove('active'));
    
    // Tìm modal tương ứng
    const targetModal = document.getElementById(`modal-${resolvedTier}`);
    
    if (overlay && targetModal) {
        overlay.classList.add('active');
        // Cho một khoảng delay nhỏ để animation CSS trượt mượt hơn
        setTimeout(() => {
            targetModal.classList.add('active');
        }, 10);
        
        // Vô hiệu hóa cuộn nền
        document.body.style.overflow = 'hidden';

        // Pre-fill name and phone for authenticated user
        const Infra = window.FintopInfra;
        if (Infra && Infra.AuthManager && Infra.AuthManager.isAuthenticated) {
            let user = null;
            try {
                user = JSON.parse(localStorage.getItem('fintop_user') || '{}');
            } catch (e) {}

            const stateUser = (Infra.AppState && typeof Infra.AppState.getState === 'function') ? Infra.AppState.getState('user') : null;
            const userFullName = (user && user.fullName) ? user.fullName : (stateUser ? stateUser.displayName : '');

            const fullNameInput = document.getElementById('proFullName');
            const phoneInput = document.getElementById('proPhone');
            if (fullNameInput && !fullNameInput.value) {
                fullNameInput.value = userFullName || 'Hội viên FinTop';
            }
            if (phoneInput && !phoneInput.value) {
                phoneInput.value = (user && user.phone) ? user.phone : '0862348886'; // default valid VN phone number
            }
            updateTransferNote();
        }
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
 * Giả lập hoặc điều hướng đăng ký hội viên Standard
 * @param {string} [action] - Hành động 'login' hoặc 'register'
 */
function submitStandard(action) {
    if (typeof openAuthModal === 'function') {
        openAuthModal(action || 'register');
    } else {
        alert("Đang chuyển hướng tới trang Đăng ký tài khoản...");
    }
}

/**
 * Gửi yêu cầu phê duyệt gói PRO bằng cách tạo hóa đơn thực tế trong CSDL
 */
async function submitProApproval() {
    // 1. Kiểm tra hạ tầng kết nối & tình trạng đăng nhập trước khi validate thông tin form
    const Infra = window.FintopInfra;
    if (!Infra) {
        alert("Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.");
        return;
    }

    if (!Infra.AuthManager.isAuthenticated) {
        alert("Vui lòng đăng nhập để gửi yêu cầu phê duyệt.");
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }

    // Tự động điền nếu trường thông tin bị trống nhưng user đã đăng nhập
    const fullNameInput = document.getElementById('proFullName');
    const phoneInput = document.getElementById('proPhone');
    
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('fintop_user') || '{}');
    } catch (e) {}

    const stateUser = (Infra.AppState && typeof Infra.AppState.getState === 'function') ? Infra.AppState.getState('user') : null;
    const userFullName = (user && user.fullName) ? user.fullName : (stateUser ? stateUser.displayName : '');
    
    if (fullNameInput && !fullNameInput.value.trim()) {
        fullNameInput.value = userFullName || 'Hội viên FinTop';
    }
    if (phoneInput && !phoneInput.value.trim()) {
        phoneInput.value = (user && user.phone) ? user.phone : '0862348886';
    }
    updateTransferNote();

    // 2. Validate thông tin thanh toán (họ tên, SĐT)
    const fullName = (document.getElementById('proFullName')?.value || '').trim();
    const phone = (document.getElementById('proPhone')?.value || '').trim();

    if (!fullName) {
        alert('Vui lòng nhập Họ và tên.');
        document.getElementById('proFullName')?.focus();
        return;
    }

    if (!phone) {
        alert('Vui lòng nhập Số điện thoại.');
        document.getElementById('proPhone')?.focus();
        return;
    }

    // Validate định dạng số điện thoại VN (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.');
        document.getElementById('proPhone')?.focus();
        return;
    }

    // 3. Lấy gói đã chọn
    const activeCard = document.querySelector('.pro-package-card.active');
    const selectedPkg = activeCard ? activeCard.getAttribute('data-package') : 'PRO1';
    const selectedMonths = activeCard ? activeCard.getAttribute('data-months') : '3';

    // 4. Disable nút bấm khi đang xử lý
    const submitBtn = document.getElementById('btnProSubmit');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    try {
        // Lấy danh sách các gói dịch vụ từ backend
        const plansRes = await Infra.ApiClient.get(Infra.FintopEnv.API_ENDPOINTS.SUBSCRIPTION_PLANS);
        const plans = plansRes.data || plansRes || [];
        const targetPlan = plans.find(p => p.tierLevel === 'SILVER');
        
        if (!targetPlan) {
            throw new Error("Không tìm thấy cấu hình gói PRO (SILVER) trên hệ thống.");
        }

        // Tạo hóa đơn mới cho gói PRO
        const invoiceRes = await Infra.ApiClient.post('/billing/invoices', {
            planId: targetPlan.id
        });
        const data = invoiceRes.data || invoiceRes;
        const invoiceId = data.invoice?.id || data.id;

        alert(
            `✅ Yêu cầu phê duyệt thành công!\n\n` +
            `Hóa đơn #${invoiceId} đã được tạo ở trạng thái Chờ duyệt.\n` +
            `Gói đã chọn: ${selectedPkg} (${selectedMonths} tháng)\n` +
            `Họ tên: ${fullName}\n` +
            `SĐT: ${phone}\n\n` +
            `Anh/Chị vui lòng thực hiện chuyển khoản thanh toán. FinTop sẽ kích hoạt tài khoản PRO ngay sau khi xác nhận.`
        );
        closePricingModal();

        // Reset form
        const proFullNameEl = document.getElementById('proFullName');
        const proPhoneEl = document.getElementById('proPhone');
        const proTransferNoteEl = document.getElementById('proTransferNote');
        if (proFullNameEl) proFullNameEl.value = '';
        if (proPhoneEl) proPhoneEl.value = '';
        if (proTransferNoteEl) proTransferNoteEl.value = '';
        removeReceiptPreview();

    } catch (err) {
        console.error('[Billing] Failed to create subscription invoice:', err);
        alert(`Đăng ký thất bại: ${err.message || 'Không thể tạo yêu cầu phê duyệt.'}`);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

/**
 * Gửi yêu cầu liên kết tài khoản chứng khoán hoặc mở tài khoản cho gói V.I.P
 */
async function submitVIP(type) {
    if (type === 'open') {
        alert("Đang chuyển hướng tới trang Mở tài khoản Chứng khoán...");
        return;
    }

    const Infra = window.FintopInfra;
    if (!Infra) {
        alert("Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.");
        return;
    }

    if (!Infra.AuthManager.isAuthenticated) {
        alert("Vui lòng đăng nhập để gửi yêu cầu liên kết tài khoản.");
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }

    const accountVal = (document.getElementById('vipStockAccount')?.value || '').trim();
    const companyVal = (document.getElementById('vipStockCompany')?.value || '').trim();

    if (!accountVal || !companyVal) {
        alert("Vui lòng điền đầy đủ Số tài khoản chứng khoán và Công ty chứng khoán.");
        return;
    }

    const submitBtn = document.querySelector('#modal-vip .btn-modal-action.primary');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    try {
        // Lấy danh sách gói dịch vụ để chọn gói GOLD (VIP)
        const plansRes = await Infra.ApiClient.get(Infra.FintopEnv.API_ENDPOINTS.SUBSCRIPTION_PLANS);
        const plans = plansRes.data || plansRes || [];
        const targetPlan = plans.find(p => p.tierLevel === 'GOLD');
        
        if (!targetPlan) {
            throw new Error("Không tìm thấy cấu hình gói V.I.P (GOLD) trên hệ thống.");
        }

        // Tạo hóa đơn yêu cầu duyệt liên kết tài khoản
        const invoiceRes = await Infra.ApiClient.post('/billing/invoices', { planId: targetPlan.id });
        const data = invoiceRes.data || invoiceRes;
        const invoiceId = data.invoice?.id || data.id;

        alert(`Đã gửi Yêu cầu liên kết tài khoản thành công!\nHóa đơn yêu cầu duyệt #${invoiceId} đã được khởi tạo.\nFinTop sẽ kiểm tra tài khoản chứng khoán của Anh/Chị và phê duyệt mở khóa đặc quyền V.I.P trong vòng 1-3 ngày làm việc.`);
        closePricingModal();
        
        // Reset form
        const accountInput = document.getElementById('vipStockAccount');
        const companyInput = document.getElementById('vipStockCompany');
        if (accountInput) accountInput.value = '';
        if (companyInput) companyInput.value = '';
    } catch (err) {
        console.error('[Billing] Failed to create linking invoice:', err);
        alert(`Yêu cầu liên kết thất bại: ${err.message || 'Không thể tạo yêu cầu phê duyệt.'}`);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}
