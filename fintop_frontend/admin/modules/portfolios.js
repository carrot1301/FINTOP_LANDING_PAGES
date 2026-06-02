/**
 * portfolios.js — Recommended Portfolio Module
 */
import { esc, statusBadge, tierBadge, formatDate, formatNumber } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'portfolios',
  label: 'Danh mục',
  icon: '💼',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>';

    try {
      const res = await API().get(EP().ADMIN_PORTFOLIOS);
      const portfolios = res.data || res;

      if (!Array.isArray(portfolios) || portfolios.length === 0) {
        container.innerHTML = `
          <div class="admin-empty-state">
            <div class="empty-icon">💼</div>
            <div class="empty-title">Chưa có danh mục nào</div>
            <div class="empty-desc">Hệ thống chưa có danh mục đầu tư khuyến nghị.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="admin-table-container">
          <div class="admin-table-toolbar">
            <div class="admin-table-title">💼 Danh mục khuyến nghị</div>
          </div>
          <table class="admin-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Trạng thái</th><th>Gói</th><th>Vốn ban đầu</th><th>NAV hiện tại</th><th>Tiền mặt</th><th>Cổ phiếu</th><th>Quản lý</th><th>Ngày</th></tr></thead>
            <tbody>
              ${portfolios.map(p => `
                <tr>
                  <td>${p.id}</td>
                  <td><strong>${esc(p.name)}</strong><div style="font-size:0.7rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(p.description) || ''}</div></td>
                  <td>${statusBadge(p.status)}</td>
                  <td>${tierBadge(p.minTierAccess)}</td>
                  <td>${formatNumber(p.initialCapital)}</td>
                  <td style="color:#34D399;font-weight:600;">${formatNumber(p.currentNav)}</td>
                  <td>${formatNumber(p.cashBalance)}</td>
                  <td>${p.holdingCount}</td>
                  <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(p.manager?.fullName) || '—'}</td>
                  <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(p.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
    }
  },

  destroy() {},
};
