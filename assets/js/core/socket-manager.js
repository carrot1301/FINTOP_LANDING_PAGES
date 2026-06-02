/**
 * ============================================================
 * socket-manager.js — WebSocket Connection Foundation
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Manages all three backend WebSocket namespaces:
 *     /ws/market        → Public, no auth required
 *     /ws/signals       → JWT + Subscription Tier
 *     /ws/notifications → JWT required
 *
 * DESIGN DECISIONS:
 *   WHY CDN for socket.io-client?
 *   The project has no bundler. socket.io-client via CDN import map
 *   (esm.sh or socket.io's own CDN) is the correct approach for a
 *   vanilla ES Module architecture.
 *
 *   WHY lazy connect?
 *   Market namespace connects on demand (when a page needs quotes).
 *   Signals/Notifications connect only after login.
 *   This avoids wasteful connections on pages that don't need WS.
 *
 *   MULTI-TAB SAFETY:
 *   When multiple tabs are open, each would create its own socket
 *   connection. We use BroadcastChannel to coordinate:
 *     - First tab = "leader" (owns the real socket connections)
 *     - Other tabs = "followers" (receive events via BroadcastChannel)
 *   This reduces backend connection pressure significantly.
 *
 *   RECONNECTION STRATEGY:
 *   Socket.IO's built-in reconnection is configured with exponential
 *   backoff. On reconnect, we re-inject fresh JWT tokens (important
 *   because the access token may have been refreshed during downtime).
 *
 * BACKEND CONTRACT:
 *   Auth: JWT via handshake.auth.token OR handshake.headers.authorization
 *         OR handshake.query.token (socket-auth.guard.ts L47-56)
 *   Market events:        subscribe_symbol, unsubscribe_symbol, quote_update
 *   Signal events:        subscribe_signals, signal_update, error
 *   Notification events:  subscribe_notifications, unread_count, new_notification
 * ============================================================
 */

import { FintopEnv } from './env.js';
import { AppState } from './state.js';

const { WS_NAMESPACES, WS_BASE_URL, DEBUG } = FintopEnv;

// ─────────────────────────────────────────────────────────────
// SOCKET.IO CLIENT CDN LOADER
// Uses socket.io's own official CDN ESM build.
// Version pinned to 4.8.3 to match backend socket.io version.
// ─────────────────────────────────────────────────────────────

let _ioPromise = null;

async function loadSocketIO() {
  if (_ioPromise) return _ioPromise;

  _ioPromise = import('https://cdn.socket.io/4.8.3/socket.io.esm.min.js')
    .then(module => module.io || module.default)
    .catch(err => {
      console.error('[SocketManager] Failed to load socket.io-client from CDN:', err);
      _ioPromise = null;
      throw err;
    });

  return _ioPromise;
}

// ─────────────────────────────────────────────────────────────
// MULTI-TAB COORDINATION via BroadcastChannel
// ─────────────────────────────────────────────────────────────

class TabCoordinator {
  constructor() {
    this._isLeader = false;
    this._channel = null;
    this._listeners = new Map();

    // BroadcastChannel may not be available in very old browsers
    if (typeof BroadcastChannel !== 'undefined') {
      this._channel = new BroadcastChannel('fintop_ws_leader');
      this._channel.onmessage = (event) => this._handleMessage(event.data);
    } else {
      // Fallback: always be leader if BroadcastChannel not supported
      this._isLeader = true;
    }
  }

  async electLeader() {
    if (!this._channel) {
      this._isLeader = true;
      return true;
    }

    return new Promise((resolve) => {
      // Send "am I needed?" query
      this._channel.postMessage({ type: 'LEADER_QUERY', tabId: this._tabId });

      // If no leader responds in 200ms, become leader
      const timeout = setTimeout(() => {
        this._isLeader = true;
        this._channel.postMessage({ type: 'LEADER_ELECTED', tabId: this._tabId });
        resolve(true);
      }, 200);

      // If another tab responds as leader, we're a follower
      const unsubscribe = this.onMessage('LEADER_RESPONSE', () => {
        clearTimeout(timeout);
        this._isLeader = false;
        resolve(false);
        unsubscribe();
      });
    });
  }

  _handleMessage(data) {
    if (data.type === 'LEADER_QUERY' && this._isLeader) {
      this._channel.postMessage({ type: 'LEADER_RESPONSE', tabId: this._tabId });
    }

    const listeners = this._listeners.get(data.type) || [];
    listeners.forEach(fn => fn(data));
  }

  onMessage(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
    return () => {
      const list = this._listeners.get(type) || [];
      this._listeners.set(type, list.filter(f => f !== fn));
    };
  }

  broadcast(data) {
    this._channel?.postMessage(data);
  }

  get isLeader() { return this._isLeader; }
  get _tabId() { return window._fintopTabId || (window._fintopTabId = Math.random().toString(36).slice(2)); }
}

// ─────────────────────────────────────────────────────────────
// NAMESPACE SOCKET WRAPPER
// Wraps a single socket.io namespace socket with our abstractions.
// ─────────────────────────────────────────────────────────────

