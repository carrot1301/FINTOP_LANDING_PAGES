/**
 * ============================================================
 * api-client.js — HTTP Client Foundation
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Centralized HTTP client wrapping the native Fetch API.
 *   All backend REST calls MUST go through this client.
 *   Never use raw fetch() directly in page scripts.
 *
 * DESIGN DECISIONS:
 *   WHY Fetch over Axios?
 *   The frontend is a static multi-page site served without a bundler.
 *   Using the native Fetch API eliminates the need for an external
 *   axios CDN link on every page. Fetch is supported in all modern
 *   browsers and provides sufficient power for our use case.
 *
 *   WHY not a class with constructor DI?
 *   We need a singleton that any page script can import immediately.
 *   A class singleton that auto-configures from FintopEnv at import
 *   time is the right balance.
 *
 * FEATURES:
 *   ✅ Automatic Authorization: Bearer header injection
 *   ✅ Correlation ID propagation (X-Correlation-Id header)
 *   ✅ ApiResponse<T> envelope unwrapping
 *   ✅ Standardized error normalization (GlobalExceptionFilter format)
 *   ✅ Silent 401 refresh: retries once after token refresh
 *   ✅ 5xx retry with exponential backoff (max 3 attempts)
 *   ✅ Request timeout (15s default)
 *   ✅ Prevents double-refresh race condition
 *
 * BACKEND CONTRACT:
 *   Success envelope (api-response.interceptor.ts):
 *     { success: true, data: T, meta?: any, timestamp: string }
 *   Error format (global-exception.filter.ts):
 *     { statusCode, code, timestamp, path, correlationId, message, stack? }
 * ============================================================
 */

import { FintopEnv } from './env.js';
import { AppState } from './state.js';

// ─────────────────────────────────────────────────────────────
// CUSTOM ERROR CLASS
// ─────────────────────────────────────────────────────────────

/**
 * Represents a normalized API error from the backend.
 * Aligned with GlobalExceptionFilter output format.
 */
class FintopApiError extends Error {
  /**
   * @param {Object} params
   * @param {number} params.statusCode - HTTP status code
   * @param {string} params.code - Backend error code (e.g. 'NOT_FOUND')
   * @param {string} params.message - Human-readable message
   * @param {string} [params.correlationId]
   * @param {string} [params.path]
   */
  constructor({ statusCode, code, message, correlationId, path }) {
    super(message);
    this.name = 'FintopApiError';
    this.statusCode = statusCode;
    this.code = code || 'UNKNOWN_ERROR';
    this.correlationId = correlationId || null;
    this.path = path || null;
    this.isApiError = true;
  }

  get isUnauthorized()  { return this.statusCode === 401; }
  get isForbidden()     { return this.statusCode === 403; }
  get isNotFound()      { return this.statusCode === 404; }
  get isServerError()   { return this.statusCode >= 500; }
  get isNetworkError()  { return this.statusCode === 0; }
}

// ─────────────────────────────────────────────────────────────
// CORRELATION ID GENERATOR
// Generates a short unique ID for request tracing.
// Matches backend X-Correlation-Id header handling.
// ─────────────────────────────────────────────────────────────

