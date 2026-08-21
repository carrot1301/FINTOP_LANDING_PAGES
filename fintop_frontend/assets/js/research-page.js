/**
 * ================================================================
 * RESEARCH PAGE – Shared Logic
 * Used by: thi-truong, chuyen-sau, doanh-nghiep, nhom-nganh
 *
 * Each HTML page sets window.RESEARCH_PAGE_CONFIG before loading this.
 * Config shape:
 *   { allowedSlugs: string[], kickerIcon: string, kickerText: string, kickerColor: string }
 * ================================================================
 */
(function () {
    'use strict';

    /* ---- State ---- */
    let allArticles = [];
    let drawerSearchKeyword = '';
    let config = null;

    /* ---- Bootstrap ---- */
    document.addEventListener('DOMContentLoaded', function () {
        config = window.RESEARCH_PAGE_CONFIG;
        if (!config) { console.error('RESEARCH_PAGE_CONFIG not defined'); return; }

        let attempts = 0;
        const interval = setInterval(function () {
            attempts++;
            if (window.FintopInfra) {
                clearInterval(interval);
                boot(window.FintopInfra);
            } else if (attempts > 50) {
                clearInterval(interval);
                console.error('FintopInfra failed to load.');
                showError();
            }
        }, 100);

        setupDrawerEvents();
        setupScrollHeader();
    });

    /* ---- Boot ---- */
    async function boot(infra) {
        try {
            const response = await infra.ApiClient.get('/blogs?limit=100');
            const list = response?.data?.data || response?.data || [];
            allArticles = list.filter(function (art) {
                return config.allowedSlugs.includes(art.category?.slug);
            });
            renderPage();
        } catch (err) {
            console.error('Failed to load articles:', err);
            showError();
        }
    }

    /* ================================================================
       RENDER – Page (featured + recent)
       ================================================================ */
    function renderPage() {
        var featuredEl = document.getElementById('rpFeatured');
        var recentGrid = document.getElementById('rpRecentGrid');

        if (!allArticles.length) {
            if (featuredEl) featuredEl.classList.remove('rp-visible');
            if (recentGrid) recentGrid.innerHTML = emptyStateHTML('Chưa có bài viết', 'Chưa có bài viết nào trong danh mục này.');
            return;
        }

        // Featured = first article (newest)
        var featured = allArticles[0];
        renderFeatured(featured, featuredEl);

        // Recent = next 6 articles (skip featured)
        var recent = allArticles.slice(1, 7);
        renderRecentGrid(recent, recentGrid);

        // Open drawer by default on page load
        openDrawer();
    }

    /* ================================================================
       RENDER – Featured Card
       ================================================================ */
    function renderFeatured(art, container) {
        if (!container) return;

        var imgUrl = extractImage(art);
        var dateStr = formatDate(art.publishedAt);
        var views = formatViews(art.views);
        var detailUrl = '../../chuyen-gia/index.html?slug=' + art.slug;

        var lockHTML = '';
        if (art.locked) {
            lockHTML = '<div class="rp-featured-lock">' +
                '<div class="rp-lock-icon"><i class="fa-solid fa-lock"></i></div>' +
                '<span class="rp-lock-text">Đặc quyền PRO</span>' +
                '</div>';
        }

        var kickerColor = config.kickerColor || '#a855f7';
        var kickerIcon = config.kickerIcon || 'fa-solid fa-star';
        var kickerText = config.kickerText || 'Bài viết nổi bật';

        var lockTitleIcon = art.locked
            ? '<i class="fa-solid fa-lock" style="color:#eab308;margin-right:6px;font-size:0.95rem;"></i>'
            : '';

        container.innerHTML =
            '<div class="rp-featured-card">' +
                '<div class="rp-featured-thumb" style="cursor:pointer;" onclick="if(window.ArticleModal){event.preventDefault();ArticleModal.open(\'' + art.slug + '\');}">' +
                    '<img src="' + imgUrl + '" alt="' + escHTML(art.title) + '" onerror="this.src=\'../../assets/images/fintop_terminal_mockup.png\'">' +
                    lockHTML +
                '</div>' +
                '<div class="rp-featured-body">' +
                    '<div class="rp-featured-kicker" style="color:' + kickerColor + '">' +
                        '<i class="' + kickerIcon + '"></i>' +
                        '<span>' + kickerText + '</span>' +
                    '</div>' +
                    '<a class="rp-featured-title" href="' + detailUrl + '" onclick="if(window.ArticleModal){event.preventDefault();ArticleModal.open(\'' + art.slug + '\');}">' +
                        lockTitleIcon + escHTML(art.title) +
                    '</a>' +
                    '<p class="rp-featured-excerpt">' + escHTML(art.excerpt || '') + '</p>' +
                    '<div class="rp-featured-meta">' +
                        '<span><i class="fa-regular fa-calendar"></i> ' + dateStr + '</span>' +
                        '<span><i class="fa-regular fa-eye"></i> ' + views + '</span>' +
                    '</div>' +
                    '<a class="rp-featured-btn" href="' + detailUrl + '" onclick="if(window.ArticleModal){event.preventDefault();ArticleModal.open(\'' + art.slug + '\');}">Đọc bài viết</a>' +
                '</div>' +
            '</div>';

        container.classList.add('rp-visible');
    }

    /* ================================================================
       RENDER – Recent Articles Grid (3×2)
       ================================================================ */
    function renderRecentGrid(articles, container) {
        if (!container) return;

        if (!articles.length) {
            container.innerHTML = emptyStateHTML('Chưa có thêm bài viết', 'Hiện chỉ có bài viết nổi bật ở trên.');
            return;
        }

        container.innerHTML = articles.map(function (art) {
            var imgUrl = extractImage(art);
            var dateStr = formatDate(art.publishedAt);
            var views = formatViews(art.views);
            var detailUrl = '../../chuyen-gia/index.html?slug=' + art.slug;
            var lockedClass = art.locked ? ' is-locked' : '';

            var lockOverlay = art.locked
                ? '<div class="rp-card-lock">' +
                    '<div class="rp-lock-icon"><i class="fa-solid fa-lock"></i></div>' +
                    '<span class="rp-lock-text">Đặc quyền PRO</span>' +
                  '</div>'
                : '';

            var lockTitleIcon = art.locked
                ? '<i class="fa-solid fa-lock" style="color:#eab308;margin-right:4px;font-size:0.78rem;"></i>'
                : '';

            return '<a class="rp-card' + lockedClass + '" href="' + detailUrl + '" onclick="if(window.ArticleModal){event.preventDefault();ArticleModal.open(\'' + art.slug + '\');}">' +
                '<div class="rp-card-thumb">' +
                    '<img src="' + imgUrl + '" alt="' + escHTML(art.title) + '" onerror="this.src=\'../../assets/images/fintop_terminal_mockup.png\'">' +
                    '<span class="rp-card-badge">' + escHTML(art.category?.name || 'Research') + '</span>' +
                    lockOverlay +
                '</div>' +
                '<div class="rp-card-body">' +
                    '<span class="rp-card-title">' + lockTitleIcon + escHTML(art.title) + '</span>' +
                    '<div class="rp-card-meta">' +
                        '<span><i class="fa-regular fa-calendar"></i> ' + dateStr + '</span>' +
                        '<span><i class="fa-regular fa-eye"></i> ' + views + '</span>' +
                    '</div>' +
                    '<p class="rp-card-excerpt">' + escHTML(art.excerpt || 'Không có mô tả ngắn.') + '</p>' +
                '</div>' +
            '</a>';
        }).join('');
    }

    /* ================================================================
       DRAWER – Events
       ================================================================ */
    function setupDrawerEvents() {
        var toggle  = document.getElementById('rpDrawerToggle');
        var overlay = document.getElementById('rpDrawerOverlay');
        var close   = document.getElementById('rpDrawerClose');
        var searchInput = document.getElementById('rpDrawerSearch');

        if (toggle) toggle.addEventListener('click', openDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);
        if (close) close.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeDrawer();
        });

        if (searchInput) {
            var timer;
            searchInput.addEventListener('input', function (e) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    drawerSearchKeyword = e.target.value.trim().toLowerCase();
                    renderDrawerList();
                }, 250);
            });
        }
    }

    function openDrawer() {
        var drawer  = document.getElementById('rpDrawer');
        var toggle  = document.getElementById('rpDrawerToggle');
        document.body.classList.add('rp-drawer-open');
        if (drawer) drawer.classList.add('rp-active');
        if (toggle) toggle.style.display = 'none';
        renderDrawerList();
    }

    function closeDrawer() {
        var drawer  = document.getElementById('rpDrawer');
        var toggle  = document.getElementById('rpDrawerToggle');
        document.body.classList.remove('rp-drawer-open');
        if (drawer) drawer.classList.remove('rp-active');
        if (toggle) toggle.style.display = '';
    }

    /* ================================================================
       DRAWER – Render List
       ================================================================ */
    function renderDrawerList() {
        var listEl = document.getElementById('rpDrawerList');
        var countEl = document.getElementById('rpDrawerCount');
        if (!listEl) return;

        var filtered = allArticles;
        if (drawerSearchKeyword) {
            filtered = allArticles.filter(function (art) {
                var t = (art.title || '').toLowerCase();
                var e = (art.excerpt || '').toLowerCase();
                return t.includes(drawerSearchKeyword) || e.includes(drawerSearchKeyword);
            });
        }

        if (countEl) {
            countEl.textContent = filtered.length + ' bài viết';
        }

        if (!filtered.length) {
            listEl.innerHTML =
                '<div class="rp-drawer-empty">' +
                    '<i class="fa-solid fa-magnifying-glass"></i>' +
                    '<p>Không tìm thấy bài viết nào.</p>' +
                '</div>';
            return;
        }

        listEl.innerHTML = filtered.map(function (art) {
            var imgUrl = extractImage(art);
            var dateStr = formatDate(art.publishedAt);
            var views = formatViews(art.views);
            var detailUrl = '../../chuyen-gia/index.html?slug=' + art.slug;
            var lockIcon = art.locked
                ? '<i class="fa-solid fa-lock rp-drawer-item-lock"></i>'
                : '';

            return '<a class="rp-drawer-item" href="' + detailUrl + '" onclick="if(window.ArticleModal){event.preventDefault();ArticleModal.open(\'' + art.slug + '\');}">' +
                '<div class="rp-drawer-item-thumb">' +
                    '<img src="' + imgUrl + '" alt="" onerror="this.src=\'../../assets/images/fintop_terminal_mockup.png\'">' +
                '</div>' +
                '<div class="rp-drawer-item-info">' +
                    '<div class="rp-drawer-item-title">' + lockIcon + escHTML(art.title) + '</div>' +
                    '<div class="rp-drawer-item-meta">' +
                        '<span><i class="fa-regular fa-calendar"></i> ' + dateStr + '</span>' +
                        '<span>·</span>' +
                        '<span><i class="fa-regular fa-eye"></i> ' + views + '</span>' +
                    '</div>' +
                '</div>' +
            '</a>';
        }).join('');
    }

    /* ================================================================
       HELPERS
       ================================================================ */
    function extractImage(art) {
        var fallback = '../../assets/images/fintop_terminal_mockup.png';
        if (!art.content) return fallback;
        try {
            var tmp = document.createElement('div');
            tmp.innerHTML = art.content;
            var img = tmp.querySelector('img');
            return img ? img.src : fallback;
        } catch (_) {
            return fallback;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch (_) {
            return '';
        }
    }

    function formatViews(views) {
        var n = views !== undefined ? views : 0;
        return n + ' lượt xem';
    }

    function escHTML(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function emptyStateHTML(title, desc) {
        return '<div class="rp-empty-state">' +
            '<i class="fa-solid fa-folder-open"></i>' +
            '<h3>' + title + '</h3>' +
            '<p>' + desc + '</p>' +
        '</div>';
    }

    function showError() {
        var grid = document.getElementById('rpRecentGrid');
        if (grid) {
            grid.innerHTML =
                '<div class="rp-empty-state">' +
                    '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444"></i>' +
                    '<h3>Lỗi tải bài viết</h3>' +
                    '<p>Không thể kết nối đến máy chủ. Vui lòng tải lại trang.</p>' +
                '</div>';
        }
    }

    /* ---- Scroll header effect ---- */
    function setupScrollHeader() {
        window.addEventListener('scroll', function () {
            var header = document.getElementById('mainHeader');
            if (!header) return;
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

})();
