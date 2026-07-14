/**
 * copy-trade.js — Expert Signals Management Module (Copy Trade)
 */
import { AdminTable, esc, statusBadge, tierBadge, directionBadge, formatDate, formatNumber, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let table = null;
let actionContainer = null;

export default {
  id: 'copy-trade',
  label: 'Copy Trade',
  icon: '🔄',

  async render(container) {
    container.innerHTML = '<div id="signal-action-area"></div><div id="signal-table-area"></div>';
    actionContainer = container.querySelector('#signal-action-area');

    table = new AdminTable({
      container: container.querySelector('#signal-table-area'),
      title: 'Quản lý Tín hiệu Copy Trade',
      columns: ['ID', 'Mã CK', 'Hướng', 'Giá Vào/Bán', 'Giá Mục Tiêu', 'Giá Cắt Lỗ', 'Trạng thái', 'Gói tối thiểu', 'Tác giả', 'Ngày', ''],
      searchable: false,
      toolbarExtra: () => `
        <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-create-signal-trigger">➕ Tạo tín hiệu mới</button>
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
        <div class="admin-detail-title">📡 Tạo tín hiệu mới</div>
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

        <!-- BUY dynamic fields -->
        <div class="admin-form-group buy-field">
          <label class="admin-form-label">Kháng cự <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-resistance" placeholder="VD: 85 - 90">
        </div>

        <div class="admin-form-group buy-field">
          <label class="admin-form-label">Điểm QTRR <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-qtrr" placeholder="VD: 76">
        </div>

        <div class="admin-form-group buy-field" style="grid-column: span 2;">
          <label class="admin-form-label">Mô tả Model <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-model-desc" placeholder="VD: Kênh xu hướng mở biên tăng trưởng">
        </div>

        <!-- SELL dynamic fields -->
        <div class="admin-form-group sell-field" style="display:none;">
          <label class="admin-form-label">Điểm ENTRY cũ <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-sell-entry" placeholder="VD: 78.2">
        </div>

        <div class="admin-form-group sell-field" style="display:none;">
          <label class="admin-form-label">Kết quả MDL <span style="color:#F87171;">*</span></label>
          <input type="text" class="admin-input" id="signal-model-result" placeholder="VD: 18.05%">
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
        <label class="admin-form-label" id="signal-notes-label">Ghi chú / Nhận định khuyến nghị</label>
        <textarea class="admin-textarea" id="signal-notes" placeholder="Nhập ghi chú hoặc phân tích tại đây..."></textarea>
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

  // Form elements reference
  const directionSelect = actionContainer.querySelector('#signal-direction');
  const entryLabel = actionContainer.querySelector('#signal-entry-label');
  const symbolInput = actionContainer.querySelector('#signal-symbol');
  const lookupStatus = actionContainer.querySelector('#symbol-lookup-status');
  const submitBtn = actionContainer.querySelector('#btn-submit-signal');
  let selectedStockId = null;

  // Dynamic direction labeling & validation fields configuration
  directionSelect?.addEventListener('change', (e) => {
    const dir = e.target.value;
    const buyFields = actionContainer.querySelectorAll('.buy-field');
    const sellFields = actionContainer.querySelectorAll('.sell-field');
    const notesLabel = actionContainer.querySelector('#signal-notes-label');

    if (dir === 'BUY') {
      entryLabel.innerHTML = 'Giá mua/giá vào <span style="color:#F87171;">*</span>';
      notesLabel.innerHTML = 'Ghi chú / Nhận định khuyến nghị';
      buyFields.forEach(el => el.style.display = '');
      sellFields.forEach(el => el.style.display = 'none');
    } else {
      entryLabel.innerHTML = 'Giá bán/giá thoát <span style="color:#F87171;">*</span>';
      notesLabel.innerHTML = 'Ghi chú MDL / Lý do bán';
      buyFields.forEach(el => el.style.display = 'none');
      sellFields.forEach(el => el.style.display = '');
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
    const minTierAccess = actionContainer.querySelector('#signal-tier')?.value;
    const notes = actionContainer.querySelector('#signal-notes')?.value.trim();

    // Validations
    if (isNaN(entryPrice) || entryPrice <= 0) {
      showToast('Giá khuyến nghị (Entry) phải là số dương hợp lệ', 'error');
      return;
    }

    let targetPrice = entryPrice;
    let cutLossPrice = entryPrice;
    let notesStr = '';

    if (direction === 'BUY') {
      const resistance = actionContainer.querySelector('#signal-resistance')?.value.trim();
      const qtrr = actionContainer.querySelector('#signal-qtrr')?.value.trim();
      const modelDesc = actionContainer.querySelector('#signal-model-desc')?.value.trim();

      if (!resistance) {
        showToast('Vui lòng nhập Kháng cự', 'error');
        return;
      }
      if (!qtrr) {
        showToast('Vui lòng nhập Điểm QTRR', 'error');
        return;
      }
      if (!modelDesc) {
        showToast('Vui lòng nhập Mô tả Model', 'error');
        return;
      }

      // Extract numeric values for target/cutloss to satisfy backend decimal validators
      const resNum = parseFloat(resistance.split('-')[0].trim());
      const qtrrNum = parseFloat(qtrr);

      if (isNaN(resNum) || resNum <= 0) {
        showToast('Kháng cự phải chứa số dương hợp lệ (ví dụ: 85 hoặc 85 - 90)', 'error');
        return;
      }
      if (isNaN(qtrrNum) || qtrrNum <= 0) {
        showToast('Điểm QTRR phải là số dương hợp lệ (ví dụ: 76)', 'error');
        return;
      }

      targetPrice = resNum;
      cutLossPrice = qtrrNum;

      notesStr = JSON.stringify({
        resistance,
        qtrr,
        modelDesc,
        notes
      });
    } else {
      const sellEntry = actionContainer.querySelector('#signal-sell-entry')?.value.trim();
      const modelResult = actionContainer.querySelector('#signal-model-result')?.value.trim();

      if (!sellEntry) {
        showToast('Vui lòng nhập Điểm ENTRY cũ', 'error');
        return;
      }
      if (!modelResult) {
        showToast('Vui lòng nhập Kết quả MDL', 'error');
        return;
      }

      const sellEntryNum = parseFloat(sellEntry);
      if (isNaN(sellEntryNum) || sellEntryNum <= 0) {
        showToast('Điểm ENTRY cũ phải là số dương hợp lệ', 'error');
        return;
      }

      targetPrice = sellEntryNum;
      cutLossPrice = sellEntryNum;

      notesStr = JSON.stringify({
        entryPoint: sellEntry,
        modelResult,
        notes
      });
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
        notes: notesStr,
      });

      showToast(`Đã tạo tín hiệu Copy Trade thành công!`);
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

    // UI formats: Parse notes JSON if possible
    let parsedNotes = null;
    let rawNotes = s.notes || '';
    try {
      if (rawNotes.trim().startsWith('{')) {
        parsedNotes = JSON.parse(rawNotes);
        rawNotes = parsedNotes.notes || '';
      }
    } catch (e) {}

    const isSell = s.direction === 'SELL';
    const showTarget = !isSell || s.targetPrice !== s.entryPrice;
    const showCutLoss = !isSell || s.cutLossPrice !== s.entryPrice;

    actionContainer.innerHTML = `
      <div class="admin-detail-panel" style="margin-bottom: 1.5rem;">
        <div class="admin-detail-header">
          <div class="admin-detail-title">📡 Chi tiết Tín hiệu <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem;">#${s.id}</span></div>
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
            <div class="admin-detail-label">${isSell ? 'Giá bán/giá thoát' : 'Giá mua/giá vào'}</div>
            <div class="admin-detail-value" style="font-weight:bold;">${formatNumber(s.entryPrice)}</div>
          </div>
          
          ${parsedNotes ? (
            s.direction === 'BUY' ? `
              <div class="admin-detail-field">
                <div class="admin-detail-label">Kháng cự</div>
                <div class="admin-detail-value" style="color:#34D399;font-weight:bold;">${esc(parsedNotes.resistance)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Điểm QTRR</div>
                <div class="admin-detail-value" style="color:#F87171;font-weight:bold;">${esc(parsedNotes.qtrr)}</div>
              </div>
              <div class="admin-detail-field" style="grid-column: span 2;">
                <div class="admin-detail-label">Mô tả Model</div>
                <div class="admin-detail-value">${esc(parsedNotes.modelDesc)}</div>
              </div>
            ` : `
              <div class="admin-detail-field">
                <div class="admin-detail-label">Điểm ENTRY cũ</div>
                <div class="admin-detail-value" style="font-weight:bold;">${esc(parsedNotes.entryPoint)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Kết quả MDL</div>
                <div class="admin-detail-value" style="color:#10B981;font-weight:bold;">${esc(parsedNotes.modelResult)}</div>
              </div>
            `
          ) : `
            <div class="admin-detail-field">
              <div class="admin-detail-label">Giá mục tiêu</div>
              <div class="admin-detail-value" style="color:#34D399;font-weight:bold;">${showTarget ? formatNumber(s.targetPrice) : '—'}</div>
            </div>
            <div class="admin-detail-field">
              <div class="admin-detail-label">Giá cắt lỗ</div>
              <div class="admin-detail-value" style="color:#F87171;font-weight:bold;">${showCutLoss ? formatNumber(s.cutLossPrice) : '—'}</div>
            </div>
          `}
          
          <div class="admin-detail-field" style="grid-column: span 2;">
            <div class="admin-detail-label">Ghi chú / Nhận định khuyến nghị</div>
            <div class="admin-detail-value" style="white-space: pre-wrap; font-size: 0.85rem; background:rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 6px; border:1px solid rgba(255,255,255,0.05);">${esc(rawNotes) || '—'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Tác giả</div>
            <div class="admin-detail-value">${esc(s.author?.fullName || 'Hệ thống')}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Ngày tạo</div>
            <div class="admin-detail-value">${formatDate(s.createdAt)}</div>
          </div>
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
