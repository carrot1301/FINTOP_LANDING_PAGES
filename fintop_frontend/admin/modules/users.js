/**
 * users.js — User Management Module
 */
import { AdminTable, esc, badge, statusBadge, tierBadge, roleBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let table = null;
let detailContainer = null;

export default {
  id: 'users',
  label: 'Người dùng',
  icon: '👥',

  async render(container) {
    container.innerHTML = '<div id="user-detail-area"></div><div id="user-table-area"></div>';
    detailContainer = container.querySelector('#user-detail-area');

    table = new AdminTable({
      container: container.querySelector('#user-table-area'),
      title: 'Danh sách người dùng',
      columns: ['ID', 'Họ tên', 'Email', 'Vai trò', 'Gói', 'Trạng thái', 'Ngày tạo', ''],
      searchable: true,
      searchPlaceholder: 'Tìm theo tên, email...',
      filters: {
        status: {
          label: 'trạng thái',
          options: [
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'INACTIVE', label: 'Ngưng' },
            { value: 'LOCKED', label: 'Khóa' },
          ],
        },
      },
      fetchData: async (page, filters) => {
        const qs = API().toQuery({ page, limit: 15, search: filters.search, status: filters.status });
        const res = await API().get(EP().ADMIN_USERS + qs);
        return res;
      },
      renderRow: (u) => `
        <tr>
          <td>${u.id}</td>
          <td><strong>${esc(u.fullName)}</strong></td>
          <td style="color:var(--text-secondary);font-size:0.8rem;">${esc(u.email)}</td>
          <td>${(u.roles || []).map(r => roleBadge(r.code || r)).join(' ')}</td>
          <td>${tierBadge(u.tierLevel)}</td>
          <td>${statusBadge(u.status)}</td>
          <td style="color:var(--text-muted);font-size:0.78rem;">${formatDate(u.createdAt)}</td>
          <td>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="view" data-id="${u.id}">Chi tiết</button>
          </td>
        </tr>
      `,
      onRowAction: async (action, id) => {
        if (action === 'view') await showUserDetail(parseInt(id));
      },
    });
  },

  destroy() {
    table = null;
    detailContainer = null;
  },
};

