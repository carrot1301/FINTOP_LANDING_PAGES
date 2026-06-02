/**
 * ============================================================
 * state.js — Lightweight Global Application State
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Provides a centralized, reactive state store for the frontend
 *   without requiring any framework (React, Vue, Alpine.js, etc.).
 *
 * DESIGN DECISIONS:
 *   WHY NOT localStorage for state? localStorage is for persistence.
 *   Runtime state is ephemeral — must be rebuilt on each page load
 *   from persisted tokens and API calls.
 *
 *   WHY EventEmitter pattern? 
 *   Multiple isolated HTML pages each include different <script> tags.
 *   An event bus allows loose coupling: auth.js fires "auth:login",
 *   a notification badge somewhere else listens without direct import.
 *
 *   WHY NOT a global window variable?
 *   We use ES Modules. The singleton is module-scoped and only
 *   exported as a named export — consumers must import it explicitly.
 *   This prevents accidental global namespace pollution.
 *
 * STATE SLICES:
 *   auth         → { isAuthenticated, accessToken, expiresAt }
 *   user         → { id, email, displayName, roles, permissions, tierLevel }
 *   subscription → { tierLevel, status, expiresAt, planId }
 *   notifications → { unreadCount, items[] }
 *   sockets      → { market: bool, signals: bool, notifications: bool }
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// EVENT EMITTER (Minimal, framework-free)
// ─────────────────────────────────────────────────────────────

class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  on(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(listener);

    // Return unsubscribe function for cleanup
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event exactly once.
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    this._listeners.get(event)?.delete(listener);
  }

  /**
   * Emit an event with optional data.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    this._listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error(`[AppState] Listener error on event "${event}":`, err);
      }
    });
  }

  /**
   * Remove all listeners for an event (or all events if not specified).
   * @param {string} [event]
   */
  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

// ─────────────────────────────────────────────────────────────
// INITIAL STATE DEFINITIONS
// ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  auth: {
    isAuthenticated: false,
    accessToken: null,      // String | null
    expiresAt: null,        // Unix timestamp (ms) | null
    isRefreshing: false,    // Prevents concurrent refresh races
  },

  user: {
    id: null,               // number
    email: null,
    displayName: null,
    roles: [],              // string[] e.g. ['SUPER_ADMIN']
    permissions: [],        // string[] e.g. ['CREATE_SIGNAL']
    tierLevel: 'STANDARD',  // SUBSCRIPTION_TIER enum
    status: null,           // USER_STATUS enum
    avatarUrl: null,
  },

  subscription: {
    tierLevel: 'STANDARD',  // Mirrors user.tierLevel for quick access
    status: null,           // 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
    planId: null,
    expiresAt: null,
  },

  notifications: {
    unreadCount: 0,
    items: [],
  },

  sockets: {
    market: 'disconnected',        // 'disconnected' | 'connecting' | 'connected' | 'error'
    signals: 'disconnected',
    notifications: 'disconnected',
  },

  watchlist: [], // Track local/sync watchlist items
};

// ─────────────────────────────────────────────────────────────
// APP STATE SINGLETON
// ─────────────────────────────────────────────────────────────

class AppStateStore extends EventEmitter {
  constructor() {
    super();

    // Deep clone initial state to prevent mutation of INITIAL_STATE
    this._state = JSON.parse(JSON.stringify(INITIAL_STATE));

    // Event name constants
    this.EVENTS = Object.freeze({
      AUTH_CHANGED:           'auth:changed',
      AUTH_LOGIN:             'auth:login',
      AUTH_LOGOUT:            'auth:logout',
      AUTH_TOKEN_REFRESHED:   'auth:token-refreshed',
      AUTH_EXPIRED:           'auth:expired',

      USER_LOADED:            'user:loaded',
      USER_CHANGED:           'user:changed',

      SUBSCRIPTION_CHANGED:   'subscription:changed',

      NOTIFICATIONS_CHANGED:  'notifications:changed',
      NOTIFICATIONS_UNREAD:   'notifications:unread',

      SOCKET_MARKET:          'socket:market',
      SOCKET_SIGNALS:         'socket:signals',
      SOCKET_NOTIFICATIONS:   'socket:notifications',

      STATE_RESET:            'state:reset',
    });
  }

  // ─────────────────────────────────────────────────────
  // STATE READ
  // ─────────────────────────────────────────────────────

  /**
   * Get a state slice (returns a shallow copy to prevent external mutation).
   * @param {'auth'|'user'|'subscription'|'notifications'|'sockets'} slice
   * @returns {Object}
   */
  getState(slice) {
    if (this._state[slice] === undefined) {
      console.warn(`[AppState] Unknown state slice: "${slice}"`);
      return null;
    }
    return Array.isArray(this._state[slice]) ? [...this._state[slice]] : { ...this._state[slice] };
  }

