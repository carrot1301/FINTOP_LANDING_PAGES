/**
 * overview.js — Admin Dashboard Overview Module
 */
import { AdminTable, esc, formatNumber, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'overview',
  label: 'Tổng quan',
  icon: '📊',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải tổng quan...</div>';

    try {
      const res = await API().get(EP().ADMIN_OVERVIEW);
      const d = res.data || res;

      container.innerHTML = `
        <div class="admin-kpi-grid">
          ${kpiCard('👥', d.users?.total, 'Người dùng', `${d.users?.active || 0} đang hoạt động`)}
          ${kpiCard('📡', d.signals?.total, 'Tín hiệu VIP', `${d.signals?.published || 0} đang phát hành`)}
          ${kpiCard('📝', d.blogs?.total, 'Bài viết', `${d.blogs?.published || 0} đã xuất bản`)}
          ${kpiCard('📄', d.reports?.total, 'Báo cáo', '')}
          ${kpiCard('🔔', d.notifications?.total, 'Thông báo', '')}
          ${kpiCard('💳', d.invoices?.total, 'Hóa đơn', `${d.invoices?.paid || 0} đã thanh toán`)}
          ${kpiCard('💼', d.portfolios?.total, 'Danh mục', '')}
          ${kpiCard('📋', d.auditLogs?.total, 'Nhật ký', 'Bản ghi kiểm toán')}
        </div>

        <div class="admin-detail-panel">
          <div class="admin-detail-header">
            <div class="admin-detail-title">🎯 Truy cập nhanh</div>
          </div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <a href="#users" class="admin-btn admin-btn-secondary">👥 Quản lý người dùng</a>
            <a href="#signals" class="admin-btn admin-btn-secondary">📡 Quản lý tín hiệu</a>
            <a href="#cms" class="admin-btn admin-btn-secondary">📝 Quản lý nội dung</a>
            <a href="#audit" class="admin-btn admin-btn-secondary">📋 Nhật ký hệ thống</a>
            <a href="#system" class="admin-btn admin-btn-secondary">⚙️ Kiểm tra hệ thống</a>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Lỗi tải tổng quan</div>
          <div class="empty-desc">${esc(err.message)}</div>
        </div>
      `;
    }
  },

  destroy() {},
};

function kpiCard(icon, value, label, sub) {
  return `
    <div class="admin-kpi-card">
      <div class="admin-kpi-icon">${icon}</div>
      <div class="admin-kpi-value">${formatNumber(value)}</div>
      <div class="admin-kpi-label">${esc(label)}</div>
      ${sub ? `<div class="admin-kpi-sub">${esc(sub)}</div>` : ''}
    </div>
  `;
}
