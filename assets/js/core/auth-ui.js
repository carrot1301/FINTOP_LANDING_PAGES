/**
 * ============================================================
 * auth-ui.js — Auth UI State Manager
 * ============================================================
 * PHASE-2B-1: Auth & Session Real Integration
 *
 * PURPOSE:
 *   Bridges the Phase-2A infrastructure modules with the actual
 *   HTML UI elements on the page. Handles:
 *   - Navbar login/logout state rendering
 *   - Auth modal form submission (real API calls)
 *   - Error message display in auth forms
 *   - Session restore → UI update on page load
 *   - Logout cleanup (tokens, sockets, state, UI)
 *   - RBAC gate application after login
 *   - WebSocket lifecycle (connect on login, disconnect on logout)
 *
 * DESIGN DECISIONS:
 *   This module is separated from auth-manager.js because:
 *   - auth-manager.js is pure logic (tokens, API calls, state)
 *   - auth-ui.js is DOM manipulation (navbar, modals, buttons)
 *   - Keeps the infrastructure layer UI-agnostic
 *   - This file can be swapped out if the UI framework changes
 *
 * INTEGRATION:
 *   Loaded by core/index.js bootstrap, auto-initializes on DOMContentLoaded.
 *   Uses: AuthManager, AppState, SocketManager, RbacEvaluator, ErrorTranslator
 * ============================================================
 */

import { FintopEnv } from './env.js';
import { AppState } from './state.js';
import { ApiClient } from './api-client.js';
import { AuthManager } from './auth-manager.js';
import { SocketManager } from './socket-manager.js';
import { RbacEvaluator } from './rbac.js';
import { ErrorTranslator } from './utils.js';

// ─────────────────────────────────────────────────────────────
// NAVBAR STATE RENDERER
// Updates the navbar to reflect authenticated/guest state.
// Called on login, logout, and session restore.
// ─────────────────────────────────────────────────────────────

