/**
 * ================================================================
 * ARTICLE MODAL OVERLAY (FireAnt Style)
 * Shared JavaScript Module for FinTop Research & Detail Articles
 * ================================================================
 */
(function () {
    'use strict';

    let modalEl = null;
    let backdropEl = null;
    let currentSlug = null;
    let initialUrl = null;

    function initModal() {
        if (backdropEl) return;

        backdropEl = document.createElement('div');
        backdropEl.className = 'article-modal-backdrop';
        backdropEl.id = 'articleModalBackdrop';
        backdropEl.innerHTML = `
            <div class="article-modal-container" id="articleModalContainer">
                <div class="article-modal-topbar">
                    <div class="article-modal-topbar-left">
                        <button type="button" class="article-modal-back-btn" id="articleModalBackBtn" title="Quay lại">
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <div class="article-modal-topbar-title">
                            <i class="fa-solid fa-newspaper" style="color: #a855f7;"></i>
                            <span>Chi tiết bài viết</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button type="button" class="article-modal-share-btn" id="articleModalShareBtn" title="Sao chép link chia sẻ bài viết" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; border-radius: 8px; padding: 6px 14px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                            <i class="fa-solid fa-share-nodes"></i>
                            <span>Chia sẻ link</span>
                        </button>
                        <button type="button" class="article-modal-close-btn" id="articleModalCloseBtn" title="Đóng (Esc)">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="article-modal-body" id="articleModalBody">
                    <!-- Content injected dynamically -->
                </div>
            </div>
        `;

        document.body.appendChild(backdropEl);

        // Event Listeners
        const closeBtn = backdropEl.querySelector('#articleModalCloseBtn');
        const backBtn = backdropEl.querySelector('#articleModalBackBtn');
        const shareBtn = backdropEl.querySelector('#articleModalShareBtn');
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backBtn) backBtn.addEventListener('click', closeModal);
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                const currentUrl = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(currentUrl).then(() => {
                        const originalHTML = shareBtn.innerHTML;
                        shareBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#10b981;"></i><span style="color:#10b981;">Đã chép link!</span>';
                        setTimeout(() => { shareBtn.innerHTML = originalHTML; }, 2000);
                    }).catch(() => {
                        alert('Đã sao chép link bài viết: ' + currentUrl);
                    });
                } else {
                    alert('Đã sao chép link bài viết: ' + currentUrl);
                }
            });
        }

        backdropEl.addEventListener('click', function (e) {
            if (e.target === backdropEl) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && backdropEl.classList.contains('is-active')) {
                closeModal();
            }
        });

        window.addEventListener('popstate', function () {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            if (slug) {
                openModal(slug, false);
            } else if (backdropEl && backdropEl.classList.contains('is-active')) {
                closeModal(false);
            }
        });
    }

    function cleanTitle(str) {
        if (!str) return 'Bài viết';
        try {
            const tmp = document.createElement('div');
            tmp.innerHTML = str;
            let text = tmp.textContent || tmp.innerText || str;
            const txt = document.createElement('textarea');
            txt.innerHTML = text;
            return txt.value;
        } catch (_) {
            return str;
        }
    }

    function formatSimpleDate(dateStr) {
        if (!dateStr) return '...';
        try {
            const d = new Date(dateStr);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        } catch (_) {
            return '...';
        }
    }

    function renderLoader() {
        const bodyEl = backdropEl.querySelector('#articleModalBody');
        if (!bodyEl) return;
        bodyEl.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <div class="rp-spinner" style="width: 40px; height: 40px; border-width: 3px; margin: 0 auto 1.5rem auto;"></div>
                <p style="color: #64748b; font-size: 0.95rem;">Đang tải nội dung bài viết...</p>
            </div>
        `;
    }

    function renderError(message) {
        const bodyEl = backdropEl.querySelector('#articleModalBody');
        if (!bodyEl) return;
        bodyEl.innerHTML = `
            <div style="padding: 3rem 2rem; text-align: center; color: #ef4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                <h3 style="font-weight: 700; font-size: 1.2rem; margin-bottom: 0.5rem;">Lỗi tải bài viết</h3>
                <p style="color: #64748b; font-size: 0.9rem;">${message || 'Không thể tải nội dung bài viết.'}</p>
                <button type="button" class="btn-tv-blue" style="margin-top: 1.5rem;" onclick="ArticleModal.close()">Đóng</button>
            </div>
        `;
    }

    async function loadAndRenderArticle(slug) {
        renderLoader();

        const infra = window.FintopInfra;
        if (!infra) {
            setTimeout(() => loadAndRenderArticle(slug), 100);
            return;
        }

        try {
            const response = await infra.ApiClient.get('/blogs/' + encodeURIComponent(slug));
            const article = response?.data || response;

            if (!article) throw new Error('Không nhận được dữ liệu bài viết.');

            const bodyEl = backdropEl.querySelector('#articleModalBody');
            const pubDateStr = formatSimpleDate(article.publishedAt || article.createdAt);
            const viewCount = article.views !== undefined ? article.views : 0;

            let rawContent = (article.content || '<p>Nội dung trống.</p>')
                .replace(/font-family\s*:\s*&quot;[^&]*&quot;[^\s;`'">]*;?/gi, '')
                .replace(/font-family\s*:\s*[^;`'">\\]+;?/gi, '')
                .replace(/<font[^>]*>/gi, '<span>')
                .replace(/<\/font>/gi, '</span>');

            let contentHTML = rawContent;

            if (!article.locked) {
                try {
                    const tmpContainer = document.createElement('div');
                    tmpContainer.innerHTML = rawContent;
                    const allEls = tmpContainer.querySelectorAll('*');
                    allEls.forEach(el => {
                        if (el.style && el.style.fontFamily) {
                            el.style.fontFamily = '';
                        }
                        if (el.hasAttribute('face')) {
                            el.removeAttribute('face');
                        }
                        if (el.hasAttribute('style')) {
                            let s = el.getAttribute('style') || '';
                            if (/font-family/i.test(s)) {
                                s = s.replace(/font-family\s*:\s*[^;]+;?/gi, '');
                                el.setAttribute('style', s);
                            }
                        }
                    });
                    contentHTML = tmpContainer.innerHTML;
                } catch (_) {
                    contentHTML = rawContent;
                }
            }
            let lockScreenHTML = '';

            if (article.locked) {
                contentHTML = `
                    <p style="filter: blur(4px); user-select: none; opacity: 0.5;">
                        Phân tích chi tiết xu hướng thị trường đang diễn biến cực kỳ phức tạp. Các hoạt động dòng tiền ngoại đang gia tăng mạnh mẽ ở vùng hỗ trợ kỹ thuật trọng yếu của VN-INDEX.
                    </p>
                    <p style="filter: blur(5px); user-select: none; opacity: 0.3;">
                        Chi tiết hành động giải ngân, danh mục và điểm chốt lời kỳ vọng của các mã cổ phiếu leader thép, chứng khoán và bất động sản khu công nghiệp được chuyên gia đề xuất.
                    </p>
                `;

                lockScreenHTML = `
                    <div class="article-lock-screen">
                        <div class="lock-card">
                            <div class="lock-icon">🔒</div>
                            <div class="lock-title">Bài Viết Phân Tích Premium</div>
                            <div class="lock-desc">
                                Bài viết chiến lược này dành riêng cho hội viên gói <strong style="color: #c084fc;">${article.minTierAccess || 'GOLD'}</strong> trở lên. Hãy nâng cấp tài khoản của bạn để xem đầy đủ nhận định chuyên sâu từ Chuyên gia FinTop.
                            </div>
                            <button type="button" class="btn-tv-blue" style="width: 100%; padding: 12px;" onclick="location.href='/index.html#panel-hoivien'">Nâng cấp Hội viên ngay</button>
                        </div>
                    </div>
                `;
            }

            bodyEl.innerHTML = `
                <article class="article-modal-card">
                    <div class="article-header-banner">
                        <div class="article-banner-logo-box">
                            <img src="/assets/images/LogoFinTop_notbg.jpg" alt="FinTop Logo" onerror="this.src='../../assets/images/LogoFinTop_notbg.jpg'">
                        </div>
                        <h1 class="article-banner-title">${cleanTitle(article.title)}</h1>
                    </div>

                    <div class="article-date-bar">
                        <span><i class="fa-regular fa-eye"></i> Lượt xem: ${viewCount}</span>
                        <span>Ngày xuất bản: ${pubDateStr}</span>
                    </div>

                    <div class="article-body-wrapper">
                        <div class="article-content">
                            ${contentHTML}
                        </div>
                        ${lockScreenHTML}
                    </div>
                </article>
            `;

        } catch (err) {
            console.error('[ArticleModal] Error loading article:', err);
            renderError(err.message);
        }
    }

    function openModal(slug, updateHistory = true) {
        initModal();

        currentSlug = slug;
        if (!initialUrl) initialUrl = window.location.href;

        backdropEl.classList.add('is-active');
        document.body.style.overflow = 'hidden';

        if (updateHistory) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('slug', slug);
            history.pushState({ modalOpen: true, slug: slug }, '', newUrl.toString());
        }

        loadAndRenderArticle(slug);
    }

    function closeModal(updateHistory = true) {
        if (!backdropEl) return;

        backdropEl.classList.remove('is-active');
        document.body.style.overflow = '';

        if (updateHistory && currentSlug) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('slug');
            history.pushState({ modalOpen: false }, '', newUrl.toString());
        }

        currentSlug = null;
    }

    // Auto-check on page load if URL has ?slug=...
    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        if (slug) {
            openModal(slug, false);
        }
    });

    window.ArticleModal = {
        open: openModal,
        close: closeModal
    };
})();
