/**
 * market.js — Dữ liệu chứng khoán (Stock Data Financial Module)
 * ============================================================
 * Admin nhập liệu chứng khoán dùng chung cho trang Tra cứu và Bộ lọc.
 *
 * Features matching legacy web:
 *   - Full analysis table: STT, Mã CP, Sàn, Ngành HĐKD,
 *     Cán bộ, Update time, Dữ liệu kỹ thuật lịch sử (Model), Trạng thái Model,
 *     Sức mạnh xu hướng, vùng kỹ thuật, Thứ tự
 *   - Toolbar: Thêm/Xóa CP, Lọc Trạng thái Model, Lọc nhóm ngành, Tìm kiếm mã CP
 *   - Toggle biểu đồ (Fireant iframe)
 *   - Inline edit (double click to edit cell)
 *   - Edit button per row
 *   - Checkbox select all/individual
 *   - Up/Down reorder
 *   - Data type filter: Dữ liệu cổ phiếu / TOP Cổ Phiếu
 */
import { esc, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;
const DELTA_RSI_HELP_TEXT = 'Biên độ dao động RSI, ghi nhận giá trị trong khoảng RSI 35-65 trên thang điểm 100.';
const STRENGTH_HELP_TEXT = 'Ghi nhận giá trị khi ΔRSI > 0 và Trạng thái Model thuộc "Khả quan", "Tích cực", "Rất tích cực". Gán nhãn "Tăng", "Tăng dần", "Tăng mạnh" theo tốc độ tăng của RSI/MFI - Dòng tiền và biên độ ΔRSI.';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const INDUSTRY_GROUPS = [
  { code: 'BBBL', label: 'Bán buôn, bán lẻ' },
  { code: 'BL', label: 'Bán lẻ' },
  { code: 'BH', label: 'Bảo hiểm' },
  { code: 'BDS', label: 'Bất động sản' },
  { code: 'BDSKCN', label: 'BĐS - KCN' },
  { code: 'CK', label: 'Chứng khoán' },
  { code: 'CNTT', label: 'Công nghệ thông tin' },
  { code: 'DAU', label: 'Dầu khí' },
  { code: 'DM', label: 'Dệt may' },
  { code: 'DPYT', label: 'Dược phẩm - Y tế' },
  { code: 'DN', label: 'Đa ngành' },
  { code: 'HK', label: 'Hàng không' },
  { code: 'KSAN', label: 'Khai khoáng' },
  { code: 'NLDN', label: 'Năng lượng/Điện/Nước' },
  { code: 'BANK', label: 'Ngân Hàng' },
  { code: 'PBDK', label: 'Phân bón' },
  { code: 'SNNNCN', label: 'Sản xuất NN/CN' },
  { code: 'THEPVL', label: 'Thép - Vật liệu' },
  { code: 'TP', label: 'Thực phẩm' },
  { code: 'TS', label: 'Thủy sản' },
  { code: 'VTB', label: 'Vận tải biển' },
  { code: 'VTK', label: 'Vận tải kho' },
  { code: 'VT', label: 'Viễn thông' },
  { code: 'XD', label: 'Xây dựng' },
  { code: 'XNK', label: 'Xuất nhập khẩu' },
];

const ACTION_FILTERS = [
  { code: 'RẤT TÍCH CỰC', label: 'Rất tích cực' },
  { code: 'TÍCH CỰC', label: 'Tích cực' },
  { code: 'KHẢ QUAN', label: 'Khả quan' },
  { code: 'TRUNG LẬP', label: 'Trung lập' },
  { code: 'KO TÍCH CỰC', label: 'Ko tích cực' },
  { code: 'TIÊU CỰC', label: 'Tiêu cực' },
];

const TREND_STRENGTH_OPTIONS = [
  { code: '', label: '—' },
  { code: 'TĂNG MẠNH', label: 'TĂNG MẠNH' },
  { code: 'TĂNG', label: 'TĂNG' },
  { code: 'TĂNG DẦN', label: 'TĂNG DẦN' }
];

function actBadge(act) {
  if (!act) return '—';
  const norm = act.trim().toUpperCase();
  let bg = 'rgba(148, 163, 184, 0.15)';
  let fg = '#94A3B8';

  if (norm === 'RẤT TÍCH CỰC') {
    bg = 'rgba(168, 85, 247, 0.2)'; // Purple soft
    fg = '#c084fc';
  } else if (norm === 'TÍCH CỰC') {
    bg = 'rgba(16, 185, 129, 0.2)'; // Green soft
    fg = '#10B981';
  } else if (norm === 'KHẢ QUAN') {
    bg = 'rgba(132, 204, 22, 0.2)'; // Lime green soft
    fg = '#84CC16';
  } else if (norm === 'TRUNG LẬP') {
    bg = 'rgba(59, 130, 246, 0.2)'; // Blue soft
    fg = '#3B82F6';
  } else if (norm === 'KO TÍCH CỰC') {
    bg = 'rgba(245, 158, 11, 0.2)'; // Orange soft
    fg = '#F59E0B';
  } else if (norm === 'TIÊU CỰC') {
    bg = 'rgba(239, 68, 68, 0.2)'; // Red soft
    fg = '#EF4444';
  }

  return `<span class="admin-badge" style="background:${bg}; color:${fg}; border:1px solid ${fg}33; font-weight:700; padding:2px 4px; border-radius:6px; font-size:0.72rem; display:inline-block; max-width:100%; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(act)}</span>`;
}

function getBadgeSelectStyle(act) {
  if (!act) {
    return `background: rgba(148, 163, 184, 0.15); color: #94A3B8; border: 1px solid rgba(148, 163, 184, 0.2); width: 100%; max-width: 100%; box-sizing: border-box; text-align: center; text-align-last: center; font-size: 0.72rem; padding: 3px 2px; white-space: normal; word-break: break-word;`;
  }
  const norm = act.trim().toUpperCase();
  let bg = 'rgba(148, 163, 184, 0.15)';
  let fg = '#94A3B8';

  if (norm === 'RẤT TÍCH CỰC') {
    bg = 'rgba(168, 85, 247, 0.2)'; // Purple soft
    fg = '#c084fc';
  } else if (norm === 'TÍCH CỰC') {
    bg = 'rgba(16, 185, 129, 0.2)'; // Green soft
    fg = '#10B981';
  } else if (norm === 'KHẢ QUAN') {
    bg = 'rgba(132, 204, 22, 0.2)'; // Lime green soft
    fg = '#84CC16';
  } else if (norm === 'TRUNG LẬP') {
    bg = 'rgba(59, 130, 246, 0.2)'; // Blue soft
    fg = '#3B82F6';
  } else if (norm === 'KO TÍCH CỰC') {
    bg = 'rgba(245, 158, 11, 0.2)'; // Orange soft
    fg = '#F59E0B';
  } else if (norm === 'TIÊU CỰC') {
    bg = 'rgba(239, 68, 68, 0.2)'; // Red soft
    fg = '#EF4444';
  }

  return `background: ${bg}; color: ${fg}; border: 1px solid ${fg}33; width: 100%; max-width: 100%; box-sizing: border-box; text-align: center; text-align-last: center; font-size: 0.72rem; padding: 3px 2px; white-space: normal; word-break: break-word;`;
}


function getStatusClass(act) {
  const norm = (act || '').toUpperCase();
  if (norm === 'RẤT TÍCH CỰC') return 'very-positive';
  if (norm === 'TÍCH CỰC') return 'positive';
  if (norm === 'KHẢ QUAN') return 'ok';
  if (norm === 'TRUNG LẬP') return 'neutral';
  if (norm === 'KO TÍCH CỰC') return 'negative';
  if (norm === 'TIÊU CỰC') return 'negative';
  return 'neutral';
}

function formatSyncTime(updatedAtStr) {
  const pad = (n) => String(n).padStart(2, '0');
  if (!updatedAtStr) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}`;
    return `${timeStr} ${dateStr}`;
  }

  const raw = String(updatedAtStr)
    .trim()
    .replace(/\\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(\d{1,2})h(\d{2})/i, '$1:$2');

  const match = raw.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s+(\d{1,2})[/-](\d{1,2})/);
  if (match) {
    return `${pad(match[1])}:${match[2]} ${pad(match[3])}/${pad(match[4])}`;
  }

  const parsed = new Date(updatedAtStr);
  if (!Number.isNaN(parsed.getTime())) {
    return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())} ${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}`;
  }

  return raw.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
}

let container = null;
let showChart = false;
let selectedActions = new Set();
let selectedStrengths = new Set();
let selectedIndustries = new Set();
let searchQuery = '';
let dataType = 'DATA'; // DATA or TIN_HIEU
let actionDropdownVisible = false;
let strengthDropdownVisible = false;
let industryDropdownVisible = false;
let documentClickHandler = null;
let stockData = []; // Mock/API data

// ─── Column/Row Resize State ───
let resizeMode = false;
let pendingColWidths = null; // { colIndex: widthPx, ... } — preview state before OK
let savedColWidths = loadSavedColWidths(); // confirmed widths from localStorage
let pendingRowHeights = null; // { rowIndex: heightPx, ... }
let savedRowHeights = loadSavedRowHeights();

