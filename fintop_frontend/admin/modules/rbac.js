/**
 * rbac.js — Quản trị Nhân sự & Phân quyền
 * ============================================================
 * Two sections:
 *   1. Staff Users Table — filtered by staff roles (userType=staff)
 *   2. System Roles Table — existing roles + permissions viewer
 */
import { AdminTable, esc, roleBadge, statusBadge, tierBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a0aec0"><rect width="100%" height="100%" fill="%232d3748"/><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>`;

let staffTable = null;
let staffEditModalEl = null;
let staffDetailEl = null;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const ROLE_DISPLAY = {
  SUPER_ADMIN:    { label: 'Super Admin',    color: '#ff3b3b' },
  CEO:            { label: 'CEO',            color: '#ff3b3b' },
  ASSISTANT_CEO:  { label: 'Trợ lý CEO',     color: '#ff6b6b' },
  EDITOR_ADMIN:   { label: 'QTV Biên tập',   color: '#3b82f6' },
  EDITOR_PRO:     { label: 'Biên tập Pro',    color: '#60a5fa' },
  EDITOR:         { label: 'Biên tập viên',   color: '#93c5fd' },
  SALE_ADMIN:     { label: 'QTV Sale',       color: '#22c55e' },
  SALE:           { label: 'Sale',           color: '#4ade80' },
  EXPERT:         { label: 'Chuyên gia',      color: '#f59e0b' },
};

function getRoleLabels(roles) {
  if (!roles || roles.length === 0) return '<span style="color:var(--text-muted)">— Chưa gán —</span>';
  return roles.map(r => {
    const code = r.code || r;
    const display = ROLE_DISPLAY[code] || { label: code, color: '#94a3b8' };
    return `<span class="admin-badge role-badge" style="background:${display.color}20;color:${display.color};border:1px solid ${display.color}40;margin:2px 4px 2px 0;display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">${display.label}</span>`;
  }).join('');
}

function getPrimaryRoleLabel(roles) {
  if (!roles || roles.length === 0) return '—';
  const primary = roles[0];
  const code = primary.code || primary;
  const display = ROLE_DISPLAY[code] || { label: code, color: '#94a3b8' };
  return display.label;
}

function formatBirthDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  id: 'rbac',
  label: 'Quản trị nhân sự',
  icon: '👥',

  async render(container) {
    container.innerHTML = `
      <div id="staff-edit-modal-area"></div>
      <div id="staff-detail-area"></div>
      <div id="staff-table-area" style="margin-bottom:2rem;"></div>
      <div id="roles-table-area"></div>
      <div id="rbac-perms-detail" style="margin-top:1.5rem;"></div>
    `;

    staffEditModalEl = container.querySelector('#staff-edit-modal-area');
    staffDetailEl = container.querySelector('#staff-detail-area');

    // ── 1. Staff Users Table ──
    renderStaffTable(container);

    // ── 2. Roles Table (preserved from original) ──
    await renderRolesTable(container);
  },

  destroy() {
    staffTable = null;
    staffEditModalEl = null;
    staffDetailEl = null;
  },
};

// ─────────────────────────────────────────────────────────────
// 1. STAFF USERS TABLE
// ─────────────────────────────────────────────────────────────

