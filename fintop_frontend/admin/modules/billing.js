/**
 * billing.js — Billing & Subscription Plans Module
 */
import { AdminTable, esc, statusBadge, tierBadge, formatDate, formatNumber } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let activeTab = 'plans';

export default {
  id: 'billing',
  label: 'Thanh toán',
  icon: '💳',

  async render(container) {
    container.innerHTML = `
      <div class="admin-tabs">
        <button class="admin-tab ${activeTab === 'plans' ? 'active' : ''}" data-tab="plans">📋 Gói dịch vụ</button>
        <button class="admin-tab ${activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">🧾 Hóa đơn</button>
      </div>
      <div id="billing-content"></div>
    `;

    container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        container.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
        renderTab(container.querySelector('#billing-content'));
      });
    });

    renderTab(container.querySelector('#billing-content'));
  },

  destroy() {},
};

function renderTab(contentEl) {
  if (activeTab === 'plans') renderPlans(contentEl);
  else renderInvoices(contentEl);
}

async function renderPlans(contentEl) {
  contentEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>';

  try {
    const res = await API().get(EP().ADMIN_BILLING_PLANS);
    const plans = res.data || res;

    if (!Array.isArray(plans) || plans.length === 0) {
      contentEl.innerHTML = '<div class="admin-empty-state"><div class="empty-icon">📋</div><div class="empty-title">Chưa có gói dịch vụ nào</div></div>';
      return;
    }

    contentEl.innerHTML = `
      <div class="admin-kpi-grid">
        ${plans.map(p => `
          <div class="admin-kpi-card">
            <div class="admin-kpi-icon">${tierIcon(p.tierLevel)}</div>
            <div class="admin-kpi-value">${formatNumber(p.price)}</div>
            <div class="admin-kpi-label">${esc(p.name)}</div>
            <div class="admin-kpi-sub">
              ${tierBadge(p.tierLevel)} · ${p.durationDays} ngày · ${esc(p.currency)}
            </div>
            <div style="margin-top:0.5rem;">${statusBadge(p.status)}</div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    contentEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

function tierIcon(tier) {
  const icons = { STANDARD: '🥉', SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎' };
  return icons[tier] || '📋';
}

function renderInvoices(contentEl) {
  new AdminTable({
    container: contentEl,
    title: 'Hóa đơn',
    columns: ['ID', 'Người dùng', 'Số tiền', 'Tiền tệ', 'Trạng thái', 'Hạn', 'Ngày tạo'],
    searchable: false,
    fetchData: async (page) => {
      const qs = API().toQuery({ page, limit: 15 });
      const res = await API().get(EP().ADMIN_BILLING_INVOICES + qs);
      return res;
    },
    renderRow: (inv) => `
      <tr>
        <td style="font-size:0.75rem;color:var(--text-muted);">${esc(inv.id)}</td>
        <td>${esc(inv.user?.fullName) || '—'}<div style="font-size:0.7rem;color:var(--text-muted);">${esc(inv.user?.email)}</div></td>
        <td><strong>${formatNumber(inv.amount)}</strong></td>
        <td>${esc(inv.currency)}</td>
        <td>${statusBadge(inv.status)}</td>
        <td style="font-size:0.78rem;">${formatDate(inv.dueDate)}</td>
        <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(inv.createdAt)}</td>
      </tr>
    `,
  });
}
