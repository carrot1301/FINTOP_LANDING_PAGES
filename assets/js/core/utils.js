/**
 * ============================================================
 * utils.js — Global Frontend Utilities
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Provides formatting, enum mapping, error translation, and
 *   retry utilities that align exactly with backend data contracts.
 *
 * BACKEND CONTRACT ALIGNMENT:
 *   - Decimal types: Prisma serializes Decimal as string (e.g. "78.20")
 *   - Timestamps: ISO 8601 (e.g. "2026-05-21T03:08:03.538Z")
 *   - Enums: Exact string keys from Prisma client types
 *   - Error format: GlobalExceptionFilter { statusCode, code, message }
 * ============================================================
 */

import { FintopEnv } from './env.js';

// ─────────────────────────────────────────────────────────────
// 1. DECIMAL & NUMBER FORMATTER
// Handles Prisma Decimal (serialized as string) and numeric types
// ─────────────────────────────────────────────────────────────

const Formatter = {
  /**
   * Format a Decimal or number to fixed decimal places.
   * Handles Prisma Decimal strings (e.g. "78.20000000").
   * @param {string|number} value
   * @param {number} [decimals=2]
   * @returns {string} e.g. "78.20"
   */
  decimal(value, decimals = 2) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return num.toFixed(decimals);
  },

  /**
   * Format a price with thousand separators.
   * @param {string|number} value
   * @param {number} [decimals=1]
   * @returns {string} e.g. "132,400" or "78.2"
   */
  price(value, decimals = 1) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    // Vietnamese stock prices typically don't need thousand separators
    // for values < 1000, but do for larger values
    if (num >= 1000) {
      return num.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    }
    return num.toFixed(decimals);
  },

  /**
   * Format a percentage change with sign.
   * @param {string|number} value - e.g. 1.85 (not 0.0185)
   * @param {number} [decimals=2]
   * @returns {string} e.g. "+1.85%" or "-0.20%"
   */
  percent(value, decimals = 2) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(decimals)}%`;
  },

  /**
   * Format a large volume number with K/M/B abbreviations.
   * @param {string|number} value
   * @returns {string} e.g. "4.8M" or "18.2K"
   */
  volume(value) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  },

  /**
   * Format a market cap (in VND billions/trillions).
   * @param {string|number} value - Value in VND billions (tỷ)
   * @returns {string} e.g. "190.2K tỷ"
   */
  marketCap(value) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K tỷ`;
    return `${num.toFixed(0)} tỷ`;
  },

  // ─────────────────────────────────────────────────────
  // 2. TIMESTAMP FORMATTER
  // Backend sends ISO 8601, frontend displays in Vietnamese format
  // ─────────────────────────────────────────────────────

  /**
   * Format ISO 8601 timestamp to display format.
   * @param {string} isoString - e.g. "2026-05-21T03:08:03.538Z"
   * @param {'full'|'date'|'time'|'vietnamese'} [format='vietnamese']
   * @returns {string} e.g. "13:05:54 29-01-2026"
   */
  timestamp(isoString, format = 'vietnamese') {
    if (!isoString) return '—';

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '—';

      // Convert to Vietnam timezone (UTC+7)
      const vnDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));

      const pad = (n) => n.toString().padStart(2, '0');
      const hours   = pad(vnDate.getUTCHours());
      const minutes = pad(vnDate.getUTCMinutes());
      const seconds = pad(vnDate.getUTCSeconds());
      const day     = pad(vnDate.getUTCDate());
      const month   = pad(vnDate.getUTCMonth() + 1);
      const year    = vnDate.getUTCFullYear();

      switch (format) {
        case 'time':        return `${hours}:${minutes}`;
        case 'date':        return `${day}-${month}-${year}`;
        case 'full':        return `${hours}:${minutes} ${day}-${month}-${year}`;
        case 'vietnamese':  return `${hours}:${minutes} ${day}-${month}-${year}`;
        case 'short':       return `${day}/${month}`;
        case 'datetime':    return `${day}/${month}/${year} ${hours}:${minutes}`;
        default:            return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
      }
    } catch {
      return '—';
    }
  },

  /**
   * Format ISO timestamp as relative time (e.g. "2 phút trước").
   * @param {string} isoString
   * @returns {string}
   */
  relativeTime(isoString) {
    if (!isoString) return '—';

    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours   = Math.floor(diffMinutes / 60);
      const diffDays    = Math.floor(diffHours / 24);

      if (diffSeconds < 60)  return 'Vừa xong';
      if (diffMinutes < 60)  return `${diffMinutes} phút trước`;
      if (diffHours < 24)    return `${diffHours} giờ trước`;
      if (diffDays < 7)      return `${diffDays} ngày trước`;
      return this.timestamp(isoString, 'date');
    } catch {
      return '—';
    }
  },
};

