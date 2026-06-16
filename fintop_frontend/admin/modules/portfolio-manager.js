/**
 * portfolio-manager.js — Portfolio Creation & Transaction Operations Manager
 */
import { esc, formatNumber, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;

let selectedPortfolioId = '';
let marketStocks = [];

async function loadStocksList() {
  if (marketStocks.length === 0) {
    try {
      const res = await API().get('/market/stocks');
      const list = res.data || res || [];
      marketStocks = list.map(s => ({
        symbol: s.ticker || s.symbol,
        companyName: s.companyName || s.ticker || s.symbol
      }));
    } catch (err) {
      console.error('Cannot fetch active stocks list from backend API:', err);
      marketStocks = [];
    }
  }
}

export default {
  id: 'portfolio-manager',
  label: 'Quản trị danh mục',
  icon: '📅',

  async render(container) {
    await loadStocksList();

    container.innerHTML = `
      <div class="admin-tabs">
        <button class="admin-tab active" data-subtab="trade">💼 Giao dịch / Tái cơ cấu</button>
        <button class="admin-tab" data-subtab="create">➕ Tạo danh mục mới</button>
      </div>
      <div id="manager-content" style="margin-top:1rem;"></div>
    `;

    const contentEl = container.querySelector('#manager-content');

    container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const sub = tab.dataset.subtab;
        if (sub === 'trade') renderTradeTab(contentEl);
        else renderCreateTab(contentEl);
      });
    });

    renderTradeTab(contentEl);
  },

  destroy() {}
};

async function renderTradeTab(contentEl) {
  contentEl.innerHTML = `
    <div class="admin-portfolio-layout">
      <div class="admin-table-container" style="margin-bottom:1.5rem;">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">💼 Chọn danh mục để quản trị</div>
          <div class="admin-table-actions">
            <select id="manage-port-select" class="admin-select" style="min-width:250px;">
              <option value="">-- Đang tải danh sách... --</option>
            </select>
          </div>
        </div>
      </div>
      <div id="manage-detail-content">
        <div class="admin-empty-state">
          <div class="empty-icon">💼</div>
          <div class="empty-title">Vui lòng chọn một danh mục</div>
          <div class="empty-desc">Chọn danh mục từ danh sách trên để đặt lệnh Mua/Bán & Rebalance.</div>
        </div>
      </div>
    </div>
  `;

  const selectEl = contentEl.querySelector('#manage-port-select');
  await loadPortfoliosSelect(selectEl);

  selectEl.addEventListener('change', (e) => {
    selectedPortfolioId = e.target.value;
    renderManageDetail(contentEl.querySelector('#manage-detail-content'));
  });

  if (selectedPortfolioId) {
    selectEl.value = selectedPortfolioId;
    renderManageDetail(contentEl.querySelector('#manage-detail-content'));
  }
}

async function loadPortfoliosSelect(selectEl) {
  try {
    const res = await API().get('/portfolios');
    const list = res.data || [];
    if (list.length === 0) {
      selectEl.innerHTML = '<option value="">Chưa có danh mục nào</option>';
      return;
    }
    selectEl.innerHTML = '<option value="">-- Chọn danh mục quản lý --</option>' +
      list.map(p => `<option value="${p.id}">${esc(p.name)} [Gói: ${p.minTierAccess}]</option>`).join('');
  } catch (err) {
    selectEl.innerHTML = '<option value="">Lỗi tải danh mục</option>';
  }
}