const NavbarAuth = {
  /**
   * Update the navbar to show authenticated user state.
   * Replaces the login button and "Bắt đầu" button with
   * user avatar + dropdown with profile/logout options.
   */
  renderAuthenticated(user) {
    const dropdownContainer = document.getElementById('userDropdownContainer');
    const startButton = document.getElementById('fintopStartBtn');
    const bellContainer = document.getElementById('notifBellContainer');

    if (!dropdownContainer) return;

    const displayName = user?.fullName || user?.displayName || user?.email || 'User';
    const initials = this._getInitials(displayName);
    const tierLevel = user?.tierLevel || 'STANDARD';
    const tierInfo = this._getTierInfo(tierLevel);

    // Dynamic VIP/Admin/Editor links based on RBAC & Tier
    let dynamicLinksHTML = '';

    if (RbacEvaluator.isAdminCapable()) {
      dynamicLinksHTML += `
        <a href="/admin/" class="user-dropdown-item" style="color: #c084fc; font-weight: bold; border-left: 3px solid #c084fc;">
          ⚙️ Bảng Quản trị (Admin)
        </a>
      `;
    }

    if (RbacEvaluator.isSuperAdmin() || RbacEvaluator.hasRole('EDITOR') || RbacEvaluator.hasPermission('CREATE_SIGNAL')) {
      dynamicLinksHTML += `
        <a href="javascript:void(0)" class="user-dropdown-item" style="color: #60a5fa; font-weight: bold; border-left: 3px solid #60a5fa;" onclick="if (typeof openPanel === 'function') { const trigger = document.querySelector('[data-panel=\\'panel-tinhieu\\']'); openPanel('panel-tinhieu', trigger || this); } else { alert('Mở bảng Đăng tín hiệu'); }">
          📡 Viết Tín hiệu (Editor)
        </a>
      `;
    }

    if (dynamicLinksHTML) {
      dynamicLinksHTML += `<div style="margin: 4px 0; border-top: 1px solid rgba(255,255,255,0.08);"></div>`;
    }

    // Special Tier Perks inside dropdown
    if (RbacEvaluator.hasTier('SILVER')) {
      dynamicLinksHTML += `
        <a href="javascript:void(0)" class="user-dropdown-item" style="color: #e2e8f0;" onclick="if (typeof openPanel === 'function') { const trigger = document.querySelector('[data-panel=\\'panel-stock-pro\\']'); openPanel('panel-stock-pro', trigger || this); } else { alert('Mở đặc quyền PRO Data'); }">
          📊 Đặc quyền PRO Data
        </a>
      `;
    }
    if (RbacEvaluator.hasTier('GOLD')) {
      dynamicLinksHTML += `
        <a href="javascript:void(0)" class="user-dropdown-item" style="color: #fbbf24;" onclick="if (typeof openPanel === 'function') { const trigger = document.querySelector('[data-panel=\\'panel-boloc\\']'); openPanel('panel-boloc', trigger || this); } else { alert('Mở Bộ lọc cổ phiếu VIP'); }">
          🔍 Bộ lọc cổ phiếu VIP
        </a>
      `;
    }
    if (RbacEvaluator.hasTier('DIAMOND')) {
      dynamicLinksHTML += `
        <a href="javascript:void(0)" class="user-dropdown-item" style="color: #a78bfa;" onclick="if (typeof openPanel === 'function') { const trigger = document.querySelector('[data-panel=\\'panel-tinhieu\\']'); openPanel('panel-tinhieu', trigger || this); } else { alert('Mở tư vấn cố vấn 1-1'); }">
          👑 Cố vấn 1-1 Diamond
        </a>
      `;
    }

    if (RbacEvaluator.hasTier('SILVER')) {
      dynamicLinksHTML += `<div style="margin: 4px 0; border-top: 1px solid rgba(255,255,255,0.08);"></div>`;
    }

    // Replace dropdown contents: avatar, name/tier block, dynamic links, and logout/help
    // NOTE: Notifications are NO LONGER inside this dropdown — they are in the bell icon
    dropdownContainer.innerHTML = `
      <div class="fintop-user-avatar" style="
        width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
        background: ${tierInfo.gradient};
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 700; color: white;
        border: 2px solid ${tierInfo.borderColor};
        box-shadow: 0 0 8px ${tierInfo.glowColor};
        transition: all 0.3s ease;
      ">${initials}</div>
      <div class="user-dropdown-menu">
        <div style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">${displayName}</div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${user?.email || ''}</div>
          <div style="margin-top: 6px;">
            <span style="
              font-size: 0.7rem; font-weight: 700; padding: 2px 8px;
              border-radius: 4px; color: ${tierInfo.textColor};
              background: ${tierInfo.badgeBg}; letter-spacing: 0.5px;
            ">${tierInfo.icon} ${tierInfo.label}</span>
          </div>
        </div>
        ${dynamicLinksHTML}
        <a href="javascript:void(0)" class="user-dropdown-item" id="fintopProfileBtn" onclick="if (typeof openPanel === 'function') { openPanel('panel-profile', this); } else { alert('Thông tin cá nhân'); }">
          👤 Thông tin cá nhân
        </a>
        <a href="javascript:void(0)" class="user-dropdown-item" id="fintopLogoutBtn">
          🚪 Đăng xuất
        </a>
        <a href="javascript:void(0)" class="user-dropdown-item" id="fintopLogoutAllBtn">
          🔒 Đăng xuất tất cả
        </a>
        <a href="javascript:void(0)" class="user-dropdown-item"
           onclick="alert('Mở Trung tâm trợ giúp')">
          Trung tâm Trợ giúp
        </a>
      </div>
    `;

    // Note: Dropdown click and logout handlers are cleanly delegated to #userDropdownContainer in auth.js
    // to avoid duplicate event listeners, memory leaks, and stale DOM references upon re-rendering.

    // Hide "Bắt đầu" button when authenticated
    if (startButton) startButton.style.display = 'none';

    // Show the notification bell icon
    if (bellContainer) bellContainer.style.display = 'inline-flex';

    // Clear anti-flicker style overrides
    this._removeAntiFlicker();
  },

  /**
   * Revert navbar to guest/unauthenticated state.
   */
  renderGuest() {
    const dropdownContainer = document.getElementById('userDropdownContainer');
    const startButton = document.getElementById('fintopStartBtn');
    const bellContainer = document.getElementById('notifBellContainer');

    if (!dropdownContainer) return;

    dropdownContainer.innerHTML = `
      <span class="icon-link" style="cursor: pointer;">👤</span>
      <div class="user-dropdown-menu">
        <a href="javascript:void(0)" class="user-dropdown-item login-btn"
           onclick="openAuthModal('login')">👤 Đăng nhập</a>
        <a href="javascript:void(0)" class="user-dropdown-item"
           onclick="alert('Mở Trung tâm trợ giúp')">Trung tâm Trợ giúp</a>
        <a href="javascript:void(0)" class="user-dropdown-item"
           onclick="alert('Tính năng mới sắp ra mắt!')">Có gì mới</a>
      </div>
    `;

    // Note: Dropdown click toggle handler is already attached by original auth.js once on DOMContentLoaded

    // Show "Bắt đầu" button when guest
    if (startButton) startButton.style.display = '';

    // Hide the notification bell icon when guest
    if (bellContainer) {
      bellContainer.style.display = 'none';
      bellContainer.classList.remove('active');
    }

    // Clear anti-flicker style overrides
    this._removeAntiFlicker();
  },

  _removeAntiFlicker() {
    try {
      const antiFlicker = document.getElementById('fintop-anti-flicker');
      if (antiFlicker) {
        antiFlicker.remove();
      }
    } catch (e) {
      console.warn('[NavbarAuth] Failed to remove anti-flicker style:', e);
    }
  },

  _getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  _getTierInfo(tier) {
    const map = {
      STANDARD: {
        label: 'STANDARD', icon: '⭐', textColor: '#94a3b8',
        gradient: 'linear-gradient(135deg, #475569, #64748b)',
        borderColor: 'rgba(100, 116, 139, 0.5)', glowColor: 'rgba(100, 116, 139, 0.2)',
        badgeBg: 'rgba(100, 116, 139, 0.2)',
      },
      SILVER: {
        label: 'PRO', icon: '🥈', textColor: '#cbd5e1',
        gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
        borderColor: 'rgba(148, 163, 184, 0.5)', glowColor: 'rgba(148, 163, 184, 0.2)',
        badgeBg: 'rgba(148, 163, 184, 0.2)',
      },
      GOLD: {
        label: 'V.I.P', icon: '🥇', textColor: '#fbbf24',
        gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
        borderColor: 'rgba(251, 191, 36, 0.5)', glowColor: 'rgba(251, 191, 36, 0.3)',
        badgeBg: 'rgba(251, 191, 36, 0.15)',
      },
      DIAMOND: {
        label: 'DIAMOND', icon: '💎', textColor: '#a78bfa',
        gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        borderColor: 'rgba(167, 139, 250, 0.5)', glowColor: 'rgba(167, 139, 250, 0.3)',
        badgeBg: 'rgba(167, 139, 250, 0.15)',
      },
    };
    return map[tier] || map.STANDARD;
  },

};

// ─────────────────────────────────────────────────────────────
// AUTH FORM ERROR DISPLAY
// ─────────────────────────────────────────────────────────────