function generateCorrelationId() {
  return `fe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────
// TIMEOUT WRAPPER
// Native fetch() has no built-in timeout. We use AbortController.
// ─────────────────────────────────────────────────────────────

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// ─────────────────────────────────────────────────────────────
// RETRY WITH EXPONENTIAL BACKOFF
// Only retries on 5xx server errors, not 4xx client errors.
// ─────────────────────────────────────────────────────────────

async function withRetry(fn, maxAttempts, baseDelayMs) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry client errors (4xx) or abort errors
      if (err.isApiError && err.statusCode < 500) throw err;
      if (err.name === 'AbortError') throw err;

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // 500, 1000, 2000ms
        if (FintopEnv.DEBUG) {
          console.warn(`[ApiClient] Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────────────────────
// RESPONSE PARSER
// Unwraps ApiResponse<T> envelope and normalizes errors.
// ─────────────────────────────────────────────────────────────

async function parseResponse(response, correlationId) {
  let body;

  try {
    body = await response.json();
  } catch {
    // Empty body (e.g. 204 No Content)
    if (response.status === 204 || response.status === 201) {
      return null;
    }
    throw new FintopApiError({
      statusCode: response.status,
      code: 'PARSE_ERROR',
      message: 'Response body could not be parsed as JSON',
      correlationId,
      path: null,
    });
  }

  // Success: unwrap the ApiResponse<T> envelope
  if (response.ok) {
    // Backend wraps all responses: { success: true, data: T, meta?, timestamp }
    if (body && typeof body === 'object' && 'success' in body) {
      return {
        data: body.data,
        meta: body.meta || null,
        timestamp: body.timestamp,
      };
    }
    // Passthrough for non-wrapped responses (e.g. health check)
    return { data: body, meta: null, timestamp: new Date().toISOString() };
  }

  // Error: normalize to FintopApiError
  throw new FintopApiError({
    statusCode: body.statusCode || response.status,
    code: body.code || 'API_ERROR',
    message: body.message || response.statusText,
    correlationId: body.correlationId || correlationId,
    path: body.path || null,
  });
}

// ─────────────────────────────────────────────────────────────
// API CLIENT CLASS
// ─────────────────────────────────────────────────────────────

class ApiClientSingleton {
  constructor() {
    this._baseUrl = FintopEnv.API_BASE_URL;
    this._timeout = FintopEnv.REQUEST_CONFIG.TIMEOUT_MS;
    this._maxRetries = FintopEnv.REQUEST_CONFIG.RETRY_MAX_ATTEMPTS;
    this._retryBase = FintopEnv.REQUEST_CONFIG.RETRY_BASE_DELAY_MS;

    // Guard against concurrent refresh requests
    this._isRefreshing = false;
    this._refreshQueue = []; // Promises waiting for refresh completion

    if (FintopEnv.DEBUG) {
      console.log('[ApiClient] Initialized. Base URL:', this._baseUrl);
    }
  }

  // ─────────────────────────────────────────────────────
  // REQUEST INTERCEPTOR: Build headers
  // ─────────────────────────────────────────────────────

  _buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Correlation-Id': generateCorrelationId(),
      ...customHeaders,
    };

    // Inject Authorization: Bearer if token exists
    const accessToken = AppState.get('auth', 'accessToken');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  // ─────────────────────────────────────────────────────
  // SILENT REFRESH ON 401
  // When an access token expires mid-session, transparently
  // refresh it and retry the original request once.
  // ─────────────────────────────────────────────────────

  async _handleUnauthorized(retryFn) {
    // If already refreshing, queue this request to retry after refresh
    if (this._isRefreshing) {
      return new Promise((resolve, reject) => {
        this._refreshQueue.push({ resolve, reject });
      }).then(() => retryFn());
    }

    this._isRefreshing = true;

    try {
      // Dynamic import to avoid circular dependency at module load time
      const { AuthManager } = await import('./auth-manager.js');
      await AuthManager.refresh();

      // Drain the queue — all queued requests can now retry
      this._refreshQueue.forEach(({ resolve }) => resolve());
      this._refreshQueue = [];

      // Retry the original request once
      return retryFn();

    } catch (refreshError) {
      // Refresh itself failed → force logout
      this._refreshQueue.forEach(({ reject }) => reject(refreshError));
      this._refreshQueue = [];

      const { AuthManager } = await import('./auth-manager.js');
      await AuthManager.logout({ silent: true });

      throw new FintopApiError({
        statusCode: 401,
        code: 'SESSION_EXPIRED',
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        correlationId: null,
        path: null,
      });
    } finally {
      this._isRefreshing = false;
    }
  }

  // ─────────────────────────────────────────────────────
  // CORE REQUEST METHOD
  // ─────────────────────────────────────────────────────

  async _request(method, path, { body, headers: customHeaders, skipAuth = false, isRetryAfterRefresh = false, skipIntercept = false } = {}) {
    if (!skipIntercept && (path === '/portfolios' || path.startsWith('/portfolios/') || path.startsWith('/portfolios?'))) {
      const mockResult = await handleMockPortfolioRequest(method, path, body, this);
      if (mockResult) return mockResult;
    }
    const url = path.startsWith('http') ? path : `${this._baseUrl}${path}`;
    const correlationId = generateCorrelationId();

    const headers = this._buildHeaders(customHeaders);
    if (skipAuth) delete headers['Authorization'];

    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
      credentials: 'include', // Important: sends cookies if any, needed for CORS with credentials
    };

    if (body !== undefined && body !== null) {
      if (typeof FormData !== 'undefined' && body instanceof FormData) {
        fetchOptions.body = body;
        delete headers['Content-Type'];
      } else {
        fetchOptions.body = JSON.stringify(body);
      }
    }

    if (FintopEnv.DEBUG) {
      console.log(`%c[ApiClient] ${method.toUpperCase()} ${path}`, 'color: #6ee7b7;', body || '');
    }

    const makeRequest = async () => {
      let response;
      try {
        response = await fetchWithTimeout(url, fetchOptions, this._timeout);
      } catch (err) {
        if (err.name === 'AbortError') {
          throw new FintopApiError({
            statusCode: 0,
            code: 'TIMEOUT',
            message: `Request timed out after ${this._timeout}ms`,
            correlationId,
            path,
          });
        }
        throw new FintopApiError({
          statusCode: 0,
          code: 'NETWORK_ERROR',
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
          correlationId,
          path,
        });
      }

      return parseResponse(response, correlationId);
    };

    try {
      return await withRetry(makeRequest, this._maxRetries, this._retryBase);
    } catch (err) {
      // Silent refresh on 401 (but only once — isRetryAfterRefresh flag prevents infinite loop)
      if (err.isApiError && err.isUnauthorized && !isRetryAfterRefresh && !skipAuth) {
        return this._handleUnauthorized(() =>
          this._request(method, path, { body, headers: customHeaders, skipAuth, isRetryAfterRefresh: true })
        );
      }

      if (FintopEnv.DEBUG) {
        console.error(`[ApiClient] Error on ${method.toUpperCase()} ${path}:`, err);
      }

      throw err;
    }
  }

  // ─────────────────────────────────────────────────────
  // PUBLIC API METHODS
  // ─────────────────────────────────────────────────────

  /**
   * HTTP GET
   * @param {string} path - API path (e.g. '/market/sectors')
   * @param {Object} [options]
   * @returns {Promise<{ data: T, meta: any, timestamp: string }>}
   */
  get(path, options = {}) {
    return this._request('GET', path, options);
  }

  /**
   * HTTP POST
   * @param {string} path
   * @param {Object} body - Request body
   * @param {Object} [options]
   * @returns {Promise<{ data: T, meta: any, timestamp: string }>}
   */
  post(path, body, options = {}) {
    return this._request('POST', path, { ...options, body });
  }

  /**
   * HTTP PATCH
   * @param {string} path
   * @param {Object} body
   * @param {Object} [options]
   */
  patch(path, body, options = {}) {
    return this._request('PATCH', path, { ...options, body });
  }

  /**
   * HTTP PUT
   * @param {string} path
   * @param {Object} body
   * @param {Object} [options]
   */
  put(path, body, options = {}) {
    return this._request('PUT', path, { ...options, body });
  }

  /**
   * HTTP DELETE
   * @param {string} path
   * @param {Object} [options]
   */
  delete(path, options = {}) {
    return this._request('DELETE', path, options);
  }

  // ─────────────────────────────────────────────────────
  // QUERY STRING BUILDER
  // Usage: ApiClient.get(path + ApiClient.toQuery({ page: 1, limit: 10 }))
  // ─────────────────────────────────────────────────────

  /**
   * Build URL query string from a params object.
   * @param {Object} params
   * @returns {string} e.g. '?page=1&limit=10'
   */
  toQuery(params = {}) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    );
    if (filtered.length === 0) return '';
    return '?' + new URLSearchParams(filtered).toString();
  }
}