// ─────────────────────────────────────────────────────────────
// 3. ENUM MAPPER
// Maps backend Prisma enum values to Vietnamese display strings.
// These are the EXACT enum values from schema.prisma.
// ─────────────────────────────────────────────────────────────

const EnumMapper = {
  /**
   * Map SIGNAL_STATUS enum to display string.
   * Backend values: DRAFT, PUBLISHED, REACHED_TARGET, CUT_LOSS, CLOSED
   * @param {string} status
   * @returns {{ label: string, color: string, cssClass: string }}
   */
  signalStatus(status) {
    const map = {
      DRAFT:          { label: 'Nháp',        color: '#94a3b8', cssClass: 'badge-draft' },
      PUBLISHED:      { label: 'ENTRY',        color: '#6ee7b7', cssClass: 'badge-entry' },
      REACHED_TARGET: { label: 'TARGET',       color: '#fbbf24', cssClass: 'badge-target' },
      CUT_LOSS:       { label: 'CUT LOSS',     color: '#f87171', cssClass: 'badge-cutloss' },
      CLOSED:         { label: 'Đóng',         color: '#64748b', cssClass: 'badge-closed' },
    };
    return map[status] || { label: status, color: '#94a3b8', cssClass: '' };
  },

  /**
   * Map SIGNAL_DIRECTION enum to display string.
   * Backend values: BUY, SELL
   */
  signalDirection(direction) {
    return direction === 'BUY' ? 'MUA' : direction === 'SELL' ? 'BÁN' : direction;
  },

  /**
   * Map SUBSCRIPTION_TIER enum to Vietnamese tier name.
   * Backend values: STANDARD, SILVER, GOLD, DIAMOND
   */
  subscriptionTier(tier) {
    const map = {
      STANDARD: { label: 'Standard', icon: '⭐', color: '#64748b' },
      SILVER:   { label: 'Pro',       icon: '🥈', color: '#94a3b8' },
      GOLD:     { label: 'V.I.P',     icon: '🥇', color: '#fbbf24' },
      DIAMOND:  { label: 'Diamond',   icon: '💎', color: '#a78bfa' },
    };
    return map[tier] || { label: tier, icon: '', color: '#64748b' };
  },

  /**
   * Map EXCHANGE_CODE enum to display string.
   * Backend values: HOSE, HNX, UPCOM
   */
  exchangeCode(code) {
    return code; // Already display-ready
  },

  /**
   * Map ALERT_CONDITION enum to Vietnamese label.
   * Backend values: PRICE_ABOVE, PRICE_BELOW, VOLUME_SPIKE, PCT_CHANGE_UP, PCT_CHANGE_DOWN
   */
  alertCondition(condition) {
    const map = {
      PRICE_ABOVE:    'Giá vượt ngưỡng',
      PRICE_BELOW:    'Giá dưới ngưỡng',
      VOLUME_SPIKE:   'Khối lượng đột biến',
      PCT_CHANGE_UP:  '% tăng vượt ngưỡng',
      PCT_CHANGE_DOWN:'% giảm vượt ngưỡng',
    };
    return map[condition] || condition;
  },

  /**
   * Map BLOG_STATUS enum to Vietnamese label.
   * Backend values: DRAFT, PENDING_REVIEW, PUBLISHED, UNPUBLISHED
   */
  blogStatus(status) {
    const map = {
      DRAFT:          { label: 'Nháp',           color: '#94a3b8' },
      PENDING_REVIEW: { label: 'Chờ duyệt',      color: '#fbbf24' },
      PUBLISHED:      { label: 'Đã đăng',         color: '#6ee7b7' },
      UNPUBLISHED:    { label: 'Ngừng đăng',      color: '#f87171' },
    };
    return map[status] || { label: status, color: '#94a3b8' };
  },

  /**
   * Map SIGNAL_STRATEGY enum to display string.
   * Backend values: SHORT_TERM, MEDIUM_TERM, LONG_TERM
   */
  signalStrategy(strategy) {
    const map = {
      SHORT_TERM:  { label: 'NGẮN HẠN', cssClass: 'badge-short' },
      MEDIUM_TERM: { label: 'TRUNG HẠN', cssClass: 'badge-longterm' },
      LONG_TERM:   { label: 'DÀI HẠN',  cssClass: 'badge-longterm' },
    };
    return map[strategy] || { label: strategy, cssClass: '' };
  },
};

