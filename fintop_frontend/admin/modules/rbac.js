/**
 * rbac.js — Roles & Permissions Module
 */
import { esc, roleBadge, statusBadge, formatDate } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'rbac',
  label: 'Phân quyền',
  icon: '🔑',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải phân quyền...</div>';

    try {
      const res = await API().get(EP().ADMIN_ROLES);
      const roles = res.data || res;

      container.innerHTML = `
        <div class="admin-table-container">
          <div class="admin-table-toolbar">
            <div class="admin-table-title">🔑 Vai trò hệ thống</div>
          </div>
          <table class="admin-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Mã</th><th>Hệ thống</th><th>Trạng thái</th><th>Quyền</th><th>Người dùng</th><th></th></tr></thead>
            <tbody>
              ${(Array.isArray(roles) ? roles : []).map(r => `
                <tr>
                  <td>${r.id}</td>
                  <td><strong>${esc(r.name)}</strong></td>
                  <td>${roleBadge(r.code)}</td>
                  <td>${r.isSystem ? '🔒 Có' : '—'}</td>
                  <td>${statusBadge(r.status)}</td>
                  <td>${r.permissionCount || 0}</td>
                  <td>${r.userCount || 0}</td>
                  <td><button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="perms" data-id="${r.id}" data-name="${esc(r.name)}">Xem quyền</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div id="rbac-perms-detail" style="margin-top:1.5rem;"></div>
      `;

      // Bind view permissions
      container.querySelectorAll('[data-action="perms"]').forEach(btn => {
        btn.addEventListener('click', () => showPermissions(parseInt(btn.dataset.id), btn.dataset.name, container));
      });
    } catch (err) {
      container.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi tải</div><div class="empty-desc">${esc(err.message)}</div></div>`;
    }
  },

  destroy() {},
};

async function showPermissions(roleId, roleName, container) {
  const detail = container.querySelector('#rbac-perms-detail');
  if (!detail) return;
  detail.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const res = await API().get(EP().ADMIN_ROLE_PERMISSIONS(roleId));
    const data = res.data || res;
    const perms = data.permissions || [];

    detail.innerHTML = `
      <div class="admin-detail-panel">
        <div class="admin-detail-header">
          <div class="admin-detail-title">🔓 Quyền của ${esc(roleName)} (${perms.length})</div>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="this.closest('.admin-detail-panel').remove()">✕ Đóng</button>
        </div>
        ${perms.length === 0 ? '<div style="color:var(--text-muted);font-size:0.85rem;">Không có quyền nào được gán.</div>' : `
          <table class="admin-table">
            <thead><tr><th>Module</th><th>Action</th><th>Code</th><th>Mô tả</th></tr></thead>
            <tbody>
              ${perms.map(p => `
                <tr>
                  <td>${roleBadge(p.module)}</td>
                  <td>${esc(p.action)}</td>
                  <td style="font-family:monospace;font-size:0.78rem;color:var(--purple-glow);">${esc(p.code)}</td>
                  <td style="color:var(--text-secondary);font-size:0.8rem;">${esc(p.description) || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  } catch (err) {
    detail.innerHTML = `<div class="admin-empty-state"><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}
