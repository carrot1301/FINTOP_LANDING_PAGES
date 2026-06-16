/**
 * market-intelligence.js — Market Intelligence Center Dashboard
 * ============================================================
 */
import { esc, formatNumber, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let containerEl = null;
let currentSummary = null;
let currentGroupBy = 'sector';

export default {
  id: 'market-intelligence',
  label: 'Market Intelligence',
  icon: '📈',

  async render(container) {
    containerEl = container;
    containerEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải dữ liệu phân tích thị trường...</div>';

    await loadData();
    renderUI();
  },

  destroy() {
    containerEl = null;
    currentSummary = null;
  }
};

async function loadData(tradeDate?: string) {
  try {
    const endpoint = EP().MARKET_INTELLIGENCE_SUMMARY;
    const url = tradeDate ? `${endpoint}?trade_date=${tradeDate}` : endpoint;
    const res = await API().get(url);
    currentSummary = res.data || res;
  } catch (err) {
    console.error('Error fetching market intelligence summary:', err);
    showToast('Lỗi tải dữ liệu phân tích thị trường.', 'error');
    currentSummary = null;
  }
}

async function handleRefresh() {
  showToast('Đang quét và tính toán dữ liệu thị trường mới...');
  try {
    const refreshEndpoint = EP().MARKET_INTELLIGENCE_REFRESH;
    await API().post(refreshEndpoint);
    showToast('Đã tính toán & cập nhật thành công!');
    await loadData();
    renderUI();
  } catch (err) {
    console.error('Error refreshing market intelligence data:', err);
    showToast('Lỗi refresh dữ liệu thị trường!', 'error');
  }
}

function handleExport(format) {
  const tradeDate = currentSummary?.trade_date || new Date().toISOString().split('T')[0];
  const url = `${window.FintopInfra.FintopEnv.API_BASE_URL}${EP().MARKET_INTELLIGENCE_EXPORT}?format=${format}&trade_date=${tradeDate}`;
  window.open(url, '_blank');
}

function renderUI() {
  if (!containerEl) return;

  if (!currentSummary) {
    containerEl.innerHTML = `
      <div class="admin-empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Không có dữ liệu thị trường</div>
        <div class="empty-desc">Hệ thống chưa tạo dữ liệu phân tích hôm nay. Bấm nút bên dưới để tính toán thủ công.</div>
        <button class="admin-btn admin-btn-primary" id="btn-mi-first-refresh">🔄 Quét dữ liệu ngay</button>
      </div>
    `;
    containerEl.querySelector('#btn-mi-first-refresh')?.addEventListener('click', handleRefresh);
    return;
  }

  const regime = currentSummary.market_regime || {};
  const sectors = currentSummary.sector_rotation || [];
  const moneyFlow = currentSummary.money_flow || [];
  const foreignFlow = currentSummary.foreign_flow || [];
  const breadth = currentSummary.market_breadth || {};

  // Color for Regime
  let regimeColor = '#3B82F6';
  let regimeBg = 'rgba(59, 130, 246, 0.1)';
  if (regime.regime === 'Risk-On') {
    regimeColor = '#10B981';
    regimeBg = 'rgba(16, 185, 129, 0.1)';
  } else if (regime.regime === 'Risk-Off') {
    regimeColor = '#EF4444';
    regimeBg = 'rgba(239, 68, 68, 0.1)';
  }

  containerEl.innerHTML = `
    <!-- Action Header -->
    <div class="mi-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
      <div class="mi-last-update" style="font-size:0.85rem;color:var(--text-muted);">
        📅 Ngày giao dịch: <strong style="color:#fff;">${esc(currentSummary.trade_date)}</strong> · Cập nhật mới nhất: ${formatDate(new Date())}
      </div>
      <div style="display:flex;gap:8px;">
        <button class="admin-btn admin-btn-secondary" id="btn-mi-export-json" title="Xuất dữ liệu JSON">📄 Xuất JSON</button>
        <button class="admin-btn admin-btn-secondary" id="btn-mi-export-csv" title="Xuất báo cáo Excel">📊 Xuất CSV Excel</button>
        <button class="admin-btn admin-btn-primary" id="btn-mi-refresh" style="background:linear-gradient(135deg, var(--purple-glow), #4F46E5);border:none;">
          🔄 Quét & Tính toán lại
        </button>
      </div>
    </div>

    <!-- Grid: Top widgets -->
    <div style="display:grid;grid-template-columns: 1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;" class="mi-responsive-grid-2">
      
      <!-- 1. Market Regime Card -->
      <div class="admin-detail-panel" style="margin-top:0;">
        <div class="admin-detail-header">
          <div class="admin-detail-title">🛡️ Trạng thái xu hướng thị trường</div>
          <span class="admin-badge" style="background:${regimeBg};color:${regimeColor};border:1px solid ${regimeColor}55;font-weight:bold;font-size:0.85rem;padding:4px 10px;">
            ${esc(regime.regime || 'Neutral')}
          </span>
        </div>
        
        <div style="display:grid;grid-template-columns: 140px 1fr;gap:1.5rem;align-items:center;margin-top:1rem;" class="mi-responsive-grid-1">
          <!-- Risk score Gauge -->
          <div style="text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">ĐIỂM RỦI RO (RISK SCORE)</div>
            <div style="position:relative;width:120px;height:120px;margin:0 auto;">
              <!-- Circle svg gauge -->
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="${regimeColor}" stroke-width="8" 
                  stroke-dasharray="314" stroke-dashoffset="${314 - (314 * (regime.risk_score || 50)) / 100}" 
                  stroke-linecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                <div style="font-size:1.6rem;font-weight:900;color:#fff;">${regime.risk_score || 50}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);">/100</div>
              </div>
            </div>
          </div>

          <!-- Description/Inputs -->
          <div>
            <p style="font-size:0.88rem;line-height:1.5;margin-top:0;margin-bottom:0.75rem;color:#E2E8F0;">
              ${esc(regime.explanation)}
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem;" class="mi-responsive-grid-1">
              <div>📈 Close: <strong>${formatNumber(regime.close)}</strong></div>
              <div>⚡ ADX: <strong>${formatNumber(regime.adx)}</strong></div>
              <div>📊 EMA20: <strong>${formatNumber(regime.ema20)}</strong></div>
              <div>📉 ATR: <strong>${formatNumber(regime.atr)}</strong></div>
              <div>📊 EMA50: <strong>${formatNumber(regime.ema50)}</strong></div>
              <div>📊 EMA200: <strong>${formatNumber(regime.ema200)}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Market Breadth Widget -->
      <div class="admin-detail-panel" style="margin-top:0;">
        <div class="admin-detail-header">
          <div class="admin-detail-title">⚖️ Độ rộng & Sức mạnh nội tại thị trường (Breadth)</div>
        </div>

        <div style="margin-top:1rem;">
          <!-- Advance Decline Bar representation -->
          <div style="display:flex;height:24px;border-radius:6px;overflow:hidden;margin-bottom:0.5rem;font-size:0.75rem;font-weight:bold;text-align:center;line-height:24px;color:#fff;">
            ${(() => {
              const adv = breadth.advancingCount || 0;
              const dec = breadth.decliningCount || 0;
              const unc = breadth.unchangedCount || 0;
              const total = adv + dec + unc || 1;
              const advPct = (adv / total) * 100;
              const decPct = (dec / total) * 100;
              const uncPct = 100 - advPct - decPct;

              return `
                <div style="width:${advPct}%;background:#10B981;" title="Tăng: ${adv}">${adv} Mã</div>
                <div style="width:${uncPct}%;background:#64748B;" title="Không đổi: ${unc}">${unc}</div>
                <div style="width:${decPct}%;background:#EF4444;" title="Giảm: ${dec}">${dec} Mã</div>
              `;
            })()}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">
            <span>🟢 Tăng: ${breadth.advancingCount}</span>
            <span>⚪ Không đổi: ${breadth.unchangedCount}</span>
            <span>🔴 Giảm: ${breadth.decliningCount}</span>
            <span>Tỷ lệ T/G: <strong style="color:#fff;">${breadth.advanceDeclineRatio}</strong></span>
          </div>

          <!-- MAs status -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;" class="mi-responsive-grid-1">
            <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">TRÊN MA20</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#a855f7;">${breadth.aboveMa20Count || 0} mã</div>
            </div>
            <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">TRÊN MA50</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#3B82F6;">${breadth.aboveMa50Count || 0} mã</div>
            </div>
            <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">TRÊN MA200</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#10B981;">${breadth.aboveMa200Count || 0} mã</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid: Body contents -->
    <div style="display:grid;grid-template-columns: 1fr 1fr;gap:1.5rem;" class="mi-responsive-grid-2">
      
      <!-- 3. Sector Rotation Panel -->
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">🌀 Luân chuyển dòng tiền ngành (Sector Rotation)</div>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Tên ngành</th>
                <th style="text-align:right;">1D Return</th>
                <th style="text-align:right;">1W Return</th>
                <th style="text-align:right;">1M Return</th>
                <th style="text-align:right;">Relative vs Index</th>
              </tr>
            </thead>
            <tbody>
              ${sectors.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:1rem;">Không có dữ liệu ngành.</td></tr>
              ` : sectors.map((s, idx) => `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td><strong style="color:var(--purple-glow);">${esc(s.sectorName)}</strong></td>
                  <td style="text-align:right;color:${s.return1d >= 0 ? '#10B981' : '#EF4444'}">${s.return1d >= 0 ? '+' : ''}${s.return1d}%</td>
                  <td style="text-align:right;color:${s.return1w >= 0 ? '#10B981' : '#EF4444'}">${s.return1w >= 0 ? '+' : ''}${s.return1w}%</td>
                  <td style="text-align:right;color:${s.return1m >= 0 ? '#10B981' : '#EF4444'}">${s.return1m >= 0 ? '+' : ''}${s.return1m}%</td>
                  <td style="text-align:right;color:#f59e0b;font-weight:bold;">${s.relativeStrength}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Money Flow / Capital Tracker Panel -->
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">💵 Bản đồ dòng tiền (Money Flow)</div>
          <div class="admin-table-actions">
            <select id="sel-flow-groupby" class="admin-select" style="min-width:120px;">
              <option value="sector" ${currentGroupBy === 'sector' ? 'selected' : ''}>Theo ngành</option>
              <option value="market_cap" ${currentGroupBy === 'market_cap' ? 'selected' : ''}>Theo vốn hóa</option>
              <option value="ticker" ${currentGroupBy === 'ticker' ? 'selected' : ''}>Theo cổ phiếu</option>
            </select>
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tập hợp</th>
                <th style="text-align:right;">Giá trị mua</th>
                <th style="text-align:right;">Giá trị bán</th>
                <th style="text-align:right;">Mua ròng</th>
                <th style="text-align:right;">Tỷ lệ ròng</th>
              </tr>
            </thead>
            <tbody>
              ${moneyFlow.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:1rem;">Không có dữ liệu dòng tiền.</td></tr>
              ` : moneyFlow.map(f => {
                  const net = f.buyValue - f.sellValue;
                  const ratio = f.netValueRatio || 0;
                  return `
                    <tr>
                      <td><strong style="color:#E2E8F0;">${esc(f.name || f.ticker)}</strong></td>
                      <td style="text-align:right;color:var(--text-muted);">${formatNumber(Math.round(f.buyValue / 1000000))}M</td>
                      <td style="text-align:right;color:var(--text-muted);">${formatNumber(Math.round(f.sellValue / 1000000))}M</td>
                      <td style="text-align:right;color:${net >= 0 ? '#10B981' : '#EF4444'};font-weight:bold;">
                        ${net >= 0 ? '+' : ''}${formatNumber(Math.round(net / 1000000))}M
                      </td>
                      <td style="text-align:right;color:${ratio >= 0 ? '#10B981' : '#EF4444'}">${ratio}%</td>
                    </tr>
                  `;
              }).slice(0, 10).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 5. Foreign Flow & Global Activity Tracker -->
    <div class="admin-table-container" style="margin-top:1.5rem;">
      <div class="admin-table-toolbar">
        <div class="admin-table-title">🌍 Khối ngoại mua bán (Foreign Flow Tracker)</div>
      </div>

      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nhóm ngành</th>
              <th style="text-align:right;">Giá trị mua</th>
              <th style="text-align:right;">Giá trị bán</th>
              <th style="text-align:right;">Giá trị ròng</th>
              <th style="text-align:right;">Khối lượng mua</th>
              <th style="text-align:right;">Khối lượng bán</th>
              <th style="text-align:right;">Khối lượng ròng</th>
            </tr>
          </thead>
          <tbody>
            ${foreignFlow.length === 0 ? `
              <tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:1rem;">Không có dữ liệu khối ngoại.</td></tr>
            ` : foreignFlow.map(ff => {
                const netValue = ff.foreignBuyValue - ff.foreignSellValue;
                const netVolume = ff.foreignBuyVolume - ff.foreignSellVolume;
                return `
                  <tr>
                    <td><strong style="color:#E2E8F0;">${esc(ff.name || ff.ticker)}</strong></td>
                    <td style="text-align:right;color:var(--text-muted);">${formatNumber(Math.round(ff.foreignBuyValue / 1000000))}M</td>
                    <td style="text-align:right;color:var(--text-muted);">${formatNumber(Math.round(ff.foreignSellValue / 1000000))}M</td>
                    <td style="text-align:right;color:${netValue >= 0 ? '#10B981' : '#EF4444'};font-weight:bold;">
                      ${netValue >= 0 ? '+' : ''}${formatNumber(Math.round(netValue / 1000000))}M
                    </td>
                    <td style="text-align:right;color:var(--text-muted);">${formatNumber(ff.foreignBuyVolume)}</td>
                    <td style="text-align:right;color:var(--text-muted);">${formatNumber(ff.foreignSellVolume)}</td>
                    <td style="text-align:right;color:${netVolume >= 0 ? '#10B981' : '#EF4444'}">
                      ${netVolume >= 0 ? '+' : ''}${formatNumber(netVolume)}
                    </td>
                  </tr>
                `;
            }).slice(0, 10).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  if (!containerEl) return;

  // Refresh
  containerEl.querySelector('#btn-mi-refresh')?.addEventListener('click', handleRefresh);

  // Group By selector
  const groupbySelect = containerEl.querySelector('#sel-flow-groupby');
  groupbySelect?.addEventListener('change', async (e) => {
    currentGroupBy = e.target.value;
    try {
      const dateStr = currentSummary?.trade_date || new Date().toISOString().split('T')[0];
      const flowRes = await API().get(`${EP().MARKET_MONEY_FLOW}?trade_date=${dateStr}&group_by=${currentGroupBy}`);
      currentSummary.money_flow = flowRes.data || flowRes;
      
      const foreignRes = await API().get(`${EP().MARKET_FOREIGN_FLOW}?trade_date=${dateStr}&group_by=${currentGroupBy}`);
      currentSummary.foreign_flow = foreignRes.data || foreignRes;
      
      renderUI();
    } catch (err) {
      console.error('Error reloading group flow:', err);
      showToast('Không thể chuyển nhóm dòng tiền.', 'error');
    }
  });

  // Export actions
  containerEl.querySelector('#btn-mi-export-json')?.addEventListener('click', () => handleExport('json'));
  containerEl.querySelector('#btn-mi-export-csv')?.addEventListener('click', () => handleExport('csv'));
}