// ─────────────────────────────────────────────────────────────
// SIMULATED PORTFOLIOS LAYER
// ─────────────────────────────────────────────────────────────

let isInitializingMock = false;

async function ensureMockPortfoliosInitialized(client) {
  const cached = localStorage.getItem('fintop_simulated_portfolios');
  if (cached) {
    return JSON.parse(cached);
  }
  if (isInitializingMock) {
    return {};
  }
  isInitializingMock = true;
  try {
    const res = await client._request('GET', '/portfolios', { skipIntercept: true });
    const list = res.data || [];
    const portfoliosMap = {};
    for (const p of list) {
      try {
        const detailRes = await client._request('GET', `/portfolios/${p.id}`, { skipIntercept: true });
        const detail = detailRes.data || detailRes;
        portfoliosMap[p.id] = {
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          minTierAccess: p.minTierAccess,
          initialCapital: p.initialCapital,
          currentNav: detail.currentNav || p.currentNav,
          cashBalance: detail.cashBalance || p.cashBalance,
          holdings: detail.holdings || [],
          locked: p.locked
        };
      } catch (e) {
        portfoliosMap[p.id] = {
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          minTierAccess: p.minTierAccess,
          initialCapital: p.initialCapital,
          currentNav: p.currentNav,
          cashBalance: p.cashBalance,
          holdings: [],
          locked: p.locked
        };
      }
    }
    localStorage.setItem('fintop_simulated_portfolios', JSON.stringify(portfoliosMap));
    return portfoliosMap;
  } catch (err) {
    console.error('Failed to initialize mock portfolios:', err);
    return {};
  } finally {
    isInitializingMock = false;
  }
}