async function renderManageDetail(detailEl) {
  if (!selectedPortfolioId) {
    detailEl.innerHTML = `
      <div class="admin-empty-state">
        <div class="empty-icon">💼</div>
        <div class="empty-title">Vui lòng chọn một danh mục</div>
        <div class="empty-desc">Chọn danh mục từ danh sách trên để đặt lệnh Mua/Bán & Rebalance.</div>
      </div>
    `;
    return;
  }

  detailEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải chi tiết...</div>';

  try {
    const res = await API().get(`/portfolios/${selectedPortfolioId}`);
    const data = res.data || res;
    if (!data) {
      detailEl.innerHTML = '<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Không tìm thấy dữ liệu danh mục</div></div>';
      return;
    }

    const cash = data.cashBalance || 0;
    const initCap = data.initialCapital || 0;
    const holdings = data.holdings || [];
    
    let stocksValue = 0;
    holdings.forEach(h => {
      stocksValue += h.currentPrice * h.quantity;
    });

    const currentNav = cash + stocksValue;

    detailEl.innerHTML = `
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <div class="admin-kpi-label">GIÁ TRỊ TÀI SẢN (NAV)</div>
          <div class="admin-kpi-value" style="color:#10B981;">${formatNumber(currentNav)}đ</div>
          <div class="admin-kpi-sub">Vốn ban đầu: ${formatNumber(initCap)}đ</div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-label">TIỀN MẶT CÒN LẠI</div>
          <div class="admin-kpi-value" style="color:#3B82F6;">${formatNumber(cash)}đ</div>
          <div class="admin-kpi-sub">Sẵn sàng để mua thêm cổ phiếu</div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-label">GIÁ TRỊ CỔ PHIẾU</div>
          <div class="admin-kpi-value" style="color:#F59E0B;">${formatNumber(stocksValue)}đ</div>
          <div class="admin-kpi-sub">Tổng giá trị thị trường holdings</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 320px; gap: 1.5rem; margin-top: 1.5rem;">
        <div class="admin-table-container">
          <div class="admin-table-toolbar">
            <div class="admin-table-title">📊 Danh sách holdings & tỷ trọng hiện tại</div>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Mã CP</th>
                <th>Tỷ trọng</th>
                <th>Số lượng</th>
                <th>Giá vốn</th>
                <th>Giá hiện tại</th>
                <th>Giá trị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${holdings.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">
                    📭 Chưa giải ngân vị thế nào. Sử dụng bảng đặt lệnh bên cạnh để mua.
                  </td>
                </tr>
              ` : holdings.map(h => {
                  const allocation = currentNav > 0 ? ((h.currentPrice * h.quantity) / currentNav * 100) : 0;
                  return `
                    <tr>
                      <td><strong style="color:var(--purple-glow);">${esc(h.symbol)}</strong></td>
                      <td>${allocation.toFixed(1)}%</td>
                      <td>${formatNumber(h.quantity)}</td>
                      <td>${formatNumber(h.avgEntryPrice)}</td>
                      <td>${formatNumber(h.currentPrice)}</td>
                      <td><strong>${formatNumber(h.currentPrice * h.quantity)}</strong></td>
                      <td>
                        <button class="admin-btn admin-btn-sm btn-sell-fast" data-symbol="${h.symbol}" data-qty="${h.quantity}" data-price="${h.currentPrice}" style="background:var(--danger);">Bán hết</button>
                      </td>
                    </tr>
                  `;
              }).join('')}
            </tbody>
          </table>
          <div style="padding:1rem; text-align:right;">
            <button class="admin-btn" id="delete-port-btn" style="background:#EF4444;">🗑️ Xóa danh mục này</button>
          </div>
        </div>

        <div class="admin-form-container" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:1.25rem; border-radius:8px;">
          <h3 style="font-size:1.1rem;margin-bottom:1rem;color:#fff;">📈 Đặt lệnh Giao dịch</h3>
          <form id="trade-form">
            <div style="margin-bottom:0.75rem;">
              <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">Mã cổ phiếu</label>
              <select id="trade-symbol-select" class="admin-select" style="width:100%;" required>
                <option value="">-- Chọn mã --</option>
                ${marketStocks.map(s => `<option value="${s.symbol}">${s.symbol} - ${esc(s.companyName)}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:0.75rem;">
              <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">Loại lệnh</label>
              <div style="display:flex;gap:0.5rem;">
                <label style="flex:1;text-align:center;padding:0.4rem;border-radius:4px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;background:rgba(16,185,129,0.1);color:#10B981;" id="lbl-buy">
                  <input type="radio" name="trade-action" value="BUY" checked style="display:none;"> MUA
                </label>
                <label style="flex:1;text-align:center;padding:0.4rem;border-radius:4px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;background:rgba(255,255,255,0.02);" id="lbl-sell">
                  <input type="radio" name="trade-action" value="SELL" style="display:none;"> BÁN
                </label>
              </div>
            </div>
            <div style="margin-bottom:0.75rem;">
              <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">Số lượng</label>
              <input type="number" id="trade-quantity" class="admin-input" style="width:100%;" placeholder="Ví dụ: 1000" min="10" required>
            </div>
            <div style="margin-bottom:1.25rem;">
              <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">Giá khớp (VND)</label>
              <input type="number" id="trade-price" class="admin-input" style="width:100%;" placeholder="Ví dụ: 132400" min="1" required>
            </div>
            <button type="submit" class="admin-btn" style="width:100%;background:linear-gradient(135deg, var(--purple-glow), #4F46E5);">Xác nhận lệnh</button>
          </form>
        </div>
      </div>
    `;

    // Bind fast sell buttons
    detailEl.querySelectorAll('.btn-sell-fast').forEach(btn => {
      btn.addEventListener('click', async () => {
        const symbol = btn.dataset.symbol;
        const qty = btn.dataset.qty;
        const price = btn.dataset.price;
        if (!confirm(`Bạn có chắc chắn muốn BÁN TOÀN BỘ ${qty} cổ phiếu ${symbol} ở giá thị trường ${formatNumber(price)}đ không?`)) {
          return;
        }
        await executeTrade(symbol, 'SELL', qty, price, detailEl);
      });
    });

    // Bind radio styles
    const radioBuy = detailEl.querySelector('input[value="BUY"]');
    const radioSell = detailEl.querySelector('input[value="SELL"]');
    const lblBuy = detailEl.querySelector('#lbl-buy');
    const lblSell = detailEl.querySelector('#lbl-sell');

    radioBuy.addEventListener('change', () => {
      lblBuy.style.background = 'rgba(16,185,129,0.1)';
      lblBuy.style.color = '#10B981';
      lblSell.style.background = 'rgba(255,255,255,0.02)';
      lblSell.style.color = 'var(--text-primary)';
    });

    radioSell.addEventListener('change', () => {
      lblSell.style.background = 'rgba(239,68,68,0.1)';
      lblSell.style.color = '#EF4444';
      lblBuy.style.background = 'rgba(255,255,255,0.02)';
      lblBuy.style.color = 'var(--text-primary)';
    });

    // Bind trade form submit
    detailEl.querySelector('#trade-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = detailEl.querySelector('#trade-symbol-select').value;
      const action = detailEl.querySelector('input[name="trade-action"]:checked').value;
      const quantity = detailEl.querySelector('#trade-quantity').value;
      const price = detailEl.querySelector('#trade-price').value;

      await executeTrade(symbol, action, quantity, price, detailEl);
    });

    // Bind delete portfolio button
    detailEl.querySelector('#delete-port-btn').addEventListener('click', async () => {
      if (!confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa hoàn toàn danh mục đầu tư này khỏi hệ thống? Thao tác này không thể hoàn tác.')) {
        return;
      }
      try {
        await API().delete(`/portfolios/${selectedPortfolioId}`);
        showToast('Xóa danh mục thành công!', 'success');
        selectedPortfolioId = '';
        const selectEl = detailEl.closest('.admin-portfolio-layout').querySelector('#manage-port-select');
        await loadPortfoliosSelect(selectEl);
        renderManageDetail(detailEl);
      } catch (err) {
        showToast(`Lỗi xóa: ${err.message}`, 'error');
      }
    });

  } catch (err) {
    detailEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

async function executeTrade(symbol, action, quantity, price, detailEl) {
  try {
    const stock = marketStocks.find(s => s.symbol === symbol);
    const companyName = stock ? stock.companyName : symbol;
    
    await API().post('/portfolios/trade', {
      portfolioId: selectedPortfolioId,
      symbol,
      companyName,
      action,
      quantity,
      price
    });

    showToast(`Đặt lệnh ${action} ${quantity} ${symbol} thành công!`, 'success');
    await renderManageDetail(detailEl);
  } catch (err) {
    showToast(`Giao dịch thất bại: ${err.message}`, 'error');
  }
}

function renderCreateTab(contentEl) {
  contentEl.innerHTML = `
    <div class="admin-form-container" style="max-width:600px; margin:0 auto; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:2rem; border-radius:8px;">
      <h2 style="font-size:1.4rem; margin-bottom:1.5rem; color:#fff;">➕ Tạo danh mục khuyến nghị mới</h2>
      <form id="create-port-form">
        <div style="margin-bottom:1rem;">
          <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Tên danh mục</label>
          <input type="text" id="port-name" class="admin-input" style="width:100%;" placeholder="Ví dụ: Danh mục V.I.P Diamond Sóng Ngành" required>
        </div>
        <div style="margin-bottom:1rem;">
          <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Mô tả chi tiết</label>
          <textarea id="port-desc" class="admin-input" style="width:100%; height:100px;" placeholder="Mô tả chiến lý đầu tư, tiêu chí chọn lọc danh mục..." required></textarea>
        </div>
        <div style="margin-bottom:1rem; display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div>
            <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Yêu cầu gói VIP</label>
            <select id="port-tier" class="admin-select" style="width:100%;" required>
              <option value="STANDARD">Standard</option>
              <option value="SILVER">Bạc (Silver)</option>
              <option value="GOLD" selected>Vàng (Gold)</option>
              <option value="DIAMOND">Kim Cương (Diamond)</option>
            </select>
          </div>
          <div>
            <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Vốn ban đầu (VND)</label>
            <input type="number" id="port-capital" class="admin-input" style="width:100%;" value="1000000000" min="1000000" required>
          </div>
        </div>
        <button type="submit" class="admin-btn" style="width:100%; margin-top:1rem; background:linear-gradient(135deg, var(--purple-glow), #4F46E5);">Tạo danh mục</button>
      </form>
    </div>
  `;

  contentEl.querySelector('#create-port-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = contentEl.querySelector('#port-name').value;
    const description = contentEl.querySelector('#port-desc').value;
    const minTierAccess = contentEl.querySelector('#port-tier').value;
    const initialCapital = contentEl.querySelector('#port-capital').value;

    try {
      const res = await API().post('/portfolios', {
        name,
        description,
        minTierAccess,
        initialCapital
      });
      showToast(`Tạo thành công danh mục: ${name}`, 'success');
      
      // Auto select the new portfolio and redirect to trade tab
      selectedPortfolioId = res.data?.id || res.id;
      const tabBtn = contentEl.closest('.admin-portfolio-layout, #admin-content').parentElement.querySelector('[data-subtab="trade"]');
      if (tabBtn) tabBtn.click();
    } catch (err) {
      showToast(`Tạo thất bại: ${err.message}`, 'error');
    }
  });
}
