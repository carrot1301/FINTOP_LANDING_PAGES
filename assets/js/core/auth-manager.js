/**
 * ============================================================
 * auth-manager.js — Auth Token Lifecycle Manager
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Owns the complete auth lifecycle:
 *     login → token storage → session restore → silent refresh
 *     → expiry detection → logout → state cleanup
 *
 * DESIGN DECISIONS:
 *   WHY localStorage for tokens?
 *   The frontend is a multi-page static site — tokens must persist
 *   across page navigations without a SPA router. sessionStorage would
 *   lose tokens on tab close, breaking user experience. localStorage
 *   is the appropriate choice for JWT tokens in this architecture.
 *
 *   WHY not httpOnly cookies?
 *   httpOnly cookies require server-side rendering or a proxy server
 *   to set them. The current deployment is a static file server. This
 *   can be migrated to httpOnly cookies in Phase-3 with an Nginx proxy.
 *
 *   SECURITY NOTE:
 *   Tokens are stored in localStorage. XSS remains the primary attack
 *   vector. The existing helmet.js configuration (main.ts L24) mitigates
 *   XSS at the API level. CSP headers should be added to the static
 *   file server in Phase-3.
 *
 *   WHY scheduled refresh?
 *   We calculate token expiry from the JWT payload `exp` claim and
 *   schedule a refresh 60 seconds before expiry. This eliminates
 *   the jarring 401-redirect-to-login experience for active users.
 *
 * BACKEND CONTRACT:
 *   POST /auth/login    → { data: { accessToken, refreshToken } }
 *   POST /auth/refresh  → { data: { accessToken, refreshToken } }
 *   POST /auth/logout   → 204 No Content
 *   GET  /auth/me       → { data: UserProfile }
 *   JWT payload contains: { sub: userId, iat, exp }
 * ============================================================
 */

import { FintopEnv } from './env.js';
import { AppState } from './state.js';
import { ApiClient, FintopApiError } from './api-client.js';

const { STORAGE_KEYS, API_ENDPOINTS, REQUEST_CONFIG } = FintopEnv;

// ─────────────────────────────────────────────────────────────
// TOKEN STORAGE HELPERS
// ─────────────────────────────────────────────────────────────

const TokenStorage = {
  saveTokens({ accessToken, refreshToken }) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (e) {
      console.error('[AuthManager] Failed to save tokens to localStorage:', e);
    }
  },

  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  },

  updateLastActivity() {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    } catch (e) {}
  },

  getLastActivity() {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },

  saveUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (e) {
      console.error('[AuthManager] Failed to save user profile:', e);
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────────────────────
// JWT PAYLOAD DECODER
// Safe base64url decode without external libraries.
// NOTE: This does NOT verify the signature (that's the server's job).
//       We only use this to read the `exp` claim for expiry detection.
// ─────────────────────────────────────────────────────────────

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → Base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(base64 + padding);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Returns the expiry time of the token in milliseconds (epoch).
 * Returns null if token is invalid or has no `exp` claim.
 * @param {string} token
 * @returns {number|null}
 */
function getTokenExpiry(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000; // JWT exp is in seconds, convert to ms
}

/**
 * Returns true if the token is expired or will expire within bufferMs.
 * @param {string} token
 * @param {number} [bufferMs=60000]
 * @returns {boolean}
 */
function isTokenExpired(token, bufferMs = REQUEST_CONFIG.REFRESH_BUFFER_MS) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry - bufferMs;
}

// ─────────────────────────────────────────────────────────────
// AUTH MANAGER CLASS
// ─────────────────────────────────────────────────────────────

class AuthManagerSingleton {
  constructor() {
    this._refreshTimer = null;  // setTimeout handle for scheduled refresh
    this._idleCheckTimer = null; // setInterval handle for checking 15-minute idle inactivity
    this._isInitialized = false;
    this._onUserActivityBound = null;
    this._onVisibilityChangeBound = null;
    this._lastActivityUpdate = 0;
  }