async function handleMockPortfolioRequest(method, path, body, client) {
  const cleanPath = path.split('?')[0];
  const portfoliosMap = await ensureMockPortfoliosInitialized(client);
  
  if (method === 'GET' && cleanPath === '/portfolios') {
    const list = Object.values(portfoliosMap).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      minTierAccess: p.minTierAccess,
      initialCapital: p.initialCapital,
      currentNav: p.currentNav,
      cashBalance: p.cashBalance,
      locked: p.locked
    }));
    return { data: list };
  }
  
  const matchDetail = cleanPath.match(/^\/portfolios\/(\d+)$/);
  if (method === 'GET' && matchDetail) {
    const id = matchDetail[1];
    const p = portfoliosMap[id];
    if (!p) {
      return null;
    }
    return { data: p };
  }
  
  if (method === 'POST' && cleanPath === '/portfolios') {
    const newId = (1000 + Math.floor(Math.random() * 9000)).toString();
    const newP = {
      id: newId,
      name: body.name,
      description: body.description || '',
      status: 'ACTIVE',
      minTierAccess: body.minTierAccess || 'STANDARD',
      initialCapital: Number(body.initialCapital),
      currentNav: Number(body.initialCapital),
      cashBalance: Number(body.initialCapital),
      holdings: [],
      locked: false
    };
    portfoliosMap[newId] = newP;
    localStorage.setItem('fintop_simulated_portfolios', JSON.stringify(portfoliosMap));
    return { data: newP };
  }
  
  if (method === 'POST' && cleanPath === '/portfolios/trade') {
    const { portfolioId, symbol, companyName, action, quantity, price } = body;
    const p = portfoliosMap[portfolioId];
    if (!p) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }
    
    const qty = Number(quantity);
    const prc = Number(price);
    const totalCost = qty * prc;
    
    if (action === 'BUY') {
      if (p.cashBalance < totalCost) {
        throw new Error('Số dư tiền mặt không đủ để mua!');
      }
      p.cashBalance -= totalCost;
      
      const existing = p.holdings.find(h => h.symbol === symbol);
      if (existing) {
        const newQty = existing.quantity + qty;
        existing.avgEntryPrice = ((existing.quantity * existing.avgEntryPrice) + totalCost) / newQty;
        existing.quantity = newQty;
        existing.currentPrice = prc;
        existing.value = newQty * prc;
        existing.profitLoss = (prc - existing.avgEntryPrice) * newQty;
        existing.profitLossPercent = ((prc - existing.avgEntryPrice) / existing.avgEntryPrice) * 100;
      } else {
        p.holdings.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          symbol,
          companyName: companyName || symbol,
          quantity: qty,
          avgEntryPrice: prc,
          currentPrice: prc,
          value: totalCost,
          allocation: 0,
          profitLoss: 0,
          profitLossPercent: 0
        });
      }
    } else if (action === 'SELL') {
      const existing = p.holdings.find(h => h.symbol === symbol);
      if (!existing || existing.quantity < qty) {
        throw new Error('Số lượng cổ phiếu trong danh mục không đủ để bán!');
      }
      
      p.cashBalance += totalCost;
      existing.quantity -= qty;
      
      if (existing.quantity === 0) {
        p.holdings = p.holdings.filter(h => h.symbol !== symbol);
      } else {
        existing.value = existing.quantity * prc;
        existing.currentPrice = prc;
        existing.profitLoss = (prc - existing.avgEntryPrice) * existing.quantity;
        existing.profitLossPercent = ((prc - existing.avgEntryPrice) / existing.avgEntryPrice) * 100;
      }
    }
    
    let stocksVal = 0;
    p.holdings.forEach(h => {
      stocksVal += h.currentPrice * h.quantity;
    });
    p.currentNav = p.cashBalance + stocksVal;
    
    portfoliosMap[portfolioId] = p;
    localStorage.setItem('fintop_simulated_portfolios', JSON.stringify(portfoliosMap));
    return { data: p };
  }
  
  const matchDelete = cleanPath.match(/^\/portfolios\/(\d+)$/);
  if (method === 'DELETE' && matchDelete) {
    const id = matchDelete[1];
    delete portfoliosMap[id];
    localStorage.setItem('fintop_simulated_portfolios', JSON.stringify(portfoliosMap));
    return { data: { success: true } };
  }
  
  return null;
}

// ─────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────

const ApiClient = new ApiClientSingleton();

export { ApiClient, FintopApiError };
export default ApiClient;
