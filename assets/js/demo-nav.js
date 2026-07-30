/**
 * demo-nav.js — Shared navigation dropdown logic for subpages
 * Persistent click-to-toggle submenu across page navigations (sessionStorage synchronized)
 */

(function () {
    // Mark document so CSS can differentiate subpages from the main SPA
    document.documentElement.classList.add('subpage-nav');

    // Inject CSS to suppress hover-triggered dropdown on subpages — only click (pinned) works
    var style = document.createElement('style');
    style.textContent =
        '.subpage-nav .dropdown:hover > .dropdown-content:not(.pinned) {' +
        '  visibility: hidden !important;' +
        '  opacity: 0 !important;' +
        '  pointer-events: none !important;' +
        '  transform: translateY(-8px) !important;' +
        '}' +
        '.page-wrapper, .demo-main, .main-container {' +
        '  transition: padding-top 0.15s cubic-bezier(0.16, 1, 0.3, 1);' +
        '}';
    document.head.appendChild(style);

    function getMainContent() {
        return document.querySelector('.main-container') || document.querySelector('.page-wrapper') || document.querySelector('.demo-main');
    }

    function getBaseTopPadding() {
        var wrapper = getMainContent();
        if (!wrapper) return 80;
        if (wrapper._baseTopPadding === undefined) {
            wrapper._baseTopPadding = parseInt(getComputedStyle(wrapper).paddingTop, 10) || 80;
        }
        return wrapper._baseTopPadding;
    }

    function syncSubmenuOffset() {
        var pinned = document.querySelector('.dropdown-content.pinned');
        var hasPinned = !!pinned;
        if (document.body) document.body.classList.toggle('has-pinned-menu', hasPinned);
        document.documentElement.classList.toggle('has-pinned-menu', hasPinned);

        var submenuH = pinned ? Math.ceil(pinned.getBoundingClientRect().height) : 0;

        var wrapper = getMainContent();
        if (wrapper) {
            wrapper.style.paddingTop = (getBaseTopPadding() + submenuH) + 'px';
        }
    }

    function toggleDropdownPin(dropdownId) {
        var targetDropdown = document.getElementById(dropdownId);
        if (!targetDropdown) return;

        var targetContent = targetDropdown.querySelector('.dropdown-content');
        if (!targetContent) return;

        var shouldPin = !targetContent.classList.contains('pinned');

        // Close all other pinned dropdowns
        document.querySelectorAll('.dropdown-content.pinned').forEach(function (content) {
            content.classList.remove('pinned');
        });

        if (shouldPin) {
            targetContent.classList.add('pinned');
            sessionStorage.setItem('pinnedDropdown', dropdownId);
        } else {
            sessionStorage.setItem('pinnedDropdown', 'closed');
        }

        requestAnimationFrame(syncSubmenuOffset);
    }

    window.toggleDropdownPin = toggleDropdownPin;

    function initNavState() {
        // Priority 1: If subpage has a defined active link (active-page / active-submenu), enforce its parent dropdown
        var activeLink = document.querySelector('.dropdown-content a.active-page') || document.querySelector('.dropdown-content a.active-submenu');
        if (activeLink) {
            var parentDropdown = activeLink.closest('.nav-item.dropdown');
            if (parentDropdown && parentDropdown.id) {
                var parentDc = parentDropdown.querySelector('.dropdown-content');
                if (parentDc) {
                    document.querySelectorAll('.dropdown-content.pinned').forEach(function (d) { d.classList.remove('pinned'); });
                    parentDc.classList.add('pinned');
                    sessionStorage.setItem('pinnedDropdown', parentDropdown.id);
                    syncSubmenuOffset();
                    return;
                }
            }
        }

        // Priority 2: Fall back to sessionStorage if user toggled a menu
        var savedPinned = sessionStorage.getItem('pinnedDropdown');
        if (savedPinned === 'closed') {
            document.querySelectorAll('.dropdown-content.pinned').forEach(function (d) { d.classList.remove('pinned'); });
            syncSubmenuOffset();
            return;
        }

        if (savedPinned) {
            var savedTarget = document.getElementById(savedPinned);
            if (savedTarget) {
                var dc = savedTarget.querySelector('.dropdown-content');
                if (dc) {
                    document.querySelectorAll('.dropdown-content.pinned').forEach(function (d) { d.classList.remove('pinned'); });
                    dc.classList.add('pinned');
                }
            }
        }

        syncSubmenuOffset();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavState);
    } else {
        initNavState();
    }

    window.addEventListener('resize', syncSubmenuOffset);
})();
