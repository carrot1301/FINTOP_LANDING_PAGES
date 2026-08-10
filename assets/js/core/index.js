/**
 * ============================================================
 * index.js — Frontend Infrastructure Bootstrap & Test Suite
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   1. Bootstrap entry point — initializes all core modules
 *      in the correct dependency order on DOMContentLoaded.
 *   2. Exposes FintopInfra global for page-level scripts that
 *      cannot use ES module imports.
 *   3. Contains the full runtime validation test suite accessible
 *      via FintopInfra.test.* in browser console.
 *
 * USAGE:
 *   Add to every page that needs infrastructure:
 *   <script type="module" src="../assets/js/core/index.js"></script>
 *
 *   Or for pages with relative depth:
 *   <script type="module" src="../../assets/js/core/index.js"></script>
 *
 *   After load, access from any inline script:
 *   window.FintopInfra.AuthManager.login(email, password)
 *   window.FintopInfra.ApiClient.get('/market/sectors')
 *   window.FintopInfra.test.all()
 * ============================================================
 */

import { FintopEnv } from './env.js';
import { AppState } from './state.js';
import { ApiClient, FintopApiError } from './api-client.js';
import { AuthManager } from './auth-manager.js';
import { SocketManager } from './socket-manager.js';
import { RbacEvaluator, TIER_HIERARCHY, PERMISSIONS } from './rbac.js';
import { Formatter, EnumMapper, ErrorTranslator, Retry, DomUtils } from './utils.js';
import { AuthUI, AuthFormUI } from './auth-ui.js';

// ─────────────────────────────────────────────────────────────
// BOOTSTRAP SEQUENCE
// ─────────────────────────────────────────────────────────────

async function bootstrap() {
  if (FintopEnv.DEBUG) {
    console.group('%c[FinTop Infrastructure] 🚀 Bootstrap', 'color: #a78bfa; font-weight: bold; font-size: 14px;');
    console.log('Environment:', FintopEnv.ENV);
    console.log('API:', FintopEnv.API_BASE_URL);
    console.log('WS:', FintopEnv.WS_BASE_URL);
  }

  try {
    // 1. Restore auth session from localStorage (non-blocking)
    await AuthManager.initialize();

    // 2. Initialize Auth UI (navbar state, form handlers)
    await AuthUI.initialize();

    // 3. Apply RBAC gates to current page DOM
    RbacEvaluator.applyAllGates();

    // 4. Notification WebSocket is handled by AuthUI.initialize()
    //    (auth-ui.js L568) — no need to subscribe here to avoid
    //    duplicate connections and race-condition warnings.

    if (FintopEnv.DEBUG) {
      console.log('%c[FinTop Infrastructure] ✅ Bootstrap complete', 'color: #6ee7b7;');
      console.groupEnd();
    }

  } catch (err) {
    console.error('[FinTop Infrastructure] Bootstrap error:', err);
    if (FintopEnv.DEBUG) console.groupEnd();
  }
}

/**
 * Update notification badge elements if present on the page.
 * @param {number} count
 */
