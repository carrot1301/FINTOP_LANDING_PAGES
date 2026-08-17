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
  CEO:            { label: 'CEO',                  color: '#ff3b3b' },
  DEVELOPER:      { label: 'Developer',            color: '#a855f7' },
  ASSISTANT_CEO:  { label: 'Trợ lý CEO',           color: '#ff6b6b' },
  EDITOR_ADMIN:   { label: 'Editor Admin',         color: '#3b82f6' },
  EDITOR_PRO:     { label: 'Editor Pro',           color: '#60a5fa' },
  EDITOR:         { label: 'Editor',               color: '#93c5fd' },
  SALE_ADMIN:     { label: 'Sales Admin',          color: '#22c55e' },
  SALE:           { label: 'Sale',                 color: '#4ade80' },
  CLIENT_DIAMOND: { label: 'Khách hàng Diamond',    color: '#eab308' },
  CLIENT_VIP:     { label: 'Khách hàng VIP',        color: '#f59e0b' },
  CLIENT_PRO:     { label: 'Khách hàng PRO',        color: '#3b82f6' },
  CLIENT:         { label: 'Khách hàng Standard',   color: '#94a3b8' },
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
      const staffId = u.staffCode || String(u.id);

      const broker = u.broker || u.manager || u.assignedBroker;
      let brokerText = '—';
      if (broker) {
        const brokerCode = broker.staffCode || String(broker.id);
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

  staffEditModalEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>';

  try {
    const [userDetailRes, staffListRes] = await Promise.all([
      API().get(EP().ADMIN_USER_DETAIL(userId)),
      API().get(EP().ADMIN_USERS + '?userType=staff&limit=100'),
    ]);
    
    const u = userDetailRes.data || userDetailRes;
    const staffList = staffListRes.data || [];

    const birthDate = u.dob ? new Date(u.dob).toISOString().split('T')[0] : '';
    const joinDate = u.joinDate ? new Date(u.joinDate).toISOString().split('T')[0] : '';
    const staffCode = u.staffCode || String(u.id);
    const userRoles = (u.roles || []).map(r => r.code);
    const phone = u.phone || '';
    const address = u.address || '';

    let avatarUrl = u.avatarUrl || u.avatar || '';
    if (!avatarUrl || avatarUrl.includes('avatar_default.png')) {
      avatarUrl = 'https://fintopdata.vn/file-image/avatar/avatar_default.png';
    }

    // Populate Manager dropdown
    const managerOptions = staffList
      .filter(s => s.id !== u.id) // Cannot be own manager
      .map(s => {
        const code = s.staffCode || String(s.id);
        const label = code ? `${s.fullName} - ${code}` : s.fullName;
        return `<option value="${s.id}" ${u.brokerId === s.id ? 'selected' : ''}>${esc(label)}</option>`;
      })
      .join('');

    staffEditModalEl.innerHTML = `
      <style>
        .edit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
        .edit-modal-container {
          background: #20263f;
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
          padding: 24px;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .edit-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .edit-modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }
        .edit-modal-close-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        .edit-section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .edit-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .edit-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .edit-form-group.full-width {
          grid-column: span 2;
        }
        .edit-form-group.third-width {
          grid-column: span 1;
        }
        @media (max-width: 768px) {
          .edit-form-grid {
            grid-template-columns: 1fr;
          }
          .edit-form-group.full-width, .edit-form-group.third-width {
            grid-column: span 1;
          }
        }
        .edit-label {
          font-size: 0.85rem;
          color: #cbd5e1;
        }
        .edit-label span.required {
          color: #ef4444;
        }
        .edit-input, .edit-select {
          background: #fff;
          color: #000;
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.95rem;
          width: 100%;
          outline: none;
          box-sizing: border-box;
        }
        .edit-input:disabled {
          background: #e2e8f0;
          color: #64748b;
          cursor: not-allowed;
        }
        .checkbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
          padding-left: 10px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .checkbox-input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .edit-modal-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 16px;
        }
        .btn-update {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-update:hover {
          background: #2563eb;
        }
        .btn-close {
          background: #f1f5f9;
          color: #0f172a;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-close:hover {
          background: #e2e8f0;
        }
      </style>

      <div class="edit-modal-overlay" id="staff-edit-overlay">
        <div class="edit-modal-container">
          <div class="edit-modal-header">
            <h3 class="edit-modal-title">Cập nhật người dùng</h3>
            <button class="edit-modal-close-btn" id="btn-close-staff-edit">✕</button>
          </div>
          <div class="edit-modal-body">
            
            <div class="edit-section-title">Thông tin cơ bản</div>
            <div class="edit-form-grid">
              <div class="edit-form-group">
                <label class="edit-label">Tên <span class="required">*</span></label>
                <input type="text" class="edit-input" id="staff-edit-fullname" value="${esc(u.fullName)}" required />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Địa chỉ Email <span class="required">*</span></label>
                <input type="email" class="edit-input" id="staff-edit-email" value="${esc(u.email)}" required />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Ngày sinh <span class="required">*</span></label>
                <input type="date" class="edit-input" id="staff-edit-dob" value="${birthDate}" required />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Số điện thoại <span class="required">*</span></label>
                <input type="text" class="edit-input" id="staff-edit-phone" value="${esc(phone)}" required />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Thứ tự</label>
                <input type="number" class="edit-input" id="staff-edit-sort-order" value="${u.sortOrder || ''}" />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Mật khẩu</label>
                <div>
                  <button type="button" class="btn-blue" id="btn-edit-change-pass" style="background:#3b82f6; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">Đổi mật khẩu</button>
                </div>
              </div>
            </div>

            <div class="edit-section-title">Thông tin liên lạc</div>
            <div class="edit-form-grid">
              <div class="edit-form-group">
                <label class="edit-label">Địa chỉ</label>
                <input type="text" class="edit-input" id="staff-edit-address" value="${esc(address)}" />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">ID nhân sự</label>
                <input type="text" class="edit-input" id="staff-edit-code" value="${esc(staffCode)}" />
              </div>
              <div class="edit-form-group full-width">
                <label class="edit-label">Người quản lý</label>
                <select class="edit-select" id="staff-edit-broker-id">
                  <option value="">-- Chọn người quản lý --</option>
                  ${managerOptions}
                </select>
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Công ty</label>
                <input type="text" class="edit-input" id="staff-edit-company" value="${esc(u.company || '')}" />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Chức vụ</label>
                <input type="text" class="edit-input" id="staff-edit-position" value="${esc(u.position || '')}" />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Gia nhập ngày</label>
                <input type="date" class="edit-input" id="staff-edit-joindate" value="${joinDate}" />
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Thời gian đầu tư</label>
                <select class="edit-select" id="staff-edit-inv-duration">
                  <option value="">-- Chọn thời gian --</option>
                  <option value="0 - 3 tháng" ${['0 - 3 tháng', '0-3 tháng'].includes(u.investmentDuration) ? 'selected' : ''}>0 - 3 tháng</option>
                  <option value="3 - 6 tháng" ${['3 - 6 tháng', '3-6 tháng'].includes(u.investmentDuration) ? 'selected' : ''}>3 - 6 tháng</option>
                  <option value="6 - 12 tháng" ${['6 - 12 tháng', '6-12 tháng'].includes(u.investmentDuration) ? 'selected' : ''}>6 - 12 tháng</option>
                  <option value="Trên 12 tháng" ${['Trên 12 tháng', 'Trên 1 năm'].includes(u.investmentDuration) ? 'selected' : ''}>Trên 12 tháng</option>
                </select>
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Khẩu vị đầu tư</label>
                <select class="edit-select" id="staff-edit-inv-style">
                  <option value="">-- Chọn khẩu vị --</option>
                  <option value="Lướt sóng ngắn hạn" ${u.investmentStyle === 'Lướt sóng ngắn hạn' ? 'selected' : ''}>Lướt sóng ngắn hạn</option>
                  <option value="Trung và dài hạn" ${u.investmentStyle === 'Trung và dài hạn' ? 'selected' : ''}>Trung và dài hạn</option>
                  <option value="Linh hoạt kết hợp" ${u.investmentStyle === 'Linh hoạt kết hợp' ? 'selected' : ''}>Linh hoạt kết hợp</option>
                </select>
              </div>
              <div class="edit-form-group">
                <label class="edit-label">Công ty chứng khoán</label>
                <select class="edit-select" id="staff-edit-stock-company">
                  <option value="">-- Chọn công ty --</option>
                  <option value="VPS" ${u.stockCompany === 'VPS' ? 'selected' : ''}>VPS</option>
                  <option value="SSI" ${u.stockCompany === 'SSI' ? 'selected' : ''}>SSI</option>
                  <option value="VND" ${u.stockCompany === 'VND' ? 'selected' : ''}>VND</option>
                  <option value="TCBS" ${u.stockCompany === 'TCBS' ? 'selected' : ''}>TCBS</option>
                  <option value="MBS" ${u.stockCompany === 'MBS' ? 'selected' : ''}>MBS</option>
                  <option value="Khác" ${['Khác', 'Công ty khác'].includes(u.stockCompany) ? 'selected' : ''}>Khác</option>
                </select>
              </div>
              <div class="edit-form-group full-width">
                <label class="edit-label">Nhập số TKCK VPS (nếu có)</label>
                <input type="text" class="edit-input" id="staff-edit-stock-account" value="${esc(u.stockAccount || '')}" placeholder="Nhập số TKCK VPS (nếu có)" />
              </div>
            </div>

            <div class="edit-form-group full-width" style="margin-top:1.5rem;">
              <label class="edit-label" style="font-weight:bold;">Quyền <span class="required">*</span></label>
              <div style="font-size:0.8rem;color:#94a3b8;margin-bottom:0.5rem;">Chọn vai trò phù hợp cho nhân viên</div>
              <div class="checkbox-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="CEO" ${userRoles.includes('CEO') ? 'checked' : ''} />
                  🔴 CEO - Admin Tổng
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="DEVELOPER" ${userRoles.includes('DEVELOPER') ? 'checked' : ''} />
                  🟣 Developer
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="ASSISTANT_CEO" ${userRoles.includes('ASSISTANT_CEO') ? 'checked' : ''} />
                  🔴 Trợ lý CEO
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="EDITOR_ADMIN" ${userRoles.includes('EDITOR_ADMIN') ? 'checked' : ''} />
                  🔵 Editor Admin
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="EDITOR_PRO" ${userRoles.includes('EDITOR_PRO') ? 'checked' : ''} />
                  🔵 Editor Pro
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="EDITOR" ${userRoles.includes('EDITOR') ? 'checked' : ''} />
                  🔵 Editor
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="SALE_ADMIN" ${userRoles.includes('SALE_ADMIN') ? 'checked' : ''} />
                  🟢 Sales Admin
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="SALE" ${userRoles.includes('SALE') ? 'checked' : ''} />
                  🟢 Sale
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="CLIENT" ${userRoles.includes('CLIENT') ? 'checked' : ''} />
                  ⚪ Khách hàng Standard
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="CLIENT_PRO" ${userRoles.includes('CLIENT_PRO') ? 'checked' : ''} />
                  🔵 Khách hàng PRO
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="CLIENT_VIP" ${userRoles.includes('CLIENT_VIP') ? 'checked' : ''} />
                  🟡 Khách hàng VIP
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input edit-role-chk" value="CLIENT_DIAMOND" ${userRoles.includes('CLIENT_DIAMOND') ? 'checked' : ''} />
                  ⭐ Khách hàng Diamond
                </label>
              </div>
            </div>

            <div class="edit-form-group full-width" style="margin-top:1.5rem;">
              <label class="edit-label" style="font-weight:bold;">Trạng thái <span class="required">*</span></label>
              <div style="padding-left:10px; margin-top:8px;">
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input" id="staff-edit-status" ${u.status === 'ACTIVE' ? 'checked' : ''} />
                  Hoạt động
                </label>
              </div>
            </div>

            <div class="edit-form-group full-width" style="margin-top:1.5rem;">
              <label class="edit-label" style="font-weight:bold;">Chọn ảnh đại diện</label>
              <div style="margin-top:8px;">
                <button type="button" class="btn-close" id="btn-edit-select-avatar" style="background:#fff; color:#000; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;">Chọn ảnh</button>
                <input type="file" id="input-edit-avatar-file" accept="image/*" style="display:none;" />
              </div>
              <div style="margin-top:12px;">
                <img id="img-edit-avatar-preview" src="${esc(avatarUrl)}" style="height:120px; width:120px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,0.1);" />
              </div>
            </div>

          </div>
          <div class="edit-modal-footer">
            <button class="btn-update" id="btn-save-staff-edit" data-uid="${u.id}">Cập nhật</button>
            <button class="btn-close" id="btn-close-footer-staff-edit">Đóng</button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { staffEditModalEl.innerHTML = ''; };
    staffEditModalEl.querySelector('#btn-close-staff-edit').addEventListener('click', closeModal);
    staffEditModalEl.querySelector('#btn-close-footer-staff-edit').addEventListener('click', closeModal);
    staffEditModalEl.querySelector('#staff-edit-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'staff-edit-overlay') closeModal();
    });

    // Change Password Trigger
    staffEditModalEl.querySelector('#btn-edit-change-pass').addEventListener('click', () => {
      showChangePasswordModal(u.id, u.fullName);
    });

    // Avatar Upload Trigger
    const btnSelectAvatar = staffEditModalEl.querySelector('#btn-edit-select-avatar');
    const inputAvatarFile = staffEditModalEl.querySelector('#input-edit-avatar-file');
    const imgAvatarPreview = staffEditModalEl.querySelector('#img-edit-avatar-preview');
    let uploadedAvatarUrl = u.avatarUrl || u.avatar || '';

    btnSelectAvatar.addEventListener('click', () => {
      inputAvatarFile.click();
    });

    inputAvatarFile.addEventListener('change', async () => {
      const file = inputAvatarFile.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('upload', file);

      try {
        showToast('Đang tải ảnh lên...');
        const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
        const response = await fetch('/blogs/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (!response.ok) throw new Error('Không thể tải ảnh lên');
        const result = await response.json();
        uploadedAvatarUrl = result.url;
        imgAvatarPreview.src = result.url;
        showToast('Tải ảnh lên thành công!');
      } catch (err) {
        showToast(err.message || 'Lỗi tải ảnh lên', 'error');
      }
    });

    // Save Action
    staffEditModalEl.querySelector('#btn-save-staff-edit').addEventListener('click', async (e) => {
      const uid = e.target.dataset.uid;
      
      // Collect Checked Roles
      const roleCodes = Array.from(staffEditModalEl.querySelectorAll('.edit-role-chk:checked')).map(el => el.value);
      if (roleCodes.length === 0) {
        showToast('Vui lòng chọn ít nhất một vai trò!', 'error');
        return;
      }

      const status = staffEditModalEl.querySelector('#staff-edit-status').checked ? 'ACTIVE' : 'INACTIVE';
      const brokerId = staffEditModalEl.querySelector('#staff-edit-broker-id').value;

      const payload = {
        fullName: staffEditModalEl.querySelector('#staff-edit-fullname').value,
        email: staffEditModalEl.querySelector('#staff-edit-email').value,
        birthDate: staffEditModalEl.querySelector('#staff-edit-dob').value,
        phone: staffEditModalEl.querySelector('#staff-edit-phone').value,
        sortOrder: staffEditModalEl.querySelector('#staff-edit-sort-order').value || null,
        address: staffEditModalEl.querySelector('#staff-edit-address').value,
        staffCode: staffEditModalEl.querySelector('#staff-edit-code').value,
        brokerId: brokerId ? parseInt(brokerId, 10) : null,
        company: staffEditModalEl.querySelector('#staff-edit-company').value,
        position: staffEditModalEl.querySelector('#staff-edit-position').value,
        joinDate: staffEditModalEl.querySelector('#staff-edit-joindate').value || null,
        investmentDuration: staffEditModalEl.querySelector('#staff-edit-inv-duration').value || null,
        investmentStyle: staffEditModalEl.querySelector('#staff-edit-inv-style').value || null,
        stockCompany: staffEditModalEl.querySelector('#staff-edit-stock-company').value || null,
        stockAccount: staffEditModalEl.querySelector('#staff-edit-stock-account').value || null,
        status: status,
        roleCodes: roleCodes,
        avatarUrl: uploadedAvatarUrl
      };

      e.target.disabled = true;
      try {
        await API().patch(EP().ADMIN_USER_DETAIL(uid), payload);
        showToast('Đã cập nhật thông tin thành viên thành công!');
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

    const investDuration = u.investmentDuration || '';
    const investStyle = u.investmentStyle || '';
    const birthDate = formatBirthDate(u.dob || u.birthDate || u.dateOfBirth || u.birthday);
    const joinDateFormatted = u.joinDate ? new Date(u.joinDate).toLocaleDateString('vi-VN') : '—';
    const staffId = u.staffCode || String(u.id);

    staffDetailEl.innerHTML = `
      <div class="admin-modal-overlay" id="staff-detail-overlay">
        <div class="admin-modal" style="max-width:700px; max-height:90vh; overflow-y:auto;">
          <div class="admin-modal-header">
            <h3>👤 Chi tiết & Phân quyền: ${esc(u.fullName)} <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem;">#${u.id}</span></h3>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-staff-detail">✕</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-detail-grid">
              <div class="admin-detail-field">
                <div class="admin-detail-label">Họ và tên</div>
                <div class="admin-detail-value"><strong>${esc(u.fullName)}</strong></div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Email</div>
                <div class="admin-detail-value">${esc(u.email)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Số điện thoại</div>
                <div class="admin-detail-value">${esc(u.phone) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Ngày sinh</div>
                <div class="admin-detail-value">${birthDate}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Địa chỉ</div>
                <div class="admin-detail-value">${esc(u.address) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">ID nhân sự</div>
                <div class="admin-detail-value"><strong style="color:#ffb200;">${esc(staffId)}</strong></div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Phòng ban</div>
                <div class="admin-detail-value">${esc(u.department?.name) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Nhóm / Team</div>
                <div class="admin-detail-value">${esc(u.team?.name) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Công ty</div>
                <div class="admin-detail-value">${esc(u.company) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Chức vụ</div>
                <div class="admin-detail-value">${esc(u.position) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Gia nhập ngày</div>
                <div class="admin-detail-value">${joinDateFormatted}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Thời gian đầu tư</div>
                <div class="admin-detail-value">${esc(investDuration) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Khẩu vị đầu tư</div>
                <div class="admin-detail-value">${esc(investStyle) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Công ty chứng khoán</div>
                <div class="admin-detail-value">${esc(u.stockCompany) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Số TK CK</div>
                <div class="admin-detail-value">${esc(u.stockAccount) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Trạng thái</div>
                <div class="admin-detail-value">${statusBadge(u.status)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Ngày tạo</div>
                <div class="admin-detail-value">${formatDate(u.createdAt)}</div>
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
            </div>

            <div style="margin-top:1.25rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:1rem;">
              <div style="display:flex;gap:0.5rem;">
                <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="ACTIVE" data-uid="${u.id}" ${u.status === 'ACTIVE' ? 'disabled' : ''}>✅ Kích hoạt</button>
                <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="INACTIVE" data-uid="${u.id}" ${u.status === 'INACTIVE' ? 'disabled' : ''}>⏸️ Ngưng</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" data-status-action="LOCKED" data-uid="${u.id}" ${u.status === 'LOCKED' ? 'disabled' : ''}>🔒 Khóa</button>
              </div>
            </div>

            <div style="margin-top:1.25rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem;">
              <div class="admin-detail-label" style="margin-bottom:0.5rem;">🔑 Cấp vai trò mới</div>
              ${unassignedRoles.length === 0 ? `
                <div style="font-size:0.8rem; color:var(--text-muted);">Nhân viên đã sở hữu tất cả các vai trò.</div>
              ` : `
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <select class="admin-select" id="staff-assign-role-select" style="min-width:180px;">
                    <option value="">-- Chọn vai trò --</option>
                    ${unassignedRoles.map(r => {
                      const display = ROLE_DISPLAY[r.code] || { label: r.name || r.code };
                      return `<option value="${esc(r.code)}">${esc(display.label)}</option>`;
                    }).join('')}
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
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" id="btn-footer-close-staff-detail">Đóng</button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { staffDetailEl.innerHTML = ''; };
    staffDetailEl.querySelector('#btn-close-staff-detail')?.addEventListener('click', closeModal);
    staffDetailEl.querySelector('#btn-footer-close-staff-detail')?.addEventListener('click', closeModal);
    staffDetailEl.querySelector('#staff-detail-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'staff-detail-overlay') closeModal();
    });

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

function showChangePasswordModal(userId, fullName) {
  const modalArea = document.getElementById('prof-change-pass-modal-area');
  if (!modalArea) return;

  modalArea.innerHTML = `
    <div class="admin-modal-overlay" id="change-pass-overlay">
      <div class="admin-modal" style="max-width:400px; margin-top: 10%;">
        <div class="admin-modal-header">
          <h3>🔑 Đổi mật khẩu nhân viên</h3>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-change-pass">✕</button>
        </div>
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label class="profile-label">Mật khẩu mới cho: ${esc(fullName)}</label>
            <input type="password" class="admin-input" id="change-pass-input" placeholder="Nhập mật khẩu mới..." />
          </div>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn admin-btn-secondary" id="btn-cancel-change-pass">Hủy</button>
          <button class="admin-btn admin-btn-primary" id="btn-save-change-pass">Lưu mật khẩu</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalArea.innerHTML = ''; };
  modalArea.querySelector('#btn-close-change-pass').addEventListener('click', closeModal);
  modalArea.querySelector('#btn-cancel-change-pass').addEventListener('click', closeModal);
  modalArea.querySelector('#change-pass-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'change-pass-overlay') closeModal();
  });

  modalArea.querySelector('#btn-save-change-pass').addEventListener('click', async () => {
    const newPassword = modalArea.querySelector('#change-pass-input').value;
    if (!newPassword || newPassword.trim().length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    try {
      await API().patch(EP().ADMIN_USER_DETAIL(userId), { password: newPassword });
      showToast('Đổi mật khẩu thành công!');
      closeModal();
    } catch (err) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 2. ROLES TABLE (preserved from original)
// ─────────────────────────────────────────────────────────────

async function renderRolesTable(container) {
  const rolesArea = container.querySelector('#roles-table-area');
  rolesArea.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải phân quyền...</div>';

  // Hierarchy rank order: CEO highest (1) → CLIENT lowest (13)
  const ROLE_RANK_ORDER = {
    CEO: 1, DEVELOPER: 2, ASSISTANT_CEO: 3, EDITOR_ADMIN: 4,
    EDITOR_PRO: 5, EDITOR: 6, SALE_ADMIN: 7, SALE: 8,
    EXPERT: 9, CLIENT_DIAMOND: 10, CLIENT_VIP: 11, CLIENT_PRO: 12, CLIENT: 13,
  };

  try {
    const res = await API().get(EP().ADMIN_ROLES);
    let roles = res.data || res;

    // Filter out SUPER_ADMIN — CEO is the highest visible role
    roles = (Array.isArray(roles) ? roles : [])
      .filter(r => r.code !== 'SUPER_ADMIN')
      .sort((a, b) => (ROLE_RANK_ORDER[a.code] ?? 99) - (ROLE_RANK_ORDER[b.code] ?? 99));

    rolesArea.innerHTML = `
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">🔑 Vai trò hệ thống</div>
        </div>
        <table class="admin-table">
          <thead><tr><th>STT</th><th>Tên</th><th>Mã</th><th>Hệ thống</th><th>Trạng thái</th><th>Quyền</th><th>Người dùng</th><th></th></tr></thead>
          <tbody>
            ${roles.map((r, idx) => {
              const display = ROLE_DISPLAY[r.code] || { label: r.name };
              const displayName = display.label;
              return `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${esc(displayName)}</strong></td>
                <td>${roleBadge(r.code)}</td>
                <td>${r.isSystem ? '🔒 Có' : '—'}</td>
                <td>${statusBadge(r.status)}</td>
                <td>${r.permissionCount || 0}</td>
                <td>${r.userCount || 0}</td>
                <td><button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="perms" data-id="${r.id}" data-name="${esc(displayName)}">Xem quyền</button></td>
              </tr>
            `}).join('')}
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