  // ─────────────────────────────────────────────────────
  // INITIALIZE — Restore session on page load
  // Called once from index.js bootstrap on DOMContentLoaded
  // ─────────────────────────────────────────────────────

  async initialize() {
    if (this._isInitialized) return;
    this._isInitialized = true;

    const accessToken = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      if (FintopEnv.DEBUG) console.log('[AuthManager] No stored tokens — guest session.');
      return;
    }

    // Check if access token is expired
    if (isTokenExpired(accessToken)) {
      if (FintopEnv.DEBUG) console.log('[AuthManager] Access token expired on restore — attempting refresh.');
      try {
        await this.refresh();
        this._startIdleTimer();
      } catch {
        // Refresh failed → clear and start as guest
        if (FintopEnv.DEBUG) console.log('[AuthManager] Refresh failed on restore — clearing session.');
        this._clearSession();
        return;
      }
    } else {
      // Token is still valid — restore state from storage
      const expiresAt = getTokenExpiry(accessToken);
      AppState.setAuthenticated({ accessToken, expiresAt });
      this._scheduleRefresh(expiresAt);
      this._startIdleTimer();

      // Restore user profile from localStorage (optimistic)
      const cachedUser = TokenStorage.getUser();
      if (cachedUser) {
        AppState.setUser(cachedUser);
      }

      // Fetch fresh profile from server in background
      this.loadUserProfile().catch(() => {});
    }

