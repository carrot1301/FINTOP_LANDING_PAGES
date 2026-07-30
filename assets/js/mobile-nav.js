/**
 * mobile-nav.js — Mobile Hamburger Drawer Navigation for FinTop DATA
 */

(function () {
    let drawerEl = null;

    function resolveUrl(path) {
        const isRoot = window.location.pathname.endsWith('index.html') && !window.location.pathname.includes('/fintop_frontend/') && !window.location.pathname.includes('/nghien-cuu/') && !window.location.pathname.includes('/fintop-ai/');
        if (isRoot) return path.replace(/^\//, '');

        const parts = window.location.pathname.split('/').filter(Boolean);
        const subIndex = parts.indexOf('fintop_frontend');
        if (subIndex !== -1) {
            const depth = parts.length - subIndex - 1;
            const prefix = '../'.repeat(depth);
            return prefix + path.replace(/^\//, '');
        }
        return path;
    }

    function createDrawer() {
        if (drawerEl) return;

        drawerEl = document.createElement('div');
        drawerEl.className = 'mobile-nav-drawer';
        drawerEl.id = 'mobileNavDrawer';

        const rootIndex = resolveUrl('/index.html');
        const fintopAiUrl = resolveUrl('/fintop-ai/index.html');
        const thiTruongUrl = resolveUrl('/nghien-cuu/thi-truong/index.html');
        const chuyenSauUrl = resolveUrl('/nghien-cuu/chuyen-sau/index.html');
        const doanhNghiepUrl = resolveUrl('/nghien-cuu/doanh-nghiep/index.html');
        const nhomNganhUrl = resolveUrl('/nghien-cuu/nhom-nganh/index.html');
        const logoUrl = resolveUrl('/assets/images/fintop-logo.png');

        drawerEl.innerHTML = `
            <div class="mobile-drawer-header">
                <a href="${rootIndex}">
                    <img src="${logoUrl}" alt="FinTop DATA" style="height: 44px; width: auto;">
                </a>
                <button class="mobile-drawer-close-btn" id="mobileDrawerCloseBtn" type="button" aria-label="Đóng Menu">✕</button>
            </div>
            <div class="mobile-drawer-nav">
                <a href="${rootIndex}" class="mobile-drawer-link">Trang chủ <span>›</span></a>
                <a href="${rootIndex}#panel-hoivien" class="mobile-drawer-link">Hội viên <span>›</span></a>

                <div class="mobile-drawer-section">
                    <div class="mobile-drawer-link" style="color: #c084fc;">FinTop Data <span>▼</span></div>
                    <div class="mobile-drawer-sublinks">
                        <a href="${rootIndex}#panel-tracuu" class="mobile-drawer-sublink">📊 Tra cứu cổ phiếu</a>
                        <a href="${rootIndex}#panel-boloc" class="mobile-drawer-sublink">🔍 Bộ lọc cổ phiếu ★</a>
                        <a href="${fintopAiUrl}" class="mobile-drawer-sublink">🤖 FinTop AI</a>
                        <a href="${rootIndex}#panel-tinhieu" class="mobile-drawer-sublink">📡 Copy Trade Chuyên gia</a>
                    </div>
                </div>

                <div class="mobile-drawer-section">
                    <div class="mobile-drawer-link">Dữ liệu <span>▼</span></div>
                    <div class="mobile-drawer-sublinks">
                        <a href="${rootIndex}#panel-stock-quant" class="mobile-drawer-sublink">Tổng quan</a>
                        <a href="${rootIndex}#panel-stock-pro" class="mobile-drawer-sublink">PRO Data ★</a>
                        <a href="${rootIndex}#panel-stock-sector" class="mobile-drawer-sublink">Định lượng</a>
                        <a href="${rootIndex}#panel-stock-reports" class="mobile-drawer-sublink">Báo cáo</a>
                    </div>
                </div>

                <div class="mobile-drawer-section">
                    <div class="mobile-drawer-link">Nghiên cứu <span>▼</span></div>
                    <div class="mobile-drawer-sublinks">
                        <a href="${thiTruongUrl}" class="mobile-drawer-sublink">Nghiên cứu thị trường</a>
                        <a href="${chuyenSauUrl}" class="mobile-drawer-sublink">Nghiên cứu chuyên sâu ★</a>
                        <a href="${doanhNghiepUrl}" class="mobile-drawer-sublink">Nghiên cứu Doanh nghiệp</a>
                        <a href="${nhomNganhUrl}" class="mobile-drawer-sublink">Nghiên cứu nhóm Ngành</a>
                    </div>
                </div>

                <div class="mobile-drawer-section">
                    <div class="mobile-drawer-link">Hướng dẫn <span>▼</span></div>
                    <div class="mobile-drawer-sublinks">
                        <a href="${rootIndex}#panel-guide-trading" class="mobile-drawer-sublink">📖 Giao dịch & Đầu tư</a>
                        <a href="${rootIndex}#panel-guide-ta" class="mobile-drawer-sublink">📈 Phân tích kỹ thuật (TA)</a>
                        <a href="${rootIndex}#panel-guide-fa" class="mobile-drawer-sublink">📊 Phân tích cơ bản (FA)</a>
                        <a href="${rootIndex}#panel-guide-library" class="mobile-drawer-sublink">📚 Tủ sách đầu tư</a>
                    </div>
                </div>
            </div>

            <div class="mobile-drawer-actions">
                <a href="${rootIndex}#pricing" class="btn-tv-blue" style="text-align: center; text-decoration: none; padding: 12px;">Bắt đầu miễn phí</a>
            </div>
        `;

        document.body.appendChild(drawerEl);

        const closeBtn = document.getElementById('mobileDrawerCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeDrawer();
            });
        }

        drawerEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

    function openDrawer() {
        createDrawer();
        if (drawerEl) {
            drawerEl.classList.add('is-active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDrawer() {
        if (drawerEl) {
            drawerEl.classList.remove('is-active');
            document.body.style.overflow = '';
        }
    }

    window.openMobileDrawer = openDrawer;
    window.closeMobileDrawer = closeDrawer;

    function setupHamburgerButton() {
        const header = document.querySelector('.tv-header');
        if (!header) return;

        const rightArea = header.querySelector('.tv-right') || header;
        if (rightArea.querySelector('.tv-hamburger-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'tv-hamburger-btn';
        btn.type = 'button';
        btn.ariaLabel = 'Mở Menu';
        btn.innerHTML = '☰';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
        });

        rightArea.prepend(btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupHamburgerButton);
    } else {
        setupHamburgerButton();
    }
})();
