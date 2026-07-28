/**
 * demo-nav.js — Shared navigation dropdown logic for subpages
 * Persistent click-to-toggle submenu across page navigations (sessionStorage synchronized)
 */

(function () {
    // Mark document so CSS can differentiate subpages from the main SPA
    document.documentElement.classList.add('subpage-nav');

    // Inject CSS to suppress hover-open and enable smooth content push
    var style = document.createElement('style');
    style.textContent =
        /* Suppress hover-triggered dropdown on subpages — only click (pinned) works */
        '.subpage-nav .dropdown:hover > .dropdown-content:not(.pinned) {' +
        '  visibility: hidden !important;' +
        '  opacity: 0 !important;' +
        '  transform: translateY(-8px) !important;' +
        '}' +
        /* Smooth transition for page content push-down */
        '.page-wrapper, .demo-main {' +
        '  transition: padding-top 0.35s cubic-bezier(0.16, 1, 0.3, 1);' +
        '}';
    document.head.appendChild(style);

    function getMainContent() {
        return document.querySelector('.page-wrapper') || document.querySelector('.demo-main');
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
        var savedPinned = sessionStorage.getItem('pinnedDropdown');

        if (savedPinned === 'closed') {
            // User explicitly closed the dropdown menu
            syncSubmenuOffset();
            return;
        }

        if (savedPinned) {
            // Restore saved pinned dropdown
            var savedTarget = document.getElementById(savedPinned);
            if (savedTarget) {
                var dc = savedTarget.querySelector('.dropdown-content');
                if (dc) dc.classList.add('pinned');
            }
        } else {
            // Default behavior: if page has an active subpage item in a dropdown, pin that parent dropdown
            var activeLink = document.querySelector('.dropdown-content a.active-page');
            if (activeLink) {
                var parentDropdown = activeLink.closest('.nav-item.dropdown');
                if (parentDropdown && parentDropdown.id) {
                    var parentDc = parentDropdown.querySelector('.dropdown-content');
                    if (parentDc) {
                        parentDc.classList.add('pinned');
                        sessionStorage.setItem('pinnedDropdown', parentDropdown.id);
                    }
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

    // Re-sync on window resize
    window.addEventListener('resize', syncSubmenuOffset);
})();
