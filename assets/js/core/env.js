/**
 * ============================================================
 * env.js — Environment Configuration & API Endpoint Governance
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Single source of truth for ALL backend URL references.
 *   No hardcoded localhost:3000 strings anywhere else in the codebase.
 *   Auto-detects environment from window.location.hostname.
 *
 * DESIGN DECISIONS:
 *   - Vanilla ES Module (no build step required)
 *   - Exported as a frozen object to prevent accidental mutation
 *   - Supports development, staging, production environments
 *   - Override via window.__FINTOP_CONFIG__ for server-side injection
 *
 * BACKEND CONTRACT:
 *   Backend runs on port 3000 (env.schema.ts: PORT default = 3000)
 *   CORS is enabled with credentials: true (main.ts L34)
 *   WebSocket uses Socket.IO with Redis adapter (main.ts L79)
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// ENVIRONMENT DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Detects the current runtime environment.
 * Priority order:
 * 1. Server-injected config (window.__FINTOP_CONFIG__)
 * 2. Hostname-based detection
 * 3. Default: development
 *
 * @returns {'development' | 'staging' | 'production'}
 */
function detectEnvironment() {
  // Allow server to inject config (for Docker/Nginx deployments)
  if (window.__FINTOP_CONFIG__?.ENV) {
    return window.__FINTOP_CONFIG__.ENV;
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'development';
  }

  if (hostname.includes('staging') || hostname.includes('dev.') || hostname.includes('test.')) {
    return 'staging';
  }

  return 'production';
}

// ─────────────────────────────────────────────────────────────
// ENVIRONMENT-SPECIFIC CONFIG
// ─────────────────────────────────────────────────────────────

const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    WS_BASE_URL:  'http://localhost:3000',
    SWAGGER_URL:  'http://localhost:3000/docs',
    HEALTH_URL:   'http://localhost:3000/health',
    DEBUG: true,
  },
  staging: {
    // Override via window.__FINTOP_CONFIG__ in staging environment
    API_BASE_URL: window.__FINTOP_CONFIG__?.API_BASE_URL || 'https://api-staging.fintopdata.vn',
    WS_BASE_URL:  window.__FINTOP_CONFIG__?.WS_BASE_URL  || 'https://api-staging.fintopdata.vn',
    SWAGGER_URL:  null, // Disabled in staging
    HEALTH_URL:   window.__FINTOP_CONFIG__?.API_BASE_URL + '/health' || 'https://api-staging.fintopdata.vn/health',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: window.__FINTOP_CONFIG__?.API_BASE_URL || 'https://api.fintopdata.vn',
    WS_BASE_URL:  window.__FINTOP_CONFIG__?.WS_BASE_URL  || 'https://api.fintopdata.vn',
    SWAGGER_URL:  null, // Disabled in production (main.ts L64)
    HEALTH_URL:   window.__FINTOP_CONFIG__?.API_BASE_URL + '/health' || 'https://api.fintopdata.vn/health',
    DEBUG: false,
  },
};

// ─────────────────────────────────────────────────────────────
// WEBSOCKET NAMESPACE PATHS
// Aligned with backend gateway declarations:
//   market.gateway.ts:     @WebSocketGateway({ namespace: '/ws/market' })
//   signal.gateway.ts:     @WebSocketGateway({ namespace: '/ws/signals' })
//   notification.gateway:  @WebSocketGateway({ namespace: '/ws/notifications' })
// ─────────────────────────────────────────────────────────────

const WS_NAMESPACES = Object.freeze({
  MARKET:        '/ws/market',
  SIGNALS:       '/ws/signals',
  NOTIFICATIONS: '/ws/notifications',
});

// ─────────────────────────────────────────────────────────────
// API ENDPOINT REGISTRY
// All backend endpoints declared here for governance.
// Import this in api-client.js — never hardcode paths elsewhere.
// ─────────────────────────────────────────────────────────────

