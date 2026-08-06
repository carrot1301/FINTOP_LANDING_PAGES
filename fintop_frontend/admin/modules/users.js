/**
 * users.js — Quản trị khách hàng (Client Management Module)
 * ============================================================
 * Replicated from legacy web: /system/client/index
 *
 * Features matching legacy web:
 *   - Full user info card: Tên, SĐT, Email, Địa chỉ, Ngày sinh,
 *     Ngày gia nhập, Thời gian đầu tư, Khẩu vị, CTCK, Số TKCK,
 *     Loại TK, Quyền truy cập
 *   - Người quản lý (Broker) column
 *   - Toggle trạng thái (active/inactive)
 *   - Sửa thông tin (edit modal)
 *   - Nâng cấp tài khoản (upgrade tier modal)
 *   - Search by name/email/phone
 *   - Pagination
 *   - Role management (existing feature preserved)
 */
import { AdminTable, esc, badge, statusBadge, tierBadge, roleBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let table = null;
let editModalEl = null;
let upgradeModalEl = null;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const INVESTMENT_DURATION_LABELS = {
  '0_3':  '0 - 3 tháng',
  '3_6':  '3 - 6 tháng',
  '6_12': '6 - 12 tháng',
  '12_':  'Trên 12 tháng',
  // Vietnamese values from registration form
  '0-3 tháng':  '0 - 3 tháng',
  '3-6 tháng':  '3 - 6 tháng',
  '6-12 tháng': '6 - 12 tháng',
  'Trên 1 năm': 'Trên 12 tháng',
};

const INVESTMENT_STYLE_LABELS = {
  'short_term':   'Lướt sóng ngắn hạn',
  'medium_long':  'Trung và dài hạn',
  'flexible':     'Linh hoạt kết hợp',
  // Vietnamese values from registration form
  'Lướt sóng ngắn hạn': 'Lướt sóng ngắn hạn',
  'Trung và dài hạn':   'Trung và dài hạn',
  'Linh hoạt kết hợp':  'Linh hoạt kết hợp',
};

const TIER_LABELS = {
  standard: 'Khách hàng Standard',
  silver:   'Khách hàng Pro',
  gold:     'Khách hàng Pro',
  diamond:  'Khách hàng Diamond',
  vip:      'Khách hàng Pro',
};

const ROLE_DISPLAY = {
  SUPER_ADMIN:    { label: 'Admin',       color: '#ff3b3b' },
  ADMIN:          { label: 'Admin',       color: '#ff3b3b' },
  EDITOR_ADMIN:   { label: 'Editor Admin',color: '#3b82f6' },
  EDITOR_PRO:     { label: 'Editor Pro',  color: '#60a5fa' },
  EDITOR:         { label: 'Editor',      color: '#93c5fd' },
  SALE_ADMIN:     { label: 'Sales Admin', color: '#22c55e' },
  SALE:           { label: 'Sale',        color: '#4ade80' },
  USER:           { label: 'Khách hàng',  color: '#ff7c00' },
};

function getRoleLabel(roles) {
  if (!roles || roles.length === 0) return `<span style="color:#ff7c00"> Khách hàng </span>`;
  const primary = roles[0];
  const code = primary.code || primary;
  const display = ROLE_DISPLAY[code] || { label: code, color: '#ff7c00' };
  return `<span style="color:${display.color}"> ${display.label} </span>`;
}

function getTierLabel(tier) {
  const t = (tier || 'standard').toLowerCase();
  return TIER_LABELS[t] || tier || 'Thường';
}

function getInvestDurationLabel(val) {
  return INVESTMENT_DURATION_LABELS[val] || val || '';
}

function getInvestStyleLabel(val) {
  return INVESTMENT_STYLE_LABELS[val] || val || '';
}

function formatBirthDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  id: 'users',
  label: 'Quản trị khách hàng',
  icon: '👥',

  async render(container) {
    container.innerHTML = `
      <div id="user-edit-modal-area"></div>
      <div id="user-upgrade-modal-area"></div>
      <div id="user-detail-area"></div>
      <div id="user-table-area"></div>
    `;

    editModalEl = container.querySelector('#user-edit-modal-area');
    upgradeModalEl = container.querySelector('#user-upgrade-modal-area');

    table = new AdminTable({
      container: container.querySelector('#user-table-area'),
      title: 'Danh sách khách hàng',
      columns: ['STT', 'Thông tin người dùng', 'Người quản lý', 'Trạng thái', 'Nâng cấp'],
      searchable: true,
      searchPlaceholder: 'Tìm kiếm tên, sđt, email...',
      toolbarExtra: () => `
        <button class="admin-btn admin-btn-danger admin-btn-sm" id="btn-delete-selected" title="Xóa người dùng đã chọn">🗑️ Xóa</button>
      `,
      filters: {
        tierLevel: {
          label: 'Gói hội viên',
          options: [
            { value: 'STANDARD', label: 'Khách hàng Standard' },
            { value: 'SILVER', label: 'Khách hàng Pro' },
            { value: 'DIAMOND', label: 'Khách hàng Diamond' },
          ]
        },
        status: {
          label: 'Trạng thái',
          options: [
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'INACTIVE', label: 'Ngưng' },
            { value: 'LOCKED', label: 'Khóa' },
          ]
        }
      },
      fetchData: async (page, filters) => {
        const qs = API().toQuery({ page: 1, limit: 1000, search: filters.search, status: filters.status, tierLevel: filters.tierLevel, userType: 'client' });
        const res = await API().get(EP().ADMIN_USERS + qs);
        let rawData = res.data || [];
        if (Array.isArray(res)) rawData = res;

        // Multi-field search and tier filtering fallback
        if (filters.tierLevel) {
          const targetTier = filters.tierLevel.toUpperCase();
          rawData = rawData.filter(u => {
            const userTier = (u.tierLevel || u.legacyTier || 'STANDARD').toUpperCase();
            if (targetTier === 'GOLD' && (userTier === 'VIP' || userTier === 'GOLD')) return true;
            if (targetTier === 'SILVER' && (userTier === 'PRO' || userTier === 'SILVER')) return true;
            return userTier === targetTier;
          });
        }

        if (filters.status) {
          const targetStatus = filters.status.toUpperCase();
          rawData = rawData.filter(u => (u.status || '').toUpperCase() === targetStatus);
        }

        if (filters.search && filters.search.trim() !== '') {
          const q = filters.search.trim().toLowerCase();
          rawData = rawData.filter(u => {
            const name = (u.fullName || u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            const phone = (u.phone || u.phoneNumber || '').toLowerCase();
            const address = (u.address || u.city || '').toLowerCase();
            const stockAccount = (u.stockAccount || '').toLowerCase();
            const stockCompany = (u.stockCompany || '').toLowerCase();
            return name.includes(q) || email.includes(q) || phone.includes(q) || address.includes(q) || stockAccount.includes(q) || stockCompany.includes(q);
          });
        }

        const limit = 15;
        const total = rawData.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * limit;
        const pagedData = rawData.slice(start, start + limit);

        pagedData.forEach((u, i) => { u._stt = start + i + 1; });

        return {
          data: pagedData,
          meta: { total, page: currentPage, limit, totalPages }
        };
      },
      renderRow: (u) => {
        const investDuration = getInvestDurationLabel(u.investmentDuration || u.investment_duration);
        const investStyle = getInvestStyleLabel(u.investmentStyle || u.investment_style);
        const broker = u.broker || u.manager || u.assignedBroker;
        let brokerDisplay = '-';
        if (broker) {
          const bName = broker.fullName || broker.name || (typeof broker === 'string' ? broker : '');
          const bCode = broker.staffCode || broker.team?.code || '';
          if (bCode && bName) {
            brokerDisplay = `${bCode} - ${bName}`;
          } else if (bName) {
            brokerDisplay = bName;
          }
        }
        const phone = u.phone || u.phoneNumber || '';
        const address = u.address || u.city || '';
        const birthDate = formatBirthDate(u.dob || u.birthDate || u.dateOfBirth || u.birthday);
        const joinDate = formatDate(u.createdAt);
        const stockCompany = u.stockCompany || u.securitiesCompany || u.brokerCompany || '';
        const stockAccount = u.stockAccount || u.securitiesAccount || u.brokerAccount || '';
        const tierLabel = u.legacyTier || getTierLabel(u.tierLevel);
        let tierHtml = esc(tierLabel);
        if (tierLabel && tierLabel !== 'Thường') {
          tierHtml = `<span style="color:#22c55e;font-weight:bold;">${esc(tierLabel)}</span>`;
        }
        const roleLabel = getRoleLabel(u.roles);
        const isActive = (u.status || '').toUpperCase() === 'ACTIVE';

        const refId = u.referralId || '';
        const refName = u.referralName || '';

        const tier = (u.tierLevel || 'standard').toLowerCase();
        const isPro = tier === 'silver' || tier === 'gold';
        const isVipDiamond = tier === 'vip' || tier === 'diamond';

        // Approval info details based on tier Level
        let approvalInfoHtml = '';
        if (isPro) {
          const sub = u.activeSubscription;
          const planName = sub?.plan?.name || (tier === 'silver' ? 'Silver' : 'Gold');
          const isUnlimited = sub?.isPermanent || (sub?.endDate && new Date(sub.endDate).getFullYear() >= 2099);
          const expiryText = isUnlimited ? 'Mặc định (Vĩnh viễn)' : (sub?.endDate ? formatDate(sub.endDate) : 'Chưa kích hoạt');
          
          let proofHtml = '—';
          if (u.paymentProofUrl) {
            proofHtml = `<a href="${esc(u.paymentProofUrl)}" target="_blank" style="color:var(--purple-glow);text-decoration:underline;font-weight:600;">Xem ảnh thanh toán 👁️</a>`;
          }

          approvalInfoHtml = `
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); color: #f59e0b; font-size: 0.78rem;">
              <strong>Thông tin phê duyệt (Gói PRO):</strong>
              <div>• Gói đăng ký: <span class="admin-badge tier-${tier}">${esc(planName)}</span></div>
              <div>• Ảnh thanh toán: ${proofHtml}</div>
              <div>• Thời hạn: ${expiryText}</div>
            </div>
          `;
        } else if (isVipDiamond) {
          approvalInfoHtml = `
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); color: #10b981; font-size: 0.78rem;">
              <strong>Thông tin phê duyệt (VIP/Diamond):</strong>
              <div>• Công ty chứng khoán: <strong>${esc(stockCompany || '—')}</strong></div>
              <div>• Số TKCK: <strong>${esc(stockAccount || '—')}</strong></div>
              <div>• Thời hạn: Mặc định (Vĩnh viễn)</div>
            </div>
          `;
        }

        return `
          <tr data-uid="${u.id}">
            <td style="width:5%;vertical-align:middle;text-align:center;">
              <input type="checkbox" class="chk-user-item" value="${u.id}" />
            </td>
            <td style="width:50%;height:auto;padding:12px 16px;vertical-align:middle;">
              <div class="user-info-card">
                <div>Tên khách hàng: <strong>${esc(u.fullName || u.name || '')}</strong></div>
                <div>Số điện thoại : ${esc(phone)}</div>
                <div>Địa chỉ Email : ${esc(u.email)}</div>
                <div>Địa chỉ : ${esc(address)}</div>
                <div>Ngày sinh : ${birthDate}</div>
                <div>Ngày gia nhập : ${joinDate}</div>
                <div>Thời gian đầu tư: ${esc(investDuration)}</div>
                <div>Khẩu vị đầu tư : ${esc(investStyle)}</div>
                <div>Công ty chứng khoán : ${esc(stockCompany || '—')}</div>
                <div>Số TKCK VPS (nếu có) : ${esc(stockAccount || '—')}</div>
                <div>ID người giới thiệu : ${esc(refId)}</div>
                <div>Tên người giới thiệu : ${esc(refName)}</div>
                <div>Loại tài khoản :  ${tierHtml} </div>
                <div>Quyền truy cập : ${roleLabel}</div>
                ${approvalInfoHtml}
              </div>
            </td>
            <td style="width:15%;vertical-align:middle;text-align:center;">
              <span>${esc(brokerDisplay)}</span>
            </td>
            <td style="width:10%;vertical-align:middle;text-align:center;">
              <label class="toggle-switch" style="cursor:pointer;">
                <input type="checkbox" class="toggle-user-status" data-uid="${u.id}" ${isActive ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </td>
            <td style="width:20%;vertical-align:middle;text-align:center;">
              <button class="admin-btn admin-btn-warning admin-btn-sm" data-action="edit-data" data-id="${u.id}" title="Sửa thông tin">
                ✏️ Sửa
              </button>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" data-action="view" data-id="${u.id}" title="Chi tiết & Phân quyền">
                📋
              </button>
              <span class="upgrade-btn" data-action="upgrade" data-id="${u.id}" data-name="${esc(u.fullName || u.name || '')}" data-tier="${esc(u.tierLevel || 'standard')}" style="cursor:pointer;margin-left:4px;" title="Nâng cấp tài khoản">
                <span style="font-size:1.5rem;color:#00ff10;">⚙️</span>
              </span>
            </td>
          </tr>
        `;
      },
      onRowAction: async (action, id, dataset) => {
        if (action === 'view') await showUserDetail(parseInt(id));
        if (action === 'edit-data') await showEditModal(parseInt(id));
        if (action === 'upgrade') showUpgradeModal(parseInt(id), dataset.name, dataset.tier);
      },
    });

    // Bind toggle status
    container.querySelector('#user-table-area').addEventListener('change', async (e) => {
      if (e.target.classList.contains('toggle-user-status')) {
        const uid = e.target.dataset.uid;
        const newStatus = e.target.checked ? 'ACTIVE' : 'INACTIVE';
        try {
          await API().patch(EP().ADMIN_USER_STATUS(uid), { status: newStatus });
          showToast(`Trạng thái đã cập nhật: ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}`);
        } catch (err) {
          showToast(err.message || 'Lỗi cập nhật trạng thái', 'error');
          e.target.checked = !e.target.checked; // Revert
        }
      }
    });

    // Bind delete selected
    container.querySelector('#btn-delete-selected')?.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.chk-user-item:checked');
      if (checked.length === 0) {
        showToast('Vui lòng chọn ít nhất một khách hàng để xóa.', 'error');
        return;
      }
      const ids = Array.from(checked).map(c => parseInt(c.value));
      if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} khách hàng đã chọn?`)) return;
      
      try {
        await Promise.all(ids.map(id => API().delete(EP().ADMIN_USER_DETAIL(id))));
        showToast(`Đã xóa thành công ${ids.length} khách hàng!`);
        if (table) table.refresh();
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa khách hàng', 'error');
      }
    });
  },

  destroy() {
    table = null;
    editModalEl = null;
    upgradeModalEl = null;
  },
};

// ─────────────────────────────────────────────────────────────
// EDIT MODAL (Sửa thông tin khách hàng)
// ─────────────────────────────────────────────────────────────

async function showEditModal(userId) {
  if (!editModalEl) return;

  editModalEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  try {
    const res = await API().get(EP().ADMIN_USER_DETAIL(userId));
    const u = res.data || res;

    const birthDate = u.dob ? new Date(u.dob).toISOString().split('T')[0] : '';

    const getStandardDuration = (val) => {
      const clean = String(val || '').replace(/\s+/g, '').replace(/-/g, '_').toLowerCase();
      if (clean.includes('0_3') || clean.includes('03')) return '0_3';
      if (clean.includes('3_6') || clean.includes('36')) return '3_6';
      if (clean.includes('6_12') || clean.includes('612')) return '6_12';
      if (clean.includes('12') || clean.includes('1năm') || clean.includes('1nam') || clean.includes('trên1')) return '12_';
      return '';
    };

    const getStandardStyle = (val) => {
      const clean = String(val || '').toLowerCase();
      if (clean.includes('short') || clean.includes('lướt') || clean.includes('luot')) return 'short_term';
      if (clean.includes('long') || clean.includes('trung') || clean.includes('dài') || clean.includes('dai')) return 'medium_long';
      if (clean.includes('flex') || clean.includes('linh') || clean.includes('kết') || clean.includes('ket')) return 'flexible';
      return '';
    };

    const getStandardBroker = (val) => {
      const clean = String(val || '').toUpperCase();
      if (clean.includes('VPS')) return 'VPS';
      if (clean.includes('SSI')) return 'SSI';
      if (clean.includes('VND')) return 'VND';
      if (clean.includes('HSC')) return 'HSC';
      if (clean.includes('MBS')) return 'MBS';
      if (clean.includes('FPTS')) return 'FPTS';
      if (clean.includes('TCBS')) return 'TCBS';
      if (clean.includes('NONE') || clean.includes('CHƯA') || clean.includes('CHUA') || !val) return 'none';
      return 'Công ty khác';
    };

    const durationVal = getStandardDuration(u.investmentDuration || u.investment_duration);
    const styleVal = getStandardStyle(u.investmentStyle || u.investment_style);
    const brokerVal = getStandardBroker(u.stockCompany);

    editModalEl.innerHTML = `
      <div class="admin-modal-overlay" id="edit-modal-overlay">
        <div class="admin-modal" style="max-width:600px;">
          <div class="admin-modal-header">
            <h3>✏️ Sửa thông tin khách hàng</h3>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-edit">✕</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <div class="admin-form-group">
                <label>Họ tên</label>
                <input type="text" class="admin-input" id="edit-fullname" value="${esc(u.fullName || u.name || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Số điện thoại</label>
                <input type="text" class="admin-input" id="edit-phone" value="${esc(u.phone || u.phoneNumber || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Email</label>
                <input type="email" class="admin-input" id="edit-email" value="${esc(u.email || '')}" disabled />
              </div>
              <div class="admin-form-group">
                <label>Địa chỉ</label>
                <input type="text" class="admin-input" id="edit-address" value="${esc(u.address || u.city || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Ngày sinh</label>
                <input type="date" class="admin-input" id="edit-birthday" value="${birthDate}" />
              </div>
              <div class="admin-form-group">
                <label>Thời gian đầu tư</label>
                <select class="admin-select" id="edit-invest-duration">
                  <option value="">-- Chọn --</option>
                  <option value="0_3" ${durationVal === '0_3' ? 'selected' : ''}>0 - 3 tháng</option>
                  <option value="3_6" ${durationVal === '3_6' ? 'selected' : ''}>3 - 6 tháng</option>
                  <option value="6_12" ${durationVal === '6_12' ? 'selected' : ''}>6 - 12 tháng</option>
                  <option value="12_" ${durationVal === '12_' ? 'selected' : ''}>Trên 12 tháng</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Khẩu vị đầu tư</label>
                <select class="admin-select" id="edit-invest-style">
                  <option value="">-- Chọn --</option>
                  <option value="short_term" ${styleVal === 'short_term' ? 'selected' : ''}>Lướt sóng ngắn hạn</option>
                  <option value="medium_long" ${styleVal === 'medium_long' ? 'selected' : ''}>Trung và dài hạn</option>
                  <option value="flexible" ${styleVal === 'flexible' ? 'selected' : ''}>Linh hoạt kết hợp</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Công ty chứng khoán</label>
                <select class="admin-select" id="edit-stock-company">
                  <option value="">-- Chọn --</option>
                  <option value="none" ${brokerVal === 'none' ? 'selected' : ''}>Chưa TKCK</option>
                  <option value="VPS" ${brokerVal === 'VPS' ? 'selected' : ''}>VPS</option>
                  <option value="SSI" ${brokerVal === 'SSI' ? 'selected' : ''}>SSI</option>
                  <option value="VND" ${brokerVal === 'VND' ? 'selected' : ''}>VND</option>
                  <option value="HSC" ${brokerVal === 'HSC' ? 'selected' : ''}>HSC</option>
                  <option value="MBS" ${brokerVal === 'MBS' ? 'selected' : ''}>MBS</option>
                  <option value="FPTS" ${brokerVal === 'FPTS' ? 'selected' : ''}>FPTS</option>
                  <option value="TCBS" ${brokerVal === 'TCBS' ? 'selected' : ''}>TCBS</option>
                  <option value="Công ty khác" ${brokerVal === 'Công ty khác' ? 'selected' : ''}>Công ty khác</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label>Số TKCK (nếu có)</label>
                <input type="text" class="admin-input" id="edit-stock-account" value="${esc(u.stockAccount || u.securitiesAccount || '')}" />
              </div>
              <div class="admin-form-group">
                <label>ID người giới thiệu</label>
                <input type="text" class="admin-input" id="edit-referral-id" value="${esc(u.referralId || '')}" />
              </div>
              <div class="admin-form-group">
                <label>Tên người giới thiệu</label>
                <input type="text" class="admin-input" id="edit-referral-name" value="${esc(u.referralName || '')}" />
              </div>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" id="btn-cancel-edit">Hủy</button>
            <button class="admin-btn admin-btn-primary" id="btn-save-edit" data-uid="${u.id}">💾 Lưu thay đổi</button>
          </div>
        </div>
      </div>
    `;

    // Close handlers
    const closeModal = () => { editModalEl.innerHTML = ''; };
    editModalEl.querySelector('#btn-close-edit').addEventListener('click', closeModal);
    editModalEl.querySelector('#btn-cancel-edit').addEventListener('click', closeModal);
    editModalEl.querySelector('#edit-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal-overlay') closeModal();
    });

    // Save handler
    editModalEl.querySelector('#btn-save-edit').addEventListener('click', async (e) => {
      const uid = e.target.dataset.uid;
      const payload = {
        fullName: editModalEl.querySelector('#edit-fullname').value,
        phone: editModalEl.querySelector('#edit-phone').value,
        address: editModalEl.querySelector('#edit-address').value,
        birthDate: editModalEl.querySelector('#edit-birthday').value,
        investmentDuration: editModalEl.querySelector('#edit-invest-duration').value,
        investmentStyle: editModalEl.querySelector('#edit-invest-style').value,
        stockCompany: editModalEl.querySelector('#edit-stock-company').value,
        stockAccount: editModalEl.querySelector('#edit-stock-account').value,
        referralId: editModalEl.querySelector('#edit-referral-id').value,
        referralName: editModalEl.querySelector('#edit-referral-name').value,
      };

      e.target.disabled = true;
      try {
        await API().patch(EP().ADMIN_USER_DETAIL(uid), payload);
        showToast('Đã cập nhật thông tin khách hàng!');
        closeModal();
        if (table) table.refresh();
      } catch (err) {
        showToast(err.message || 'Lỗi cập nhật', 'error');
        e.target.disabled = false;
      }
    });

  } catch (err) {
    editModalEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// UPGRADE MODAL (Nâng cấp tài khoản)
// ─────────────────────────────────────────────────────────────

function showUpgradeModal(userId, userName, currentTier) {
  if (!upgradeModalEl) return;

  upgradeModalEl.innerHTML = `
    <div class="admin-modal-overlay" id="upgrade-modal-overlay">
      <div class="admin-modal" style="max-width:450px;">
        <div class="admin-modal-header">
          <h3>⚙️ Nâng cấp tài khoản</h3>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-upgrade">✕</button>
        </div>
        <div class="admin-modal-body">
          <div style="margin-bottom:1rem;">
            <strong>Khách hàng:</strong> ${esc(userName)}<br/>
            <strong>Gói hiện tại:</strong> ${tierBadge(currentTier)}
          </div>
          <div class="admin-form-group">
            <label>Nâng cấp lên gói</label>
            <select class="admin-select" id="upgrade-tier">
              <option value="standard" ${currentTier === 'standard' ? 'selected' : ''}>Khách hàng Standard</option>
              <option value="silver" ${currentTier === 'silver' ? 'selected' : ''}>Khách hàng Pro</option>
              <option value="diamond" ${currentTier === 'diamond' ? 'selected' : ''}>Khách hàng Diamond</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Người quản lý (Broker)</label>
            <input type="text" class="admin-input" id="upgrade-broker" placeholder="Nhập tên hoặc ID broker..." />
          </div>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn admin-btn-secondary" id="btn-cancel-upgrade">Hủy</button>
          <button class="admin-btn admin-btn-primary" id="btn-save-upgrade" data-uid="${userId}">✅ Xác nhận nâng cấp</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { upgradeModalEl.innerHTML = ''; };
  upgradeModalEl.querySelector('#btn-close-upgrade').addEventListener('click', closeModal);
  upgradeModalEl.querySelector('#btn-cancel-upgrade').addEventListener('click', closeModal);
  upgradeModalEl.querySelector('#upgrade-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'upgrade-modal-overlay') closeModal();
  });

  upgradeModalEl.querySelector('#btn-save-upgrade').addEventListener('click', async (e) => {
    const uid = e.target.dataset.uid;
    const newTier = upgradeModalEl.querySelector('#upgrade-tier').value;
    const broker = upgradeModalEl.querySelector('#upgrade-broker').value;

    if (!confirm(`Xác nhận nâng cấp khách hàng "${userName}" lên gói "${getTierLabel(newTier)}"?`)) return;

    e.target.disabled = true;
    try {
      // Update tier and broker via user details endpoint
      await API().patch(EP().ADMIN_USER_DETAIL(uid), { tierLevel: newTier, broker });
      showToast(`Đã nâng cấp thành công lên gói ${getTierLabel(newTier)}!`);
      closeModal();
      if (table) table.refresh();
    } catch (err) {
      showToast(err.message || 'Lỗi nâng cấp', 'error');
      e.target.disabled = false;
    }
  });
}

