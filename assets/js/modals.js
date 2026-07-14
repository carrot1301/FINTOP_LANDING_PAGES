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
                noteElement.innerHTML = `<div>[HỌ TÊN]_[SỐ ĐIỆN THOẠI]_[GÓI ${pkgValue} - ${months} THÁNG]</div>
                <div style="color:#64748b; font-size:0.85em;">Ví dụ: NGUYỄN VĂN A_0862348886_${pkgValue} - ${months} THÁNG</div>`;
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

function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỹ|Ỷ|Ỵ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * CRC-16/CCITT-FALSE checksum (polynomial 0x1021, init 0xFFFF)
 * Required by EMVCo QR specification
 */
function crc16ccitt(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc;
}

/**
 * Build EMVCo-standard VietQR data string
 * Follows EMVCO Merchant-Presented QR specification + VietQR (Napas) extension
 * @param {string} bankBin  - Bank BIN (e.g. '970422' for MBBank)
 * @param {string} account  - Account number
 * @param {number} amount   - Transfer amount in VND
 * @param {string} addInfo  - Transfer description / purpose
 * @returns {string} Complete EMVCo data string with CRC
 */
function buildVietQRData(bankBin, account, amount, addInfo) {
    function tlv(tag, value) {
        return tag + String(value.length).padStart(2, '0') + value;
    }

    let payload = '';

    // 00 - Payload Format Indicator
    payload += tlv('00', '01');

    // 01 - Point of Initiation Method (12 = dynamic QR with amount)
    payload += tlv('01', '12');

    // 38 - Merchant Account Information (VietQR)
    let merchantAcct = '';
    merchantAcct += tlv('00', 'A000000727');           // VietQR Global Unique Identifier
    let consumerInfo = '';
    consumerInfo += tlv('00', bankBin);                 // Acquirer ID (Bank BIN)
    consumerInfo += tlv('01', account);                 // Consumer Account Number
    merchantAcct += tlv('01', consumerInfo);
    merchantAcct += tlv('02', 'QRIBFTTA');             // Service code: QR Interbank Fund Transfer to Account
    payload += tlv('38', merchantAcct);

    // 53 - Transaction Currency (704 = VND)
    payload += tlv('53', '704');

    // 54 - Transaction Amount
    if (amount && amount > 0) {
        payload += tlv('54', String(amount));
    }

    // 58 - Country Code
    payload += tlv('58', 'VN');

    // 62 - Additional Data Field Template
    if (addInfo) {
        let field62 = tlv('08', addInfo);              // 08 = Purpose of Transaction
        payload += tlv('62', field62);
    }

    // 63 - CRC (append tag + length placeholder, compute CRC, append hex value)
    payload += '6304';
    const crc = crc16ccitt(payload);
    payload += crc.toString(16).toUpperCase().padStart(4, '0');

    return payload;
}

/**
 * Render QR code to an <img> element using qrcode-generator library
 * @param {string} data - The data to encode
 * @param {HTMLImageElement} imgEl - Target image element
 */
function renderQRToImg(data, imgEl) {
    if (typeof qrcode !== 'function') {
        // Library not loaded yet, fallback to VietQR image API
        imgEl.src = `https://img.vietqr.io/image/MB-862862348886-compact2.png?amount=2500000&addInfo=FINTOP`;
        return;
    }
    // Type 0 = auto-detect version, Error correction M (15%)
    const qr = qrcode(0, 'M');
    qr.addData(data);
    qr.make();

    // Create data URL: cell size 6px, margin 2 cells
    imgEl.src = qr.createDataURL(6, 2);
}

/**
 * Tự động cập nhật nội dung chuyển khoản, số tiền, và mã VietQR động (EMVCo client-side)
 */
