/**
 * command-palette.js — Global Command Palette (Ctrl + K) for FinTop DATA
 */

(function () {
    const STOCKS = [
        { ticker: 'VCB', name: 'Ngân hàng Vietcombank', sector: 'Ngân hàng', panel: 'panel-tracuu' },
        { ticker: 'HPG', name: 'Tập đoàn Hòa Phát', sector: 'Thép & Vật liệu', panel: 'panel-tracuu' },
        { ticker: 'FPT', name: 'Tập đoàn FPT', sector: 'Công nghệ thông tin', panel: 'panel-tracuu' },
        { ticker: 'SSI', name: 'CTCP Chứng khoán SSI', sector: 'Chứng khoán', panel: 'panel-tracuu' },
        { ticker: 'MBB', name: 'Ngân hàng MBBank', sector: 'Ngân hàng', panel: 'panel-tracuu' },
        { ticker: 'TCB', name: 'Ngân hàng Techcombank', sector: 'Ngân hàng', panel: 'panel-tracuu' },
        { ticker: 'VHM', name: 'CTCP Vinhomes', sector: 'Bất động sản', panel: 'panel-tracuu' },
        { ticker: 'VIC', name: 'Tập đoàn Vingroup', sector: 'Bất động sản', panel: 'panel-tracuu' },
        { ticker: 'STB', name: 'Ngân hàng Sacombank', sector: 'Ngân hàng', panel: 'panel-tracuu' },
        { ticker: 'MWG', name: 'CTCP Thế Giới Di Động', sector: 'Bán lẻ', panel: 'panel-tracuu' },
        { ticker: 'VNM', name: 'CTCP Sữa Việt Nam', sector: 'Thực phẩm & Đồ uống', panel: 'panel-tracuu' }
    ];

    const PAGES = [
        { title: '📊 Tra cứu cổ phiếu', desc: 'Bảng giá, chỉ số và mô hình định lượng', target: 'panel-tracuu', icon: '📊', type: 'panel' },
        { title: '🔍 Bộ lọc cổ phiếu ★', desc: 'Lọc cổ phiếu theo tiêu chí xu hướng & RSI/MFI', target: 'panel-boloc', icon: '🔍', type: 'panel' },
        { title: '🤖 FinTop AI', desc: 'Trợ lý phân tích tài chính AI thông minh', url: '/fintop-ai/index.html', icon: '🤖', type: 'page' },
        { title: '📡 Copy Trade Chuyên gia', desc: 'Tín hiệu giao dịch và danh mục đầu tư', target: 'panel-tinhieu', icon: '📡', type: 'panel' },
        { title: '👑 Quyền lợi Hội viên', desc: 'Các gói dịch vụ Standard, Silver, Gold, Diamond', target: 'panel-hoivien', icon: '👑', type: 'panel' },
        { title: '📰 Nghiên cứu Thị trường', desc: 'Báo cáo tổng hợp diễn biến VN-Index', url: '/nghien-cuu/thi-truong/index.html', icon: '📰', type: 'page' },
        { title: '🔬 Nghiên cứu Chuyên sâu', desc: 'Phân tích vĩ mô và mô hình định giá', url: '/nghien-cuu/chuyen-sau/index.html', icon: '🔬', type: 'page' },
        { title: '🏢 Nghiên cứu Doanh nghiệp', desc: 'Đánh giá sức khỏe tài chính & doanh thu', url: '/nghien-cuu/doanh-nghiep/index.html', icon: '🏢', type: 'page' },
        { title: '🏭 Nghiên cứu Nhóm Ngành', desc: 'Phân tích chu kỳ ngành và dòng tiền', url: '/nghien-cuu/nhom-nganh/index.html', icon: '🏭', type: 'page' },
        { title: '📖 Giao dịch & Đầu tư', desc: 'Lộ trình và bài học kỷ luật giao dịch', target: 'panel-guide-trading', icon: '📖', type: 'panel' },
        { title: '📈 Phân tích kỹ thuật (TA)', desc: 'Chỉ báo MA, RSI, Bollinger Bands và nến', target: 'panel-guide-ta', icon: '📈', type: 'panel' },
        { title: '📊 Phân tích cơ bản (FA)', desc: 'Báo cáo tài chính, P/E, P/B và định giá', target: 'panel-guide-fa', icon: '📊', type: 'panel' },
        { title: '📚 Tủ sách đầu tư', desc: 'Checklist và tài liệu tự luyện quy trình', target: 'panel-guide-library', icon: '📚', type: 'panel' }
    ];

    let overlayEl = null;
    let inputEl = null;
    let resultsEl = null;
    let selectedIndex = 0;
    let currentResults = [];

    function resolveUrl(path) {
        // Resolve path relative to current page location
        const isRoot = window.location.pathname.endsWith('index.html') && !window.location.pathname.includes('/fintop_frontend/') && !window.location.pathname.includes('/nghien-cuu/') && !window.location.pathname.includes('/fintop-ai/');
        if (isRoot) {
            return path.replace(/^\//, '');
        }
        // Subpage depth check
        const parts = window.location.pathname.split('/').filter(Boolean);
        const subIndex = parts.indexOf('fintop_frontend');
        if (subIndex !== -1) {
            const depth = parts.length - subIndex - 1;
            const prefix = '../'.repeat(depth);
            return prefix + path.replace(/^\//, '');
        }
        return path;
    }

    function createOverlay() {
        if (overlayEl) return;

        overlayEl = document.createElement('div');
        overlayEl.className = 'cmd-palette-overlay';
        overlayEl.id = 'cmdPaletteOverlay';

        overlayEl.innerHTML = `
            <div class="cmd-palette-card" onclick="event.stopPropagation()">
                <div class="cmd-palette-header">
                    <span class="cmd-palette-search-icon">🔍</span>
                    <input type="text" class="cmd-palette-input" id="cmdPaletteInput" placeholder="Tìm mã cổ phiếu (VCB, HPG...), trang, hoặc công cụ..." autocomplete="off">
                    <span class="cmd-palette-kbd-badge">ESC</span>
                </div>
                <div class="cmd-palette-body" id="cmdPaletteBody"></div>
                <div class="cmd-palette-footer">
                    <span>FinTop DATA Quick Search</span>
                    <div class="cmd-palette-hints">
                        <span><span class="cmd-palette-kbd-badge">↑↓</span> Điều hướng</span>
                        <span><span class="cmd-palette-kbd-badge">↵</span> Chọn</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlayEl);

        inputEl = document.getElementById('cmdPaletteInput');
        resultsEl = document.getElementById('cmdPaletteBody');

        overlayEl.addEventListener('click', closePalette);

        inputEl.addEventListener('input', function () {
            renderResults(this.value.trim());
        });

        inputEl.addEventListener('keydown', handleKeyNavigation);
    }

    function openPalette() {
        createOverlay();
        overlayEl.classList.add('is-active');
        inputEl.value = '';
        selectedIndex = 0;
        renderResults('');
        setTimeout(() => inputEl.focus(), 50);
    }

    function closePalette() {
        if (overlayEl) {
            overlayEl.classList.remove('is-active');
        }
    }

    function renderResults(query) {
        const q = query.toLowerCase();
        currentResults = [];

        // Match stocks
        const matchedStocks = STOCKS.filter(s =>
            s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
        );

        // Match pages
        const matchedPages = PAGES.filter(p =>
            p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
        );

        let html = '';

        if (matchedStocks.length > 0) {
            html += `<div class="cmd-palette-section-title">📈 Mã Cổ Phiếu</div>`;
            matchedStocks.forEach(s => {
                const idx = currentResults.length;
                currentResults.push({ type: 'stock', data: s });
                const isSelected = idx === selectedIndex ? 'is-selected' : '';
                html += `
                    <div class="cmd-palette-item ${isSelected}" data-index="${idx}" onclick="executeItem(${idx})">
                        <div class="cmd-palette-item-left">
                            <span class="cmd-palette-item-icon" style="color: #c084fc; font-weight: 800;">${s.ticker}</span>
                            <div>
                                <div class="cmd-palette-item-title">${s.name}</div>
                                <div class="cmd-palette-item-subtitle">${s.sector}</div>
                            </div>
                        </div>
                        <span class="cmd-palette-item-tag">Xem Tra cứu</span>
                    </div>
                `;
            });
        }

        if (matchedPages.length > 0) {
            html += `<div class="cmd-palette-section-title">🚀 Tính Năng & Trang</div>`;
            matchedPages.forEach(p => {
                const idx = currentResults.length;
                currentResults.push({ type: 'page', data: p });
                const isSelected = idx === selectedIndex ? 'is-selected' : '';
                html += `
                    <div class="cmd-palette-item ${isSelected}" data-index="${idx}" onclick="executeItem(${idx})">
                        <div class="cmd-palette-item-left">
                            <span class="cmd-palette-item-icon">${p.icon}</span>
                            <div>
                                <div class="cmd-palette-item-title">${p.title}</div>
                                <div class="cmd-palette-item-subtitle">${p.desc}</div>
                            </div>
                        </div>
                        <span class="cmd-palette-item-tag">${p.type === 'panel' ? 'Mở Panel' : 'Mở Trang'}</span>
                    </div>
                `;
            });
        }

        if (currentResults.length === 0) {
            html = `<div class="cmd-palette-empty">Không tìm thấy kết quả cho "${query}"</div>`;
        }

        resultsEl.innerHTML = html;
    }

    function handleKeyNavigation(e) {
        if (e.key === 'Escape') {
            closePalette();
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentResults.length > 0) {
                selectedIndex = (selectedIndex + 1) % currentResults.length;
                updateSelection();
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentResults.length > 0) {
                selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
                updateSelection();
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentResults.length > 0 && selectedIndex < currentResults.length) {
                executeItem(selectedIndex);
            }
        }
    }

    function updateSelection() {
        const items = resultsEl.querySelectorAll('.cmd-palette-item');
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('is-selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    function executeItem(idx) {
        const item = currentResults[idx];
        if (!item) return;

        closePalette();

        if (item.type === 'stock') {
            const stock = item.data;
            if (typeof window.openPanel === 'function') {
                window.openPanel(stock.panel);
            } else {
                window.location.href = resolveUrl('/index.html#' + stock.panel);
            }
            // Populate stock search if search input exists
            setTimeout(() => {
                const searchEl = document.getElementById('tracuuSearchInput') || document.getElementById('stockFilterSearch');
                if (searchEl) {
                    searchEl.value = stock.ticker;
                    searchEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, 120);
        } else if (item.type === 'page') {
            const page = item.data;
            if (page.type === 'panel') {
                if (typeof window.openPanel === 'function') {
                    window.openPanel(page.target);
                } else {
                    window.location.href = resolveUrl('/index.html#' + page.target);
                }
            } else if (page.url) {
                window.location.href = resolveUrl(page.url);
            }
        }
    }

    window.executeItem = executeItem;

    // Attach global listeners
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openPalette();
        }
    });

    // Attach click listeners to all search bars
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.tv-search-bar').forEach(bar => {
            bar.style.cursor = 'pointer';
            bar.addEventListener('click', function (e) {
                e.preventDefault();
                openPalette();
            });
        });
    });
})();