const AuthFormUI = {
  /**
   * Show error message in the auth form.
   * @param {string} formId - 'authFormLogin' or 'authFormRegister'
   * @param {string} message
   */
  showError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;

    this.clearError(formId);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'fintop-auth-error';
    errorDiv.id = `${formId}-error`;
    errorDiv.setAttribute('data-auth-error', formId === 'authFormLogin' ? 'login' : 'register');
    errorDiv.style.cssText = `
      background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;
      color: #fca5a5; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
      animation: fintop-shake 0.4s ease;
    `;
    errorDiv.innerHTML = `<span style="font-size: 1.1rem;">⚠️</span><span>${message}</span>`;

    // Insert after the title
    const title = form.querySelector('.auth-title');
    if (title) {
      title.insertAdjacentElement('afterend', errorDiv);
    } else {
      form.prepend(errorDiv);
    }
  },

  /**
   * Clear error message from auth form.
   * @param {string} formId
   */
  clearError(formId) {
    const existing = document.getElementById(`${formId}-error`);
    if (existing) existing.remove();
    this.clearSuccess(formId);
  },

  /**
   * Show success message in the auth form.
   * @param {string} formId
   * @param {string} message
   */
  showSuccess(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;

    const existing = document.getElementById(`${formId}-success`);
    if (existing) existing.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'fintop-auth-success';
    successDiv.id = `${formId}-success`;
    successDiv.style.cssText = `
      background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;
      color: #a7f3d0; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
      animation: fintop-shake 0.4s ease;
    `;
    successDiv.innerHTML = `<span style="font-size: 1.1rem;">✅</span><span>${message}</span>`;

    // Insert after the title
    const title = form.querySelector('.auth-title');
    if (title) {
      title.insertAdjacentElement('afterend', successDiv);
    } else {
      form.prepend(successDiv);
    }
  },

  /**
   * Clear success message from auth form.
   * @param {string} formId
   */
  clearSuccess(formId) {
    const existing = document.getElementById(`${formId}-success`);
    if (existing) existing.remove();
  },

  /**
   * Set the submit button loading state.
   * @param {string} formId
   * @param {boolean} loading
   */
  setLoading(formId, loading) {
    const form = document.getElementById(formId);
    if (!form) return;

    const btn = form.querySelector('.auth-btn-submit');
    if (!btn) return;

    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Đang xử lý...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.textContent = btn.dataset.originalText || 'Đăng nhập';
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
    }
  },
};

// ─────────────────────────────────────────────────────────────
// AUTH UI CONTROLLER
// Main orchestrator for all auth-related UI interactions.
// ─────────────────────────────────────────────────────────────