  /**
   * Get a specific field within a state slice.
   * @param {'auth'|'user'|'subscription'|'notifications'|'sockets'} slice
   * @param {string} field
   * @returns {*}
   */
  get(slice, field) {
    return this._state[slice]?.[field];
  }

  // ─────────────────────────────────────────────────────
  // STATE WRITE
  // ─────────────────────────────────────────────────────

  /**
   * Merge partial state into a slice and emit change event.
   * @param {'auth'|'user'|'subscription'|'notifications'|'sockets'} slice
   * @param {Object} partial
   * @param {string} [eventOverride] - Emit this event instead of generic change
   */
  setState(slice, partial, eventOverride) {
    if (this._state[slice] === undefined) {
      console.warn(`[AppState] Unknown state slice: "${slice}"`);
      return;
    }

    // Deep merge for nested objects, shallow merge for primitives, array copy for arrays
    if (Array.isArray(this._state[slice]) || Array.isArray(partial)) {
      this._state[slice] = Array.isArray(partial) ? [...partial] : [partial];
    } else {
      this._state[slice] = { ...this._state[slice], ...partial };
    }

    // Emit slice-specific change event
    const eventName = eventOverride || `state:changed:${slice}`;
    this.emit(eventName, this.getState(slice));
  }

  // ─────────────────────────────────────────────────────
  // AUTH CONVENIENCE METHODS
  // ─────────────────────────────────────────────────────

  /**
   * Set authenticated state after successful login or token restore.
   * @param {{ accessToken: string, expiresAt: number }} tokenData
   */
  setAuthenticated(tokenData) {
    this.setState('auth', {
      isAuthenticated: true,
      accessToken: tokenData.accessToken,
      expiresAt: tokenData.expiresAt,
      isRefreshing: false,
    }, this.EVENTS.AUTH_CHANGED);
    this.emit(this.EVENTS.AUTH_LOGIN, tokenData);
  }

  /**
   * Clear all auth state and user data on logout.
   */
  clearAuth() {
    this._state.auth = { ...INITIAL_STATE.auth };
    this._state.user = { ...INITIAL_STATE.user };
    this._state.subscription = { ...INITIAL_STATE.subscription };
    this._state.notifications = { ...INITIAL_STATE.notifications };
    this.emit(this.EVENTS.AUTH_CHANGED, this.getState('auth'));
    this.emit(this.EVENTS.AUTH_LOGOUT);
  }

  /**
   * Update user profile.
   * @param {Object} userProfile
   */
  setUser(userProfile) {
    this.setState('user', {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName || userProfile.email,
      roles: userProfile.roles || [],
      permissions: userProfile.permissions || [],
      tierLevel: userProfile.tierLevel || 'STANDARD',
      status: userProfile.status,
      avatarUrl: userProfile.avatarUrl || null,
    }, this.EVENTS.USER_LOADED);
  }

  /**
   * Update subscription data.
   * @param {Object} subscription
   */
  setSubscription(subscription) {
    this.setState('subscription', {
      tierLevel: subscription.tierLevel || 'STANDARD',
      status: subscription.status,
      planId: subscription.planId || null,
      expiresAt: subscription.expiresAt || null,
    }, this.EVENTS.SUBSCRIPTION_CHANGED);
    // Sync tier to user slice for RBAC
    this.setState('user', { tierLevel: subscription.tierLevel || 'STANDARD' });
  }

  /**
   * Update notification unread count.
   * @param {number} count
   */
  setUnreadCount(count) {
    this.setState('notifications', { unreadCount: count }, this.EVENTS.NOTIFICATIONS_UNREAD);
  }

  /**
   * Update socket connection status for a namespace.
   * @param {'market'|'signals'|'notifications'} namespace
   * @param {'disconnected'|'connecting'|'connected'|'error'} status
   */
  setSocketStatus(namespace, status) {
    const valid = ['market', 'signals', 'notifications'];
    if (!valid.includes(namespace)) {
      console.warn(`[AppState] Invalid socket namespace: "${namespace}"`);
      return;
    }
    this.setState('sockets', { [namespace]: status });
  }

  // ─────────────────────────────────────────────────────
  // STATE RESET
  // ─────────────────────────────────────────────────────

  /**
   * Reset all state to initial values (e.g., on hard logout).
   */
  reset() {
    this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.emit(this.EVENTS.STATE_RESET);
  }

  // ─────────────────────────────────────────────────────
  // DEBUG
  // ─────────────────────────────────────────────────────

  /**
   * Dump full state to console (development only).
   */
  dump() {
    console.group('%c[AppState] State Dump', 'color: #a78bfa; font-weight: bold;');
    Object.keys(this._state).forEach(slice => {
      console.log(`${slice}:`, { ...this._state[slice] });
    });
    console.groupEnd();
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────

const AppState = new AppStateStore();

export { AppState };
export default AppState;