async function showUserDetail(userId) {
  if (!detailContainer) return;
  detailContainer.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const [userDetailRes, allRolesRes] = await Promise.all([
      API().get(EP().ADMIN_USER_DETAIL(userId)),
      API().get(EP().ADMIN_ROLES),
    ]);
    const u = userDetailRes.data || userDetailRes;
    const allRoles = allRolesRes.data || allRolesRes;

    const assignedCodes = (u.roles || []).map(r => r.code);
    const unassignedRoles = (allRoles || []).filter(r => !assignedCodes.includes(r.code));

    detailContainer.innerHTML = `
      <div class="admin-detail-panel">
        <div class="admin-detail-header">
          <div class="admin-detail-title">👤 ${esc(u.fullName)} <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem;">#${u.id}</span></div>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="this.closest('.admin-detail-panel').remove()">✕ Đóng</button>
        </div>
        <div class="admin-detail-grid">
          <div class="admin-detail-field">
            <div class="admin-detail-label">Email</div>
            <div class="admin-detail-value">${esc(u.email)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Số điện thoại</div>
            <div class="admin-detail-value">${esc(u.phone) || '—'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Gói</div>
            <div class="admin-detail-value">${tierBadge(u.tierLevel)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Trạng thái</div>
            <div class="admin-detail-value">${statusBadge(u.status)}</div>
          </div>
          <div class="admin-detail-field" style="grid-column: span 2;">
            <div class="admin-detail-label">Vai trò hiện tại</div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.25rem;">
              ${(u.roles || []).map(r => `
                <div class="admin-badge role-badge" style="display:flex; align-items:center; gap:0.35rem; padding: 0.25rem 0.5rem;">
                  <span>${esc(r.name || r.code || r)}</span>
                  <button class="admin-btn-remove-role" data-role-code="${esc(r.code || r)}" data-uid="${u.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-weight:bold; font-size:0.85rem; padding:0 0 0 0.35rem; line-height:1;">✕</button>
                </div>
              `).join('') || '—'}
            </div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Phòng ban</div>
            <div class="admin-detail-value">${esc(u.department?.name) || '—'}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Ngày tạo</div>
            <div class="admin-detail-value">${formatDate(u.createdAt)}</div>
          </div>
          <div class="admin-detail-field">
            <div class="admin-detail-label">Đăng ký hoạt động</div>
            <div class="admin-detail-value">${u.activeSubscription ? esc(u.activeSubscription.plan?.name) : '—'}</div>
          </div>
        </div>

        <div style="margin-top:1.25rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:1rem;">
          <div style="display:flex;gap:0.5rem;">
            <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="ACTIVE" data-uid="${u.id}">✅ Kích hoạt</button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="INACTIVE" data-uid="${u.id}">⏸️ Ngưng</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm" data-status-action="LOCKED" data-uid="${u.id}">🔒 Khóa</button>
          </div>
        </div>

        <div class="admin-detail-panel" style="margin-top:1.25rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem;">
          <div class="admin-detail-label" style="margin-bottom:0.5rem;">🔑 Cấp vai trò mới</div>
          ${unassignedRoles.length === 0 ? `
            <div style="font-size:0.8rem; color:var(--text-muted);">Người dùng đã sở hữu tất cả các vai trò.</div>
          ` : `
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <select class="admin-select" id="assign-role-select" style="min-width:180px;">
                <option value="">-- Chọn vai trò --</option>
                ${unassignedRoles.map(r => `<option value="${esc(r.code)}">${esc(r.name)}</option>`).join('')}
              </select>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-assign-role">Gán vai trò</button>
            </div>
          `}
        </div>

        ${u.recentSessions && u.recentSessions.length > 0 ? `
          <div style="margin-top:1.25rem;border-top:1px solid rgba(255,255,255,0.05);padding-top:1rem;">
            <div class="admin-detail-label" style="margin-bottom:0.5rem;">Phiên đăng nhập gần đây</div>
            <table class="admin-table" style="font-size:0.75rem;">
              <thead><tr><th>IP</th><th>User Agent</th><th>Thời gian</th></tr></thead>
              <tbody>
                ${u.recentSessions.map(s => `
                  <tr>
                    <td>${esc(s.ipAddress)}</td>
                    <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.userAgent)}</td>
                    <td>${formatDate(s.createdAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;

    // Status action buttons
    detailContainer.querySelectorAll('[data-status-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.dataset.statusAction;
        const uid = btn.dataset.uid;

        // Confirmation gate
        const statusLabels = { ACTIVE: 'Kích hoạt', INACTIVE: 'Ngưng hoạt động', LOCKED: 'Khóa' };
        const label = statusLabels[newStatus] || newStatus;
        if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái người dùng này sang "${label}" không?`)) {
          return;
        }

        try {
          await API().patch(EP().ADMIN_USER_STATUS(uid), { status: newStatus });
          showToast(`Trạng thái người dùng đã cập nhật: ${newStatus}`);
          if (table) table.refresh();
          await showUserDetail(parseInt(uid));
        } catch (err) {
          showToast(err.message || 'Lỗi cập nhật', 'error');
        }
      });
    });

    // Assign Role button
    const assignBtn = detailContainer.querySelector('#btn-assign-role');
    assignBtn?.addEventListener('click', async () => {
      const selectEl = detailContainer.querySelector('#assign-role-select');
      const roleCode = selectEl?.value;
      if (!roleCode) {
        showToast('Vui lòng chọn vai trò để gán', 'error');
        return;
      }

      if (!confirm(`Bạn có chắc muốn gán vai trò "${roleCode}" cho người dùng này không?`)) {
        return;
      }

      assignBtn.disabled = true;
      try {
        await API().patch(EP().ADMIN_USER_ROLE(u.id), { roleCode });
        showToast(`Đã gán vai trò ${roleCode} thành công!`);
        if (table) table.refresh();
        await showUserDetail(u.id);
      } catch (err) {
        showToast(err.message || 'Lỗi gán vai trò', 'error');
        assignBtn.disabled = false;
      }
    });

    // Remove Role buttons
    detailContainer.querySelectorAll('.admin-btn-remove-role').forEach(btn => {
      btn.addEventListener('click', async () => {
        const roleCode = btn.dataset.roleCode;
        const uid = btn.dataset.uid;

        // Self-demotion guard
        const currentAdmin = window.FintopInfra.AppState.getState('user') || {};
        if (parseInt(uid) === currentAdmin.id && roleCode === 'SUPER_ADMIN') {
          showToast('Bạn không thể tự gỡ vai trò quản trị viên cấp cao của chính mình!', 'error');
          return;
        }

        if (!confirm(`Bạn có chắc chắn muốn gỡ vai trò "${roleCode}" khỏi người dùng này không?`)) {
          return;
        }

        btn.disabled = true;
        try {
          await API().delete(EP().ADMIN_USER_ROLE(uid), { body: { roleCode } });
          showToast(`Đã gỡ vai trò ${roleCode} thành công!`);
          if (table) table.refresh();
          await showUserDetail(parseInt(uid));
        } catch (err) {
          showToast(err.message || 'Lỗi gỡ vai trò', 'error');
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    detailContainer.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}
