/**
 * signals.js — VIP Signal Management Module
 */
import { AdminTable, esc, statusBadge, tierBadge, directionBadge, formatDate, formatNumber, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let table = null;
let actionContainer = null;

export default {
  id: 'signals',
  label: 'Tín hiệu VIP',
  icon: '📡',

  async render(container) {
    container.innerHTML = '<div id="signal-action-area"></div><div id="signal-table-area"></div>';
    actionContainer = container.querySelector('#signal-action-area');

    table = new AdminTable({
      container: container.querySelector('#signal-table-area'),
      title: 'Tín hiệu VIP',
      columns: ['ID', 'Mã CK', 'Hướng', 'Giá Vào/Bán', 'Giá Mục Tiêu', 'Giá Cắt Lỗ', 'Trạng thái', 'Gói tối thiểu', 'Tác giả', 'Ngày', ''],
      searchable: false,
      toolbarExtra: () => `
        <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-create-signal-trigger">➕ Tạo tín hiệu</button>
      `,
      filters: {
        status: {
          label: 'trạng thái',
          options: [
            { value: 'DRAFT', label: 'Bản nháp' },
            { value: 'PUBLISHED', label: 'Đang phát hành' },
            { value: 'REACHED_TARGET', label: 'Đạt mục tiêu' },
            { value: 'CUT_LOSS', label: 'Cắt lỗ' },
            { value: 'CLOSED', label: 'Đã đóng' },
          ],
        },
      },
      fetchData: async (page, filters) => {
        const qs = API().toQuery({ page, limit: 15, status: filters.status });
        const res = await API().get(EP().ADMIN_SIGNALS + qs);
        return res;
      },
      renderRow: (s) => `
        <tr>
          <td>${s.id}</td>
          <td><strong>${esc(s.symbol)}</strong><div style="font-size:0.7rem;color:var(--text-muted);">${esc(s.companyName)}</div></td>
          <td>${directionBadge(s.direction)}</td>
          <td>${formatNumber(s.entryPrice)}</td>
          <td style="color:#34D399;">${formatNumber(s.targetPrice)}</td>
          <td style="color:#F87171;">${formatNumber(s.cutLossPrice)}</td>
          <td>${statusBadge(s.status)}</td>
          <td>${tierBadge(s.minTierAccess)}</td>
          <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(s.author?.fullName) || '—'}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(s.publishedAt || s.createdAt)}</td>
          <td>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="detail" data-id="${s.id}">Chi tiết</button>
          </td>
        </tr>
      `,
      onRowAction: async (action, id) => {
        if (action === 'detail') await showSignalDetail(parseInt(id));
      },
    });

    // Bind event for the trigger button
    const createTrigger = container.querySelector('#btn-create-signal-trigger');
    createTrigger?.addEventListener('click', showCreateSignalForm);
  },

  destroy() {
    table = null;
    actionContainer = null;
  },
};

function showCreateSignalForm() {
  if (!actionContainer) return;

  actionContainer.innerHTML = `
    <div class="admin-detail-panel" style="margin-bottom: 1.5rem;">
      <div class="admin-detail-header">
        <div class="admin-detail-title">📡 Tạo tín hiệu VIP mới</div>
        <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-form">✕ Đóng</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
        <div class="admin-form-group">
          <label class="admin-form-label">Mã chứng khoán <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-symbol" placeholder="VD: FPT" style="text-transform: uppercase;">
          <div id="symbol-lookup-status" style="font-size: 0.75rem; margin-top: 0.25rem; min-height: 1rem;"></div>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label">Hướng <span style="color:#F87171;">*</span></label>
          <select class="admin-select" id="signal-direction" style="width: 100%;">
            <option value="BUY">Tín hiệu mua (BUY)</option>
            <option value="SELL">Tín hiệu bán / khuyến nghị bán (SELL)</option>
          </select>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" id="signal-entry-label">Giá mua/giá vào <span style="color:#F87171;">*</span></label>
          <input type="number" step="any" class="admin-input" id="signal-entry" placeholder="VD: 135.5">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" id="signal-target-label">Giá mục tiêu <span style="color:#F87171;">*</span></label>
          <input type="number" step="any" class="admin-input" id="signal-target" placeholder="VD: 155.0">
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label" id="signal-cutloss-label">Giá cắt lỗ <span style="color:#F87171;">*</span></label>
          <input type="number" step="any" class="admin-input" id="signal-cutloss" placeholder="VD: 125.0">
        </div>

        <div class="admin-form-group" style="grid-column: 1 / -1; margin-top: -0.25rem; margin-bottom: 0.25rem;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Tính nhanh R/R:</span>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-rr-tp3" style="color:#34D399; padding: 2px 8px;">+3% TP</button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-rr-tp5" style="color:#34D399; padding: 2px 8px;">+5% TP</button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-rr-tp10" style="color:#34D399; padding: 2px 8px;">+10% TP</button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-rr-sl3" style="color:#F87171; padding: 2px 8px;">-3% SL</button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-rr-sl5" style="color:#F87171; padding: 2px 8px;">-5% SL</button>
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-form-label">Gói tối thiểu <span style="color:#F87171;">*</span></label>
          <select class="admin-select" id="signal-tier" style="width: 100%;">
            <option value="GOLD">V.I.P</option>
            <option value="DIAMOND">Diamond</option>
            <option value="SILVER">PRO</option>
            <option value="STANDARD">Standard</option>
          </select>
        </div>
      </div>

      <div class="admin-form-group" style="margin-top: 1rem;">
        <label class="admin-form-label">Ghi chú / Nhận định khuyến nghị</label>
        <textarea class="admin-textarea" id="signal-notes" placeholder="Nhập ghi chú hoặc phân tích kỹ thuật tại đây..."></textarea>
      </div>

      <div style="margin-top: 1.25rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="admin-btn admin-btn-secondary" id="btn-cancel-create">Hủy bỏ</button>
        <button class="admin-btn admin-btn-primary" id="btn-submit-signal" disabled>Tạo tín hiệu</button>
      </div>
    </div>
  `;

  // Bind close/cancel actions
  const closeForm = () => { actionContainer.innerHTML = ''; };
  actionContainer.querySelector('#btn-close-form')?.addEventListener('click', closeForm);
  actionContainer.querySelector('#btn-cancel-create')?.addEventListener('click', closeForm);

  // Bind R/R calculation shortcuts
  const applyCalc = (pct, field) => {
    const entry = parseFloat(actionContainer.querySelector('#signal-entry')?.value);
    if (isNaN(entry) || entry <= 0) {
      showToast('Vui lòng nhập Giá mua/giá vào hợp lệ trước', 'error');
      return;
    }
    const val = (entry * (1 + pct)).toFixed(1);
    const targetInput = actionContainer.querySelector(field === 'tp' ? '#signal-target' : '#signal-cutloss');
    if (targetInput) targetInput.value = val;
  };
  actionContainer.querySelector('#btn-rr-tp3')?.addEventListener('click', () => applyCalc(0.03, 'tp'));
  actionContainer.querySelector('#btn-rr-tp5')?.addEventListener('click', () => applyCalc(0.05, 'tp'));
  actionContainer.querySelector('#btn-rr-tp10')?.addEventListener('click', () => applyCalc(0.10, 'tp'));
  actionContainer.querySelector('#btn-rr-sl3')?.addEventListener('click', () => applyCalc(-0.03, 'sl'));
  actionContainer.querySelector('#btn-rr-sl5')?.addEventListener('click', () => applyCalc(-0.05, 'sl'));

  // Form elements reference
  const directionSelect = actionContainer.querySelector('#signal-direction');
  const entryLabel = actionContainer.querySelector('#signal-entry-label');
  const targetLabel = actionContainer.querySelector('#signal-target-label');
  const cutlossLabel = actionContainer.querySelector('#signal-cutloss-label');
  const symbolInput = actionContainer.querySelector('#signal-symbol');
  const lookupStatus = actionContainer.querySelector('#symbol-lookup-status');
  const submitBtn = actionContainer.querySelector('#btn-submit-signal');
  let selectedStockId = null;

  // Dynamic direction labeling & validation fields configuration
  directionSelect?.addEventListener('change', (e) => {
    const dir = e.target.value;
    if (dir === 'BUY') {
      entryLabel.innerHTML = 'Giá mua/giá vào <span style="color:#F87171;">*</span>';
      targetLabel.innerHTML = 'Giá mục tiêu <span style="color:#F87171;">*</span>';
      cutlossLabel.innerHTML = 'Giá cắt lỗ <span style="color:#F87171;">*</span>';
    } else {
      entryLabel.innerHTML = 'Giá bán/giá hiện tại <span style="color:#F87171;">*</span>';
      targetLabel.innerHTML = 'Giá mục tiêu (Tùy chọn)';
      cutlossLabel.innerHTML = 'Giá cắt lỗ (Tùy chọn)';
    }
  });

  // Symbol dynamic verification
  let lookupTimeout = null;
  symbolInput?.addEventListener('input', (e) => {
    clearTimeout(lookupTimeout);
    const symbol = e.target.value.trim().toUpperCase();
    selectedStockId = null;
    submitBtn.disabled = true;

    if (!symbol) {
      lookupStatus.innerHTML = '';
      return;
    }

    lookupStatus.innerHTML = '<span style="color:var(--text-muted);">🔍 Đang tìm mã...</span>';

    lookupTimeout = setTimeout(async () => {
      try {
        const res = await API().get(EP().MARKET_STOCK(symbol));
        const stock = res.data || res;
        if (stock && stock.id) {
          selectedStockId = stock.id;
          lookupStatus.innerHTML = `<span style="color:#34D399;">✅ ${esc(stock.companyName)}</span>`;
          submitBtn.disabled = false;
        } else {
          lookupStatus.innerHTML = '<span style="color:#F87171;">❌ Không tìm thấy mã cổ phiếu trong dữ liệu hệ thống</span>';
        }
      } catch (err) {
        lookupStatus.innerHTML = '<span style="color:#F87171;">❌ Không tìm thấy mã cổ phiếu trong dữ liệu hệ thống</span>';
      }
    }, 400);
  });

  // Form submit handler
  submitBtn?.addEventListener('click', async () => {
    if (!selectedStockId) return;

    const direction = directionSelect?.value;
    const entryPrice = parseFloat(actionContainer.querySelector('#signal-entry')?.value);

    const targetPriceVal = actionContainer.querySelector('#signal-target')?.value.trim();
    const cutLossPriceVal = actionContainer.querySelector('#signal-cutloss')?.value.trim();

    let targetPrice = targetPriceVal ? parseFloat(targetPriceVal) : null;
    let cutLossPrice = cutLossPriceVal ? parseFloat(cutLossPriceVal) : null;

    const minTierAccess = actionContainer.querySelector('#signal-tier')?.value;
    const notes = actionContainer.querySelector('#signal-notes')?.value.trim();

    // Validations
    if (isNaN(entryPrice) || entryPrice <= 0) {
      showToast('Giá khuyến nghị (Entry) phải là số dương hợp lệ', 'error');
      return;
    }

    if (direction === 'BUY') {
      if (!targetPriceVal) {
        showToast('Tín hiệu mua yêu cầu nhập Giá mục tiêu', 'error');
        return;
      }
      if (!cutLossPriceVal) {
        showToast('Tín hiệu mua yêu cầu nhập Giá cắt lỗ', 'error');
        return;
      }
      if (isNaN(targetPrice) || targetPrice <= 0) {
        showToast('Giá mục tiêu phải là số dương hợp lệ', 'error');
        return;
      }
      if (isNaN(cutLossPrice) || cutLossPrice <= 0) {
        showToast('Giá cắt lỗ phải là số dương hợp lệ', 'error');
        return;
      }
      if (targetPrice <= entryPrice) {
        showToast('Tín hiệu mua: Giá mục tiêu phải lớn hơn giá mua', 'error');
        return;
      }
      if (cutLossPrice >= entryPrice) {
        showToast('Tín hiệu mua: Giá cắt lỗ phải nhỏ hơn giá mua', 'error');
        return;
      }
    } else if (direction === 'SELL') {
      // If empty on SELL, default to entryPrice to avoid faking bad values and conform to backend/DB required Decimal columns
      if (targetPrice === null) targetPrice = entryPrice;
      if (cutLossPrice === null) cutLossPrice = entryPrice;

      if (targetPriceVal && (isNaN(targetPrice) || targetPrice <= 0)) {
        showToast('Giá mục tiêu phải là số dương hợp lệ', 'error');
        return;
      }
      if (cutLossPriceVal && (isNaN(cutLossPrice) || cutLossPrice <= 0)) {
        showToast('Giá cắt lỗ phải là số dương hợp lệ', 'error');
        return;
      }

      // If they explicitly specified them, run validation
      if (targetPriceVal && targetPrice >= entryPrice) {
        showToast('Tín hiệu bán: Giá mục tiêu phải nhỏ hơn giá hiện tại', 'error');
        return;
      }
      if (cutLossPriceVal && cutLossPrice <= entryPrice) {
        showToast('Tín hiệu bán: Giá cắt lỗ phải lớn hơn giá hiện tại', 'error');
        return;
      }
    }

    if (!confirm(`Xác nhận tạo tín hiệu ${direction} cho mã ${symbolInput.value.trim().toUpperCase()}?`)) {
      return;
    }

    submitBtn.disabled = true;
    try {
      await API().post(EP().SIGNAL_CREATE, {
        stockId: selectedStockId,
        direction,
        entryPrice,
        targetPrice,
        cutLossPrice,
        minTierAccess,
        notes: notes || undefined,
      });

      showToast(`Đã tạo tín hiệu VIP thành công!`);
      closeForm();
      if (table) table.refresh();
    } catch (err) {
      showToast(err.message || 'Lỗi tạo tín hiệu', 'error');
      submitBtn.disabled = false;
    }
  });
}

async function showSignalDetail(signalId) {
  if (!actionContainer) return;
  actionContainer.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const res = await API().get(EP().ADMIN_SIGNALS);
    const list = res.data || res;
    const s = (Array.isArray(list) ? list : list.data || []).find(item => item.id === signalId);

    if (!s) {
      showToast('Không tìm thấy thông tin tín hiệu', 'error');
      actionContainer.innerHTML = '';
      return;
    }

    // Auto-populate triggerPrice with realtime closing quote, falling back to entryPrice
    let defaultTriggerPrice = s.entryPrice;
    try {
      const stockRes = await API().get(EP().MARKET_STOCK(s.symbol));
      const stock = stockRes.data || stockRes;
      if (stock && stock.realtimeQuote && stock.realtimeQuote.close) {
        defaultTriggerPrice = stock.realtimeQuote.close;
      }
    } catch (err) {
      console.warn('Could not fetch realtime quote for default triggerPrice:', err);
    }

    const isClosed = s.status === 'CLOSED' || s.status === 'REACHED_TARGET' || s.status === 'CUT_LOSS';

    // UI formats: Hide optional target/cutloss values if they were omitted (equal to entry price on SELL)
    const isSell = s.direction === 'SELL';
    const showTarget = !isSell || s.targetPrice !== s.entryPrice;
    const showCutLoss = !isSell || s.cutLossPrice !== s.entryPrice;

    actionContainer.innerHTML = `
      <div class="admin-detail-panel" style="margin-bottom: 1.5rem;">
        <div class="admin-detail-header">
          <div class="admin-detail-title">📡 Chi tiết Tín hiệu VIP <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem;">#${s.id}</span></div>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-detail">✕ Đóng</button>
        </div>

        <div class="admin-detail-grid">
          <div class="admin-detail-field">
            <div class="admin-detail-label">Mã chứng khoán</div>
            <div class="admin-detail-value"><strong>${esc(s.symbol)}</strong> (${esc(s.companyName)})</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Hướng</div>
            <div class="admin-detail-value">${directionBadge(s.direction)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Trạng thái</div>
            <div class="admin-detail-value">${statusBadge(s.status)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Gói tối thiểu</div>
            <div class="admin-detail-value">${tierBadge(s.minTierAccess)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">${isSell ? 'Giá bán/giá hiện tại' : 'Giá mua/giá vào'}</div>
            <div class="admin-detail-value" style="font-weight:bold;">${formatNumber(s.entryPrice)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Giá mục tiêu</div>
            <div class="admin-detail-value" style="color:#34D399;font-weight:bold;">${showTarget ? formatNumber(s.targetPrice) : '— (Không đặt)'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Giá cắt lỗ</div>
            <div class="admin-detail-value" style="color:#F87171;font-weight:bold;">${showCutLoss ? formatNumber(s.cutLossPrice) : '— (Không đặt)'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Tác giả</div>
            <div class="admin-detail-value">${esc(s.author?.fullName || 'Hệ thống')}</div>
          </div>
          <div class="admin-detail-field" style="grid-column: span 2;">
            <div class="admin-detail-label">Nhận định / Ghi chú</div>
            <div class="admin-detail-value" style="white-space: pre-wrap; font-size: 0.85rem; background:rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px; border:1px solid rgba(255,255,255,0.05);">${esc(s.notes) || '—'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Ngày tạo</div>
            <div class="admin-detail-value">${formatDate(s.createdAt)}</div>
          </div>
          ${s.publishedAt ? `
            <div class="admin-detail-field">
              <div class="admin-detail-label">Ngày phát hành</div>
              <div class="admin-detail-value">${formatDate(s.publishedAt)}</div>
            </div>
          ` : ''}
          ${s.closedAt ? `
            <div class="admin-detail-field">
              <div class="admin-detail-label">Ngày đóng</div>
              <div class="admin-detail-value">${formatDate(s.closedAt)}</div>
            </div>
          ` : ''}
        </div>

        ${isClosed ? `
          <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.05); color:var(--text-muted); font-size:0.8rem; text-align:center;">
            🔒 Tín hiệu này đã kết thúc vòng đời và không thể cập nhật thêm trạng thái.
          </div>
        ` : `
          <div class="admin-detail-panel" style="margin-top:1.25rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem; background:none; border:none; padding-left:0; padding-right:0;">
            <div class="admin-detail-label" style="margin-bottom:0.5rem;">⚙️ Quản lý trạng thái & vòng đời</div>
            <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
              <div class="admin-form-group" style="margin-bottom:0; display:flex; gap:0.5rem; align-items:center;">
                <label class="admin-form-label" style="margin-bottom:0; white-space:nowrap;">Giá ghi nhận trạng thái:</label>
                <input type="number" step="any" class="admin-input" id="transition-trigger-price" value="${defaultTriggerPrice}" placeholder="VD: 155.0" style="max-width:140px;">
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="admin-btn admin-btn-primary admin-btn-sm" data-target-status="REACHED_TARGET">🎯 Đạt mục tiêu</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" data-target-status="CUT_LOSS">📉 Cắt lỗ</button>
                <button class="admin-btn admin-btn-secondary admin-btn-sm" data-target-status="CLOSED">⏸️ Đóng</button>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Bind close action
    actionContainer.querySelector('#btn-close-detail')?.addEventListener('click', () => {
      actionContainer.innerHTML = '';
    });

    // Bind transition action buttons
    if (!isClosed) {
      actionContainer.querySelectorAll('[data-target-status]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const nextStatus = btn.dataset.targetStatus;
          const priceInput = actionContainer.querySelector('#transition-trigger-price');
          const triggerPrice = parseFloat(priceInput?.value);

          if (isNaN(triggerPrice) || triggerPrice <= 0) {
            showToast('Vui lòng nhập giá ghi nhận trạng thái (Trigger Price) hợp lệ trước khi chuyển trạng thái', 'error');
            return;
          }

          const statusLabels = {
            REACHED_TARGET: 'Đạt mục tiêu (REACHED_TARGET)',
            CUT_LOSS: 'Cắt lỗ (CUT_LOSS)',
            CLOSED: 'Đóng (CLOSED)',
          };

          if (!confirm(`Bạn có chắc muốn chuyển trạng thái tín hiệu sang "${statusLabels[nextStatus]}" với giá ghi nhận trạng thái là ${triggerPrice}?`)) {
            return;
          }

          btn.disabled = true;
          try {
            await API().patch(EP().SIGNAL_STATUS(s.id), {
              status: nextStatus,
              triggerPrice,
            });

            showToast(`Đã chuyển trạng thái tín hiệu sang ${nextStatus} thành công!`);
            actionContainer.innerHTML = '';
            if (table) table.refresh();
          } catch (err) {
            showToast(err.message || 'Lỗi cập nhật trạng thái', 'error');
            btn.disabled = false;
          }
        });
      });
    }

  } catch (err) {
    showToast(err.message || 'Lỗi tải chi tiết tín hiệu', 'error');
    actionContainer.innerHTML = '';
  }
}
