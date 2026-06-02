/**
 * market.js — Market Data Module
 */
import { AdminTable, esc, statusBadge, formatDate, formatNumber } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let activeTab = 'stocks';

export default {
  id: 'market',
  label: 'Thị trường',
  icon: '📈',

  async render(container) {
    container.innerHTML = `
      <div class="admin-tabs">
        <button class="admin-tab ${activeTab === 'stocks' ? 'active' : ''}" data-tab="stocks">📊 Cổ phiếu</button>
        <button class="admin-tab ${activeTab === 'sync' ? 'active' : ''}" data-tab="sync">🔄 Đồng bộ dữ liệu</button>
      </div>
      <div id="market-content"></div>
    `;

    container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        container.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
        renderTab(container.querySelector('#market-content'));
      });
    });

    renderTab(container.querySelector('#market-content'));
  },

  destroy() {},
};

function renderTab(contentEl) {
  if (activeTab === 'stocks') renderStocks(contentEl);
  else renderSyncLogs(contentEl);
}

function renderStocks(contentEl) {
  new AdminTable({
    container: contentEl,
    title: 'Danh sách cổ phiếu',
    columns: ['ID', 'Mã CK', 'Tên công ty', 'Sàn', 'Ngành', 'Trạng thái'],
    searchable: false,
    fetchData: async (page) => {
      const qs = API().toQuery({ page, limit: 20 });
      const res = await API().get(EP().ADMIN_MARKET_STOCKS + qs);
      return res;
    },
    renderRow: (s) => `
      <tr>
        <td>${s.id}</td>
        <td><strong style="color:var(--purple-glow);">${esc(s.symbol)}</strong></td>
        <td>${esc(s.companyName)}</td>
        <td>${esc(s.exchange?.code) || '—'}</td>
        <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(s.industry?.name) || '—'}</td>
        <td>${statusBadge(s.status)}</td>
      </tr>
    `,
  });
}

function renderSyncLogs(contentEl) {
  new AdminTable({
    container: contentEl,
    title: 'Lịch sử đồng bộ dữ liệu',
    columns: ['ID', 'Nguồn', 'Loại', 'Trạng thái', 'Upserted', 'Failed', 'Bắt đầu', 'Kết thúc'],
    searchable: false,
    fetchData: async (page) => {
      const qs = API().toQuery({ page, limit: 15 });
      const res = await API().get(EP().ADMIN_MARKET_SYNC_LOGS + qs);
      return res;
    },
    renderRow: (l) => `
      <tr>
        <td style="font-size:0.75rem;color:var(--text-muted);">${esc(l.id)}</td>
        <td>${esc(l.source)}</td>
        <td>${esc(l.syncType)}</td>
        <td>${statusBadge(l.status)}</td>
        <td style="color:#34D399;">${formatNumber(l.recordsUpserted)}</td>
        <td style="color:#F87171;">${formatNumber(l.recordsFailed)}</td>
        <td style="font-size:0.78rem;">${formatDate(l.startedAt)}</td>
        <td style="font-size:0.78rem;">${formatDate(l.completedAt)}</td>
      </tr>
    `,
  });
}