// ─────────────────────────────────────────────────────────────
// 4. ERROR TRANSLATOR
// Maps backend error codes to Vietnamese user-facing messages.
// Aligned with GlobalExceptionFilter error codes.
// ─────────────────────────────────────────────────────────────

const ErrorTranslator = {
  /**
   * Translate a backend error (FintopApiError or raw error) to
   * a user-friendly Vietnamese message object.
   *
   * @param {Object} err - FintopApiError or { statusCode, code, message }
   * @returns {{ title: string, message: string, actionLabel: string|null }}
   */
  translate(err) {
    const code = err?.code || 'UNKNOWN_ERROR';
    const statusCode = err?.statusCode || 0;
    const errMsg = err?.message || '';

    if (errMsg === 'EMAIL_NOT_VERIFIED') {
      return {
        title: 'Chưa xác thực email',
        message: 'Tài khoản chưa được kích hoạt. Vui lòng nhập mã OTP đã được gửi đến email của bạn.',
        actionLabel: 'Xác thực ngay'
      };
    }

    // Specific backend error codes
    const codeMap = {
      'SESSION_EXPIRED':      { title: 'Phiên hết hạn',       message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', actionLabel: 'Đăng nhập' },
      'NO_REFRESH_TOKEN':     { title: 'Chưa đăng nhập',      message: 'Vui lòng đăng nhập để tiếp tục.', actionLabel: 'Đăng nhập' },
      'INVALID_TOKEN_RESPONSE':{ title: 'Lỗi máy chủ',       message: 'Có lỗi trong quá trình xác thực. Vui lòng thử lại.', actionLabel: 'Thử lại' },
      'TIMEOUT':              { title: 'Hết thời gian',        message: 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.', actionLabel: 'Thử lại' },
      'NETWORK_ERROR':        { title: 'Lỗi kết nối',          message: 'Không thể kết nối đến máy chủ. Kiểm tra mạng và thử lại.', actionLabel: 'Thử lại' },
      'NOT_FOUND':            { title: 'Không tìm thấy',       message: 'Nội dung bạn tìm kiếm không tồn tại.', actionLabel: null },
      'PARSE_ERROR':          { title: 'Lỗi dữ liệu',          message: 'Phản hồi từ máy chủ không hợp lệ.', actionLabel: 'Thử lại' },
    };

    if (codeMap[code]) return codeMap[code];

    // Status code fallbacks
    const statusMap = {
      0:   { title: 'Mất kết nối',   message: 'Không thể kết nối đến máy chủ.', actionLabel: 'Thử lại' },
      400: { title: 'Yêu cầu không hợp lệ', message: err?.message || 'Dữ liệu gửi lên không hợp lệ.', actionLabel: null },
      401: { title: 'Chưa đăng nhập', message: 'Vui lòng đăng nhập để thực hiện thao tác này.', actionLabel: 'Đăng nhập' },
      403: { title: 'Không có quyền', message: 'Bạn không có quyền thực hiện thao tác này.', actionLabel: null },
      404: { title: 'Không tìm thấy', message: 'Tài nguyên không tồn tại.', actionLabel: null },
      409: { title: 'Xung đột dữ liệu', message: err?.message || 'Dữ liệu đã tồn tại.', actionLabel: null },
      422: { title: 'Dữ liệu không hợp lệ', message: err?.message || 'Vui lòng kiểm tra lại thông tin.', actionLabel: null },
      429: { title: 'Quá nhiều yêu cầu', message: 'Vui lòng chờ một chút và thử lại.', actionLabel: 'Thử lại' },
      500: { title: 'Lỗi máy chủ',    message: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.', actionLabel: 'Thử lại' },
      503: { title: 'Dịch vụ gián đoạn', message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.', actionLabel: null },
    };

    return statusMap[statusCode] || {
      title: 'Đã xảy ra lỗi',
      message: err?.message || 'Vui lòng thử lại sau.',
      actionLabel: null,
    };
  },

  /**
   * Display a toast/notification for an error.
   * Integrates with the existing UI — falls back to console.error.
   * @param {Object} err
   */
  showErrorToast(err) {
    const { title, message } = this.translate(err);
    const fullMessage = `${title}: ${message}`;

    if (FintopEnv.DEBUG) {
      console.error('[ErrorTranslator]', fullMessage, err);
    }

    // TODO: Replace with proper toast in Phase-2B when UI integration begins
    // For now, emit on AppState for any listening UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fintop:error', {
        detail: { title, message, original: err },
      }));
    }
  },
};