function updateTransferNote() {
    const nameInput = document.getElementById('proFullName');
    const phoneInput = document.getElementById('proPhone');
    const nameVal = (nameInput?.value || '').trim();
    const phoneVal = (phoneInput?.value || '').trim();
    const activeCard = document.querySelector('.pro-package-card.active');
    const pkgValue = activeCard ? activeCard.getAttribute('data-package') : 'PRO1';
    const months = activeCard ? activeCard.getAttribute('data-months') : '3';

    const transferNoteInput = document.getElementById('proTransferNote');
    
    // Clean inputs for the note
    const safeName = removeVietnameseTones(nameVal).replace(/[^A-Z0-9 ]/g, '');
    const safePhone = phoneVal.replace(/[^0-9]/g, '');

    if (transferNoteInput) {
        if (nameVal || phoneVal) {
            transferNoteInput.value = `${safeName || '[HO TEN]'}_${safePhone || '[SDT]'}_${pkgValue} - ${months} THANG`;
        } else {
            transferNoteInput.value = '';
            transferNoteInput.placeholder = `Ví dụ: NGUYEN VAN A_0862348886_${pkgValue} - ${months} THANG`;
        }
    }

    // Determine price dynamically from data-price attribute (set by backend sync), fallback to defaults
    const amountDisplay = document.getElementById('pro-amount-display');
    let price = 0;
    if (activeCard && activeCard.getAttribute('data-price')) {
        price = parseInt(activeCard.getAttribute('data-price'), 10);
    }
    // Fallback to default hardcoded prices if data-price not available
    if (!price || isNaN(price)) {
        if (pkgValue === 'PRO1') price = 2500000;
        else if (pkgValue === 'PRO2') price = 4500000;
        else if (pkgValue === 'PRO3') price = 8000000;
        else price = 2500000;
    }
    const priceText = Number(price).toLocaleString('vi-VN') + ' VND';

    if (amountDisplay) {
        amountDisplay.textContent = priceText;
    }

    // Build transfer description for QR
    let note = `FINTOP ${pkgValue}`;
    if (nameVal || phoneVal) {
        note = `${safeName.replace(/\s+/g, ' ') || 'HO TEN'} ${safePhone || 'SDT'} ${pkgValue}`;
    } else {
        // Use logged-in user info as default
        const Infra = window.FintopInfra;
        if (Infra && Infra.AuthManager && Infra.AuthManager.isAuthenticated) {
            let user = {};
            try { user = JSON.parse(localStorage.getItem('fintop_user') || '{}'); } catch(e){}
            const stateUser = Infra.AppState?.getState('user');
            const userFullName = user.fullName || stateUser?.displayName || '';
            const userPhone = user.phone || '';
            if (userFullName) {
                const cleanUser = removeVietnameseTones(userFullName).replace(/[^A-Z0-9 ]/g, '').trim();
                const cleanPhone = userPhone.replace(/[^0-9]/g, '');
                note = `${cleanUser} ${cleanPhone} ${pkgValue}`;
            }
        }
    }

    // Generate and load the beautiful VietQR image dynamically with correct account number, amount, and note
    const qrImg = document.getElementById('pro-vietqr-img');
    if (qrImg) {
        const qrUrl = `https://img.vietqr.io/image/970422-862862348886-compact2.png?amount=${price}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent('CONG TY TNHH DAU TU VA PHAT TRIEN FINTOP')}`;
        qrImg.src = qrUrl;
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

        // Always generate QR and update amount display, even for non-authenticated users
        updateTransferNote();
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

    const receiptFile = document.getElementById('proReceiptUpload')?.files?.[0];
    if (!receiptFile) {
        alert('Vui lòng tải ảnh xác nhận chuyển khoản trước khi gửi yêu cầu phê duyệt.');
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
        // Upload payment receipt image to server
        const formData = new FormData();
        formData.append('upload', receiptFile);

        const uploadRes = await fetch(`${Infra.FintopEnv.API_BASE_URL}/blogs/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('fintop_access_token')}`
            },
            body: formData
        });

        if (!uploadRes.ok) {
            throw new Error('Không thể tải ảnh thanh toán lên máy chủ.');
        }

        const uploadData = await uploadRes.json();
        const uploadUrl = uploadData.data?.url || uploadData.url;

        if (!uploadUrl) {
            throw new Error('Ảnh thanh toán tải lên không có URL phản hồi.');
        }

        // Save payment proof URL to user profile
        await Infra.ApiClient.patch('/auth/profile', {
            paymentProofUrl: uploadUrl
        });

        // Lấy danh sách các gói dịch vụ từ backend
        const plansRes = await Infra.ApiClient.get(Infra.FintopEnv.API_ENDPOINTS.SUBSCRIPTION_PLANS);
        const plans = plansRes.data || plansRes || [];
        
        // Tìm gói chính xác theo lựa chọn (PRO1, PRO2, PRO3)
        const targetPlan = plans.find(p => p.name === selectedPkg || p.name.includes(selectedPkg)) || plans.find(p => p.tierLevel === 'SILVER');
        
        if (!targetPlan) {
            throw new Error("Không tìm thấy cấu hình gói PRO trên hệ thống.");
        }

        // Tạo hóa đơn mới cho gói PRO
        const invoiceRes = await Infra.ApiClient.post('/billing/invoices', {
            planId: targetPlan.id
        });
        const data = invoiceRes.data || invoiceRes;
        const invoiceId = data.invoice?.id || data.id;

        alert(
            `Yêu cầu phê duyệt thành công!\n\n` +
            `Thông tin phê duyệt của Anh/Chị sẽ được xử lý trong 1-3 ngày làm việc.\n` +
            `Mã yêu cầu: #${invoiceId}\n` +
            `Gói đã chọn: ${selectedPkg} (${selectedMonths} tháng)`
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

    const submitBtn = Array.from(document.querySelectorAll('#modal-vip .btn-modal-action.primary'))
        .find((btn) => btn.getAttribute('onclick') === "submitVIP('link')");
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

/**
 * Gửi yêu cầu liên kết tài khoản Diamond.
 */
async function submitDiamond(type) {
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
        alert("Vui lòng đăng nhập để gửi yêu cầu liên kết tài khoản Diamond.");
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }

    const accountVal = (document.getElementById('diamondStockAccount')?.value || '').trim();
    const companyVal = (document.getElementById('diamondStockCompany')?.value || '').trim();
    const navVal = (document.getElementById('diamondNav')?.value || '').trim();

    if (!accountVal || !companyVal || !navVal) {
        alert("Vui lòng điền đầy đủ Số tài khoản chứng khoán, Công ty chứng khoán và NAV dự kiến.");
        return;
    }

    const submitBtn = Array.from(document.querySelectorAll('#modal-diamond .btn-modal-action.primary'))
        .find((btn) => btn.getAttribute('onclick') === "submitDiamond('link')");
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    try {
        const plansRes = await Infra.ApiClient.get(Infra.FintopEnv.API_ENDPOINTS.SUBSCRIPTION_PLANS);
        const plans = plansRes.data || plansRes || [];
        const targetPlan = plans.find(p => p.tierLevel === 'DIAMOND');

        if (!targetPlan) {
            throw new Error("Không tìm thấy cấu hình gói Diamond trên hệ thống.");
        }

        const invoiceRes = await Infra.ApiClient.post('/billing/invoices', { planId: targetPlan.id });
        const data = invoiceRes.data || invoiceRes;
        const invoiceId = data.invoice?.id || data.id;

        alert(`Yêu cầu phê duyệt Diamond thành công!\nThông tin phê duyệt của Anh/Chị sẽ được xử lý trong 1-3 ngày làm việc.\nMã yêu cầu: #${invoiceId}`);
        closePricingModal();

        const accountInput = document.getElementById('diamondStockAccount');
        const companyInput = document.getElementById('diamondStockCompany');
        const navInput = document.getElementById('diamondNav');
        if (accountInput) accountInput.value = '';
        if (companyInput) companyInput.value = '';
        if (navInput) navInput.value = '';
    } catch (err) {
        console.error('[Billing] Failed to create Diamond linking invoice:', err);
        alert(`Yêu cầu liên kết Diamond thất bại: ${err.message || 'Không thể tạo yêu cầu phê duyệt.'}`);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}