function loadSavedColWidths() {
  try {
    const raw = localStorage.getItem('fintop_admin_table_col_widths');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed['10'] && parsed['10'] < 155) {
      delete parsed['10'];
    }
    return parsed;
  } catch { return null; }
}
function loadSavedRowHeights() {
  try {
    const raw = localStorage.getItem('fintop_admin_table_row_heights');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function persistColWidths(widths) {
  localStorage.setItem('fintop_admin_table_col_widths', JSON.stringify(widths));
}
function persistRowHeights(heights) {
  localStorage.setItem('fintop_admin_table_row_heights', JSON.stringify(heights));
}

// ─────────────────────────────────────────────────────────────
// SEED DATA (mock from legacy web scrape)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// INIT & LOAD
// ─────────────────────────────────────────────────────────────

async function loadStockData() {
  try {
    const res = await API().get('/market/stocks');
    const apiStocks = res.data || res || [];
    stockData = apiStocks.map(s => ({
      id: s.id,
      order: s.order || 0,
      code_cp: s.ticker,
      exchange: s.exchange,
      industry: s.industry,
      analyst: s.officer || '',
      updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(s.updated_at).toLocaleDateString('vi-VN') : '',
      ratings_TA: '',
      identify_trend: s.model_desc || '',
      act: s.statusText || '',
      delta_rsi: s.delta_rsi || '',
      rsi_mfi: s.trend || '',
      trading_price_range: s.validation_zone || '',
      resistance_range: s.resistance_zone || '',
      support_range: s.support_zone || '',
      top_status: s.top_status || 0
    }));
  } catch (err) {
    console.error('Error fetching stocks from backend:', err);
    showToast('Không thể kết nối API lấy danh sách cổ phiếu.', 'error');
    stockData = [];
  }
}

async function saveStockField(sid, field, value) {
  try {
    const backendFieldMap = {
      order: 'order',
      code_cp: 'symbol',
      exchange: 'exchange',
      industry: 'industry',
      analyst: 'analyst',
      identify_trend: 'identify_trend',
      act: 'act',
      delta_rsi: 'delta_rsi',
      rsi_mfi: 'rsi_mfi',
      trading_price_range: 'trading_price_range',
      resistance_range: 'resistance_range',
      support_range: 'support_range',
      top_status: 'top_status'
    };
    const key = backendFieldMap[field];
    if (key) {
      const res = await API().put(`/market/stocks/${sid}`, { [key]: value });
      const updatedStock = res.data || res;
      const stock = stockData.find(s => String(s.id) === String(sid));
      if (stock) {
        if (updatedStock && updatedStock.updated_at) {
          stock.updatedAt = new Date(updatedStock.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(updatedStock.updated_at).toLocaleDateString('vi-VN');
        } else {
          stock.updatedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
        }
      }
      showToast('Đã cập nhật thay đổi thành công.');
      return updatedStock;
    }
  } catch (err) {
    console.error('Error updating stock field:', err);
    showToast('Lỗi lưu thay đổi lên backend!', 'error');
    throw err;
  }
}

async function syncUserPageData() {
  try {
    const payload = {
      stocks: stockData.map(s => ({
        id: s.id,
        order: s.order,
        top_status: s.top_status,
        identify_trend: s.identify_trend,
        act: s.act,
        delta_rsi: s.delta_rsi,
        rsi_mfi: s.rsi_mfi,
        trading_price_range: s.trading_price_range,
        resistance_range: s.resistance_range,
        support_range: s.support_range
      }))
    };
    await API().post('/market/stocks/bulk', payload);

    const filterSyncData = stockData.map(s => ({
      ticker: s.code_cp,
      san: s.exchange,
      nganh: s.industry,
      canBo: s.analyst || 'FinTop DATA',
      time: formatSyncTime(s.updatedAt),
      desc: s.identify_trend || '',
      status: getStatusClass(s.act),
      statusText: s.act || '',
      modelResult: s.act || '',
      deltaRsi: s.delta_rsi || '',
      trend: s.rsi_mfi || '',
      vungKiemDinh: s.trading_price_range || '',
      khangCu: s.resistance_range || '',
      hoTro: s.support_range || ''
    }));

    const searchSyncData = {};
    stockData.forEach(s => {
      searchSyncData[s.code_cp] = {
        san: s.exchange,
        nganh: s.industry,
        time: formatSyncTime(s.updatedAt),
        desc: s.identify_trend || '',
        status: getStatusClass(s.act),
        statusText: s.act || ''
      };
    });

    localStorage.setItem('fintop_stock_filter_sync', JSON.stringify(filterSyncData));
    localStorage.setItem('fintop_stock_search_sync', JSON.stringify(searchSyncData));

    showToast('Đã lưu dữ liệu vào database và đồng bộ thành công sang trang người dùng!');
  } catch (err) {
    console.error('Error syncing stock data to user page:', err);
    showToast('Lỗi đồng bộ dữ liệu chứng khoán!', 'error');
  }
}

// ─────────────────────────────────────────────────────────────
// FILTER LOGIC
// ─────────────────────────────────────────────────────────────

function getFilteredData() {
  let filtered = [...stockData];

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toUpperCase();
    filtered = filtered.filter(s => s.code_cp.toUpperCase().includes(q));
  }

  // Action filter
  if (selectedActions.size > 0) {
    filtered = filtered.filter(s => {
      const actNorm = (s.act || '').toUpperCase().replace(/\s+/g, '_');
      return selectedActions.has(actNorm) || selectedActions.has(s.act);
    });
  }

  // Strength filter (Lọc Sức mạnh XH)
  if (selectedStrengths.size > 0) {
    filtered = filtered.filter(s => {
      const rsiMfiNorm = (s.rsi_mfi || '').trim().toUpperCase();
      return selectedStrengths.has(rsiMfiNorm) || selectedStrengths.has(s.rsi_mfi);
    });
  }

  // Industry filter
  if (selectedIndustries.size > 0) {
    filtered = filtered.filter(s => {
      return INDUSTRY_GROUPS.some(ig => selectedIndustries.has(ig.code) && s.industry === ig.label);
    });
  }

  // Data type filter
  if (dataType === 'TIN_HIEU') {
    filtered = filtered.filter(s => s.top_status && s.top_status > 0);
  }

  return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// ─────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────

function renderAll() {
  if (!container) return;

  // Preserve scroll position before re-rendering
  const scrollEl = container.querySelector('.df-table-scroll');
  const savedScrollTop = scrollEl ? scrollEl.scrollTop : 0;
  const savedScrollLeft = scrollEl ? scrollEl.scrollLeft : 0;
  const savedWindowScrollY = window.scrollY || document.documentElement.scrollTop;

  const activeEl = document.activeElement;
  let activeSid = null;
  let activeField = null;
  if (activeEl && activeEl.dataset && activeEl.dataset.sid) {
    activeSid = activeEl.dataset.sid;
    activeField = activeEl.dataset.field;
  }

  if (!document.getElementById('market-drag-styles')) {
    const dragStyle = document.createElement('style');
    dragStyle.id = 'market-drag-styles';
    dragStyle.textContent = `
      .df-row-dragging {
        opacity: 0.45;
        background: rgba(124, 58, 237, 0.15) !important;
        outline: 2px dashed #7c3aed !important;
      }
      .df-drag-handle {
        cursor: move;
        cursor: -webkit-grabbing;
        font-size: 1.1rem;
        color: #7c3aed;
        padding: 0 4px;
        user-select: none;
      }
      /* Hide spinner arrows for number inputs in the table */
      .df-table input[type=number]::-webkit-outer-spin-button,
      .df-table input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .df-table input[type=number] {
        -moz-appearance: textfield;
      }
      .df-table .df-delta-rsi-header {
        color: rgba(148, 163, 184, 0.82);
        font-size: 0.68rem;
        font-weight: 600;
      }
      .df-delta-rsi-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        cursor: pointer;
      }
      .df-delta-rsi-hover-box {
        position: absolute;
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        width: 240px;
        padding: 9px 12px;
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 8px;
        background: #12101d;
        color: #e2e8f0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
        font-size: 0.75rem;
        font-weight: 400;
        line-height: 1.45;
        text-align: left;
        white-space: normal;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }
      .df-delta-rsi-wrapper:hover .df-delta-rsi-hover-box {
        opacity: 1;
        visibility: visible;
      }
      /* ── Column / Row Resize Mode ── */
      .df-table th,
      .df-table td {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        vertical-align: middle;
      }
      .df-table.resize-mode {
        user-select: none;
        table-layout: fixed;
        width: 100%;
      }
      .df-table.resize-mode th,
      .df-table.resize-mode td {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        overflow: visible;
        text-overflow: clip;
      }
      .df-direct-input,
      .df-premium-select,
      .df-premium-input,
      .df-premium-select-badge,
      .df-industry-select {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      .df-table.resize-mode th {
        position: relative;
      }
      .df-col-resize-handle {
        position: absolute;
        right: -4px;
        top: 0;
        bottom: 0;
        width: 8px;
        cursor: col-resize;
        z-index: 20;
        background: transparent;
        transition: background 0.12s;
      }
      .df-col-resize-handle::after {
        content: '';
        position: absolute;
        right: 3px;
        top: 15%;
        bottom: 15%;
        width: 2px;
        background: rgba(168, 85, 247, 0.35);
        border-radius: 1px;
      }
      .df-col-resize-handle:hover,
      .df-col-resize-handle.active {
        background: rgba(168, 85, 247, 0.18);
      }
      .df-col-resize-handle:hover::after,
      .df-col-resize-handle.active::after {
        background: #a855f7;
        width: 3px;
      }
      .df-row-resize-handle {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 8px;
        cursor: row-resize;
        z-index: 20;
        background: transparent;
        transition: background 0.12s;
      }
      .df-row-resize-handle::after {
        content: '';
        position: absolute;
        bottom: 3px;
        left: 15%;
        right: 15%;
        height: 2px;
        background: rgba(168, 85, 247, 0.35);
        border-radius: 1px;
      }
      .df-row-resize-handle:hover,
      .df-row-resize-handle.active {
        background: rgba(168, 85, 247, 0.18);
      }
      .df-row-resize-handle:hover::after,
      .df-row-resize-handle.active::after {
        background: #a855f7;
        height: 3px;
      }
      .df-table.resize-mode td,
      .df-table.resize-mode th {
        border-right: 1px dashed rgba(168,85,247,0.2) !important;
        border-bottom: 1px dashed rgba(168,85,247,0.15) !important;
      }
      .df-table.resize-mode tbody tr {
        position: relative;
      }
      /* When saved widths exist, use fixed layout too */
      .df-table.has-saved-widths {
        table-layout: fixed;
        width: 100%;
      }
      .df-resize-toolbar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: rgba(168, 85, 247, 0.12);
        border: 1px solid rgba(168, 85, 247, 0.35);
        border-radius: 8px;
        margin-left: 6px;
        animation: dfResizePulse 2s infinite;
      }
      @keyframes dfResizePulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.18); }
        50% { box-shadow: 0 0 8px 2px rgba(168, 85, 247, 0.25); }
      }
      .df-resize-ok {
        background: linear-gradient(135deg, #10B981, #059669) !important;
        border: none !important;
        color: #fff !important;
        font-weight: 700;
        padding: 4px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.78rem;
      }
      .df-resize-cancel {
        background: rgba(239, 68, 68, 0.15) !important;
        border: 1px solid rgba(239, 68, 68, 0.4) !important;
        color: #ef4444 !important;
        font-weight: 600;
        padding: 4px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.78rem;
      }
      .df-resize-reset {
        background: rgba(148, 163, 184, 0.1) !important;
        border: 1px solid rgba(148, 163, 184, 0.3) !important;
        color: #94A3B8 !important;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.72rem;
      }
    `;
    document.head.appendChild(dragStyle);
  }

  const filtered = getFilteredData();

  container.innerHTML = `
    <!-- Top Bar actions -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;margin-bottom:0.5rem;">
      <div></div>
      <div style="display:flex;align-items:center;gap:15px;">
        <label style="cursor:pointer;display:flex;align-items:center;gap:6px;color:#ff9f00;font-family:serif;font-size:0.9rem;margin:0;">
          <input type="checkbox" id="toggle-chart" ${showChart ? 'checked' : ''} />
          Ẩn hiện biểu đồ
        </label>
        <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-sync-user-page" style="background: linear-gradient(135deg, #10B981, #059669); border: none; font-weight: bold; color: white; padding: 6px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);" title="Lưu và đồng bộ dữ liệu sang trang người dùng">
          🔄 Lưu & Đồng bộ người dùng
        </button>
      </div>
    </div>

    <!-- Chart Area -->
    <div id="chart-area" style="display:${showChart ? 'block' : 'none'};margin-bottom:1rem;">
      <div style="border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;">
        <iframe style="width:100%;border:none;" height="550" src="https://fireant.vn/charts" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="df-toolbar" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:0.75rem;">
      <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-add-stock" title="Thêm cổ phiếu">➕</button>
      <button class="admin-btn admin-btn-danger admin-btn-sm" id="btn-delete-stock" title="Xóa cổ phiếu đã chọn">🗑️</button>

      <!-- 1. Action Filter (Lọc Trạng thái Model) -->
      <div class="df-filter-group" style="position:relative;">
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-toggle-action-filter" style="min-width:130px;">
          Lọc Trạng thái Model ${selectedActions.size > 0 ? `<span style="color:#f59e0b">(${selectedActions.size})</span>` : ''}
        </button>
        <div id="action-filter-dropdown" class="df-filter-dropdown" style="display:${actionDropdownVisible ? 'block' : 'none'};position:absolute;top:100%;left:0;z-index:1010;width:180px;border:1px solid #5e72e4;background:var(--bg-card);border-radius:0 0 6px 6px;padding:4px 0;max-height:250px;overflow-y:auto;">
          ${ACTION_FILTERS.map(af => `
            <label style="display:block;padding:4px 10px;cursor:pointer;font-size:0.82rem;" class="df-filter-label">
              <input type="checkbox" class="action-filter-chk" value="${af.code}" ${selectedActions.has(af.code) ? 'checked' : ''} />
              <span>${esc(af.label)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- 2. Strength Filter (Lọc Sức mạnh XH) -->
      <div class="df-filter-group" style="position:relative;">
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-toggle-strength-filter" style="min-width:130px;">
          Lọc Sức mạnh XH ${selectedStrengths.size > 0 ? `<span style="color:#f59e0b">(${selectedStrengths.size})</span>` : ''}
        </button>
        <div id="strength-filter-dropdown" class="df-filter-dropdown" style="display:${strengthDropdownVisible ? 'block' : 'none'};position:absolute;top:100%;left:0;z-index:1010;width:180px;border:1px solid #5e72e4;background:var(--bg-card);border-radius:0 0 6px 6px;padding:4px 0;max-height:250px;overflow-y:auto;">
          ${TREND_STRENGTH_OPTIONS.map(st => `
            <label style="display:block;padding:4px 10px;cursor:pointer;font-size:0.82rem;" class="df-filter-label">
              <input type="checkbox" class="strength-filter-chk" value="${st.code}" ${selectedStrengths.has(st.code) ? 'checked' : ''} />
              <span>${esc(st.label)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- 3. Industry Filter (Lọc nhóm ngành) -->
      <div class="df-filter-group" style="position:relative;">
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-toggle-industry-filter" style="min-width:130px;">
          Lọc nhóm ngành ${selectedIndustries.size > 0 ? `<span style="color:#f59e0b">(${selectedIndustries.size})</span>` : ''}
        </button>
        <div id="industry-filter-dropdown" class="df-filter-dropdown" style="display:${industryDropdownVisible ? 'block' : 'none'};position:absolute;top:100%;left:0;z-index:1010;width:220px;border:1px solid #5e72e4;background:var(--bg-card);border-radius:0 0 6px 6px;padding:4px 0;max-height:250px;overflow-y:auto;">
          ${INDUSTRY_GROUPS.map(ig => `
            <label style="display:block;padding:4px 10px;cursor:pointer;font-size:0.82rem;" class="df-filter-label">
              <input type="checkbox" class="industry-filter-chk" value="${ig.code}" ${selectedIndustries.has(ig.code) ? 'checked' : ''} />
              <span>${esc(ig.label)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Column/Row Resize Toggle -->
      <button class="admin-btn admin-btn-sm" id="btn-toggle-resize" style="min-width:auto; ${resizeMode ? 'background:rgba(168,85,247,0.25);border-color:#a855f7;color:#c084fc;' : 'background:rgba(148,163,184,0.1);border:1px solid rgba(148,163,184,0.2);color:#94A3B8;'}" title="Bật/tắt chế độ chỉnh kích thước cột & hàng">
        📐 Chỉnh bảng
      </button>
      ${resizeMode ? `
        <div class="df-resize-toolbar">
          <span style="color:#c084fc;font-size:0.75rem;font-weight:600;">↔ Kéo viền cột/hàng để chỉnh</span>
          <button class="df-resize-ok" id="btn-resize-ok" title="Xác nhận kích thước mới">✓ OK</button>
          <button class="df-resize-cancel" id="btn-resize-cancel" title="Hủy thay đổi">✕ Hủy</button>
          <button class="df-resize-reset" id="btn-resize-reset" title="Đặt lại kích thước mặc định">↩ Mặc định</button>
        </div>
      ` : ''}

      <!-- Search -->
      <div style="display:flex;align-items:center;gap:0;margin-left:auto;">
        <input type="text" class="admin-search" id="df-search" placeholder="Tìm kiếm mã CP" value="${esc(searchQuery)}" style="min-width:160px;border-radius:6px 0 0 6px;" />
        ${searchQuery ? `<span id="df-clear-search" style="cursor:pointer;padding:0 8px;color:#ff9f00;font-size:1rem;line-height:2;" title="Xóa tìm kiếm"> ✕ </span>` : ''}
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="df-search-btn" style="border-radius:0 6px 6px 0;">🔍</button>
      </div>
    </div>

    <!-- Data Table -->
    <div style="overflow-x:auto;max-height:800px;overflow-y:auto;" class="df-table-scroll">
      <table class="admin-table df-table${resizeMode ? ' resize-mode' : ''}${savedColWidths ? ' has-saved-widths' : ''}" style="font-size:0.8rem;">
        <thead>
          <tr style="position:sticky;top:0;z-index:5;">
            ${buildThCell(0, '2%', '<input type="checkbox" id="chk-all-stocks" />')}
            ${buildThCell(1, '6%', 'STT')}
            ${buildThCell(2, '4%', 'Mã CP')}
            ${buildThCell(3, '3%', 'Sàn')}
            ${buildThCell(4, '7.5%', 'Ngành HĐKD')}
            ${buildThCell(5, '5.5%', 'Kiểm soát DL')}
            ${buildThCell(6, '5.5%', 'Update time')}
            ${buildThCell(7, '14%', 'Dữ liệu kỹ thuật lịch sử (Model)')}
            ${buildThCell(8, '10%', 'Trạng thái Model')}
            ${buildThCell(9, '4.5%', `<div class="df-delta-rsi-wrapper" style="position:relative;display:inline-flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;"><span class="df-delta-rsi-heading">ΔRSI</span><span class="df-delta-rsi-info" id="df-delta-rsi-info">(i)</span><div class="df-delta-rsi-hover-box">${esc(DELTA_RSI_HELP_TEXT)}</div></div>`, 'df-delta-rsi-header')}
            ${buildThCell(10, '13%', `<div class="df-delta-rsi-wrapper" style="position:relative;display:inline-flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;"><span style="display:inline-block;text-align:center;line-height:1.25;"><span style="white-space:normal;word-break:break-word;display:block;">Sức mạnh xu hướng</span><span style="white-space:normal;word-break:break-word;display:block;">RSI/MFI - Dòng tiền <span class="df-delta-rsi-info">(i)</span></span></span><div class="df-delta-rsi-hover-box" style="width:260px;">${esc(STRENGTH_HELP_TEXT)}</div></div>`)}
            ${buildThCell(11, '13%', 'Vùng kiểm định<br/>kỹ thuật')}
            ${buildThCell(12, '13%', 'Vùng kháng cự<br/>kỹ thuật')}
            ${buildThCell(13, '13%', 'Vùng hỗ trợ<br/>kỹ thuật')}
            ${buildThCell(14, '1.5%', '<span id="btn-add-row" style="cursor:pointer;color:var(--purple-glow);" title="Thêm dòng">➕</span>')}
          </tr>
        </thead>
        <tbody id="df-table-body">
          ${filtered.length === 0 ? `
            <tr><td colspan="15" style="text-align:center;padding:2rem;color:var(--text-muted);">Không có dữ liệu phù hợp.</td></tr>
          ` : filtered.map((s, idx) => renderStockRow(s, idx)).join('')}
        </tbody>
      </table>
      <datalist id="industry-datalist">
        ${INDUSTRY_GROUPS.map(ig => `<option value="${esc(ig.label)}"></option>`).join('')}
      </datalist>
    </div>

    <!-- Footer info -->
    <div style="padding:0.5rem 0;font-size:0.78rem;color:var(--text-muted);">
      Có ${filtered.length}/${stockData.length} bản ghi
    </div>
    <div class="df-delta-rsi-tooltip" id="df-delta-rsi-tooltip" role="tooltip" hidden>
      ${esc(DELTA_RSI_HELP_TEXT)}
    </div>
  `;

  bindEvents();

  // Apply saved row heights after render
  if (savedRowHeights) {
    const rows = container.querySelectorAll('#df-table-body tr');
    rows.forEach((row, i) => {
      if (savedRowHeights[String(i)] !== undefined) {
        const h = savedRowHeights[String(i)];
        row.querySelectorAll('td').forEach(td => {
          td.style.height = h + 'px';
        });
      }
    });
  }

  // If resize mode is active, attach interactive resize handlers after DOM paint
  if (resizeMode) {
    requestAnimationFrame(() => attachResizeHandlers());
  }

  // Restore scroll position & focus
  const restoreScroll = () => {
    const newScrollEl = container.querySelector('.df-table-scroll');
    if (newScrollEl) {
      newScrollEl.scrollTop = savedScrollTop;
      newScrollEl.scrollLeft = savedScrollLeft;
    }
    window.scrollTo({ top: savedWindowScrollY, behavior: 'instant' });
  };

  restoreScroll();
  requestAnimationFrame(restoreScroll);

  if (activeSid && activeField) {
    const targetInput = container.querySelector(`[data-sid="${activeSid}"][data-field="${activeField}"]`);
    if (targetInput) {
      try { targetInput.focus(); } catch (e) {}
    }
  }
}

function renderStockRow(s, idx) {
  return `
    <tr data-stock-id="${s.id}" draggable="false">
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;"><input type="checkbox" class="chk-stock-item" value="${s.id}" /></td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <div style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;box-sizing:border-box;">
          <span class="df-drag-handle" style="cursor:move;color:#7c3aed;font-size:1rem;user-select:none;padding:0 2px;" title="Kéo thả để sắp xếp">☰</span>
          <input type="number" class="df-direct-input df-premium-input" data-field="order" data-sid="${s.id}" value="${s.order}" style="width:100%;max-width:35px;text-align:center;padding:3px 2px;box-sizing:border-box;font-size:0.75rem;" />
        </div>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input" data-field="code_cp" data-sid="${s.id}" value="${esc(s.code_cp)}" style="width:100%;max-width:100%;box-sizing:border-box;color:var(--purple-glow);font-weight:600;text-transform:uppercase;text-align:center;padding:3px 2px;font-size:0.75rem;" />
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <select class="df-direct-input df-premium-select" data-field="exchange" data-sid="${s.id}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;">
          <option value="HOSE" ${s.exchange === 'HOSE' ? 'selected' : ''}>HOSE</option>
          <option value="HNX" ${s.exchange === 'HNX' ? 'selected' : ''}>HNX</option>
          <option value="UPCOM" ${s.exchange === 'UPCOM' ? 'selected' : ''}>UPCOM</option>
        </select>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <select class="df-direct-input df-premium-select df-industry-select" data-field="industry" data-sid="${s.id}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;">
          <option value="__CUSTOM__" ${!INDUSTRY_GROUPS.some(ig => ig.label === s.industry) && s.industry ? 'selected' : ''}>
            ${!INDUSTRY_GROUPS.some(ig => ig.label === s.industry) && s.industry ? esc(s.industry) : '✍️ Tự nhập khác...'}
          </option>
          ${INDUSTRY_GROUPS.map(ig => `<option value="${esc(ig.label)}" ${s.industry === ig.label ? 'selected' : ''}>${esc(ig.label)}</option>`).join('')}
        </select>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input" data-field="analyst" data-sid="${s.id}" value="${esc(s.analyst)}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;text-align:center;" />
      </td>
      <td style="text-align:center;vertical-align:middle;color:var(--text-muted);font-size:0.72rem;padding:3px 2px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;max-width:100%;box-sizing:border-box;">
        ${s.updatedAt ? (() => {
          const parts = String(s.updatedAt).trim().split(' ');
          if (parts.length >= 2) {
            return `<div style="font-weight:600;color:#e2e8f0;font-size:0.72rem;line-height:1.1;">${esc(parts[0])}</div><div style="font-size:0.68rem;color:#94a3b8;line-height:1.1;margin-top:2px;">${esc(parts[1])}</div>`;
          }
          return esc(s.updatedAt);
        })() : '—'}
      </td>
      <td style="vertical-align:middle;padding:4px 2px;">
        <textarea class="df-direct-input df-premium-input" data-field="identify_trend" data-sid="${s.id}" rows="3" style="width:100%;max-width:100%;box-sizing:border-box;text-align:left;resize:vertical;line-height:1.35;padding:4px 5px;font-size:0.75rem;min-height:60px;">${esc(s.identify_trend)}</textarea>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <select class="df-direct-input df-premium-select-badge" data-field="act" data-sid="${s.id}" style="${getBadgeSelectStyle(s.act)}">
          <option value="" ${s.act === '' ? 'selected' : ''}>—</option>
          <option value="RẤT TÍCH CỰC" ${s.act === 'RẤT TÍCH CỰC' ? 'selected' : ''}>RẤT TÍCH CỰC</option>
          <option value="TÍCH CỰC" ${s.act === 'TÍCH CỰC' ? 'selected' : ''}>TÍCH CỰC</option>
          <option value="KHẢ QUAN" ${s.act === 'KHẢ QUAN' ? 'selected' : ''}>KHẢ QUAN</option>
          <option value="TRUNG LẬP" ${s.act === 'TRUNG LẬP' ? 'selected' : ''}>TRUNG LẬP</option>
          <option value="KO TÍCH CỰC" ${s.act === 'KO TÍCH CỰC' ? 'selected' : ''}>KO TÍCH CỰC</option>
          <option value="TIÊU CỰC" ${s.act === 'TIÊU CỰC' ? 'selected' : ''}>TIÊU CỰC</option>
        </select>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input df-delta-rsi-input" data-field="delta_rsi"
          data-sid="${s.id}" value="${esc(s.delta_rsi || '')}" placeholder=""
          aria-label="Delta RSI của ${esc(s.code_cp)}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;text-align:center;" />
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <select class="df-direct-input df-premium-select" data-field="rsi_mfi" data-sid="${s.id}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;">
          ${TREND_STRENGTH_OPTIONS.map(opt => `<option value="${esc(opt.code)}" ${s.rsi_mfi === opt.code ? 'selected' : ''}>${esc(opt.label)}</option>`).join('')}
        </select>
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input" data-field="trading_price_range" data-sid="${s.id}" value="${esc(s.trading_price_range || '')}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;text-align:center;" />
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input" data-field="resistance_range" data-sid="${s.id}" value="${esc(s.resistance_range || '')}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;text-align:center;" />
      </td>
      <td style="text-align:center;vertical-align:middle;padding:4px 2px;">
        <input type="text" class="df-direct-input df-premium-input" data-field="support_range" data-sid="${s.id}" value="${esc(s.support_range || '')}" style="width:100%;max-width:100%;box-sizing:border-box;padding:3px 2px;font-size:0.75rem;text-align:center;" />
      </td>
      <td style="text-align:center;vertical-align:middle;">
        <span class="df-edit-row-btn" data-sid="${s.id}" style="cursor:pointer;color:#f59e0b;" title="Sửa dòng">✏️</span>
      </td>
    </tr>
  `;
}

function closeDeltaRsiTooltip() {
  if (!container) return;
  const button = container.querySelector('#df-delta-rsi-info');
  const tooltip = container.querySelector('#df-delta-rsi-tooltip');
  if (!button || !tooltip) return;
  tooltip.hidden = true;
  button.setAttribute('aria-expanded', 'false');
}

function toggleDeltaRsiTooltip() {
  if (!container) return;
  const button = container.querySelector('#df-delta-rsi-info');
  const tooltip = container.querySelector('#df-delta-rsi-tooltip');
  if (!button || !tooltip) return;

  const shouldOpen = tooltip.hidden;
  closeDeltaRsiTooltip();
  if (!shouldOpen) return;

  tooltip.hidden = false;
  button.setAttribute('aria-expanded', 'true');

  const buttonRect = button.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const halfWidth = tooltipRect.width / 2;
  const centerX = Math.min(
    window.innerWidth - halfWidth - 12,
    Math.max(halfWidth + 12, buttonRect.left + (buttonRect.width / 2)),
  );
  const belowTop = buttonRect.bottom + 8;
  const top = belowTop + tooltipRect.height <= window.innerHeight - 12
    ? belowTop
    : Math.max(12, buttonRect.top - tooltipRect.height - 8);

  tooltip.style.left = `${centerX}px`;
  tooltip.style.top = `${top}px`;
}

let dragRowEl = null;

function handleDragStart(e) {
  if (this.getAttribute('draggable') !== 'true') {
    e.preventDefault();
    return;
  }
  dragRowEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.stockId);
  this.classList.add('df-row-dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  
  if (dragRowEl && dragRowEl !== this) {
    const rect = this.getBoundingClientRect();
    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
    this.parentNode.insertBefore(dragRowEl, next ? this.nextSibling : this);
  }
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('df-row-dragging');
  
  // Reorder stockData array based on DOM order
  const rows = Array.from(container.querySelectorAll('#df-table-body tr'));
  const newOrderIds = rows.map(r => r.dataset.stockId).filter(Boolean);
  
  const newStockData = [];
  newOrderIds.forEach((id) => {
    const stock = stockData.find(s => String(s.id) === String(id));
    if (stock) {
      newStockData.push(stock);
    }
  });
  
  stockData = newStockData;
  reorderStocks();
  
  syncNewOrderToBackend();
}

async function syncNewOrderToBackend() {
  try {
    const payload = {
      stocks: stockData.map(s => ({
        id: s.id,
        order: s.order
      }))
    };
    await API().post('/market/stocks/bulk', payload);
    renderAll();
  } catch (err) {
    console.error('Error saving reordered stocks:', err);
    showToast('Lỗi đồng bộ thứ tự kéo thả lên backend!', 'error');
  }
}

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────

function bindEvents() {
  if (!container) return;

  const deltaRsiInfoButton = container.querySelector('#df-delta-rsi-info');
  deltaRsiInfoButton?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDeltaRsiTooltip();
  });
  deltaRsiInfoButton?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDeltaRsiTooltip();
      deltaRsiInfoButton.focus();
    }
  });

  // Drag & Drop Row Reordering
  const dragRows = container.querySelectorAll('#df-table-body tr');
  dragRows.forEach(row => {
    const handle = row.querySelector('.df-drag-handle');
    if (handle) {
      handle.addEventListener('mousedown', () => {
        row.setAttribute('draggable', 'true');
      });
      handle.addEventListener('mouseup', () => {
        row.setAttribute('draggable', 'false');
      });
    }

    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragend', function(e) {
      row.setAttribute('draggable', 'false');
      handleDragEnd.call(this, e);
    });
  });

  // Toggle chart
  container.querySelector('#toggle-chart')?.addEventListener('change', (e) => {
    showChart = e.target.checked;
    const chartArea = container.querySelector('#chart-area');
    if (chartArea) chartArea.style.display = showChart ? 'block' : 'none';
  });

  // Save & Sync button
  container.querySelector('#btn-sync-user-page')?.addEventListener('click', async () => {
    const btn = container.querySelector('#btn-sync-user-page');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ Đang đồng bộ...';
      try {
        await syncUserPageData();
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  });

  // Search
  const searchInput = container.querySelector('#df-search');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { searchQuery = searchInput.value; renderAll(); }
  });
  container.querySelector('#df-search-btn')?.addEventListener('click', () => {
    searchQuery = container.querySelector('#df-search')?.value || '';
    renderAll();
  });
  container.querySelector('#df-clear-search')?.addEventListener('click', () => {
    searchQuery = '';
    renderAll();
  });

  // 1. Action filter toggle (Lọc Trạng thái Model)
  container.querySelector('#btn-toggle-action-filter')?.addEventListener('click', (e) => {
    e.stopPropagation();
    actionDropdownVisible = !actionDropdownVisible;
    strengthDropdownVisible = false;
    industryDropdownVisible = false;
    renderAll();
  });
  container.querySelectorAll('.action-filter-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) selectedActions.add(chk.value);
      else selectedActions.delete(chk.value);
      renderAll();
    });
  });

  // 2. Strength filter toggle (Lọc Sức mạnh XH)
  container.querySelector('#btn-toggle-strength-filter')?.addEventListener('click', (e) => {
    e.stopPropagation();
    strengthDropdownVisible = !strengthDropdownVisible;
    actionDropdownVisible = false;
    industryDropdownVisible = false;
    renderAll();
  });
  container.querySelectorAll('.strength-filter-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) selectedStrengths.add(chk.value);
      else selectedStrengths.delete(chk.value);
      renderAll();
    });
  });

  // 3. Industry filter toggle (Lọc nhóm ngành)
  container.querySelector('#btn-toggle-industry-filter')?.addEventListener('click', (e) => {
    e.stopPropagation();
    industryDropdownVisible = !industryDropdownVisible;
    actionDropdownVisible = false;
    strengthDropdownVisible = false;
    renderAll();
  });
  container.querySelectorAll('.industry-filter-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) selectedIndustries.add(chk.value);
      else selectedIndustries.delete(chk.value);
      renderAll();
    });
  });

  // Prevent dropdowns from closing when clicking inside them
  container.querySelector('#action-filter-dropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  container.querySelector('#strength-filter-dropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  container.querySelector('#industry-filter-dropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close dropdowns on click outside
  if (documentClickHandler) document.removeEventListener('click', documentClickHandler);
  documentClickHandler = () => {
    if (actionDropdownVisible || strengthDropdownVisible || industryDropdownVisible) {
      actionDropdownVisible = false;
      strengthDropdownVisible = false;
      industryDropdownVisible = false;
      renderAll();
    }
  };
  document.addEventListener('click', documentClickHandler);

  // Select all checkbox
  container.querySelector('#chk-all-stocks')?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    container.querySelectorAll('.chk-stock-item').forEach(c => { c.checked = checked; });
  });

  // Add stock
  container.querySelector('#btn-add-stock')?.addEventListener('click', showAddStockModal);
  container.querySelector('#btn-add-row')?.addEventListener('click', showAddStockModal);

  // Delete selected stocks
  container.querySelector('#btn-delete-stock')?.addEventListener('click', async () => {
    const checked = container.querySelectorAll('.chk-stock-item:checked');
    if (checked.length === 0) {
      showToast('Vui lòng chọn ít nhất một cổ phiếu để xóa.', 'error');
      return;
    }
    const ids = Array.from(checked).map(c => c.value);
    if (!confirm(`Xóa ${ids.length} cổ phiếu đã chọn?`)) return;

    try {
      for (const sid of ids) {
        if (!sid.startsWith('stock-')) {
          await API().delete(`/market/stocks/${sid}`);
        }
      }
      showToast(`Đã xóa ${ids.length} cổ phiếu.`);
      await loadStockData();
      renderAll();
    } catch (err) {
      console.error('Error deleting stocks:', err);
      showToast('Lỗi xóa cổ phiếu trên backend!', 'error');
    }
  });

  // Up/Down order
  container.querySelectorAll('.df-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sid = btn.dataset.sid;
      const dir = btn.dataset.dir;
      moveStock(sid, dir);
    });
  });

  // Direct table input listeners
  container.querySelectorAll('.df-direct-input').forEach(input => {
    const handleSave = async () => {
      const field = input.dataset.field;
      const sid = input.dataset.sid;
      const stock = stockData.find(s => String(s.id) === String(sid));
      if (!stock) return;

      let newValue = input.value.trim();
      if (field === 'industry' && newValue === '__CUSTOM__') {
        const promptVal = prompt(`Nhập tên ngành mới tùy chỉnh cho mã ${stock.code_cp}:`, stock.industry || '');
        if (promptVal && promptVal.trim()) {
          newValue = promptVal.trim();
        } else {
          // Revert back if cancelled
          input.value = INDUSTRY_GROUPS.some(ig => ig.label === stock.industry) ? stock.industry : '__CUSTOM__';
          return;
        }
      }

      const typedVal = field === 'order' || field === 'top_status' ? parseInt(newValue) || 0 : newValue;

      if (stock[field] !== typedVal) {
        if (field === 'code_cp') {
          const symbol = String(typedVal).toUpperCase();
          if (symbol.length >= 3 && symbol !== stock.code_cp) {
            try {
              const res = await API().get(EP().MARKET_LOOKUP(symbol));
              const info = res.data || res;
              if (info) {
                stock.code_cp = symbol;
                if (info.exchange) stock.exchange = info.exchange;
                if (info.industry) stock.industry = info.industry;

                await API().put(`/market/stocks/${sid}`, {
                  symbol: symbol,
                  exchange: info.exchange || stock.exchange,
                  industry: info.industry || stock.industry
                });
                showToast(`✅ Tự động cập nhật: sàn ${info.exchange || '—'}, ngành ${info.industry || '—'}`);
                await loadStockData();
                renderAll();
                return;
              }
            } catch (err) {
              const errMsg = err?.message || '';
              if (errMsg.includes('Unique') || errMsg.includes('đã tồn tại') || errMsg.includes('already exists')) {
                showToast(`⚠️ Mã cổ phiếu ${symbol} đã tồn tại trong hệ thống!`, 'error');
                // Revert the value in DOM and abort
                input.value = stock.code_cp;
                return;
              } else {
                showToast('Không tìm thấy thông tin mã CP. Vui lòng tự điền Sàn/Ngành.', 'warning');
                // Do NOT return here, fall through to allow manual save of the ticker code
              }
            }
          }
        }

        const oldValue = stock[field];
        stock[field] = typedVal;
        try {
          await saveStockField(sid, field, typedVal);
          if (field === 'act') {
            input.style.cssText = getBadgeSelectStyle(typedVal);
          }
          renderAll();
        } catch (err) {
          // Revert on save failure
          stock[field] = oldValue;
          input.value = oldValue;
          renderAll();
        }
      }
    };

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', handleSave);
    } else {
      input.addEventListener('blur', handleSave);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        }
      });
    }
  });

  // Edit row button (opens full edit modal)
  container.querySelectorAll('.df-edit-row-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sid = btn.dataset.sid;
      showEditStockModal(sid);
    });
  });

  // ── Resize mode buttons ──
  container.querySelector('#btn-toggle-resize')?.addEventListener('click', () => {
    if (!resizeMode) {
      // Snapshot current pixel widths from DOM BEFORE re-rendering
      const table = container.querySelector('.df-table');
      if (table) {
        const ths = table.querySelectorAll('thead th');
        const widths = {};
        ths.forEach((th, i) => {
          widths[String(i)] = th.offsetWidth;
        });
        pendingColWidths = widths;
      }
      resizeMode = true;
      pendingRowHeights = null;
      renderAll();
    }
  });

  container.querySelector('#btn-resize-ok')?.addEventListener('click', () => {
    // Commit current DOM widths/heights
    const table = container.querySelector('.df-table');
    if (table) {
      const ths = table.querySelectorAll('thead th');
      const widths = {};
      ths.forEach((th, i) => {
        widths[String(i)] = Math.round(th.getBoundingClientRect().width);
      });
      savedColWidths = widths;
      persistColWidths(widths);

      // Save row heights from first td of each row
      const rows = table.querySelectorAll('tbody tr');
      const heights = {};
      rows.forEach((row, i) => {
        heights[String(i)] = Math.round(row.getBoundingClientRect().height);
      });
      savedRowHeights = heights;
      persistRowHeights(heights);
    }
    pendingColWidths = null;
    pendingRowHeights = null;
    resizeMode = false;
    showToast('✅ Đã lưu kích thước bảng thành công!');
    renderAll();
  });

  container.querySelector('#btn-resize-cancel')?.addEventListener('click', () => {
    pendingColWidths = null;
    pendingRowHeights = null;
    resizeMode = false;
    renderAll();
  });

  container.querySelector('#btn-resize-reset')?.addEventListener('click', () => {
    savedColWidths = null;
    savedRowHeights = null;
    pendingColWidths = null;
    pendingRowHeights = null;
    localStorage.removeItem('fintop_admin_table_col_widths');
    localStorage.removeItem('fintop_admin_table_row_heights');
    resizeMode = false;
    showToast('↩ Đã đặt lại kích thước bảng mặc định.');
    renderAll();
  });
}

// ─────────────────────────────────────────────────────────────
// REORDER
// ─────────────────────────────────────────────────────────────

async function moveStock(sid, direction) {
  const idx = stockData.findIndex(s => String(s.id) === String(sid));
  if (idx === -1) return;

  if (direction === 'up' && idx > 0) {
    [stockData[idx], stockData[idx - 1]] = [stockData[idx - 1], stockData[idx]];
  } else if (direction === 'down' && idx < stockData.length - 1) {
    [stockData[idx], stockData[idx + 1]] = [stockData[idx + 1], stockData[idx]];
  }

  reorderStocks();

  try {
    const payload = {
      stocks: stockData.map(s => ({
        id: s.id,
        order: s.order
      }))
    };
    await API().post('/market/stocks/bulk', payload);
    renderAll();
  } catch (err) {
    console.error('Error reordering stocks:', err);
    showToast('Lỗi đồng bộ thứ tự lên backend!', 'error');
  }
}

// ─────────────────────────────────────────────────────────────
// COLUMN / ROW RESIZE — Helper Functions
// ─────────────────────────────────────────────────────────────

function buildThCell(colIndex, defaultWidth, content, extraClass) {
  // Determine actual width: pending (preview from DOM snapshot) > saved (localStorage) > default %
  let w = defaultWidth;
  if (pendingColWidths && pendingColWidths[String(colIndex)] !== undefined) {
    w = pendingColWidths[String(colIndex)] + 'px';
  } else if (savedColWidths && savedColWidths[String(colIndex)] !== undefined) {
    w = savedColWidths[String(colIndex)] + 'px';
  }
  const cls = extraClass ? ` class="${extraClass}"` : '';
  const resHandle = resizeMode ? `<div class="df-col-resize-handle" data-col="${colIndex}"></div>` : '';
  return `<th${cls} style="width:${w};min-width:30px;text-align:center;position:relative;">${content}${resHandle}</th>`;
}

function attachResizeHandlers() {
  if (!container) return;
  const table = container.querySelector('.df-table');
  if (!table) return;

  // ── Column resize: drag the right-edge handle of each <th> ──
  const colHandles = table.querySelectorAll('.df-col-resize-handle');
  colHandles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const th = handle.parentElement;
      const startX = e.clientX;
      const startW = th.getBoundingClientRect().width;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (me) => {
        me.preventDefault();
        const diff = me.clientX - startX;
        const newW = Math.max(30, startW + diff);
        th.style.width = newW + 'px';
        th.style.minWidth = newW + 'px';
        th.style.maxWidth = newW + 'px';
      };

      const onMouseUp = () => {
        handle.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });

  // ── Row resize: inject handle at bottom of each row's last-child td ──
  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach((row, rowIndex) => {
    if (row.querySelector('.df-row-resize-handle')) return;
    // Use the first visible td
    const targetTd = row.querySelector('td');
    if (!targetTd) return;
    targetTd.style.position = 'relative';
    const rowHandle = document.createElement('div');
    rowHandle.className = 'df-row-resize-handle';
    rowHandle.dataset.row = String(rowIndex);
    targetTd.appendChild(rowHandle);

    rowHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = row.getBoundingClientRect().height;
      rowHandle.classList.add('active');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (me) => {
        me.preventDefault();
        const diff = me.clientY - startY;
        const newH = Math.max(28, startH + diff);
        // Set height on every td in the row so it actually sticks
        row.querySelectorAll('td').forEach(td => {
          td.style.height = newH + 'px';
        });
      };

      const onMouseUp = () => {
        rowHandle.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

function reorderStocks() {
  stockData.forEach((s, i) => { s.order = i + 1; });
}

// ─────────────────────────────────────────────────────────────
// ADD STOCK MODAL
// ─────────────────────────────────────────────────────────────

function showAddStockModal() {
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay';
  overlay.id = 'add-stock-overlay';
  overlay.innerHTML = `
    <div class="admin-modal" style="max-width:550px;">
      <div class="admin-modal-header">
        <h3>➕ Thêm cổ phiếu mới</h3>
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-add-stock">✕</button>
      </div>
      <div class="admin-modal-body">
        <div class="admin-form-grid">
          <div class="admin-form-group">
            <label>Mã CP *</label>
            <input type="text" class="admin-input" id="add-code-cp" placeholder="VD: FPT" maxlength="10" style="text-transform:uppercase;" />
          </div>
          <div class="admin-form-group">
            <label>Sàn <span id="add-exchange-loading" style="display:none;color:#f59e0b;font-size:0.75rem;">⏳ Đang tra cứu...</span></label>
            <select class="admin-select" id="add-exchange">
              <option value="" selected>-- Chọn sàn --</option>
              <option value="HOSE">HOSE</option>
              <option value="HNX">HNX</option>
              <option value="UPCOM">UPCOM</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Nhóm ngành HĐKD <span id="add-industry-loading" style="display:none;color:#f59e0b;font-size:0.75rem;">⏳ Đang tra cứu...</span></label>
            <select class="admin-select" id="add-industry-select">
              <option value="__CUSTOM__">✍️ Tự nhập tên ngành mới tùy chỉnh...</option>
              <option value="" selected>-- Chọn 1 trong 25 ngành chuẩn --</option>
              ${INDUSTRY_GROUPS.map(ig => `<option value="${esc(ig.label)}">${esc(ig.label)}</option>`).join('')}
            </select>
            <input type="text" class="admin-input" id="add-industry-custom" placeholder="Gõ tên ngành mới tùy chỉnh..." style="display:none;margin-top:6px;border-color:#5e72e4;" />
          </div>
          <div class="admin-form-group">
            <label>Kiểm soát DL</label>
            <input type="text" class="admin-input" id="add-analyst" placeholder="VD: FinTop DATA" />
          </div>
          <div class="admin-form-group">
            <label>Dữ liệu kỹ thuật lịch sử (Model)</label>
            <input type="text" class="admin-input" id="add-trend" placeholder="Nhập nhận định..." />
          </div>
          <div class="admin-form-group">
            <label>Trạng thái Model</label>
            <select class="admin-select" id="add-act">
              <option value="RẤT TÍCH CỰC">RẤT TÍCH CỰC</option>
              <option value="TÍCH CỰC">TÍCH CỰC</option>
              <option value="KHẢ QUAN">KHẢ QUAN</option>
              <option value="TRUNG LẬP" selected>TRUNG LẬP</option>
              <option value="KO TÍCH CỰC">KO TÍCH CỰC</option>
              <option value="TIÊU CỰC">TIÊU CỰC</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>ΔRSI</label>
            <input type="text" class="admin-input" id="add-delta-rsi" placeholder=""
              title="${esc(DELTA_RSI_HELP_TEXT)}" />
          </div>
          <div class="admin-form-group">
            <label>Sức mạnh xu hướng RSI/MFI - Dòng tiền</label>
            <select class="admin-select" id="add-rsi-mfi">
              ${TREND_STRENGTH_OPTIONS.map(opt => `<option value="${esc(opt.code)}">${esc(opt.label)}</option>`).join('')}
            </select>
          </div>
          <div class="admin-form-group">
            <label>Vùng kiểm định kỹ thuật</label>
            <input type="text" class="admin-input" id="add-price-range" placeholder="VD: 34 - 34.5" />
          </div>
          <div class="admin-form-group">
            <label>Vùng kháng cự kỹ thuật</label>
            <input type="text" class="admin-input" id="add-resistance" placeholder="VD: 38 - 42" />
          </div>
          <div class="admin-form-group">
            <label>Vùng hỗ trợ kỹ thuật</label>
            <input type="text" class="admin-input" id="add-support" placeholder="VD: 33" />
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="admin-btn admin-btn-secondary" id="btn-cancel-add-stock">Hủy</button>
        <button class="admin-btn admin-btn-primary" id="btn-save-add-stock">💾 Thêm cổ phiếu</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();
  overlay.querySelector('#btn-close-add-stock').addEventListener('click', closeModal);
  overlay.querySelector('#btn-cancel-add-stock').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  const addCodeCp = overlay.querySelector('#add-code-cp');
  const addExchange = overlay.querySelector('#add-exchange');
  const addIndSelect = overlay.querySelector('#add-industry-select');
  const addIndCustom = overlay.querySelector('#add-industry-custom');

  const addExLoading = overlay.querySelector('#add-exchange-loading');
  const addIndLoading = overlay.querySelector('#add-industry-loading');
  const btnSaveAdd = overlay.querySelector('#btn-save-add-stock');

  if (addIndSelect) {
    addIndSelect.addEventListener('change', () => {
      if (addIndSelect.value === '__CUSTOM__') {
        addIndCustom.style.display = 'block';
        addIndCustom.focus();
      } else {
        addIndCustom.style.display = 'none';
      }
    });
  }

  addCodeCp.addEventListener('blur', async () => {
    const symbol = addCodeCp.value.trim().toUpperCase();
    if (symbol.length >= 3) {
      if (addExLoading) addExLoading.style.display = 'inline';
      if (addIndLoading) addIndLoading.style.display = 'inline';
      if (btnSaveAdd) btnSaveAdd.disabled = true;
      try {
        const res = await API().get(EP().MARKET_LOOKUP(symbol));
        const info = res.data || res;
        if (info && info.exchange) addExchange.value = info.exchange;
        if (info && info.industry) {
          const isPreset = INDUSTRY_GROUPS.some(ig => ig.label === info.industry);
          if (isPreset) {
            addIndSelect.value = info.industry;
            addIndCustom.style.display = 'none';
          } else {
            addIndSelect.value = '__CUSTOM__';
            addIndCustom.style.display = 'block';
            addIndCustom.value = info.industry;
          }
        }
        if (info && (info.exchange || info.industry)) {
          showToast(`✅ Tự động điền: sàn ${info.exchange || '—'}, ngành ${info.industry || '—'}`);
        }
      } catch (err) {
        console.warn('Lỗi tra cứu mã cổ phiếu tự động:', err);
        showToast('Không tìm thấy thông tin mã CP. Vui lòng chọn sàn/ngành thủ công.', 'error');
      } finally {
        if (addExLoading) addExLoading.style.display = 'none';
        if (addIndLoading) addIndLoading.style.display = 'none';
        if (btnSaveAdd) btnSaveAdd.disabled = false;
      }
    }
  });

  overlay.querySelector('#btn-save-add-stock').addEventListener('click', async () => {
    const code = (overlay.querySelector('#add-code-cp').value || '').trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã cổ phiếu!', 'error');
      return;
    }
    if (stockData.some(s => s.code_cp.toUpperCase() === code)) {
      showToast(`Mã ${code} đã tồn tại!`, 'error');
      return;
    }

    const finalIndustry = addIndSelect.value === '__CUSTOM__'
      ? (addIndCustom.value.trim() || 'Đa ngành')
      : (addIndSelect.value || 'Đa ngành');

    const payload = {
      symbol: code,
      exchange: overlay.querySelector('#add-exchange').value,
      industry: finalIndustry,
      analyst: overlay.querySelector('#add-analyst').value || '',
      identify_trend: overlay.querySelector('#add-trend').value || '',
      act: overlay.querySelector('#add-act').value,
      delta_rsi: overlay.querySelector('#add-delta-rsi').value || '',
      rsi_mfi: overlay.querySelector('#add-rsi-mfi').value || '',
      trading_price_range: overlay.querySelector('#add-price-range').value || '',
      resistance_range: overlay.querySelector('#add-resistance').value || '',
      support_range: overlay.querySelector('#add-support').value || '',
      top_status: 1,
      order: stockData.length + 1
    };

    try {
      await API().post('/market/stocks', payload);
      showToast(`Đã thêm cổ phiếu ${code}!`);
      await loadStockData();
      closeModal();
      renderAll();
    } catch (err) {
      console.error('Error creating stock:', err);
      showToast('Lỗi tạo cổ phiếu trên backend!', 'error');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// EDIT STOCK MODAL (row edit)
// ─────────────────────────────────────────────────────────────

function showEditStockModal(sid) {
  const stock = stockData.find(s => String(s.id) === String(sid));
  if (!stock) return;

  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay';
  overlay.id = 'edit-stock-overlay';
  overlay.innerHTML = `
    <div class="admin-modal" style="max-width:550px;">
      <div class="admin-modal-header">
        <h3>✏️ Sửa cổ phiếu: <strong style="color:var(--purple-glow);">${esc(stock.code_cp)}</strong></h3>
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-edit-stock">✕</button>
      </div>
      <div class="admin-modal-body">
        <div class="admin-form-grid">
          <div class="admin-form-group">
            <label>Mã CP</label>
            <input type="text" class="admin-input" id="es-code-cp" value="${esc(stock.code_cp)}" style="text-transform:uppercase;" />
          </div>
          <div class="admin-form-group">
            <label>Sàn <span id="es-exchange-loading" style="display:none;color:#f59e0b;font-size:0.75rem;">⏳ Đang tra cứu...</span></label>
            <select class="admin-select" id="es-exchange">
              <option value="HOSE" ${stock.exchange === 'HOSE' ? 'selected' : ''}>HOSE</option>
              <option value="HNX" ${stock.exchange === 'HNX' ? 'selected' : ''}>HNX</option>
              <option value="UPCOM" ${stock.exchange === 'UPCOM' ? 'selected' : ''}>UPCOM</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Nhóm ngành <span id="es-industry-loading" style="display:none;color:#f59e0b;font-size:0.75rem;">⏳ Đang tra cứu...</span></label>
            <select class="admin-select" id="es-industry-select">
              <option value="__CUSTOM__" ${!INDUSTRY_GROUPS.some(ig => ig.label === stock.industry) && stock.industry ? 'selected' : ''}>
                ${!INDUSTRY_GROUPS.some(ig => ig.label === stock.industry) && stock.industry ? `✍️ Tự nhập: ${esc(stock.industry)}` : '✍️ Tự nhập tên ngành mới tùy chỉnh...'}
              </option>
              <option value="">-- Chọn 1 trong 25 ngành chuẩn --</option>
              ${INDUSTRY_GROUPS.map(ig => `<option value="${esc(ig.label)}" ${stock.industry === ig.label ? 'selected' : ''}>${esc(ig.label)}</option>`).join('')}
            </select>
            <input type="text" class="admin-input" id="es-industry-custom" value="${!INDUSTRY_GROUPS.some(ig => ig.label === stock.industry) ? esc(stock.industry || '') : ''}" placeholder="Gõ tên ngành mới tùy chỉnh..." style="display:${!INDUSTRY_GROUPS.some(ig => ig.label === stock.industry) && stock.industry ? 'block' : 'none'};margin-top:6px;border-color:#5e72e4;" />
          </div>
          <div class="admin-form-group">
            <label>Kiểm soát DL</label>
            <input type="text" class="admin-input" id="es-analyst" value="${esc(stock.analyst || '')}" />
          </div>
          <div class="admin-form-group" style="grid-column: span 2;">
            <label>Dữ liệu kỹ thuật lịch sử (Model)</label>
            <textarea class="admin-input" id="es-trend" rows="3" style="resize:vertical;">${esc(stock.identify_trend || '')}</textarea>
          </div>
          <div class="admin-form-group">
            <label>Trạng thái Model</label>
            <select class="admin-select" id="es-act">
              <option value="RẤT TÍCH CỰC" ${stock.act === 'RẤT TÍCH CỰC' ? 'selected' : ''}>RẤT TÍCH CỰC</option>
              <option value="TÍCH CỰC" ${stock.act === 'TÍCH CỰC' ? 'selected' : ''}>TÍCH CỰC</option>
              <option value="KHẢ QUAN" ${stock.act === 'KHẢ QUAN' ? 'selected' : ''}>KHẢ QUAN</option>
              <option value="TRUNG LẬP" ${stock.act === 'TRUNG LẬP' ? 'selected' : ''}>TRUNG LẬP</option>
              <option value="KO TÍCH CỰC" ${stock.act === 'KO TÍCH CỰC' ? 'selected' : ''}>KO TÍCH CỰC</option>
              <option value="TIÊU CỰC" ${stock.act === 'TIÊU CỰC' ? 'selected' : ''}>TIÊU CỰC</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>ΔRSI</label>
            <input type="text" class="admin-input" id="es-delta-rsi" value="${esc(stock.delta_rsi || '')}"
              placeholder="" title="${esc(DELTA_RSI_HELP_TEXT)}" />
          </div>
          <div class="admin-form-group">
            <label>Sức mạnh xu hướng RSI/MFI - Dòng tiền</label>
            <select class="admin-select" id="es-rsi-mfi">
              ${TREND_STRENGTH_OPTIONS.map(opt => `<option value="${esc(opt.code)}" ${stock.rsi_mfi === opt.code ? 'selected' : ''}>${esc(opt.label)}</option>`).join('')}
            </select>
          </div>
          <div class="admin-form-group">
            <label>Vùng kiểm định kỹ thuật</label>
            <input type="text" class="admin-input" id="es-price-range" value="${esc(stock.trading_price_range || '')}" />
          </div>
          <div class="admin-form-group">
            <label>Vùng kháng cự kỹ thuật</label>
            <input type="text" class="admin-input" id="es-resistance" value="${esc(stock.resistance_range || '')}" />
          </div>
          <div class="admin-form-group">
            <label>Vùng hỗ trợ kỹ thuật</label>
            <input type="text" class="admin-input" id="es-support" value="${esc(stock.support_range || '')}" />
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button class="admin-btn admin-btn-secondary" id="btn-cancel-edit-stock">Hủy</button>
        <button class="admin-btn admin-btn-primary" id="btn-save-edit-stock">💾 Lưu thay đổi</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();
  overlay.querySelector('#btn-close-edit-stock').addEventListener('click', closeModal);
  overlay.querySelector('#btn-cancel-edit-stock').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  const esCodeCp = overlay.querySelector('#es-code-cp');
  const esExchange = overlay.querySelector('#es-exchange');
  const esIndSelect = overlay.querySelector('#es-industry-select');
  const esIndCustom = overlay.querySelector('#es-industry-custom');

  const esExLoading = overlay.querySelector('#es-exchange-loading');
  const esIndLoading = overlay.querySelector('#es-industry-loading');
  const btnSaveEdit = overlay.querySelector('#btn-save-edit-stock');

  if (esIndSelect) {
    esIndSelect.addEventListener('change', () => {
      if (esIndSelect.value === '__CUSTOM__') {
        esIndCustom.style.display = 'block';
        esIndCustom.focus();
      } else {
        esIndCustom.style.display = 'none';
      }
    });
  }

  esCodeCp.addEventListener('blur', async () => {
    const symbol = esCodeCp.value.trim().toUpperCase();
    if (symbol.length >= 3 && symbol !== stock.code_cp) {
      if (esExLoading) esExLoading.style.display = 'inline';
      if (esIndLoading) esIndLoading.style.display = 'inline';
      if (btnSaveEdit) btnSaveEdit.disabled = true;
      try {
        const res = await API().get(EP().MARKET_LOOKUP(symbol));
        const info = res.data || res;
        if (info && info.exchange) esExchange.value = info.exchange;
        if (info && info.industry) {
          const isPreset = INDUSTRY_GROUPS.some(ig => ig.label === info.industry);
          if (isPreset) {
            esIndSelect.value = info.industry;
            esIndCustom.style.display = 'none';
          } else {
            esIndSelect.value = '__CUSTOM__';
            esIndCustom.style.display = 'block';
            esIndCustom.value = info.industry;
          }
        }
        if (info && (info.exchange || info.industry)) {
          showToast(`✅ Tự động cập nhật: sàn ${info.exchange || '—'}, ngành ${info.industry || '—'}`);
        }
      } catch (err) {
        console.warn('Lỗi tra cứu mã cổ phiếu tự động:', err);
        showToast('Không tìm thấy thông tin mã CP. Vui lòng chọn sàn/ngành thủ công.', 'error');
      } finally {
        if (esExLoading) esExLoading.style.display = 'none';
        if (esIndLoading) esIndLoading.style.display = 'none';
        if (btnSaveEdit) btnSaveEdit.disabled = false;
      }
    }
  });

  overlay.querySelector('#btn-save-edit-stock').addEventListener('click', async () => {
    const finalIndustry = esIndSelect.value === '__CUSTOM__'
      ? (esIndCustom.value.trim() || 'Đa ngành')
      : (esIndSelect.value || 'Đa ngành');

    const updatedFields = {
      symbol: (overlay.querySelector('#es-code-cp').value || '').trim().toUpperCase(),
      exchange: overlay.querySelector('#es-exchange').value,
      industry: finalIndustry,
      analyst: overlay.querySelector('#es-analyst').value,
      act: overlay.querySelector('#es-act').value,
      identify_trend: overlay.querySelector('#es-trend').value,
      delta_rsi: overlay.querySelector('#es-delta-rsi').value,
      rsi_mfi: overlay.querySelector('#es-rsi-mfi').value,
      trading_price_range: overlay.querySelector('#es-price-range').value,
      resistance_range: overlay.querySelector('#es-resistance').value,
      support_range: overlay.querySelector('#es-support').value,
    };

    try {
      await API().put(`/market/stocks/${sid}`, updatedFields);
      showToast(`Đã cập nhật cổ phiếu ${updatedFields.symbol}!`);
      await loadStockData();
      closeModal();
      renderAll();
    } catch (err) {
      console.error('Error updating stock:', err);
      showToast('Lỗi cập nhật cổ phiếu trên backend!', 'error');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  id: 'market',
  label: 'Dữ liệu chứng khoán',
  icon: '🪙',

  async render(el) {
    container = el;
    await loadStockData();

    if (!documentClickHandler) {
      documentClickHandler = (e) => {
        const isClickInsideAction = e.target.closest('#btn-toggle-action-filter') || e.target.closest('#action-filter-dropdown');
        const isClickInsideIndustry = e.target.closest('#btn-toggle-industry-filter') || e.target.closest('#industry-filter-dropdown');
        if (!isClickInsideAction && !isClickInsideIndustry) {
          if (actionDropdownVisible || industryDropdownVisible) {
            actionDropdownVisible = false;
            industryDropdownVisible = false;
            renderAll();
          }
        }
        const isClickInsideDeltaRsi = e.target.closest('#df-delta-rsi-info') || e.target.closest('#df-delta-rsi-tooltip');
        if (!isClickInsideDeltaRsi) closeDeltaRsiTooltip();
      };
      document.addEventListener('click', documentClickHandler);
    }

    renderAll();
  },

  destroy() {
    if (documentClickHandler) {
      document.removeEventListener('click', documentClickHandler);
      documentClickHandler = null;
    }
    container = null;
  },
};