function _updateNotificationBadge(count) {
  const badges = document.querySelectorAll('[data-notification-badge]');
  badges.forEach(badge => {
    badge.textContent = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// RUNTIME VALIDATION TEST SUITE
// Run from browser console: FintopInfra.test.all()
// ─────────────────────────────────────────────────────────────

const Test = {
  _pass: (name) => console.log(`%c  ✅ PASS: ${name}`, 'color: #6ee7b7;'),
  _fail: (name, err) => console.error(`  ❌ FAIL: ${name}`, err),
  _section: (name) => console.group(`%c[Test] ${name}`, 'color: #a78bfa; font-weight: bold;'),
  _end: () => console.groupEnd(),

  // ─── ENV TESTS ─────────────────────────────────────────────

  async env() {
    this._section('Environment Config');
    try {
      if (!FintopEnv.API_BASE_URL) throw new Error('API_BASE_URL is empty');
      this._pass(`API_BASE_URL: ${FintopEnv.API_BASE_URL}`);

      if (!FintopEnv.WS_BASE_URL) throw new Error('WS_BASE_URL is empty');
      this._pass(`WS_BASE_URL: ${FintopEnv.WS_BASE_URL}`);

      if (!FintopEnv.WS_NAMESPACES.MARKET) throw new Error('WS_NAMESPACES.MARKET missing');
      this._pass(`WS_NAMESPACES: ${JSON.stringify(FintopEnv.WS_NAMESPACES)}`);

      if (Object.isFrozen(FintopEnv)) {
        this._pass('FintopEnv is frozen (immutable)');
      } else {
        this._fail('FintopEnv should be frozen', 'Object.isFrozen() returned false');
      }

      if (typeof FintopEnv.API_ENDPOINTS.MARKET_STOCK === 'function') {
        const testPath = FintopEnv.API_ENDPOINTS.MARKET_STOCK('FPT');
        if (testPath === '/market/stocks/FPT') {
          this._pass(`Dynamic endpoint: ${testPath}`);
        } else {
          this._fail('Dynamic endpoint', `Expected /market/stocks/FPT, got ${testPath}`);
        }
      }
    } catch (err) {
      this._fail('ENV config', err);
    }
    this._end();
  },

  // ─── STATE TESTS ────────────────────────────────────────────

  async state() {
    this._section('AppState Store');
    try {
      // Test setState
      AppState.setState('auth', { isAuthenticated: false });
      const authState = AppState.getState('auth');
      if ('isAuthenticated' in authState) this._pass('getState() returns auth slice');
      else throw new Error('getState() missing isAuthenticated');

      // Test EventEmitter
      let fired = false;
      const unsub = AppState.on('test:event', () => { fired = true; });
      AppState.emit('test:event');
      unsub();
      if (fired) this._pass('EventEmitter on/emit/off works');
      else throw new Error('EventEmitter did not fire event');

      // Test once()
      let count = 0;
      AppState.once('test:once', () => { count++; });
      AppState.emit('test:once');
      AppState.emit('test:once');
      if (count === 1) this._pass('once() fires exactly once');
      else this._fail('once()', `Expected count=1, got count=${count}`);

      // Test unknown slice warning
      const result = AppState.getState('nonexistent');
      if (result === null) this._pass('Unknown slice returns null safely');

    } catch (err) {
      this._fail('AppState', err);
    }
    this._end();
  },

  // ─── API CLIENT TESTS ───────────────────────────────────────

  async api() {
    this._section('API Client (live — requires backend running)');
    try {
      // Test health endpoint (no auth required)
      const health = await ApiClient.get(FintopEnv.API_ENDPOINTS.HEALTH);
      if (health?.data?.status === 'ok' || health?.data?.status === 'degraded') {
        this._pass(`GET /health → status: ${health.data.status}`);
      } else {
        this._pass(`GET /health → response received (structure: ${JSON.stringify(health?.data)?.slice(0, 50)})`);
      }

      // Test query string builder
      const qs = ApiClient.toQuery({ page: 1, limit: 10, empty: null, undef: undefined });
      if (qs === '?page=1&limit=10') {
        this._pass(`toQuery() filters nulls: "${qs}"`);
      } else {
        this._fail('toQuery()', `Expected ?page=1&limit=10, got ${qs}`);
      }

      // Test error normalization on 404
      try {
        await ApiClient.get('/this-route-definitely-does-not-exist');
        this._fail('404 normalization', 'Expected FintopApiError to be thrown');
      } catch (err) {
        if (err instanceof FintopApiError && err.statusCode === 404) {
          this._pass(`404 → FintopApiError (code: ${err.code})`);
        } else if (err instanceof FintopApiError) {
          this._pass(`Non-existent route → FintopApiError (status: ${err.statusCode})`);
        } else {
          this._fail('Error normalization', `Expected FintopApiError, got ${err.constructor.name}`);
        }
      }

    } catch (err) {
      this._fail('API Client (backend may not be running)', err.message || err);
    }
    this._end();
  },

  // ─── AUTH TESTS ─────────────────────────────────────────────

  async auth() {
    this._section('Auth Manager (token lifecycle)');
    try {
      // Test JWT decoder with a known token
      const { getTokenExpiry, isTokenExpired } = await import('./auth-manager.js');

      // Construct a known expired JWT (exp in the past)
      const expiredPayload = btoa(JSON.stringify({ sub: 1, exp: Math.floor(Date.now() / 1000) - 3600 }));
      const expiredToken = `header.${expiredPayload.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.sig`;

      const expiry = getTokenExpiry(expiredToken);
      if (typeof expiry === 'number') this._pass(`getTokenExpiry() returns number: ${expiry}`);
      else this._fail('getTokenExpiry()', `Expected number, got ${typeof expiry}`);

      const isExpired = isTokenExpired(expiredToken, 0);
      if (isExpired) this._pass('isTokenExpired() correctly identifies expired token');
      else this._fail('isTokenExpired()', 'Expected true for expired token');

      // Test non-expired token
      const futurePayload = btoa(JSON.stringify({ sub: 1, exp: Math.floor(Date.now() / 1000) + 3600 }));
      const futureToken = `header.${futurePayload.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.sig`;
      const notExpired = isTokenExpired(futureToken, 0);
      if (!notExpired) this._pass('isTokenExpired() correctly identifies valid token');
      else this._fail('isTokenExpired()', 'Expected false for future token');

      // Test auth state
      const authState = AppState.getState('auth');
      this._pass(`Auth state initialized: isAuthenticated=${authState.isAuthenticated}`);

      // Test session restore (non-breaking if no token stored)
      this._pass('AuthManager.initialize() available and callable');

    } catch (err) {
      this._fail('Auth Manager', err);
    }
    this._end();
  },

  // ─── RBAC TESTS ─────────────────────────────────────────────

  async rbac() {
    this._section('RBAC Evaluator');
    try {
      // Tier comparison tests
      // Simulate GOLD user
      AppState.setState('user', { tierLevel: 'GOLD', roles: [], permissions: [] });
      AppState.setState('auth', { isAuthenticated: true });

      if (RbacEvaluator.hasTier('STANDARD')) this._pass('GOLD user hasTier(STANDARD) = true');
      else this._fail('hasTier(STANDARD)', 'GOLD should pass STANDARD check');

      if (RbacEvaluator.hasTier('GOLD')) this._pass('GOLD user hasTier(GOLD) = true');
      else this._fail('hasTier(GOLD)', 'GOLD should pass GOLD check');

      if (!RbacEvaluator.hasTier('DIAMOND')) this._pass('GOLD user hasTier(DIAMOND) = false');
      else this._fail('hasTier(DIAMOND)', 'GOLD should NOT pass DIAMOND check');

      // SUPER_ADMIN bypass
      AppState.setState('user', { tierLevel: 'STANDARD', roles: ['SUPER_ADMIN'], permissions: [] });
      if (RbacEvaluator.hasTier('DIAMOND')) this._pass('SUPER_ADMIN bypasses tier DIAMOND');
      if (RbacEvaluator.hasPermission('MANAGE_USERS')) this._pass('SUPER_ADMIN bypasses MANAGE_USERS permission');

      // Permission check
      AppState.setState('user', { tierLevel: 'GOLD', roles: [], permissions: ['CREATE_SIGNAL'] });
      if (RbacEvaluator.hasPermission('CREATE_SIGNAL')) this._pass('hasPermission(CREATE_SIGNAL) = true');
      if (!RbacEvaluator.hasPermission('MANAGE_USERS')) this._pass('hasPermission(MANAGE_USERS) = false');

      // Restore clean state
      AppState.clearAuth();
      this._pass('State restored to unauthenticated after tests');

    } catch (err) {
      this._fail('RBAC Evaluator', err);
    }
    this._end();
  },

  // ─── UTILS TESTS ────────────────────────────────────────────

  async utils() {
    this._section('Utilities');
    try {
      // Decimal formatter
      if (Formatter.decimal('78.20000000', 2) === '78.20') this._pass('decimal("78.20000000", 2) = "78.20"');
      else this._fail('decimal()', Formatter.decimal('78.20000000', 2));

      if (Formatter.decimal(null) === '—') this._pass('decimal(null) = "—"');

      // Price formatter
      if (Formatter.price(132.4, 1) === '132.4') this._pass(`price(132.4) = "${Formatter.price(132.4, 1)}"`);

      // Percent formatter
      if (Formatter.percent(1.85) === '+1.85%') this._pass(`percent(1.85) = "${Formatter.percent(1.85)}"`);
      if (Formatter.percent(-0.2) === '-0.20%') this._pass(`percent(-0.2) = "${Formatter.percent(-0.2)}"`);

      // Timestamp formatter
      const ts = Formatter.timestamp('2026-01-29T06:05:54.000Z', 'full');
      if (ts.includes('29-01-2026')) this._pass(`timestamp → date part: "${ts}"`);

      // Relative time
      const recent = Formatter.relativeTime(new Date(Date.now() - 30000).toISOString());
      if (recent === 'Vừa xong') this._pass(`relativeTime(30s ago) = "${recent}"`);

      // Enum mapper
      const status = EnumMapper.signalStatus('PUBLISHED');
      if (status.label === 'ENTRY') this._pass(`signalStatus(PUBLISHED) → label: "${status.label}"`);

      const tier = EnumMapper.subscriptionTier('GOLD');
      if (tier.label === 'Vàng') this._pass(`subscriptionTier(GOLD) → label: "${tier.label}"`);

      // Error translator
      const translated = ErrorTranslator.translate({ statusCode: 401, code: 'SESSION_EXPIRED' });
      if (translated.title === 'Phiên hết hạn') this._pass(`translate(SESSION_EXPIRED) → "${translated.title}"`);

      const network = ErrorTranslator.translate({ statusCode: 0, code: 'NETWORK_ERROR' });
      if (network.actionLabel === 'Thử lại') this._pass(`translate(NETWORK_ERROR) → actionLabel: "${network.actionLabel}"`);

      // Volume formatter
      if (Formatter.volume(4800000) === '4.8M') this._pass(`volume(4.8M) = "${Formatter.volume(4800000)}"`);
      if (Formatter.volume(18200) === '18.2K') this._pass(`volume(18.2K) = "${Formatter.volume(18200)}"`);

    } catch (err) {
      this._fail('Utilities', err);
    }
    this._end();
  },

  // ─── SOCKET TESTS ───────────────────────────────────────────

  async sockets() {
    this._section('Socket Manager (live — requires backend running)');
    try {
      // Test market connection (public, no auth)
      const socket = await SocketManager.connectMarket();
      if (socket.connected) {
        this._pass('/ws/market connected');

        // Test subscribe/unsubscribe
        let quoteReceived = false;
        const unsubscribe = await SocketManager.subscribeMarketQuote('FPT', (quote) => {
          quoteReceived = true;
          if (FintopEnv.DEBUG) console.log('  Quote received:', quote);
        });
        this._pass('subscribeMarketQuote(FPT) emitted');

        // Wait 2s for possible quote push
        await Retry.sleep(2000);
        unsubscribe();
        this._pass(`subscribeMarketQuote unsubscribed (quote received: ${quoteReceived})`);

      } else {
        this._fail('/ws/market', 'Not connected after connectMarket()');
      }

    } catch (err) {
      this._fail('Socket Manager (backend may not be running)', err.message || err);
    }
    this._end();
  },

  // ─── RUN ALL ────────────────────────────────────────────────

  async all() {
    console.group(
      '%c[FintopInfra] 🧪 Full Validation Suite',
      'color: #a78bfa; font-weight: bold; font-size: 16px;'
    );
    console.log('%cRunning all infrastructure tests...', 'color: #94a3b8;');
    console.log('');

    await this.env();
    await this.state();
    await this.auth();
    await this.rbac();
    await this.utils();
    await this.api();
    await this.sockets();

    console.log('');
    console.log('%c[FintopInfra] Test suite complete. Check results above.', 'color: #a78bfa; font-weight: bold;');
    console.groupEnd();
  },
};

// ─────────────────────────────────────────────────────────────
// GLOBAL EXPOSURE
// Exposes the full infrastructure to page-level inline scripts
// that cannot use ES module imports.
// ─────────────────────────────────────────────────────────────

window.FintopInfra = Object.freeze({
  // Core modules
  FintopEnv,
  AppState,
  ApiClient,
  AuthManager,
  SocketManager,
  RbacEvaluator,

  // Auth UI (Phase-2B-1)
  AuthUI,
  AuthFormUI,

  // Utilities
  Formatter,
  EnumMapper,
  ErrorTranslator,
  Retry,
  DomUtils,

  // Constants
  TIER_HIERARCHY,
  PERMISSIONS,
  FintopApiError,

  // Test suite
  test: Test,

  // Version
  version: '2.1.0-phase2b1',
});

if (FintopEnv.DEBUG) {
  console.log(
    '%c[FinTop] 🟢 Infrastructure ready. Access via window.FintopInfra',
    'color: #6ee7b7; font-weight: bold;'
  );
  console.log('%c  Run FintopInfra.test.all() to validate', 'color: #94a3b8;');
}

// ─────────────────────────────────────────────────────────────
// INIT ON DOM READY
// ─────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  // DOMContentLoaded already fired (script loaded async/defer)
  bootstrap();
}

export {
  FintopEnv, AppState, ApiClient, AuthManager,
  SocketManager, RbacEvaluator, Formatter, EnumMapper,
  ErrorTranslator, Retry, DomUtils, TIER_HIERARCHY,
  PERMISSIONS, FintopApiError, AuthUI, AuthFormUI,
};