class NamespaceSocket {
  /**
   * @param {string} namespace - e.g. '/ws/market'
   * @param {Object} options - socket.io connect options
   * @param {string} stateKey - 'market' | 'signals' | 'notifications'
   * @param {TabCoordinator} coordinator
   */
  constructor(namespace, options, stateKey, coordinator) {
    this._namespace = namespace;
    this._options = options;
    this._stateKey = stateKey;
    this._coordinator = coordinator;
    this._socket = null;
    this._eventHandlers = new Map(); // eventName → Set<Function>
  }

  get connected() {
    return this._socket?.connected === true;
  }

  async connect() {
    if (this.connected) return this._socket;

    AppState.setSocketStatus(this._stateKey, 'connecting');

    const io = await loadSocketIO();

    // Get current access token for auth
    const accessToken = AppState.get('auth', 'accessToken');

    this._socket = io(`${WS_BASE_URL}${this._namespace}`, {
      ...this._options,
      auth: accessToken ? { token: accessToken } : {},
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
    });

    this._bindSocketEvents();

    return new Promise((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve(this._socket);
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        this._socket.off('connect', onConnect);
        this._socket.off('connect_error', onError);
      };
      this._socket.once('connect', onConnect);
      this._socket.once('connect_error', onError);

      // Timeout after 10 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error(`Socket connection to ${this._namespace} timed out`));
      }, 10000);
    });
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
    AppState.setSocketStatus(this._stateKey, 'disconnected');
  }

  emit(event, data) {
    if (!this.connected) {
      console.warn(`[SocketManager] Cannot emit "${event}" — namespace ${this._namespace} not connected`);
      return;
    }
    this._socket.emit(event, data);
  }

  on(event, handler) {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set());
    }
    this._eventHandlers.get(event).add(handler);

    if (this._socket) {
      this._socket.on(event, handler);
    }

    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._eventHandlers.get(event)?.delete(handler);
    this._socket?.off(event, handler);
  }

  _bindSocketEvents() {
    this._socket.on('connect', () => {
      AppState.setSocketStatus(this._stateKey, 'connected');
      if (DEBUG) console.log(`%c[SocketManager] ✅ Connected: ${this._namespace}`, 'color: #6ee7b7;');

      // Re-register all event handlers after reconnect
      this._eventHandlers.forEach((handlers, event) => {
        handlers.forEach(handler => this._socket.on(event, handler));
      });
    });

    this._socket.on('disconnect', (reason) => {
      AppState.setSocketStatus(this._stateKey, 'disconnected');
      if (DEBUG) console.log(`[SocketManager] Disconnected from ${this._namespace}: ${reason}`);
    });

    this._socket.on('connect_error', (err) => {
      AppState.setSocketStatus(this._stateKey, 'error');
      if (DEBUG) console.error(`[SocketManager] Connection error on ${this._namespace}:`, err.message);
    });

    this._socket.on('reconnect_attempt', (attempt) => {
      if (DEBUG) console.log(`[SocketManager] Reconnect attempt ${attempt} for ${this._namespace}`);
    });

    this._socket.on('reconnect', () => {
      if (DEBUG) console.log(`%c[SocketManager] ♻️ Reconnected: ${this._namespace}`, 'color: #6ee7b7;');

      // Re-inject fresh access token after reconnect
      const freshToken = AppState.get('auth', 'accessToken');
      if (freshToken && this._socket.auth) {
        this._socket.auth = { token: freshToken };
      }
    });

    // Handle backend error events
    this._socket.on('error', (err) => {
      console.error(`[SocketManager] Backend error on ${this._namespace}:`, err);
    });
  }

  /**
   * Update auth token and reconnect (called after token refresh).
   */
  updateToken() {
    const freshToken = AppState.get('auth', 'accessToken');
    if (this._socket && freshToken) {
      this._socket.auth = { token: freshToken };
      if (this.connected) {
        this._socket.disconnect().connect();
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// SOCKET MANAGER SINGLETON
// ─────────────────────────────────────────────────────────────

class SocketManagerSingleton {
  constructor() {
    this._coordinator = new TabCoordinator();

    // Namespace socket instances (lazy)
    this._market = null;
    this._signals = null;
    this._notifications = null;

    // Listen for token refresh → reconnect authenticated namespaces
    AppState.on(AppState.EVENTS.AUTH_TOKEN_REFRESHED, () => this._onTokenRefreshed());
    AppState.on(AppState.EVENTS.AUTH_LOGOUT, () => this.disconnectAll());
  }

  // ─────────────────────────────────────────────────────
  // MARKET NAMESPACE (/ws/market)
  // Public — no JWT required
  // ─────────────────────────────────────────────────────

  async connectMarket() {
    if (!this._market) {
      this._market = new NamespaceSocket(
        WS_NAMESPACES.MARKET,
        {}, // no auth options needed
        'market',
        this._coordinator
      );
    }

    if (!this._market.connected) {
      await this._market.connect();
    }

    return this._market;
  }

  /**
   * Subscribe to real-time quotes for a stock symbol.
   * @param {string} symbol - e.g. 'FPT'
   * @param {Function} callback - Receives quote_update payload
   * @returns {Promise<Function>} Unsubscribe function
   */
  async subscribeMarketQuote(symbol, callback) {
    const socket = await this.connectMarket();

    // Send subscribe event to backend
    socket.emit('subscribe_symbol', symbol);

    // Listen for quote updates
    const unsubscribe = socket.on('quote_update', (data) => {
      if (data.symbol === symbol) {
        callback(data);
      }
    });

    if (DEBUG) console.log(`[SocketManager] Subscribed to market quotes: ${symbol}`);

    // Return unsubscribe + cleanup function
    return () => {
      socket.emit('unsubscribe_symbol', symbol);
      unsubscribe();
      if (DEBUG) console.log(`[SocketManager] Unsubscribed from market quotes: ${symbol}`);
    };
  }

  // ─────────────────────────────────────────────────────
  // SIGNALS NAMESPACE (/ws/signals)
  // JWT + Subscription Tier required
  // ─────────────────────────────────────────────────────

  async connectSignals() {
    if (!AppState.get('auth', 'isAuthenticated')) {
      throw new Error('[SocketManager] Cannot connect to /ws/signals — user not authenticated');
    }

    if (!this._signals) {
      this._signals = new NamespaceSocket(
        WS_NAMESPACES.SIGNALS,
        {}, // JWT injected in NamespaceSocket.connect()
        'signals',
        this._coordinator
      );
    }

    if (!this._signals.connected) {
      await this._signals.connect();
    }

    return this._signals;
  }

  /**
   * Subscribe to signal updates for a minimum tier level.
   * @param {'STANDARD'|'SILVER'|'GOLD'|'DIAMOND'} minTier
   * @param {Function} callback - Receives signal_update payload
   * @returns {Promise<Function>} Unsubscribe function
   */
  async subscribeSignals(minTier, callback) {
    const socket = await this.connectSignals();

    // Send subscribe event — backend validates tier in SocketAuthGuard + handler
    socket.emit('subscribe_signals', minTier);

    const unsubscribe = socket.on('signal_update', callback);

    if (DEBUG) console.log(`[SocketManager] Subscribed to signals (min tier: ${minTier})`);

    return unsubscribe;
  }

  // ─────────────────────────────────────────────────────
  // NOTIFICATIONS NAMESPACE (/ws/notifications)
  // JWT required
  // ─────────────────────────────────────────────────────

  async connectNotifications() {
    if (!AppState.get('auth', 'isAuthenticated')) {
      throw new Error('[SocketManager] Cannot connect to /ws/notifications — user not authenticated');
    }

    if (!this._notifications) {
      this._notifications = new NamespaceSocket(
        WS_NAMESPACES.NOTIFICATIONS,
        {},
        'notifications',
        this._coordinator
      );
    }

    if (!this._notifications.connected) {
      await this._notifications.connect();
    }

    return this._notifications;
  }

  /**
   * Subscribe to user notifications and initial unread count.
   * @param {Function} onNotification - Receives new_notification payload
   * @param {Function} onUnreadCount - Receives { count: number }
   * @returns {Promise<Function>} Unsubscribe function
   */
  async subscribeNotifications(onNotification, onUnreadCount) {
    const socket = await this.connectNotifications();

    // Trigger backend to join user's notification room
    socket.emit('subscribe_notifications');

    const unsubNotif = socket.on('new_notification', (data) => {
      AppState.setUnreadCount((AppState.get('notifications', 'unreadCount') || 0) + 1);
      onNotification?.(data);
    });

    const unsubCount = socket.on('unread_count', (data) => {
      AppState.setUnreadCount(data.count);
      onUnreadCount?.(data);
    });

    if (DEBUG) console.log('[SocketManager] Subscribed to notifications');

    return () => {
      unsubNotif();
      unsubCount();
    };
  }

  // ─────────────────────────────────────────────────────
  // LIFECYCLE MANAGEMENT
  // ─────────────────────────────────────────────────────

  disconnectAll() {
    this._market?.disconnect();
    this._signals?.disconnect();
    this._notifications?.disconnect();

    this._market = null;
    this._signals = null;
    this._notifications = null;
  }

  disconnectAuthenticated() {
    this._signals?.disconnect();
    this._notifications?.disconnect();
    this._signals = null;
    this._notifications = null;
  }

  _onTokenRefreshed() {
    // Update auth token in active authenticated namespaces
    this._signals?.updateToken();
    this._notifications?.updateToken();
    if (DEBUG) console.log('[SocketManager] Token updated on authenticated sockets');
  }

  // ─────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────

  get status() {
    return {
      market:        this._market?.connected ? 'connected' : 'disconnected',
      signals:       this._signals?.connected ? 'connected' : 'disconnected',
      notifications: this._notifications?.connected ? 'connected' : 'disconnected',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────

const SocketManager = new SocketManagerSingleton();

export { SocketManager };
export default SocketManager;