    if (FintopEnv.DEBUG) {
      console.log('%c[AuthManager] Session restored ✓', 'color: #6ee7b7; font-weight: bold;');
    }
  }

  // ─────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password.
   * Stores tokens, loads user profile, schedules refresh.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User profile
   * @throws {FintopApiError}
   */
  async login(email, password) {
    const response = await ApiClient.post(
      API_ENDPOINTS.AUTH_LOGIN,
      { email, password },
      { skipAuth: true }
    );

    const { accessToken, refreshToken, requirePasswordChange } = response.data;

    // Validate token format before storing
    if (!accessToken || !refreshToken) {
      throw new FintopApiError({
        statusCode: 500,
        code: 'INVALID_TOKEN_RESPONSE',
        message: 'Server returned an invalid token format.',
      });
    }

    // Store tokens
    TokenStorage.saveTokens({ accessToken, refreshToken });

    // Update global state
    const expiresAt = getTokenExpiry(accessToken);
    AppState.setAuthenticated({ accessToken, expiresAt });

    // Schedule proactive token refresh
    this._scheduleRefresh(expiresAt);

    // Start 15-minute idle inactivity timer
    this._startIdleTimer();

    // Load and return user profile
    const user = await this.loadUserProfile();

    if (FintopEnv.DEBUG) {
      console.log('%c[AuthManager] Login successful ✓', 'color: #6ee7b7; font-weight: bold;', user);
    }

    // Return user with first-login flag
    return { user, requirePasswordChange: !!requirePasswordChange };
  }

  // ─────────────────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────────────────

  /**
   * Rotate the token pair using the stored refresh token.
   * Called automatically when access token is near expiry.
   * Also called by ApiClient on 401 responses.
   *
   * @returns {Promise<void>}
   * @throws {FintopApiError} If refresh token is invalid/expired
   */
  async refresh() {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new FintopApiError({
        statusCode: 401,
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token available.',
      });
    }

    // Mark as refreshing in state to prevent concurrent refreshes
    AppState.setState('auth', { isRefreshing: true });

    try {
      const response = await ApiClient.post(
        API_ENDPOINTS.AUTH_REFRESH,
        { refreshToken },
        { skipAuth: true } // Skip auth header — we're refreshing, not using a valid access token
      );

      const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

      // Store new token pair
      TokenStorage.saveTokens({ accessToken: newAccess, refreshToken: newRefresh });

      // Update state
      const expiresAt = getTokenExpiry(newAccess);
      AppState.setAuthenticated({ accessToken: newAccess, expiresAt });
      AppState.emit(AppState.EVENTS.AUTH_TOKEN_REFRESHED, { expiresAt });

      // Reschedule next refresh & restart idle timer
      this._scheduleRefresh(expiresAt);
      this._startIdleTimer();

      if (FintopEnv.DEBUG) {
        console.log('%c[AuthManager] Token refreshed ✓', 'color: #6ee7b7;');
      }

    } finally {
      AppState.setState('auth', { isRefreshing: false });
    }
  }

  // ─────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────

  /**
   * Logout the current session.
   * Revokes the token on the server, then clears local storage.
   *
   * @param {{ silent?: boolean, all?: boolean }} [options]
   *   silent: skip server call (e.g. server already rejected token)
   *   all: logout all sessions (POST /auth/logout-all)
   */
  async logout({ silent = false, all = false } = {}) {
    this._cancelRefreshTimer();
    this._stopIdleTimer();

    const refreshToken = TokenStorage.getRefreshToken();
    
    // Clear local session first so the UI updates INSTANTLY
    this._clearSession();

    if (!silent && refreshToken) {
      try {
        const endpoint = all ? API_ENDPOINTS.AUTH_LOGOUT_ALL : API_ENDPOINTS.AUTH_LOGOUT;
        // Run the server-side revocation in the background (non-blocking)
        ApiClient.post(endpoint, { refreshToken }).catch(err => {
          if (FintopEnv.DEBUG) {
            console.warn('[AuthManager] Server logout background request failed:', err.message);
          }
        });
      } catch (err) {
        if (FintopEnv.DEBUG) {
          console.warn('[AuthManager] Failed to initiate background logout:', err.message);
        }
      }
    }

    if (FintopEnv.DEBUG) {
      console.log('%c[AuthManager] Logged out ✓', 'color: #f87171;');
    }
  }

  // ─────────────────────────────────────────────────────
  // LOAD USER PROFILE
  // ─────────────────────────────────────────────────────

  /**
   * Fetch and store the current user profile from the server.
   * @returns {Promise<Object>} User profile
   */
  async loadUserProfile() {
    const response = await ApiClient.get(API_ENDPOINTS.AUTH_ME);
    const user = response.data;

    AppState.setUser(user);
    TokenStorage.saveUser(user);

    return user;
  }

  // ─────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────

  /** @returns {boolean} */
  get isAuthenticated() {
    return AppState.get('auth', 'isAuthenticated') === true;
  }

  /** @returns {string|null} */
  get accessToken() {
    return AppState.get('auth', 'accessToken') || TokenStorage.getAccessToken();
  }

  /** @returns {boolean} */
  get isExpired() {
    const token = this.accessToken;
    if (!token) return true;
    return isTokenExpired(token, 0); // Check strict expiry without buffer
  }

  /**
   * Get user's tier level from state.
   * @returns {'STANDARD'|'SILVER'|'GOLD'|'DIAMOND'}
   */
  get tierLevel() {
    return AppState.get('user', 'tierLevel') || 'STANDARD';
  }

  /**
   * Get user's permissions array.
   * @returns {string[]}
   */
  get permissions() {
    return AppState.get('user', 'permissions') || [];
  }

  /**
   * Check if user has SUPER_ADMIN role.
   * @returns {boolean}
   */
  get isSuperAdmin() {
    const roles = AppState.get('user', 'roles') || [];
    return roles.includes('SUPER_ADMIN');
  }

  // ─────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────

  /**
   * Schedule a proactive token refresh before expiry.
   * @param {number|null} expiresAt - Unix timestamp in ms
   */
  _scheduleRefresh(expiresAt) {
    this._cancelRefreshTimer();

    if (!expiresAt) return;

    // Refresh 60 seconds before expiry
    const delay = expiresAt - Date.now() - REQUEST_CONFIG.REFRESH_BUFFER_MS;

    if (delay <= 0) {
      // Token expires very soon — refresh immediately
      this.refresh().catch(err => {
        if (FintopEnv.DEBUG) console.warn('[AuthManager] Immediate refresh failed:', err.message);
      });
      return;
    }

    this._refreshTimer = setTimeout(async () => {
      try {
        await this.refresh();
      } catch (err) {
        if (FintopEnv.DEBUG) {
          console.warn('[AuthManager] Scheduled refresh failed:', err.message);
        }
        // Force logout if refresh fails during scheduled refresh
        AppState.emit(AppState.EVENTS.AUTH_EXPIRED);
        await this.logout({ silent: true });
      }
    }, delay);

    if (FintopEnv.DEBUG) {
      console.log(`[AuthManager] Refresh scheduled in ${Math.round(delay / 1000)}s`);
    }
  }

  _cancelRefreshTimer() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  // ─────────────────────────────────────────────────────
  // IDLE INACTIVITY AUTO-LOGOUT
  // Monitors main window + embedded iframes (CKEditor 4)
  // ─────────────────────────────────────────────────────

  _startIdleTimer() {
    this._stopIdleTimer();

    // Set initial last activity timestamp
    TokenStorage.updateLastActivity();

    // Throttled activity event handler (updates at most once every 2 seconds)
    this._onUserActivityBound = () => {
      const now = Date.now();
      if (now - this._lastActivityUpdate > 2000) {
        this._lastActivityUpdate = now;
        TokenStorage.updateLastActivity();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input'];
    events.forEach(evt => window.addEventListener(evt, this._onUserActivityBound, { passive: true }));

    // ── CKEditor 4 iframe detection ──
    // CKEditor 4 renders its WYSIWYG content inside an <iframe>.
    // Events inside that iframe (typing, clicking, scrolling) do NOT
    // bubble up to the parent window, so the idle timer never sees them.
    // We solve this by:
    //   1. Hooking into CKEditor's own event system ('change', 'key', 'focus')
    //   2. Attaching DOM listeners to every same-origin <iframe> we find
    //   3. Using a MutationObserver to catch iframes added later (lazy-loaded editors)
    this._trackedIframes = new WeakSet();
    this._attachIframeListeners();
    this._hookCKEditorEvents();

    // Watch for dynamically added iframes (CKEditor creates them after init)
    this._iframeMutationObserver = new MutationObserver(() => {
      this._attachIframeListeners();
      this._hookCKEditorEvents();
    });
    this._iframeMutationObserver.observe(document.body, { childList: true, subtree: true });

    this._onVisibilityChangeBound = () => {
      if (!document.hidden) {
        this._checkIdleTimeout();
        // Re-attach in case iframe was recreated while tab was hidden
        this._attachIframeListeners();
        this._hookCKEditorEvents();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibilityChangeBound);

    // Periodically check every 30 seconds (increased from 10s)
    this._idleCheckTimer = setInterval(() => {
      this._checkIdleTimeout();
    }, 30000);
  }

  /**
   * Attach activity listeners to all same-origin iframes on the page.
   * Safe against cross-origin iframes (silently skips them).
   */
  _attachIframeListeners() {
    if (!this._onUserActivityBound) return;
    const iframes = document.querySelectorAll('iframe');
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input'];

    iframes.forEach(iframe => {
      if (this._trackedIframes.has(iframe)) return;
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          events.forEach(evt => {
            iframeDoc.addEventListener(evt, this._onUserActivityBound, { passive: true });
          });
          this._trackedIframes.add(iframe);
          if (FintopEnv.DEBUG) {
            console.log('[AuthManager] ✓ Attached activity listeners to iframe:', iframe.className || iframe.id || '(anonymous)');
          }
        }
      } catch (e) {
        // Cross-origin iframe — silently skip (SecurityError)
      }
    });
  }

  /**
   * Hook into CKEditor 4's event system so that any editor interaction
   * (typing, formatting, paste, etc.) is treated as user activity.
   */
  _hookCKEditorEvents() {
    if (!window.CKEDITOR || !this._onUserActivityBound) return;
    if (this._ckeditorHooked) return;

    const handler = this._onUserActivityBound;

    // Hook existing instances
    for (const name in window.CKEDITOR.instances) {
      const editor = window.CKEDITOR.instances[name];
      if (!editor._fintopIdleHooked) {
        editor.on('change', handler);
        editor.on('key', handler);
        editor.on('focus', handler);
        editor.on('afterPaste', handler);
        editor.on('saveSnapshot', handler);
        editor._fintopIdleHooked = true;
        if (FintopEnv.DEBUG) {
          console.log(`[AuthManager] ✓ Hooked CKEditor instance: ${name}`);
        }
      }
    }

    // Hook future instances (CKEditor fires 'instanceReady' globally)
    if (!window.CKEDITOR._fintopGlobalHooked) {
      window.CKEDITOR.on('instanceReady', (evt) => {
        const editor = evt.editor;
        if (!editor._fintopIdleHooked) {
          editor.on('change', handler);
          editor.on('key', handler);
          editor.on('focus', handler);
          editor.on('afterPaste', handler);
          editor.on('saveSnapshot', handler);
          editor._fintopIdleHooked = true;
          if (FintopEnv.DEBUG) {
            console.log(`[AuthManager] ✓ Hooked CKEditor instance (late): ${editor.name}`);
          }
        }
        // Also attach to the iframe CKEditor just created
        this._attachIframeListeners();
      });
      window.CKEDITOR._fintopGlobalHooked = true;
    }

    this._ckeditorHooked = true;
  }

  _checkIdleTimeout() {
    if (!this.isAuthenticated) return;

    const lastActivity = TokenStorage.getLastActivity();
    if (!lastActivity) return;

    const idleTime = Date.now() - lastActivity;
    const idleLimit = REQUEST_CONFIG.IDLE_TIMEOUT_MS || (60 * 60 * 1000);

    if (idleTime >= idleLimit) {
      const idleMinutes = Math.round(idleTime / 60000);
      const limitMinutes = Math.round(idleLimit / 60000);
      if (FintopEnv.DEBUG) {
        console.warn(`[AuthManager] User idle for ${idleMinutes}m (>${limitMinutes}m) — triggering auto logout.`);
      }
      this._stopIdleTimer();
      AppState.emit(AppState.EVENTS.AUTH_EXPIRED);
      try {
        alert(`Tài khoản đã tự động đăng xuất do không thao tác trên trang web quá ${limitMinutes} phút. Vui lòng đăng nhập lại.`);
      } catch (e) {}
      this.logout({ silent: false });
    }
  }

  _stopIdleTimer() {
    if (this._idleCheckTimer) {
      clearInterval(this._idleCheckTimer);
      this._idleCheckTimer = null;
    }
    if (this._onUserActivityBound) {
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input'];
      events.forEach(evt => window.removeEventListener(evt, this._onUserActivityBound));

      // Also remove from tracked iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            events.forEach(evt => iframeDoc.removeEventListener(evt, this._onUserActivityBound));
          }
        } catch (e) {}
      });

      this._onUserActivityBound = null;
    }
    if (this._onVisibilityChangeBound) {
      document.removeEventListener('visibilitychange', this._onVisibilityChangeBound);
      this._onVisibilityChangeBound = null;
    }
    if (this._iframeMutationObserver) {
      this._iframeMutationObserver.disconnect();
      this._iframeMutationObserver = null;
    }
    this._trackedIframes = null;
    this._ckeditorHooked = false;
  }

  _clearSession() {
    this._stopIdleTimer();
    TokenStorage.clearTokens();
    AppState.clearAuth();
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────

const AuthManager = new AuthManagerSingleton();

export { AuthManager, TokenStorage, isTokenExpired, getTokenExpiry };
export default AuthManager;
