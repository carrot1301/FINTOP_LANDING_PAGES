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
    this._isInitialized = false;
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

    const { accessToken, refreshToken } = response.data;

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

    // Load and return user profile
    const user = await this.loadUserProfile();

    if (FintopEnv.DEBUG) {
      console.log('%c[AuthManager] Login successful ✓', 'color: #6ee7b7; font-weight: bold;', user);
    }

    return user;
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

      // Reschedule next refresh
      this._scheduleRefresh(expiresAt);

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

    if (!silent) {
      try {
        const endpoint = all ? API_ENDPOINTS.AUTH_LOGOUT_ALL : API_ENDPOINTS.AUTH_LOGOUT;
        const refreshToken = TokenStorage.getRefreshToken();
        await ApiClient.post(endpoint, { refreshToken });
      } catch (err) {
        // If server-side logout fails, still clear local state
        if (FintopEnv.DEBUG) {
          console.warn('[AuthManager] Server logout failed (clearing local state anyway):', err.message);
        }
      }
    }

    this._clearSession();

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

  _clearSession() {
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