// ─────────────────────────────────────────────────────────────
// 5. RETRY UTILITY
// Standalone retry for cases outside the API client (e.g. WS ops)
// ─────────────────────────────────────────────────────────────

const Retry = {
  /**
   * Execute an async function with exponential backoff retry.
   * @template T
   * @param {() => Promise<T>} fn - The async function to retry
   * @param {number} [maxAttempts=3]
   * @param {number} [baseDelayMs=500]
   * @param {(err: Error) => boolean} [shouldRetry] - Optional predicate
   * @returns {Promise<T>}
   */
  async withRetry(fn, maxAttempts = 3, baseDelayMs = 500, shouldRetry = null) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;

        // Check if we should retry this error
        if (shouldRetry && !shouldRetry(err)) throw err;

        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },

  /**
   * Sleep for a number of milliseconds.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

// ─────────────────────────────────────────────────────────────
// 6. DOM UTILITIES
// Small helpers for common DOM operations
// ─────────────────────────────────────────────────────────────

const DomUtils = {
  /**
   * Set text content of an element safely.
   * @param {string|HTMLElement} target - Selector or element
   * @param {string} text
   */
  setText(target, text) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.textContent = text ?? '—';
  },

  /**
   * Set inner HTML of an element safely.
   * @param {string|HTMLElement} target
   * @param {string} html
   */
  setHtml(target, html) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.innerHTML = html || '';
  },

  /**
   * Toggle CSS class on an element based on condition.
   * @param {string|HTMLElement} target
   * @param {string} className
   * @param {boolean} condition
   */
  toggleClass(target, className, condition) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.classList.toggle(className, condition);
  },

  /**
   * Show loading skeleton on an element.
   * @param {string|HTMLElement} target
   */
  showSkeleton(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.classList.add('fintop-skeleton');
      el.setAttribute('aria-busy', 'true');
    }
  },

  /**
   * Remove loading skeleton from an element.
   * @param {string|HTMLElement} target
   */
  hideSkeleton(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.classList.remove('fintop-skeleton');
      el.removeAttribute('aria-busy');
    }
  },
};

export { Formatter, EnumMapper, ErrorTranslator, Retry, DomUtils };
export default { Formatter, EnumMapper, ErrorTranslator, Retry, DomUtils };