// ─────────────────────────────────────────────────────────────
// DETAIL PANEL (Chi tiết & Phân quyền — preserved from original)
// ─────────────────────────────────────────────────────────────

async function showUserDetail(userId) {
  const detailContainer = document.getElementById('user-detail-area');
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
      <div class="admin-modal-overlay" id="detail-modal-overlay">
        <div class="admin-modal" style="max-width:700px; max-height:90vh; overflow-y:auto;">
          <div class="admin-modal-header">
            <h3>👤 Chi tiết & Phân quyền: ${esc(u.fullName)} <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem;">#${u.id}</span></h3>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-detail">✕</button>
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
                <div class="admin-detail-value">${u.dob ? new Date(u.dob).toLocaleDateString('vi-VN') : '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Địa chỉ</div>
                <div class="admin-detail-value">${esc(u.address) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Gói hội viên</div>
                <div class="admin-detail-value">${tierBadge(u.tierLevel)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Trạng thái</div>
                <div class="admin-detail-value">${statusBadge(u.status)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Ngày tạo tài khoản</div>
                <div class="admin-detail-value">${formatDate(u.createdAt)}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Đăng ký hoạt động</div>
                <div class="admin-detail-value">${u.activeSubscription ? esc(u.activeSubscription.plan?.name) : '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Phòng ban / Nhóm</div>
                <div class="admin-detail-value">${esc(u.department?.name || u.team?.name) || '—'}</div>
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
                <div class="admin-detail-label">Thời gian đầu tư</div>
                <div class="admin-detail-value">${esc(getInvestDurationLabel(u.investmentDuration)) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Khẩu vị đầu tư</div>
                <div class="admin-detail-value">${esc(getInvestStyleLabel(u.investmentStyle)) || '—'}</div>
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
                <div class="admin-detail-label">ID người giới thiệu</div>
                <div class="admin-detail-value">${esc(u.referralId) || '—'}</div>
              </div>
              <div class="admin-detail-field">
                <div class="admin-detail-label">Tên người giới thiệu</div>
                <div class="admin-detail-value">${esc(u.referralName) || '—'}</div>
              </div>
              <div class="admin-detail-field" style="grid-column: span 2;">
                <div class="admin-detail-label">Vai trò hệ thống</div>
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
                <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="ACTIVE" data-uid="${u.id}">✅ Kích hoạt</button>
                <button class="admin-btn admin-btn-secondary admin-btn-sm" data-status-action="INACTIVE" data-uid="${u.id}">⏸️ Ngưng</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" data-status-action="LOCKED" data-uid="${u.id}">🔒 Khóa</button>
              </div>
            </div>

            <div style="margin-top:1.25rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem;">
              <div class="admin-detail-label" style="margin-bottom:0.5rem;">🔑 Cấp vai trò mới</div>
              ${unassignedRoles.length === 0 ? `
                <div style="font-size:0.8rem; color:var(--text-muted);">Người dùng đã sở hữu tất cả các vai trò.</div>
              ` : `
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <select class="admin-select" id="assign-role-select" style="min-width:180px;">
                    <option value="">-- Chọn vai trò --</option>
                    ${unassignedRoles.map(r => {
                      const display = ROLE_DISPLAY[r.code] || { label: r.name || r.code };
                      return `<option value="${esc(r.code)}">${esc(display.label)}</option>`;
                    }).join('')}
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
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" id="btn-footer-close-detail">Đóng</button>
          </div>
        </div>
      </div>
    `;

    // Close handlers
    const closeModal = () => { detailContainer.innerHTML = ''; };
    detailContainer.querySelector('#btn-close-detail')?.addEventListener('click', closeModal);
    detailContainer.querySelector('#btn-footer-close-detail')?.addEventListener('click', closeModal);
    detailContainer.querySelector('#detail-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal-overlay') closeModal();
    });

    // Status action buttons
    detailContainer.querySelectorAll('[data-status-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.dataset.statusAction;
        const uid = btn.dataset.uid;

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
