import { esc, roleBadge, statusBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let editModalEl = null;

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
        <div id="rbac-edit-modal-area"></div>
        <div class="admin-table-container">
          <div class="admin-table-toolbar">
            <div class="admin-table-title">🔑 Vai trò hệ thống</div>
          </div>
          <table class="admin-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Mã</th><th>Hệ thống</th><th>Trạng thái</th><th>Quyền</th><th>Người dùng</th><th>Hành động</th></tr></thead>
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
                  <td>
                    <button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="perms" data-id="${r.id}" data-name="${esc(r.name)}">Xem quyền</button>
                    <button class="admin-btn admin-btn-primary admin-btn-sm" style="margin-left:4px;" data-action="edit-perms" data-id="${r.id}" data-name="${esc(r.name)}">Sửa quyền</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div id="rbac-perms-detail" style="margin-top:1.5rem;"></div>
      `;

      editModalEl = container.querySelector('#rbac-edit-modal-area');

      // Bind view permissions
      container.querySelectorAll('[data-action="perms"]').forEach(btn => {
        btn.addEventListener('click', () => showPermissions(parseInt(btn.dataset.id), btn.dataset.name, container));
      });

      // Bind edit permissions
      container.querySelectorAll('[data-action="edit-perms"]').forEach(btn => {
        btn.addEventListener('click', () => showEditPermissionsModal(parseInt(btn.dataset.id), btn.dataset.name, container));
      });

    } catch (err) {
      container.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi tải</div><div class="empty-desc">${esc(err.message)}</div></div>`;
    }
  },

  destroy() {
    editModalEl = null;
  },
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

async function showEditPermissionsModal(roleId, roleName, container) {
  if (!editModalEl) return;
  editModalEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const [allPermsRes, rolePermsRes] = await Promise.all([
      API().get('/admin/permissions'),
      API().get(EP().ADMIN_ROLE_PERMISSIONS(roleId))
    ]);

    const allPerms = allPermsRes.data || allPermsRes || [];
    const roleData = rolePermsRes.data || rolePermsRes || {};
    const rolePerms = roleData.permissions || [];
    const rolePermIds = new Set(rolePerms.map(p => p.id));

    // Group permissions by module
    const groups = {};
    allPerms.forEach(p => {
      const mod = p.module || 'Khác';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    });

    editModalEl.innerHTML = `
      <div class="admin-modal-overlay" id="rbac-edit-modal-overlay">
        <div class="admin-modal" style="max-width: 650px; background: #0b0b16; border: 1px solid rgba(139, 92, 246, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px);">
          <div class="admin-modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem;">
            <h3 style="color: #fff; margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">🔑 Cập nhật quyền: ${esc(roleName)}</h3>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-rbac-edit" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">✕</button>
          </div>
          <div class="admin-modal-body" style="max-height: 60vh; overflow-y: auto; padding: 1.25rem 1.5rem;">
            <p style="margin: 0 0 1.25rem 0; color: var(--text-secondary); font-size: 0.8rem;">
              Chọn các quyền cho vai trò này. Nhấn "Lưu thay đổi" để cập nhật phân quyền hệ thống.
            </p>
            
            <div class="rbac-perms-groups" style="display: flex; flex-direction: column; gap: 1rem;">
              ${Object.entries(groups).map(([mod, perms]) => {
                const allChecked = perms.every(p => rolePermIds.has(p.id));
                return `
                  <div class="rbac-group-card" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 0.85rem 1rem; border-radius: 6px;">
                    <div class="rbac-group-title" style="font-weight: 700; font-size: 0.85rem; color: #a78bfa; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                      <span>📁 ${esc(mod)}</span>
                      <button type="button" class="select-all-group" style="font-size: 0.75rem; color: var(--text-muted); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;">
                        ${allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div class="rbac-group-items" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.65rem;">
                      ${perms.map(p => {
                        const checked = rolePermIds.has(p.id) ? 'checked' : '';
                        return `
                          <label class="rbac-perm-item" style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; font-size: 0.78rem; user-select: none; padding: 0.25rem; border-radius: 4px; transition: background 0.2s;">
                            <input type="checkbox" class="rbac-perm-checkbox" value="${p.id}" ${checked} style="margin-top: 0.1rem; accent-color: #8b5cf6;" />
                            <div>
                              <div style="font-weight: 600; color: #fff; font-family: monospace; font-size: 0.75rem;">${esc(p.code)}</div>
                              <div style="color: var(--text-muted); font-size: 0.72rem; line-height: 1.2; margin-top: 0.1rem;">${esc(p.description || p.action)}</div>
                            </div>
                          </label>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div class="admin-modal-footer" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
            <button class="admin-btn admin-btn-secondary" id="btn-cancel-rbac-edit">Hủy</button>
            <button class="admin-btn admin-btn-primary" id="btn-save-rbac-edit" data-id="${roleId}">💾 Lưu thay đổi</button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { editModalEl.innerHTML = ''; };
    editModalEl.querySelector('#btn-close-rbac-edit').addEventListener('click', closeModal);
    editModalEl.querySelector('#btn-cancel-rbac-edit').addEventListener('click', closeModal);
    editModalEl.querySelector('#rbac-edit-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'rbac-edit-modal-overlay') closeModal();
    });

    // Wire group "Select All" toggle
    editModalEl.querySelectorAll('.rbac-group-card').forEach(card => {
      const btn = card.querySelector('.select-all-group');
      const checkboxes = card.querySelectorAll('.rbac-perm-checkbox');
      
      btn.addEventListener('click', () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        btn.textContent = allChecked ? 'Chọn tất cả' : 'Bỏ chọn tất cả';
      });

      // Update the button text if any checkbox changes status
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          const allChecked = Array.from(checkboxes).every(cb => cb.checked);
          btn.textContent = allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
        });
      });
    });

    // Save handler
    editModalEl.querySelector('#btn-save-rbac-edit').addEventListener('click', async (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      const checkedBoxes = editModalEl.querySelectorAll('.rbac-perm-checkbox:checked');
      const permissionIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value, 10));

      e.target.disabled = true;
      e.target.textContent = 'Đang lưu...';

      try {
        await API().patch(`/admin/roles/${id}/permissions`, { permissionIds });
        showToast('Cập nhật phân quyền thành công!');
        closeModal();
        
        // Refresh the whole tab container to reload the roles list with updated counts
        const rbacModule = (await import('./rbac.js')).default;
        await rbacModule.render(container);
      } catch (err) {
        showToast(err.message || 'Lỗi cập nhật phân quyền', 'error');
        e.target.disabled = false;
        e.target.textContent = '💾 Lưu thay đổi';
      }
    });

  } catch (err) {
    editModalEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