function renderStaffTable(container) {
  staffTable = new AdminTable({
    container: container.querySelector('#staff-table-area'),
    title: '👥 Danh sách nhân sự',
    columns: ['<input type="checkbox" id="chk-all-staff">', 'STT', 'Thông tin người dùng', 'Người quản lý', 'Ảnh đại diện', 'Trạng thái', '#'],
    searchable: true,
    searchPlaceholder: 'Tìm theo tên, email, SĐT...',
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
      const qs = API().toQuery({ page, limit: 15, search: filters.search, status: filters.status, userType: 'staff' });
      const res = await API().get(EP().ADMIN_USERS + qs);
      const data = res.data || [];
      const meta = res.meta || { total: data.length, page: 1, limit: 15, totalPages: 1 };

      const startIdx = ((meta.page || 1) - 1) * (meta.limit || 15);
      data.forEach((u, i) => { u._stt = startIdx + i + 1; });

      return { data, meta };
    },
    renderRow: (u) => {
      const phone = u.phone || u.phoneNumber || '';
      const address = u.address || u.city || '';
      const birthDate = formatBirthDate(u.dob || u.birthDate || u.dateOfBirth || u.birthday);
      const isActive = (u.status || '').toUpperCase() === 'ACTIVE';
      const roleText = getPrimaryRoleLabel(u.roles);
      const staffId = u.team?.code || u.department?.code || '—';

      const broker = u.broker || u.manager || u.assignedBroker;
      let brokerText = '—';
      if (broker) {
        const brokerCode = broker.team?.code || broker.department?.code || '';
        brokerText = brokerCode ? `${brokerCode} - ${broker.fullName || broker.name || broker}` : (broker.fullName || broker.name || broker);
      }

      // Check if avatar path is relative or absolute, handle properly
      let avatarUrl = u.avatarUrl || u.avatar || '';
      if (!avatarUrl || avatarUrl.includes('avatar_default.png')) {
        avatarUrl = DEFAULT_AVATAR;
      } else if (avatarUrl.startsWith('/assets/')) {
        avatarUrl = '../../' + avatarUrl.slice(1);
      } else if (avatarUrl.startsWith('/file-image/')) {
        avatarUrl = 'https://fintopdata.vn' + avatarUrl;
      }

      return `
        <tr data-uid="${u.id}">
          <td style="width:5%;vertical-align:middle;text-align:center;">
            <input type="checkbox" class="chk-staff-item" value="${u.id}" />
          </td>
          <td style="width:5%;vertical-align:middle;text-align:center;">${u._stt}</td>
          <td style="width:40%;height:auto;padding:12px 16px;vertical-align:middle;">
            <div class="user-info-card">
              <div>Tên: <strong>${esc(u.fullName || u.name || '')}</strong></div>
              <div>ID nhân sự : <span style="color:#ffb200;font-weight:bold;">${esc(staffId)}</span></div>
              <div>Số điện thoại : ${esc(phone)}</div>
              <div>Địa chỉ Email : ${esc(u.email)}</div>
              <div>Địa chỉ : ${esc(address)}</div>
              <div>Ngày sinh : ${birthDate}</div>
              <div>Quyền truy cập : <span style="color:#ffb200;font-weight:bold;">${esc(roleText)}</span></div>
            </div>
          </td>
          <td style="width:15%;vertical-align:middle;text-align:center;">
            <span>${esc(brokerText)}</span>
          </td>
          <td style="width:15%;vertical-align:middle;text-align:center;">
            <img src="${esc(avatarUrl)}" alt="Avatar" style="border-radius:4px;height: 80px;width: 80px;object-fit: cover;border: 1px solid rgba(255,255,255,0.1);" onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}';">
          </td>
          <td style="width:10%;vertical-align:middle;text-align:center;">
            <label class="toggle-switch" style="cursor:pointer;">
              <input type="checkbox" class="toggle-staff-status" data-uid="${u.id}" ${isActive ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td style="width:10%;vertical-align:middle;text-align:center;">
            <button class="admin-btn admin-btn-warning admin-btn-sm" data-action="edit-staff" data-id="${u.id}" title="Sửa thông tin" style="padding: 6px 10px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px;">
              ✏️
            </button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="view-staff" data-id="${u.id}" title="Chi tiết & Phân quyền" style="padding: 6px 10px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; margin-top: 4px;">
              📋
            </button>
          </td>
        </tr>
      `;
    },
    onRowAction: async (action, id) => {
      if (action === 'edit-staff') await showStaffEditModal(parseInt(id));
      if (action === 'view-staff') await showStaffDetail(parseInt(id));
    },
  });

  // Bind toggle status
  container.querySelector('#staff-table-area').addEventListener('change', async (e) => {
    if (e.target.classList.contains('toggle-staff-status')) {
      const uid = e.target.dataset.uid;
      const newStatus = e.target.checked ? 'ACTIVE' : 'INACTIVE';
      try {
        await API().patch(EP().ADMIN_USER_STATUS(uid), { status: newStatus });
        showToast(`Trạng thái đã cập nhật: ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}`);
      } catch (err) {
        showToast(err.message || 'Lỗi cập nhật trạng thái', 'error');
        e.target.checked = !e.target.checked;
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────
// STAFF EDIT MODAL
// ─────────────────────────────────────────────────────────────

async function showStaffEditModal(userId) {
  if (!staffEditModalEl) return;

  staffEditModalEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const res = await API().get(EP().ADMIN_USER_DETAIL(userId));
    const u = res.data || res;

    staffEditModalEl.innerHTML = `
      <div class="admin-modal-overlay" id="staff-edit-overlay">
        <div class="admin-modal" style="max-width:500px;">
          <div class="admin-modal-header">
            <h3>✏️ Sửa thông tin nhân viên</h3>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-staff-edit">✕</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <div class="admin-form-group">
                <label>Họ tên</label>
                <input type="text" class="admin-input" id="staff-edit-fullname" value="${esc(u.fullName || u.name || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Số điện thoại</label>
                <input type="text" class="admin-input" id="staff-edit-phone" value="${esc(u.phone || u.phoneNumber || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Email</label>
                <input type="email" class="admin-input" id="staff-edit-email" value="${esc(u.email || '')}" disabled />
              </div>
              <div class="admin-form-group">
                <label>Địa chỉ</label>
                <input type="text" class="admin-input" id="staff-edit-address" value="${esc(u.address || u.city || '')}" />
              </div>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" id="btn-cancel-staff-edit">Hủy</button>
            <button class="admin-btn admin-btn-primary" id="btn-save-staff-edit" data-uid="${u.id}">💾 Lưu thay đổi</button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { staffEditModalEl.innerHTML = ''; };
    staffEditModalEl.querySelector('#btn-close-staff-edit').addEventListener('click', closeModal);
    staffEditModalEl.querySelector('#btn-cancel-staff-edit').addEventListener('click', closeModal);
    staffEditModalEl.querySelector('#staff-edit-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'staff-edit-overlay') closeModal();
    });

    staffEditModalEl.querySelector('#btn-save-staff-edit').addEventListener('click', async (e) => {
      const uid = e.target.dataset.uid;
      const payload = {
        fullName: staffEditModalEl.querySelector('#staff-edit-fullname').value,
        phone: staffEditModalEl.querySelector('#staff-edit-phone').value,
        address: staffEditModalEl.querySelector('#staff-edit-address').value,
      };

      e.target.disabled = true;
      try {
        await API().patch(EP().ADMIN_USER_DETAIL(uid), payload);
        showToast('Đã cập nhật thông tin nhân viên!');
        closeModal();
        if (staffTable) staffTable.refresh();
      } catch (err) {
        showToast(err.message || 'Lỗi cập nhật', 'error');
        e.target.disabled = false;
      }
    });
  } catch (err) {
    staffEditModalEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// STAFF DETAIL PANEL (with role assignment)
// ─────────────────────────────────────────────────────────────

async function showStaffDetail(userId) {
  if (!staffDetailEl) return;
  staffDetailEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const [userDetailRes, allRolesRes] = await Promise.all([
      API().get(EP().ADMIN_USER_DETAIL(userId)),
      API().get(EP().ADMIN_ROLES),
    ]);
    const u = userDetailRes.data || userDetailRes;
    const allRoles = allRolesRes.data || allRolesRes;

    const assignedCodes = (u.roles || []).map(r => r.code);
    const unassignedRoles = (allRoles || []).filter(r => !assignedCodes.includes(r.code));

    staffDetailEl.innerHTML = `
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
            <div class="admin-detail-label">Phòng ban</div>
            <div class="admin-detail-value">${esc(u.department?.name) || '—'}</div>
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
            <div class="admin-detail-label">Ngày tạo</div>
            <div class="admin-detail-value">${formatDate(u.createdAt)}</div>
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
            <div style="font-size:0.8rem; color:var(--text-muted);">Nhân viên đã sở hữu tất cả các vai trò.</div>
          ` : `
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <select class="admin-select" id="staff-assign-role-select" style="min-width:180px;">
                <option value="">-- Chọn vai trò --</option>
                ${unassignedRoles.map(r => `<option value="${esc(r.code)}">${esc(r.name)}</option>`).join('')}
              </select>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-staff-assign-role">Gán vai trò</button>
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
    staffDetailEl.querySelectorAll('[data-status-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.dataset.statusAction;
        const uid = btn.dataset.uid;
        const statusLabels = { ACTIVE: 'Kích hoạt', INACTIVE: 'Ngưng hoạt động', LOCKED: 'Khóa' };
        const label = statusLabels[newStatus] || newStatus;
        if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái nhân viên này sang "${label}" không?`)) return;

        try {
          await API().patch(EP().ADMIN_USER_STATUS(uid), { status: newStatus });
          showToast(`Trạng thái nhân viên đã cập nhật: ${newStatus}`);
          if (staffTable) staffTable.refresh();
          await showStaffDetail(parseInt(uid));
        } catch (err) {
          showToast(err.message || 'Lỗi cập nhật', 'error');
        }
      });
    });

    // Assign Role button
    const assignBtn = staffDetailEl.querySelector('#btn-staff-assign-role');
    assignBtn?.addEventListener('click', async () => {
      const selectEl = staffDetailEl.querySelector('#staff-assign-role-select');
      const roleCode = selectEl?.value;
      if (!roleCode) {
        showToast('Vui lòng chọn vai trò để gán', 'error');
        return;
      }
      if (!confirm(`Bạn có chắc muốn gán vai trò "${roleCode}" cho nhân viên này không?`)) return;

      assignBtn.disabled = true;
      try {
        await API().patch(EP().ADMIN_USER_ROLE(u.id), { roleCode });
        showToast(`Đã gán vai trò ${roleCode} thành công!`);
        if (staffTable) staffTable.refresh();
        await showStaffDetail(u.id);
      } catch (err) {
        showToast(err.message || 'Lỗi gán vai trò', 'error');
        assignBtn.disabled = false;
      }
    });

    // Remove Role buttons
    staffDetailEl.querySelectorAll('.admin-btn-remove-role').forEach(btn => {
      btn.addEventListener('click', async () => {
        const roleCode = btn.dataset.roleCode;
        const uid = btn.dataset.uid;

        const currentAdmin = window.FintopInfra.AppState.getState('user') || {};
        if (parseInt(uid) === currentAdmin.id && roleCode === 'SUPER_ADMIN') {
          showToast('Bạn không thể tự gỡ vai trò quản trị viên cấp cao của chính mình!', 'error');
          return;
        }

        if (!confirm(`Bạn có chắc chắn muốn gỡ vai trò "${roleCode}" khỏi nhân viên này không?`)) return;

        btn.disabled = true;
        try {
          await API().delete(EP().ADMIN_USER_ROLE(uid), { body: { roleCode } });
          showToast(`Đã gỡ vai trò ${roleCode} thành công!`);
          if (staffTable) staffTable.refresh();
          await showStaffDetail(parseInt(uid));
        } catch (err) {
          showToast(err.message || 'Lỗi gỡ vai trò', 'error');
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    staffDetailEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. ROLES TABLE (preserved from original)
// ─────────────────────────────────────────────────────────────

async function renderRolesTable(container) {
  const rolesArea = container.querySelector('#roles-table-area');
  rolesArea.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải phân quyền...</div>';

  try {
    const res = await API().get(EP().ADMIN_ROLES);
    const roles = res.data || res;

    rolesArea.innerHTML = `
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
    `;

    // Bind view permissions
    rolesArea.querySelectorAll('[data-action="perms"]').forEach(btn => {
      btn.addEventListener('click', () => showPermissions(parseInt(btn.dataset.id), btn.dataset.name, container));
    });
  } catch (err) {
    rolesArea.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi tải</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

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