const API_ENDPOINTS = Object.freeze({
  // Auth (auth.controller.ts)
  AUTH_LOGIN:       '/auth/login',
  AUTH_REFRESH:     '/auth/refresh',
  AUTH_LOGOUT:      '/auth/logout',
  AUTH_LOGOUT_ALL:  '/auth/logout-all',
  AUTH_ME:          '/auth/me',

  // Market (market.controller.ts)
  MARKET_SECTORS:   '/market/sectors',
  MARKET_STOCK:     (symbol)  => `/market/stocks/${encodeURIComponent(symbol)}`,
  MARKET_HISTORICAL:(symbol)  => `/market/stocks/${encodeURIComponent(symbol)}/historical`,

  // Signals (signal.controller.ts) — GOLD tier required
  SIGNALS_LIST:     '/signals',
  SIGNAL_CREATE:    '/signals',
  SIGNAL_STATUS:    (id)      => `/signals/${id}/status`,

  // Billing (billing.controller.ts)
  BILLING_INVOICES: '/billing/invoices',
  BILLING_WEBHOOK:  '/billing/webhook',

  // Watchlist (watchlist.controller.ts)
  WATCHLIST_CREATE: '/watchlists',
  WATCHLIST_ITEMS:  (id)      => `/watchlists/${id}/items`,

  // Alerts (alert.controller.ts)
  ALERTS_LIST:      '/alerts',
  ALERT_CREATE:     '/alerts',
  ALERT_DELETE:     (id)      => `/alerts/${id}`,

  // Notifications (notification.controller.ts)
  NOTIFICATIONS:    '/users/notifications',
  NOTIFICATION_READ:(id)      => `/users/notifications/${id}/read`,

  // CMS / Blog (blog.controller.ts)
  BLOG_GET:         (slug)    => `/blogs/${encodeURIComponent(slug)}`,
  BLOG_CREATE:      '/blogs',
  BLOG_STATUS:      (id)      => `/blogs/${id}/status`,

  // Subscription (subscription.controller.ts)
  SUBSCRIPTION:     '/users/subscription',

  // Admin (admin.controller.ts)
  ADMIN_OVERVIEW:            '/admin/overview',
  ADMIN_USERS:               '/admin/users',
  ADMIN_USER_DETAIL:         (id)  => `/admin/users/${id}`,
  ADMIN_USER_STATUS:         (id)  => `/admin/users/${id}/status`,
  ADMIN_USER_ROLE:           (id)  => `/admin/users/${id}/role`,
  ADMIN_ROLES:               '/admin/roles',
  ADMIN_ROLE_PERMISSIONS:    (id)  => `/admin/roles/${id}/permissions`,
  ADMIN_SIGNALS:             '/admin/signals',
  ADMIN_BLOGS:               '/admin/blogs',
  ADMIN_REPORTS:             '/admin/reports',
  ADMIN_NOTIFICATIONS:       '/admin/notifications',
  ADMIN_NOTIFICATION_BROADCAST: '/admin/notifications/broadcast',
  ADMIN_AUDIT_LOGS:          '/admin/audit-logs',
  ADMIN_BILLING_PLANS:       '/admin/billing/plans',
  ADMIN_BILLING_INVOICES:    '/admin/billing/invoices',
  ADMIN_MARKET_SYNC_LOGS:    '/admin/market/sync-logs',
  ADMIN_MARKET_STOCKS:       '/admin/market/stocks',
  ADMIN_PORTFOLIOS:          '/admin/portfolios',

  // Health (health.controller.ts)
  HEALTH:           '/health',
  HEALTH_READINESS: '/health/readiness',
  HEALTH_LIVENESS:  '/health/liveness',

  // Metrics
  METRICS:          '/metrics',
});

// ─────────────────────────────────────────────────────────────
// STORAGE KEYS
// Centralised to prevent typos across modules
// ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN:  'fintop_access_token',
  REFRESH_TOKEN: 'fintop_refresh_token',
  USER_PROFILE:  'fintop_user',
  SUBSCRIPTION:  'fintop_subscription',
  SESSION_STATE: 'fintop_session_state',
});

// ─────────────────────────────────────────────────────────────
// REQUEST CONFIG
// ─────────────────────────────────────────────────────────────

const REQUEST_CONFIG = Object.freeze({
  TIMEOUT_MS:          15000,  // 15s request timeout
  RETRY_MAX_ATTEMPTS:  3,
  RETRY_BASE_DELAY_MS: 500,    // Exponential backoff base
  REFRESH_BUFFER_MS:   60000,  // Refresh token 60s before expiry
});

// ─────────────────────────────────────────────────────────────
// ASSEMBLED ENVIRONMENT CONFIG
// ─────────────────────────────────────────────────────────────

const ENV = detectEnvironment();
const envConfig = ENVIRONMENTS[ENV];

const FintopEnv = Object.freeze({
  ENV,
  API_BASE_URL:  envConfig.API_BASE_URL,
  WS_BASE_URL:   envConfig.WS_BASE_URL,
  SWAGGER_URL:   envConfig.SWAGGER_URL,
  HEALTH_URL:    envConfig.HEALTH_URL,
  DEBUG:         envConfig.DEBUG,
  WS_NAMESPACES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  REQUEST_CONFIG,
});

// ─────────────────────────────────────────────────────────────
// DEBUG LOGGING
// ─────────────────────────────────────────────────────────────

if (FintopEnv.DEBUG) {
  console.log(
    `%c[FinTop ENV] 🌐 Environment: ${ENV} | API: ${FintopEnv.API_BASE_URL}`,
    'color: #a78bfa; font-weight: bold;'
  );
}

export { FintopEnv };
export default FintopEnv;
