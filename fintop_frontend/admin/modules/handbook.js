/**
 * handbook.js — Investor Guides & Tutorials CMS Manager
 * ============================================================
 * Replicated from legacy web: /system/handbook/index
 *
 * Features matching legacy web:
 *   - 4 Category Tabs: Tủ sách đầu tư, Phân tích kỹ thuật (TA), Phân tích cơ bản (FA), Chứng khoán TTCK
 *   - Search by title
 *   - Add, Edit, Delete handbooks (sync with database)
 *   - Drive Link integration
 */
import { esc, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let currentCategory = 'TU_SACH_DAU_TU';
let searchKeyword = '';
let handbooksList = [];

const CATEGORY_TABS = [
  { id: 'TU_SACH_DAU_TU', label: 'Tủ sách đầu tư' },
  { id: 'KT_TA',          label: 'Kiến thức phân tích kỹ thuật (TA)' },
  { id: 'KT_FA',          label: 'Kiến thức phân tích cơ bản (FA)' },
  { id: 'KT_TTCK',        label: 'Kiến thức chứng khoán, TTCK' }
];

export default {
  id: 'handbook',
  label: 'Cẩm nang nhà đầu tư',
  icon: '📖',

  async render(container) {
    container.innerHTML = `
      <div id="handbook-modal-area"></div>
      <div class="admin-portfolio-layout">
        <!-- Toolbar & Category Tabs -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="admin-btn" id="btn-add-handbook" style="background:#22c55e;" title="Thêm cẩm nang mới">➕</button>
            <button class="admin-btn" id="btn-delete-selected-handbooks" style="background:#ef4444;" title="Xóa cẩm nang đã chọn">🗑️</button>
          </div>
          
          <div class="handbook-tabs" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${CATEGORY_TABS.map(tab => `
              <button class="tab-item ${tab.id === currentCategory ? 'active' : ''}" data-cat="${tab.id}" style="padding:8px 16px; border-radius:4px; border:none; cursor:pointer; font-weight:500; transition:all 0.2s;">
                ${esc(tab.label)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Search Bar -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem;">
          <input type="text" id="handbook-search-input" class="admin-input" style="flex:1;" placeholder="Tìm kiếm cẩm nang..." value="${esc(searchKeyword)}" />
          <button class="admin-btn" id="btn-search-handbook" style="background:#1e293b; border:1px solid rgba(255,255,255,0.1);">🔍</button>
        </div>

        <!-- Handbooks Table -->
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width:5%; text-align:center;"><input type="checkbox" id="chk-all-handbooks" /></th>
                <th style="width:8%; text-align:center;">STT</th>
                <th>Tên cẩm nang</th>
                <th style="width:15%; text-align:center;">#</th>
              </tr>
            </thead>
            <tbody id="handbooks-tbody">
              <tr><td colspan="4" style="text-align:center; padding:2rem;"><div class="admin-spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Inject CSS for active tab
    if (!document.getElementById('handbook-tab-styles')) {
      const style = document.createElement('style');
      style.id = 'handbook-tab-styles';
      style.innerHTML = `
        .handbook-tabs .tab-item {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .handbook-tabs .tab-item.active {
          background: #22c55e !important;
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(34,197,94,0.2);
        }
      `;
      document.head.appendChild(style);
    }

    // Bind events
    const tbody = container.querySelector('#handbooks-tbody');
    
    // Tab switching
    container.querySelectorAll('.handbook-tabs .tab-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.handbook-tabs .tab-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        loadHandbooks(tbody);
      });
    });

    // Search
    const searchInput = container.querySelector('#handbook-search-input');
    const triggerSearch = () => {
      searchKeyword = searchInput.value.trim();
      loadHandbooks(tbody);
    };
    container.querySelector('#btn-search-handbook').addEventListener('click', triggerSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });

    // Add
    container.querySelector('#btn-add-handbook').addEventListener('click', () => {
      showHandbookModal(null, tbody);
    });

    // Delete selected
    container.querySelector('#btn-delete-selected-handbooks').addEventListener('click', async () => {
      const checked = container.querySelectorAll('.chk-hb-item:checked');
      if (checked.length === 0) {
        showToast('Vui lòng chọn ít nhất một cẩm nang để xóa.', 'error');
        return;
      }
      const ids = Array.from(checked).map(c => parseInt(c.value));
      if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} cẩm nang đã chọn?`)) return;

      try {
        await Promise.all(ids.map(id => API().delete(`/admin/handbooks/${id}`)));
        showToast(`Đã xóa thành công ${ids.length} cẩm nang!`);
        loadHandbooks(tbody);
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa cẩm nang', 'error');
      }
    });

    // Checkbox all
    container.querySelector('#chk-all-handbooks').addEventListener('change', (e) => {
      container.querySelectorAll('.chk-hb-item').forEach(chk => {
        chk.checked = e.target.checked;
      });
    });

    // Load initial data
    loadHandbooks(tbody);
  },

  destroy() {}
};

async function loadHandbooks(tbody) {
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem;"><div class="admin-spinner"></div></td></tr>';
  
  try {
    const qs = API().toQuery({ category: currentCategory, search: searchKeyword });
    const res = await API().get('/admin/handbooks' + qs);
    handbooksList = res.data || res || [];

    if (handbooksList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">Không tìm thấy cẩm nang nào.</td></tr>';
      return;
    }

    tbody.innerHTML = handbooksList.map((hb, idx) => `
      <tr data-hbid="${hb.id}">
        <td style="text-align:center; vertical-align:middle;">
          <input type="checkbox" class="chk-hb-item" value="${hb.id}" />
        </td>
        <td style="text-align:center; vertical-align:middle; color:var(--text-muted);">${idx + 1}</td>
        <td style="vertical-align:middle; font-weight:500;">${esc(hb.title)}</td>
        <td style="text-align:center; vertical-align:middle;">
          <div style="display:flex; gap:0.25rem; justify-content:center;">
            ${hb.driveLink ? `
              <a href="${esc(hb.driveLink)}" target="_blank" class="admin-btn admin-btn-sm" style="background:#0284c7; display:flex; align-items:center; justify-content:center; width:32px; height:32px;" title="Xem tài liệu">
                🌐
              </a>
            ` : `
              <button class="admin-btn admin-btn-sm" style="background:rgba(255,255,255,0.05); color:var(--text-muted); width:32px; height:32px; cursor:not-allowed;" disabled title="Không có tài liệu">
                —
              </button>
            `}
            <button class="admin-btn admin-btn-sm btn-edit-hb" data-id="${hb.id}" style="background:#f97316; display:flex; align-items:center; justify-content:center; width:32px; height:32px;" title="Sửa thông tin">
              ✏️
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Bind edit buttons
    tbody.querySelectorAll('.btn-edit-hb').forEach(btn => {
      btn.addEventListener('click', () => {
        const hbId = parseInt(btn.dataset.id);
        const hb = handbooksList.find(h => h.id === hbId);
        if (hb) showHandbookModal(hb, tbody);
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ef4444; padding:2rem;">Lỗi tải dữ liệu: ${esc(err.message)}</td></tr>`;
  }
}

function showHandbookModal(hb, tbody) {
  const modalArea = document.getElementById('handbook-modal-area');
  if (!modalArea) return;

  const isEdit = !!hb;
  
  modalArea.innerHTML = `
    <div class="admin-modal-overlay" id="hb-modal-overlay" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999;">
      <div class="admin-modal" style="max-width:650px; width:90%; background:#1e2235; border-radius:8px; padding:1.5rem 2rem; border:1px solid rgba(255,255,255,0.05); position:relative;">
        
        <button class="admin-btn-close" id="btn-close-hb-modal" style="position:absolute; top:1.5rem; right:1.5rem; background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer; font-weight:bold;">x</button>
        
        <h2 style="font-size:1.5rem; font-weight:bold; margin-bottom:2rem; color:#fff;">${isEdit ? 'Cập nhật cẩm nang' : 'Thêm cẩm nang mới'}</h2>
        
        <div class="admin-modal-body" style="display:flex; flex-direction:column; gap:1.25rem; margin-bottom:2rem;">
          
          <!-- Loại cẩm nang -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Loại cẩm nang <span style="color:#ef4444;">*</span></label>
            <select id="modal-hb-category" class="admin-select" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;">
              ${CATEGORY_TABS.map(tab => `
                <option value="${tab.id}" ${(isEdit ? hb.category : currentCategory) === tab.id ? 'selected' : ''}>${esc(tab.label)}</option>
              `).join('')}
            </select>
          </div>

          <!-- Tên cẩm nang -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Tên cẩm nang <span style="color:#ef4444;">*</span></label>
            <input type="text" id="modal-hb-title" class="admin-input" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;" value="${isEdit && hb.title ? esc(hb.title) : ''}" placeholder="Nhập tên cẩm nang..." />
          </div>

          <!-- Đường dẫn -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Đường dẫn <span style="color:#ef4444;">*</span></label>
            <input type="text" id="modal-hb-link" class="admin-input" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;" value="${isEdit && hb.driveLink ? esc(hb.driveLink) : ''}" placeholder="Dán đường dẫn tài liệu..." />
          </div>

          <!-- Kiểu đường dẫn -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Kiểu đường dẫn <span style="color:#ef4444;">*</span></label>
            <select id="modal-hb-link-type" class="admin-select" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;">
              <option value="link" ${isEdit && hb.linkType === 'link' ? 'selected' : ''}>Link liên kết</option>
              <option value="file" ${isEdit && hb.linkType === 'file' ? 'selected' : ''}>Tài liệu tải lên</option>
            </select>
          </div>

          <!-- Mô tả -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Mô tả</label>
            <input type="text" id="modal-hb-desc" class="admin-input" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;" value="${isEdit && hb.description ? esc(hb.description) : ''}" placeholder="Nhập mô tả..." />
          </div>

          <!-- Thứ tự -->
          <div style="display:flex; align-items:center;">
            <label style="width:30%; font-weight:500; color:#cbd5e1; font-size:0.95rem;">Thứ tự</label>
            <input type="number" id="modal-hb-order" class="admin-input" style="flex:1; background:#fff; color:#1e293b; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; font-size:0.95rem;" value="${isEdit && (hb.order !== undefined && hb.order !== null) ? hb.order : '0'}" />
          </div>

          <!-- Trạng thái -->
          <div style="display:flex; align-items:center; padding-left:30%;">
            <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; color:#cbd5e1; font-size:0.95rem; font-weight:500;">
              <input type="checkbox" id="modal-hb-status" ${!isEdit || hb.status === 'ACTIVE' ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
              Hoạt động
            </label>
          </div>

        </div>
        <div class="admin-modal-footer" style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.25rem;">
          <button class="admin-btn" id="btn-save-hb-modal" style="background:#5c6bc0; color:#fff; font-weight:bold; border-radius:8px; padding:10px 20px; font-size:0.95rem; border:none; cursor:pointer; transition:all 0.2s;">
            ${isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button class="admin-btn" id="btn-cancel-hb-modal" style="background:rgba(255,255,255,0.05); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 20px; font-size:0.95rem; cursor:pointer; transition:all 0.2s;">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalArea.innerHTML = ''; };
  modalArea.querySelector('#btn-close-hb-modal').addEventListener('click', closeModal);
  modalArea.querySelector('#btn-cancel-hb-modal').addEventListener('click', closeModal);
  modalArea.querySelector('#hb-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'hb-modal-overlay') closeModal();
  });

  // Save handler
  modalArea.querySelector('#btn-save-hb-modal').addEventListener('click', async (e) => {
    const title = modalArea.querySelector('#modal-hb-title').value.trim();
    const driveLink = modalArea.querySelector('#modal-hb-link').value.trim();
    const category = modalArea.querySelector('#modal-hb-category').value;
    const linkType = modalArea.querySelector('#modal-hb-link-type').value;
    const description = modalArea.querySelector('#modal-hb-desc').value.trim();
    const order = parseInt(modalArea.querySelector('#modal-hb-order').value, 10) || 0;
    const status = modalArea.querySelector('#modal-hb-status').checked ? 'ACTIVE' : 'INACTIVE';
    
    if (!title) {
      showToast('Vui lòng nhập tên cẩm nang.', 'error');
      return;
    }
    if (!driveLink) {
      showToast('Vui lòng nhập đường dẫn tài liệu.', 'error');
      return;
    }

    e.target.disabled = true;

    const payload = {
      title,
      driveLink,
      category,
      linkType,
      description: description || null,
      order,
      status
    };

    try {
      if (isEdit) {
        await API().patch(`/admin/handbooks/${hb.id}`, payload);
        showToast('Cập nhật cẩm nang thành công!');
      } else {
        await API().post('/admin/handbooks', payload);
        showToast('Thêm cẩm nang mới thành công!');
      }
      closeModal();
      loadHandbooks(tbody);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu cẩm nang', 'error');
      e.target.disabled = false;
    }
  });
}