const AuthUI = {
  _initialized: false,

  /**
   * Initialize auth UI — called once on DOMContentLoaded.
   * Restores session state and updates navbar accordingly.
   */
  async initialize() {
    if (this._initialized) return;
    this._initialized = true;

    // Inject shake animation CSS (for error message animation)
    this._injectStyles();

    // Listen for auth state changes to keep UI in sync
    AppState.on(AppState.EVENTS.AUTH_LOGIN, () => this._onLogin());
    AppState.on(AppState.EVENTS.AUTH_LOGOUT, () => this._onLogout());
    AppState.on(AppState.EVENTS.USER_LOADED, (user) => this._onUserLoaded(user));

    // Multi-tab synchronization via localStorage events
    window.addEventListener('storage', async (e) => {
      if (e.key === FintopEnv.STORAGE_KEYS.ACCESS_TOKEN) {
        if (e.newValue) {
          if (FintopEnv.DEBUG) {
            console.log('[AuthUI] Auth token detected in another tab — synchronizing session.');
          }
          // Reset initial status if needed and restore session
          AuthManager._isInitialized = false;
          await AuthManager.initialize();
        } else {
          if (FintopEnv.DEBUG) {
            console.log('[AuthUI] Auth token cleared in another tab — executing silent logout.');
          }
          // Perform silent local logout
          await AuthManager.logout({ silent: true });
        }
      }
    });

    // Delegated click listener for notifications read
    const handleNotificationClick = async (e) => {
      const notifItem = e.target.closest('.fintop-notif-item');
      if (notifItem) {
        e.preventDefault();
        e.stopPropagation();
        const id = notifItem.dataset.id;
        
        // Mark as read in UI instantly
        notifItem.style.borderLeft = 'none';
        notifItem.style.background = 'transparent';
        notifItem.style.opacity = '0.6';
        const dot = notifItem.querySelector('.notif-dot');
        if (dot) dot.remove();

        // Extrapolate values to show in detail modal
        const titleEl = notifItem.querySelector('.notif-title');
        const contentEl = notifItem.querySelector('.notif-content');
        const timeEl = notifItem.querySelector('.notif-time');
        
        const titleText = titleEl ? titleEl.textContent.trim().replace(/[\n\r]+/g, ' ') : 'Thông báo';
        const contentText = contentEl ? contentEl.innerHTML.trim() : '';
        const timeText = timeEl ? timeEl.textContent.trim() : '';

        // Close bell dropdown when opening detail modal
        const bellContainer = document.getElementById('notifBellContainer');
        if (bellContainer) bellContainer.classList.remove('active');

        // Check if it is a membership upgrade notification
        const isUpgrade = titleText.includes('Nâng cấp tài khoản');
        
        if (isUpgrade) {
          // Open the modal immediately with a loading state, then fetch subscription details
          this.showNotificationDetailModal({ 
            title: titleText, 
            content: contentText, 
            time: timeText, 
            isLoadingUpgrade: true 
          });
          
          try {
            const subResponse = await ApiClient.get('/users/subscription');
            const subData = subResponse.data || subResponse || {};
            
            // Format subscription details
            this.showNotificationDetailModal({ 
              title: titleText, 
              content: contentText, 
              time: timeText, 
              subscription: subData 
            });
          } catch (err) {
            if (FintopEnv.DEBUG) console.error('[AuthUI] Failed to load subscription details:', err);
            // Fallback: show standard modal
            this.showNotificationDetailModal({ 
              title: titleText, 
              content: contentText, 
              time: timeText 
            });
          }
        } else {
          // Open normal modal
          this.showNotificationDetailModal({ title: titleText, content: contentText, time: timeText });
        }

        try {
          await ApiClient.patch(`/users/notifications/${id}/read`);
          
          // Decrement count
          const currentCount = AppState.get('notifications', 'unreadCount') || 0;
          if (currentCount > 0) {
            AppState.setUnreadCount(currentCount - 1);
            this._updateNotificationBadge(currentCount - 1);
          }
        } catch (err) {
          if (FintopEnv.DEBUG) console.error('[AuthUI] Failed to mark notification as read:', err);
        }
      }
    };

    document.addEventListener('click', handleNotificationClick);
    
    // Bind to bell dropdown as well
    const bellDropdownEl = document.getElementById('notifBellDropdown');
    if (bellDropdownEl) {
      bellDropdownEl.addEventListener('click', handleNotificationClick);
    }

    // Bell icon toggle handler
    const bellBtn = document.getElementById('notifBellBtn');
    const bellContainerEl = document.getElementById('notifBellContainer');
    if (bellBtn && bellContainerEl) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bellContainerEl.classList.toggle('active');
        // Close user dropdown if open
        const userDropdown = document.getElementById('userDropdownContainer');
        if (userDropdown) userDropdown.classList.remove('active');
      });
    }

    // Close bell dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const bellContainer = document.getElementById('notifBellContainer');
      if (bellContainer && !bellContainer.contains(e.target)) {
        bellContainer.classList.remove('active');
      }
    });

    // Delegated click listener for top-left logo brand navigation (ADMIN-NAV-1)
    document.addEventListener('click', (e) => {
      const target = e.target;
      const neonLogoImg = target.closest('.neon-logo');
      const logoLink = target.closest('.logo-link');
      
      const anchor = logoLink || (neonLogoImg ? neonLogoImg.closest('a') : null);
      
      if (anchor) {
        e.preventDefault();
        
        // Check if we are currently inside the admin panel
        const isCurrentPageAdmin = window.location.pathname.startsWith('/admin') || 
                                   window.location.pathname.includes('/fintop_frontend/admin/');
        
        if (isCurrentPageAdmin || anchor.classList.contains('admin-logo-link')) {
          // If already on admin page, navigate back to the user page
          const targetUrl = anchor.getAttribute('href') || '/index.html';
          if (FintopEnv.DEBUG) console.log('[AuthUI] Logo clicked in Admin — Navigating to user page:', targetUrl);
          window.location.href = targetUrl;
        } else if (RbacEvaluator.isAdminCapable()) {
          // If on user page and user is admin, navigate to admin panel
          if (FintopEnv.DEBUG) console.log('[AuthUI] Logo clicked — Admin-capable user. Navigating to /admin/');
          window.location.href = '/admin/';
        } else {
          // If on user page and user is standard/guest, navigate to home/user index page
          const targetUrl = anchor.getAttribute('href') || '/index.html';
          if (FintopEnv.DEBUG) console.log('[AuthUI] Logo clicked — Guest/Standard user. Navigating to:', targetUrl);
          window.location.href = targetUrl;
        }
      }
    });


    // Render initial navbar state based on session
    if (AuthManager.isAuthenticated) {
      const user = AppState.getState('user');
      NavbarAuth.renderAuthenticated(user);
      this.loadNotifications();

      SocketManager.subscribeNotifications(
        (notification) => {
          if (FintopEnv.DEBUG) console.log('[AuthUI] New notification:', notification);
          this._handleIncomingNotification(notification);
        },
        (unread) => {
          this._updateNotificationBadge(unread.count);
        }
      ).then((unsub) => {
        this._notifUnsubscribe = unsub;
      }).catch((err) => {
        if (FintopEnv.DEBUG) console.warn('[AuthUI] Notification WS connection failed:', err.message);
      });
    } else {
      NavbarAuth.renderGuest();
    }

    if (FintopEnv.DEBUG) {
      console.log('[AuthUI] Initialized');
    }
  },

  // ─────────────────────────────────────────────────────
  // REAL LOGIN HANDLER
  // Called by the auth modal form submission.
  // Replaces the old submitAuth(event, 'login') demo logic.
  // ─────────────────────────────────────────────────────

  /**
   * Handle real login form submission.
   * @param {Event} event - Form submit event
   */
  async handleLogin(event) {
    event.preventDefault();
    console.log('[AuthUI] ▶ handleLogin called');

    const form = document.getElementById('authFormLogin');
    if (!form) {
      console.error('[AuthUI] ❌ authFormLogin form not found!');
      return;
    }

    // Double submit guard
    const submitBtn = form.querySelector('.auth-btn-submit');
    if (submitBtn && submitBtn.disabled) {
      console.warn('[AuthUI] ⚠️ Submit button is disabled (double submit guard). Skipping.');
      return;
    }

    // Get input values using IDs (stable, unlike type-based selectors
    // which break when password toggle changes input type to "text")
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    if (!emailInput || !passwordInput) {
      console.error('[AuthUI] ❌ Input elements not found! email:', !!emailInput, 'password:', !!passwordInput);
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    console.log('[AuthUI] 📧 Email:', email, '| Password length:', password.length);

    // Client-side validation
    if (!email) {
      AuthFormUI.showError('authFormLogin', 'Vui lòng nhập email.');
      emailInput.focus();
      return;
    }

    if (!password || password.length < 6) {
      AuthFormUI.showError('authFormLogin', 'Mật khẩu phải có ít nhất 6 ký tự.');
      passwordInput.focus();
      return;
    }

    AuthFormUI.clearError('authFormLogin');
    AuthFormUI.setLoading('authFormLogin', true);

    try {
      console.log('[AuthUI] 🔄 Calling AuthManager.login...');
      await AuthManager.login(email, password);
      console.log('[AuthUI] ✅ Login successful!');

      // Success → close modal
      if (typeof closeAuthModal === 'function') {
        closeAuthModal();
      }

      // Clear form fields for security
      emailInput.value = '';
      passwordInput.value = '';

    } catch (err) {
      console.error('[AuthUI] ❌ Login failed:', err);
      // Translate backend error to Vietnamese message
      const translated = ErrorTranslator.translate(err);

      if (err?.message === 'EMAIL_NOT_VERIFIED') {
        const verifyEmailInput = document.getElementById('verifyEmailAddress');
        if (verifyEmailInput) {
          verifyEmailInput.value = email;
        }
        if (typeof switchAuthView === 'function') {
          switchAuthView('verify');
        }
        AuthFormUI.showError('authFormVerify', translated.message);
      } else {
        AuthFormUI.showError('authFormLogin', translated.message);
      }

      if (FintopEnv.DEBUG) {
        console.error('[AuthUI] Login failed:', err);
      }
    } finally {
      AuthFormUI.setLoading('authFormLogin', false);
    }
  },

  // ─────────────────────────────────────────────────────
  // REGISTER HANDLER
  // ─────────────────────────────────────────────────────

  /**
   * Handle register form submission.
   * @param {Event} event
   */
  async handleRegister(event) {
    event.preventDefault();

    const form = document.getElementById('authFormRegister');
    if (!form) return;

    const fullNameInput = document.getElementById('registerFullName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');

    if (!fullNameInput || !emailInput || !passwordInput) return;

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!fullName) {
      AuthFormUI.showError('authFormRegister', 'Vui lòng nhập họ và tên.');
      fullNameInput.focus();
      return;
    }

    if (!email) {
      AuthFormUI.showError('authFormRegister', 'Vui lòng nhập email.');
      emailInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      AuthFormUI.showError('authFormRegister', 'Email không đúng định dạng (VD: example@fintop.vn).');
      emailInput.focus();
      return;
    }

    if (!password || password.length < 6) {
      AuthFormUI.showError('authFormRegister', 'Mật khẩu phải có ít nhất 6 ký tự.');
      passwordInput.focus();
      return;
    }

    // Collect all additional registration fields
    const phoneInput = document.getElementById('registerPhone');
    const birthdayInput = document.getElementById('registerBirthday');
    const cityInput = document.getElementById('registerCity');
    const stockAccountInput = document.getElementById('registerStockAccount');
    const refIdInput = document.getElementById('registerRefId');
    const refNameInput = document.getElementById('registerRefName');

    const phone = phoneInput ? phoneInput.value.trim() : '';
    const dob = birthdayInput ? birthdayInput.value : '';
    const address = cityInput ? cityInput.value.trim() : '';
    const stockAccount = stockAccountInput ? stockAccountInput.value.trim() : '';
    const referralId = refIdInput ? refIdInput.value.trim() : '';
    const referralName = refNameInput ? refNameInput.value.trim() : '';

    // Radio button values
    const investmentDurationRadio = form.querySelector('input[name="investmentDuration"]:checked');
    const riskAppetiteRadio = form.querySelector('input[name="riskAppetite"]:checked');
    const brokerageCompanyRadio = form.querySelector('input[name="brokerageCompany"]:checked');

    const investmentDuration = investmentDurationRadio ? investmentDurationRadio.value : '';
    const investmentStyle = riskAppetiteRadio ? riskAppetiteRadio.value : '';
    const stockCompany = brokerageCompanyRadio ? brokerageCompanyRadio.value : '';

    AuthFormUI.clearError('authFormRegister');
    AuthFormUI.setLoading('authFormRegister', true);

    try {
      const payload = { email, password, fullName };
      if (phone) payload.phone = phone;
      if (dob) payload.dob = dob;
      if (address) payload.address = address;
      if (investmentDuration) payload.investmentDuration = investmentDuration;
      if (investmentStyle) payload.investmentStyle = investmentStyle;
      if (stockCompany && stockCompany !== 'none') payload.stockCompany = stockCompany;
      if (stockAccount) payload.stockAccount = stockAccount;
      if (referralId) payload.referralId = referralId;
      if (referralName) payload.referralName = referralName;

      const result = await ApiClient.post('/auth/register', payload, { skipAuth: true });

      if (result?.data?.verificationRequired) {
        const verifyEmailInput = document.getElementById('verifyEmailAddress');
        if (verifyEmailInput) verifyEmailInput.value = email;

        if (typeof switchAuthView === 'function') {
          switchAuthView('verify');
        }

        AuthFormUI.showSuccess('authFormVerify',
          'Mã xác thực đã được gửi đến ' + email + '. Vui lòng kiểm tra email.'
        );
      } else {
        emailInput.value = '';

        if (typeof switchAuthView === 'function') {
          switchAuthView('login');
        }

        AuthFormUI.showSuccess('authFormLogin', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập lại.');

        setTimeout(() => {
          AuthFormUI.clearSuccess('authFormLogin');
        }, 3000);
      }

      fullNameInput.value = '';
      passwordInput.value = '';
    } catch (err) {
      const translated = ErrorTranslator.translate(err);
      AuthFormUI.showError('authFormRegister', translated.message);

      if (FintopEnv.DEBUG) {
        console.error('[AuthUI] Registration failed:', err);
      }
    } finally {
      AuthFormUI.setLoading('authFormRegister', false);
    }
  },

  // ─────────────────────────────────────────────────────
  // FORGOT PASSWORD HANDLER
  // ─────────────────────────────────────────────────────

  async handleForgotPassword(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      AuthFormUI.showError('authFormForgot', 'Vui lòng nhập email để khôi phục mật khẩu.');
      if (emailInput) emailInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      AuthFormUI.showError('authFormForgot', 'Email không đúng định dạng.');
      return;
    }

    AuthFormUI.clearError('authFormForgot');
    AuthFormUI.setLoading('authFormForgot', true);

    try {
      await ApiClient.post('/auth/forgot-password', { email }, { skipAuth: true });
      AuthFormUI.showSuccess('authFormForgot',
        'Link đặt lại mật khẩu đã được gửi vào email. Vui lòng kiểm tra hộp thư, kể cả mục Spam.'
      );
    } catch (err) {
      const translated = ErrorTranslator.translate(err);
      AuthFormUI.showError('authFormForgot', translated.message);
    } finally {
      AuthFormUI.setLoading('authFormForgot', false);
    }
  },

  // ─────────────────────────────────────────────────────
  // EMAIL VERIFICATION HANDLERS
  // ─────────────────────────────────────────────────────

  async handleVerifyEmail(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('verifyEmailAddress');
    const codeInput = document.getElementById('verifyOtpCode');

    if (!emailInput || !codeInput) return;

    const email = emailInput.value.trim();
    const code = codeInput.value.trim();

    if (!email) {
      AuthFormUI.showError('authFormVerify', 'Không tìm thấy email cần xác thực. Vui lòng đăng ký hoặc đăng nhập lại.');
      return;
    }

    if (!code || code.length !== 6) {
      AuthFormUI.showError('authFormVerify', 'Vui lòng nhập mã OTP 6 số.');
      codeInput.focus();
      return;
    }

    AuthFormUI.clearError('authFormVerify');
    AuthFormUI.setLoading('authFormVerify', true);

    try {
      await ApiClient.post('/auth/verify-email', { email, code }, { skipAuth: true });
      codeInput.value = '';

      if (typeof switchAuthView === 'function') {
        switchAuthView('login');
      }
      AuthFormUI.showSuccess('authFormLogin', 'Xác thực email thành công. Vui lòng đăng nhập.');
    } catch (err) {
      const translated = ErrorTranslator.translate(err);
      AuthFormUI.showError('authFormVerify', translated.message);
    } finally {
      AuthFormUI.setLoading('authFormVerify', false);
    }
  },

  async handleResendOTP(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('verifyEmailAddress');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) {
      AuthFormUI.showError('authFormVerify', 'Không tìm thấy email cần xác thực.');
      return;
    }

    const resendBtn = document.getElementById('resendOtpBtn');
    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.textContent = 'Đang gửi...';
    }

    try {
      await ApiClient.post('/auth/resend-verification', { email }, { skipAuth: true });
      AuthFormUI.showSuccess('authFormVerify', 'Mã OTP mới đã được gửi vào email.');

      if (resendBtn) {
        let countdown = 60;
        resendBtn.textContent = `Gửi lại (${countdown}s)`;
        const interval = setInterval(() => {
          countdown--;
          resendBtn.textContent = `Gửi lại (${countdown}s)`;
          if (countdown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Gửi lại mã OTP';
          }
        }, 1000);
      }
    } catch (err) {
      const translated = ErrorTranslator.translate(err);
      AuthFormUI.showError('authFormVerify', translated.message);
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Gửi lại mã OTP';
      }
    }
  },

  // ─────────────────────────────────────────────────────
  // LOGOUT HANDLER
  // ─────────────────────────────────────────────────────

  /**
   * Handle logout with full cleanup.
   * @param {boolean} [all=false] - Logout all devices
   */
  async handleLogout(all = false) {
    // Close dropdown
    const dropdownContainer = document.getElementById('userDropdownContainer');
    if (dropdownContainer) dropdownContainer.classList.remove('active');

    try {
      // Disconnect authenticated WebSockets BEFORE logout (needs valid token)
      SocketManager.disconnectAuthenticated();

      // Perform logout (server revocation + local cleanup)
      await AuthManager.logout({ all });

    } catch (err) {
      if (FintopEnv.DEBUG) {
        console.warn('[AuthUI] Logout error:', err.message);
      }
    }
    // UI update happens automatically via AUTH_LOGOUT event → _onLogout()
  },

  // ─────────────────────────────────────────────────────
  // EVENT HANDLERS (triggered by AppState events)
  // ─────────────────────────────────────────────────────

  _onLogin() {
    const user = AppState.getState('user');
    NavbarAuth.renderAuthenticated(user);
    RbacEvaluator.applyAllGates();

    // Load initial historical notifications
    this.loadNotifications();

    // Connect to notification WebSocket
    SocketManager.subscribeNotifications(
      (notification) => {
        if (FintopEnv.DEBUG) console.log('[AuthUI] New notification:', notification);
        this._handleIncomingNotification(notification);
      },
      (unread) => {
        this._updateNotificationBadge(unread.count);
      }
    ).then((unsub) => {
      this._notifUnsubscribe = unsub;
    }).catch((err) => {
      if (FintopEnv.DEBUG) console.warn('[AuthUI] Notification WS connection failed:', err.message);
    });

    // Start background offline polling fallback
    this._startNotificationFallback();
  },

  _onLogout() {
    if (this._notifUnsubscribe) {
      this._notifUnsubscribe();
      this._notifUnsubscribe = null;
    }
    if (this._notifFallbackInterval) {
      clearInterval(this._notifFallbackInterval);
      this._notifFallbackInterval = null;
    }
    NavbarAuth.renderGuest();
    RbacEvaluator.applyAllGates();
  },

  _onUserLoaded(user) {
    // Update navbar whenever user profile is refreshed
    if (AuthManager.isAuthenticated) {
      NavbarAuth.renderAuthenticated(user);
    }
  },

  async loadNotifications() {
    // Target the notification list inside the bell dropdown
    const bellDropdown = document.getElementById('notifBellDropdown');
    const listContainer = bellDropdown ? bellDropdown.querySelector('.fintop-notifications-list') : document.querySelector('.fintop-notifications-list');
    if (FintopEnv.DEBUG) console.log('[AuthUI] loadNotifications called. listContainer:', !!listContainer);
    if (!listContainer) return;

    try {
      const response = await ApiClient.get('/users/notifications?limit=10');
      const notifications = response?.data?.data || response?.data || [];
      if (FintopEnv.DEBUG) console.log('[AuthUI] Loaded notifications:', notifications.length);
      this.renderNotificationsList(notifications);

      // Sync unread badge count from notifications
      const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;
      this._updateNotificationBadge(unreadCount);
    } catch (err) {
      if (FintopEnv.DEBUG) console.error('[AuthUI] Failed to load notifications:', err);
    }
  },

  _startNotificationFallback() {
    if (this._notifFallbackInterval) clearInterval(this._notifFallbackInterval);
    this._notifFallbackInterval = setInterval(() => {
      if (AuthManager.isAuthenticated && SocketManager.status.notifications !== 'connected') {
        this.loadNotifications();
      }
    }, 30000);
  },

  renderNotificationsList(notifications) {
    const bellDropdown = document.getElementById('notifBellDropdown');
    const listContainer = bellDropdown ? bellDropdown.querySelector('.fintop-notifications-list') : document.querySelector('.fintop-notifications-list');
    if (!listContainer) return;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      listContainer.innerHTML = `<div style="font-size: 0.8rem; color: #64748b; text-align: center; padding: 24px 0;">Không có thông báo mới</div>`;
      return;
    }

    listContainer.innerHTML = notifications.map(notif => this._renderNotificationItem(notif)).join('');
  },

  _renderNotificationItem(notif) {
    const isUnread = notif.status === 'UNREAD' || notif.status === undefined || notif.readAt === null;
    const glowStyle = isUnread ? 'border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.04);' : 'opacity: 0.6;';
    const dotIndicator = isUnread ? '<span class="notif-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444; display: inline-block; margin-left: 6px;"></span>' : '';
    
    // Aligns formatting with the Formatter tool helper
    const timeText = window.FintopInfra?.Formatter?.relativeTime(notif.createdAt) || 'Vừa xong';

    return `
      <div class="fintop-notif-item" data-id="${notif.id}" style="padding: 8px 10px; border-radius: 6px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.78rem; color: #cbd5e1; cursor: pointer; transition: all 0.2s ease; ${glowStyle}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
          <div class="notif-title" style="font-weight: 600;">${notif.title || 'Thông báo'} ${dotIndicator}</div>
          <div class="notif-time" style="font-size: 0.65rem; color: #64748b; white-space: nowrap;">${timeText}</div>
        </div>
        <div class="notif-content" style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px; line-height: 1.4;">${notif.content || notif.message || ''}</div>
      </div>
    `;
  },

  _handleIncomingNotification(notification) {
    const bellDropdown = document.getElementById('notifBellDropdown');
    const listContainer = bellDropdown ? bellDropdown.querySelector('.fintop-notifications-list') : document.querySelector('.fintop-notifications-list');
    if (!listContainer) return;

    if (listContainer.innerHTML.includes('Không có thông báo mới')) {
      listContainer.innerHTML = '';
    }

    const itemHtml = this._renderNotificationItem(notification);
    listContainer.insertAdjacentHTML('afterbegin', itemHtml);

    const newItem = listContainer.querySelector(`[data-id="${notification.id}"]`);
    if (newItem) {
      newItem.style.boxShadow = '0 0 12px rgba(168,85,247,0.5)';
      setTimeout(() => {
        newItem.style.boxShadow = '';
      }, 1500);
    }

    // Auto-sync user profile if the notification indicates a membership upgrade
    if (notification.title && notification.title.includes('Nâng cấp tài khoản')) {
      AuthManager.loadUserProfile().catch(err => {
        console.error('[AuthUI] Failed to auto-reload user profile on upgrade notification:', err);
      });
    }
  },

  _updateNotificationBadge(count) {
    // Update bell icon badge
    const bellBadge = document.getElementById('notifBellBadge');
    if (bellBadge) {
      bellBadge.textContent = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
      bellBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Also update any legacy badges
    const badges = document.querySelectorAll('[data-notification-badge]');
    badges.forEach(badge => {
      badge.textContent = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    // Update inner unread indicator in bell dropdown header
    const innerBadge = document.querySelector('.fintop-notif-unread-indicator');
    if (innerBadge) {
      innerBadge.textContent = count > 0 ? String(count) : '';
      innerBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  },

  showNotificationDetailModal({ title, content, time, isLoadingUpgrade, subscription }) {
    let modalOverlay = document.getElementById('fintopNotifDetailModal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'fintopNotifDetailModal';
      modalOverlay.className = 'notif-modal-overlay';
      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeNotificationDetailModal();
        }
      });
    }

    let detailHTML = `<div style="margin-top: 10px;">${content}</div>`;

    if (isLoadingUpgrade) {
      detailHTML = `
        <div style="margin-top: 10px;">${content}</div>
        <div style="margin-top: 20px; padding: 15px; border-radius: 8px; border: 1px dashed rgba(168,85,247,0.3); background: rgba(168,85,247,0.02); text-align: center; color: #a855f7;">
          <span style="display: inline-block; animation: fintop-spin 1s infinite linear; margin-right: 8px;">⏳</span> Đang tải chi tiết gói nâng cấp...
        </div>
      `;
    } else if (subscription) {
      const tier = (subscription.plan?.tierLevel || subscription.tierLevel || 'STANDARD').toUpperCase();
      let rawPlanName = subscription.plan?.name || tier;
      let planName = rawPlanName.toUpperCase().trim();
      
      // Unify plan names exactly to standard, pro 1 2 3, V.I.P and diamond
      if (planName === 'SILVER') {
        planName = 'PRO';
      } else if (planName === 'GOLD' || planName === 'VIP') {
        planName = 'V.I.P';
      } else if (planName.startsWith('PRO')) {
        const match = planName.match(/^PRO\s*(\d+)$/i);
        if (match) {
          planName = `PRO ${match[1]}`;
        } else {
          planName = 'PRO';
        }
      } else if (planName.startsWith('VIP')) {
        const match = planName.match(/^VIP\s*(\d+)$/i);
        if (match) {
          planName = `V.I.P ${match[1]}`;
        } else {
          planName = 'V.I.P';
        }
      } else if (planName === 'STANDARD') {
        planName = 'STANDARD';
      } else if (planName === 'DIAMOND') {
        planName = 'DIAMOND';
      } else {
        planName = rawPlanName
          .replace(/silver/gi, 'PRO')
          .replace(/gold/gi, 'V.I.P')
          .replace(/vip/gi, 'V.I.P');
      }
      
      let durationText = 'Không xác định';
      if (subscription.endDate) {
        const d = new Date(subscription.endDate);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          durationText = `${day}/${month}/${year}`;
        }
      } else {
        durationText = 'Vĩnh viễn (Vô thời hạn)';
      }

      if (content.includes('Vô thời hạn') || content.includes('vô thời hạn')) {
        durationText = 'Vĩnh viễn (Vô thời hạn)';
      }

      let privilegesHTML = '';
      if (tier === 'SILVER') {
        privilegesHTML = `
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Xem đặc quyền PRO Data</span></div>
          <div style="display: flex; gap: 8px;">🟢 <span style="color:#e2e8f0;">Xem tín hiệu CG (Expert Signals)</span></div>
        `;
      } else if (tier === 'GOLD') {
        privilegesHTML = `
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Xem đặc quyền PRO Data</span></div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Xem tín hiệu CG (Expert Signals)</span></div>
          <div style="display: flex; gap: 8px;">🟢 <span style="color:#e2e8f0;">Sử dụng Bộ lọc cổ phiếu VIP</span></div>
        `;
      } else if (tier === 'DIAMOND') {
        privilegesHTML = `
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Xem đặc quyền PRO Data</span></div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Xem tín hiệu CG (Expert Signals)</span></div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">🟢 <span style="color:#e2e8f0;">Sử dụng Bộ lọc cổ phiếu VIP</span></div>
          <div style="display: flex; gap: 8px;">🟢 <span style="color:#a78bfa; font-weight:700;">Nhận hỗ trợ Cố vấn 1-1 Diamond</span></div>
        `;
      } else {
        privilegesHTML = `<div style="color: #64748b; font-style: italic;">Quyền lợi mặc định cho tài khoản Standard.</div>`;
      }

      const badgeColor = tier === 'DIAMOND' ? '#a78bfa' : (tier === 'GOLD' ? '#fbbf24' : '#cbd5e1');

      detailHTML = `
        <div style="margin-bottom: 18px; color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;">
          ${content}
        </div>
        <div style="background: rgba(168, 85, 247, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 8px;">
            <span style="color: #94a3b8; font-weight: 500;">Gói dịch vụ:</span>
            <span style="color: ${badgeColor}; font-weight: 800; letter-spacing: 0.5px;">⭐ ${planName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 8px;">
            <span style="color: #94a3b8; font-weight: 500;">Hạn sử dụng:</span>
            <span style="color: #fff; font-weight: 700;">${durationText}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
            <span style="color: #94a3b8; font-weight: 500; margin-bottom: 4px;">Quyền lợi được mở khóa:</span>
            <div style="font-size: 0.8rem; line-height: 1.5; display: flex; flex-direction: column; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.02);">
              ${privilegesHTML}
            </div>
          </div>
        </div>
      `;
    }

    modalOverlay.innerHTML = `
      <div class="notif-modal-card">
        <div class="notif-modal-header">
          <div class="notif-modal-title">🔔 ${title}</div>
          <button class="notif-modal-close-btn" type="button">&times;</button>
        </div>
        <div class="notif-modal-body">
          <div class="notif-modal-time">⏱️ ${time}</div>
          ${detailHTML}
        </div>
        <div class="notif-modal-footer">
          <button class="notif-modal-btn" type="button">Đóng</button>
        </div>
      </div>
    `;

    const closeBtn = modalOverlay.querySelector('.notif-modal-close-btn');
    const footerBtn = modalOverlay.querySelector('.notif-modal-btn');
    [closeBtn, footerBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.closeNotificationDetailModal());
      }
    });

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
      modalOverlay.classList.add('active');
    }, 10);

    document.body.style.overflow = 'hidden';
  },

  closeNotificationDetailModal() {
    const modalOverlay = document.getElementById('fintopNotifDetailModal');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }
  },

  // ─────────────────────────────────────────────────────
  // CSS INJECTION (one-time)
  // ─────────────────────────────────────────────────────

  _injectStyles() {
    if (document.getElementById('fintop-auth-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'fintop-auth-ui-styles';
    style.textContent = `
      @keyframes fintop-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      .fintop-auth-error {
        animation: fintop-shake 0.4s ease;
      }
      .fintop-user-avatar:hover {
        transform: scale(1.08);
        filter: brightness(1.15);
      }
      .fintop-hidden { display: none !important; }
      .fintop-locked { opacity: 0.5; pointer-events: none; }
      
      @keyframes fintop-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Notification Detail Modal styling */
      .notif-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 10002;
        background: rgba(7, 7, 13, 0.75);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
      }
      .notif-modal-overlay.active {
        opacity: 1;
      }
      .notif-modal-card {
        background: rgba(15, 15, 25, 0.95);
        border: 1px solid rgba(168, 85, 247, 0.35);
        box-shadow: 0 15px 35px rgba(0,0,0,0.5), 0 0 30px rgba(168, 85, 247, 0.1);
        border-radius: 16px;
        width: 100%;
        max-width: 500px;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .notif-modal-overlay.active .notif-modal-card {
        transform: scale(1);
      }
      .notif-modal-header {
        padding: 20px 24px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .notif-modal-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.4;
      }
      .notif-modal-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.65rem;
        cursor: pointer;
        transition: color 0.2s;
        padding: 0 0 0 12px;
        line-height: 1;
      }
      .notif-modal-close-btn:hover {
        color: #ffffff;
      }
      .notif-modal-body {
        padding: 20px 24px 24px;
        color: #cbd5e1;
        font-size: 0.9rem;
        line-height: 1.6;
        max-height: 350px;
        overflow-y: auto;
      }
      .notif-modal-time {
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 12px;
      }
      .notif-modal-footer {
        padding: 12px 24px 20px;
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid rgba(255,255,255,0.04);
      }
      .notif-modal-btn {
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .notif-modal-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);
  },
};

export { AuthUI, NavbarAuth, AuthFormUI };
export default AuthUI;
