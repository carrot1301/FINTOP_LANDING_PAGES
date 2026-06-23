/**
 * billing.js — Billing & Subscription Plans Module
 * (Integrated with modal confirmations, package tier filters, date range filters, and real-time approvals)
 */
import { esc, statusBadge, tierBadge, formatDate, formatNumber, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

const PREDEFINED_FEATURES = [
  'Tra cứu cổ phiếu',
  'Phân tích cơ bản',
  'FinTop AI phân tích',
  'Tool & dữ liệu cơ bản',
  'Bộ lọc cổ phiếu chuyên nghiệp',
  'Nghiên cứu & phân tích chuyên sâu',
  'Tool & dữ liệu nâng cao',
  'PRO Data và PRO Analysis',
  'Full đặc quyền PRO',
  'Kết nối chuyên gia',
  'Phân tích chuyên gia',
  'Liên kết tài khoản chứng khoán',
  'Full đặc quyền V.I.P',
  'Cố vấn 1-1 chuyên gia',
  'Hỗ trợ chiến lược danh mục'
];

function renderFeaturesCheckboxes(selectedFeatures = []) {
  const container = document.getElementById('plan-features-checkboxes');
  if (!container) return;
  
  container.innerHTML = PREDEFINED_FEATURES.map((feature) => {
    const isChecked = selectedFeatures.includes(feature) ? 'checked' : '';
    return `
      <label style="display: flex; align-items: center; gap: 0.5rem; color: #fff; font-size: 0.8rem; cursor: pointer; user-select: none; padding: 0.25rem 0;">
        <input type="checkbox" class="plan-feature-checkbox" value="${esc(feature)}" ${isChecked} style="width: 16px; height: 16px; cursor: pointer;">
        <span>${esc(feature)}</span>
      </label>
    `;
  }).join('');
}

let activeTab = 'invoices'; // Default tab
let subscriptionPlans = [];
let allInvoices = [];
let filteredInvoices = [];
let currentPage = 1;
const itemsPerPage = 15;

// Local simulation lists to mock mutations without database migrations
let deletedInvoiceIds = [];
let approvedInvoiceIds = [];
let voidedInvoiceIds = [];

function loadStorage() {
  try {
    deletedInvoiceIds = JSON.parse(sessionStorage.getItem('fintop_deleted_invoices') || '[]');
    approvedInvoiceIds = JSON.parse(sessionStorage.getItem('fintop_approved_invoices') || '[]');
    voidedInvoiceIds = JSON.parse(sessionStorage.getItem('fintop_voided_invoices') || '[]');
  } catch (e) {
    console.error('Failed to load simulated billing data:', e);
  }
}

function saveStorage() {
  try {
    sessionStorage.setItem('fintop_deleted_invoices', JSON.stringify(deletedInvoiceIds));
    sessionStorage.setItem('fintop_approved_invoices', JSON.stringify(approvedInvoiceIds));
    sessionStorage.setItem('fintop_voided_invoices', JSON.stringify(voidedInvoiceIds));
  } catch (e) {
    console.error('Failed to save simulated billing data:', e);
  }
}

async function fetchPlansIfNeeded() {
  if (subscriptionPlans.length === 0) {
    try {
      const res = await API().get(EP().ADMIN_BILLING_PLANS);
      subscriptionPlans = res.data || res || [];
    } catch (e) {
      console.error('Failed to load subscription plans:', e);
    }
  }
}

function getInvoiceTier(amount) {
  const plan = subscriptionPlans.find(p => Number(p.price) === Number(amount));
  if (plan) return plan.tierLevel;
  
  // Fallbacks based on standard pricing
  const amt = Number(amount);
  if (amt <= 0) return 'STANDARD';
  if (amt < 2000000) return 'STANDARD';
  if (amt < 5000000) return 'SILVER';
  if (amt < 10000000) return 'GOLD';
  return 'DIAMOND';
}

async function computeSignature(payload, secret = 'default-secret-for-dev') {
  const payloadString = JSON.stringify(payload);
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadString)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  id: 'billing',
  label: 'Phê duyệt thanh toán',
  icon: '💳',

  async render(container) {
    loadStorage();
    container.innerHTML = `
      <div class="admin-tabs">
        <button class="admin-tab ${activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">💵 Phê duyệt thanh toán</button>
        <button class="admin-tab ${activeTab === 'plans' ? 'active' : ''}" data-tab="plans">📋 Gói dịch vụ</button>
      </div>
      <div id="billing-content"></div>

      <!-- Glassmorphic Invoice Detail Modal (Matches User Requirements) -->
      <div id="invoice-detail-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5, 5, 10, 0.85); backdrop-filter:blur(8px); z-index:10000; align-items:center; justify-content:center; padding:1rem;">
        <div style="background:var(--bg-card); border:1px solid var(--purple-border); border-radius:12px; max-width:480px; width:100%; padding:1.5rem; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          <button id="modal-close-btn" style="position:absolute; top:1rem; right:1.5rem; background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;">✕</button>
          <h3 style="font-size:1.15rem; margin-bottom:1.25rem; color:#fff; display:flex; align-items:center; gap:0.5rem;">📄 Chi tiết Hóa đơn <span id="modal-invoice-id" style="font-weight:400; color:var(--text-muted);"></span></h3>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; font-size:0.85rem; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:1rem; border-radius:8px;">
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Khách hàng</div>
              <div id="modal-user-name" style="font-weight:700; color:#fff;"></div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Email</div>
              <div id="modal-user-email" style="word-break:break-all; color:#e2e8f0;"></div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Gói nâng cấp</div>
              <div id="modal-upgrade-package"></div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Số tiền</div>
              <div id="modal-amount" style="font-weight:700; color:var(--purple-glow); font-size:0.95rem;"></div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Ngày tạo</div>
              <div id="modal-created-at" style="color:#e2e8f0;"></div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.15rem; font-weight:600;">Hạn thanh toán</div>
              <div id="modal-due-date" style="color:#e2e8f0;"></div>
            </div>
          </div>

          <div style="text-align:center; padding:0.75rem; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.2); border-radius:6px; margin-bottom:1.5rem; color:#FBBF24; font-size:0.88rem; font-weight:600;">
            ❓ Bạn chắc chắn duyệt hóa đơn?
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button id="modal-cancel-btn" class="admin-btn admin-btn-secondary" style="height:38px;">Hủy bỏ</button>
            <button id="modal-confirm-approve-btn" class="admin-btn" style="background:var(--success); color:#fff; height:38px; font-weight:700;">Duyệt để hoàn tất</button>
          </div>
        </div>
      </div>

      <!-- Glassmorphic Plan Form Modal (Matches User Requirements) -->
      <div id="plan-form-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5, 5, 10, 0.85); backdrop-filter:blur(8px); z-index:10000; align-items:center; justify-content:center; padding:1rem;">
        <div style="background:var(--bg-card); border:1px solid var(--purple-border); border-radius:12px; max-width:520px; width:100%; padding:1.5rem; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.6); max-height: 90vh; overflow-y: auto;">
          <button id="plan-modal-close-btn" style="position:absolute; top:1rem; right:1.5rem; background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;">✕</button>
          <h3 id="plan-modal-title" style="font-size:1.15rem; margin-bottom:1.25rem; color:#fff; display:flex; align-items:center; gap:0.5rem;">📋 Thêm gói dịch vụ mới</h3>
          
          <form id="plan-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="hidden" id="plan-id">
            
            <div>
              <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Tên gói *</label>
              <input type="text" id="plan-name" required class="admin-input" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; height:38px; padding:0 0.75rem;" placeholder="Ví dụ: SILVER, GOLD, DIAMOND...">
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Mô tả</label>
              <textarea id="plan-description" class="admin-input" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; min-height:60px; padding:0.5rem 0.75rem; resize:vertical;" placeholder="Mô tả tóm tắt gói cước..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Cấp bậc (Tier) *</label>
                <select id="plan-tier-level" required class="admin-select" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; height:38px; padding:0 0.75rem;">
                  <option value="STANDARD">Standard</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="DIAMOND">Diamond</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Thời gian (Ngày) *</label>
                <input type="number" id="plan-duration" required min="1" class="admin-input" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; height:38px; padding:0 0.75rem;" placeholder="Ví dụ: 30, 90, 365">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Giá tiền (VND) *</label>
                <input type="number" id="plan-price" required min="0" class="admin-input" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; height:38px; padding:0 0.75rem;" placeholder="Ví dụ: 1500000">
              </div>
              <div id="plan-status-container" style="display: none;">
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Trạng thái *</label>
                <select id="plan-status" class="admin-select" style="width:100%; background:rgba(30,30,45,0.8); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; height:38px; padding:0 0.75rem;">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; margin-bottom:0.35rem;">Danh sách tính năng</label>
              <div id="plan-features-checkboxes" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px; max-height: 200px; overflow-y: auto;">
                <!-- Checkboxes populated here -->
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem;">
              <button type="button" id="plan-modal-cancel-btn" class="admin-btn admin-btn-secondary" style="height:38px;">Hủy bỏ</button>
              <button type="submit" id="plan-modal-save-btn" class="admin-btn" style="background:var(--success); color:#fff; height:38px; font-weight:700;">Lưu lại</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Bind modal close buttons
    const modalEl = container.querySelector('#invoice-detail-modal');
    container.querySelector('#modal-close-btn')?.addEventListener('click', () => {
      modalEl.style.display = 'none';
    });
    container.querySelector('#modal-cancel-btn')?.addEventListener('click', () => {
      modalEl.style.display = 'none';
    });

    // Bind plan form modal submit
    const planModalEl = container.querySelector('#plan-form-modal');
    const planFormEl = container.querySelector('#plan-form');
    
    container.querySelector('#plan-modal-close-btn')?.addEventListener('click', () => {
      planModalEl.style.display = 'none';
    });
    container.querySelector('#plan-modal-cancel-btn')?.addEventListener('click', () => {
      planModalEl.style.display = 'none';
    });

    // Auto-populate default features on tier level selection change (only for new plans)
    const tierLevelSelect = container.querySelector('#plan-tier-level');
    tierLevelSelect?.addEventListener('change', () => {
      const id = container.querySelector('#plan-id').value;
      if (!id) { // New plan
        const selectedTier = tierLevelSelect.value;
        const defaultFeaturesStr = getDefaultFeaturesForTier(selectedTier);
        const defaultFeatures = defaultFeaturesStr.split('\n').map(f => f.trim()).filter(Boolean);
        renderFeaturesCheckboxes(defaultFeatures);
      }
    });
    
    planFormEl?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const saveBtn = container.querySelector('#plan-modal-save-btn');
      const originalText = saveBtn ? saveBtn.textContent : 'Lưu lại';
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Đang xử lý...';
      }
      
      try {
        const id = container.querySelector('#plan-id').value;
        const name = container.querySelector('#plan-name').value.trim();
        const description = container.querySelector('#plan-description').value.trim();
        const tierLevel = container.querySelector('#plan-tier-level').value;
        const durationDays = parseInt(container.querySelector('#plan-duration').value, 10);
        const price = parseFloat(container.querySelector('#plan-price').value);
        const status = container.querySelector('#plan-status').value;
        
        // Retrieve selected features from checkboxes
        const checkedBoxes = container.querySelectorAll('.plan-feature-checkbox:checked');
        const features = Array.from(checkedBoxes).map(cb => cb.value).join(';');
          
        const payload = {
          name,
          description,
          tierLevel,
          durationDays,
          price,
          features
        };
        
        if (id) {
          payload.status = status;
          await API().patch(`${EP().ADMIN_BILLING_PLANS}/${id}`, payload);
          showToast('Cập nhật gói dịch vụ thành công!', 'success');
        } else {
          await API().post(EP().ADMIN_BILLING_PLANS, payload);
          showToast('Thêm gói dịch vụ mới thành công!', 'success');
        }
        
        planModalEl.style.display = 'none';
        
        // Refresh active plans tab
        const contentEl = container.querySelector('#billing-content');
        if (contentEl) {
          await renderPlans(contentEl);
        }
      } catch (err) {
        showToast(`Lỗi lưu gói: ${err.message || err.response?.data?.message}`, 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = originalText;
        }
      }
    });

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

// ─────────────────────────────────────────────────────────────
// PLANS TAB RENDER
// ─────────────────────────────────────────────────────────────
async function renderPlans(contentEl) {
  contentEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>';

  try {
    const res = await API().get(EP().ADMIN_BILLING_PLANS);
    const plans = res.data || res;
    subscriptionPlans = plans;

    if (!Array.isArray(plans) || plans.length === 0) {
      contentEl.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem;">
          <button id="btn-add-plan" class="admin-btn" style="background: var(--purple-glow); color: #fff; display: flex; align-items: center; gap: 0.5rem; border: none; height: 38px; border-radius: 6px; padding: 0 1rem; cursor: pointer; font-weight: 600;">
            ➕ Thêm gói mới
          </button>
        </div>
        <div class="admin-empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">Chưa có gói dịch vụ nào</div>
        </div>
      `;
      
      // Bind Add plan button click even when empty
      contentEl.querySelector('#btn-add-plan')?.addEventListener('click', () => {
        openPlanModal();
      });
      return;
    }

    contentEl.innerHTML = `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem;">
        <button id="btn-add-plan" class="admin-btn" style="background: var(--purple-glow); color: #fff; display: flex; align-items: center; gap: 0.5rem; border: none; height: 38px; border-radius: 6px; padding: 0 1rem; cursor: pointer; font-weight: 600;">
          ➕ Thêm gói mới
        </button>
      </div>
      <div class="admin-kpi-grid">
        ${plans.map(p => {
          const featuresList = String(p.features || '').split(';').map(f => f.trim()).filter(Boolean);
          const featuresHtml = featuresList.map(f => `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">✦ ${esc(f)}</div>`).join('');
          
          return `
            <div class="admin-kpi-card" data-plan-id="${p.id}" style="position: relative; padding-bottom: 4.5rem; display: flex; flex-direction: column; text-align: left; height: 100%;">
              <div class="admin-kpi-icon">${tierIcon(p.tierLevel)}</div>
              <div class="admin-kpi-value">${formatNumber(p.price)}đ</div>
              <div class="admin-kpi-label" style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0.25rem 0;">${esc(p.name)}</div>
              <div class="admin-kpi-sub">
                ${tierBadge(p.tierLevel)} · ${p.durationDays} ngày · ${esc(p.currency)}
              </div>
              ${p.description ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem; font-style:italic;">${esc(p.description)}</div>` : ''}
              
              <div style="margin-top:0.75rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.75rem; flex-grow: 1;">
                <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Tính năng:</div>
                ${featuresHtml || '<div style="font-size:0.75rem; color:var(--text-muted);">Không có tính năng</div>'}
              </div>
              <div style="margin-top:0.5rem; margin-bottom: 0.5rem;">${statusBadge(p.status)}</div>
              
              <!-- Actions Footer -->
              <div style="position: absolute; bottom: 1rem; left: 1.5rem; right: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button class="admin-btn admin-btn-sm btn-edit-plan" data-id="${p.id}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                  ✏️ Sửa
                </button>
                <button class="admin-btn admin-btn-sm btn-delete-plan" data-id="${p.id}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #EF4444; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                  🗑️ Xóa
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Add plan button click
    contentEl.querySelector('#btn-add-plan')?.addEventListener('click', () => {
      openPlanModal();
    });

    // Bind Edit plan buttons click
    contentEl.querySelectorAll('.btn-edit-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const plan = subscriptionPlans.find(p => String(p.id) === String(id));
        if (!plan) return;
        
        openPlanModal(plan);
      });
    });

    // Bind Delete plan buttons click
    contentEl.querySelectorAll('.btn-delete-plan').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const plan = subscriptionPlans.find(p => String(p.id) === String(id));
        if (!plan) return;
        
        if (!confirm(`Bạn có chắc muốn xóa gói dịch vụ "${plan.name}"?`)) {
          return;
        }
        
        try {
          await API().delete(`${EP().ADMIN_BILLING_PLANS}/${id}`);
          showToast('Xóa gói dịch vụ thành công!', 'success');
          await renderPlans(contentEl);
        } catch (err) {
          showToast(`Lỗi xóa gói: ${err.message}`, 'error');
        }
      });
    });

  } catch (err) {
    contentEl.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-desc">${esc(err.message)}</div></div>`;
  }
}

function openPlanModal(plan = null) {
  const modal = document.getElementById('plan-form-modal');
  if (!modal) return;
  
  if (plan) {
    document.getElementById('plan-modal-title').textContent = '✏️ Cập nhật gói dịch vụ';
    document.getElementById('plan-id').value = plan.id;
    document.getElementById('plan-name').value = plan.name || '';
    document.getElementById('plan-description').value = plan.description || '';
    document.getElementById('plan-tier-level').value = plan.tierLevel || 'STANDARD';
    document.getElementById('plan-duration').value = plan.durationDays || '30';
    document.getElementById('plan-price').value = plan.price ? Number(plan.price) : 0;
    
    const selectedFeatures = String(plan.features || '').split(';').map(f => f.trim()).filter(Boolean);
    renderFeaturesCheckboxes(selectedFeatures);
    
    document.getElementById('plan-status-container').style.display = 'block';
    document.getElementById('plan-status').value = plan.status || 'ACTIVE';
  } else {
    document.getElementById('plan-modal-title').textContent = '📋 Thêm gói dịch vụ mới';
    document.getElementById('plan-id').value = '';
    document.getElementById('plan-name').value = '';
    document.getElementById('plan-description').value = '';
    document.getElementById('plan-tier-level').value = 'STANDARD';
    document.getElementById('plan-duration').value = '30';
    document.getElementById('plan-price').value = '0';
    
    const defaultFeaturesStr = getDefaultFeaturesForTier('STANDARD');
    const defaultFeatures = defaultFeaturesStr.split('\n').map(f => f.trim()).filter(Boolean);
    renderFeaturesCheckboxes(defaultFeatures);
    
    document.getElementById('plan-status-container').style.display = 'none';
    document.getElementById('plan-status').value = 'ACTIVE';
  }
  
  modal.style.display = 'flex';
}

function getDefaultFeaturesForTier(tier) {
  const defaults = {
    STANDARD: 'Tra cứu cổ phiếu\nPhân tích cơ bản\nFinTop AI phân tích\nTool & dữ liệu cơ bản',
    SILVER: 'Bộ lọc cổ phiếu chuyên nghiệp\nNghiên cứu & phân tích chuyên sâu\nTool & dữ liệu nâng cao\nPRO Data và PRO Analysis',
    GOLD: 'Full đặc quyền PRO\nKết nối chuyên gia\nPhân tích chuyên gia\nLiên kết tài khoản chứng khoán',
    DIAMOND: 'Full đặc quyền PRO\nFull đặc quyền V.I.P\nCố vấn 1-1 chuyên gia\nHỗ trợ chiến lược danh mục'
  };
  return defaults[tier] || '';
}

function tierIcon(tier) {
  const icons = { STANDARD: '🥉', SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎' };
  return icons[tier] || '📋';
}

// ─────────────────────────────────────────────────────────────
// INVOICES (PAYMENT APPROVALS) TAB RENDER
// ─────────────────────────────────────────────────────────────
async function renderInvoices(contentEl) {
  contentEl.innerHTML = `
    <!-- Filters Toolbar (Matches Screenshot Layout) -->
    <div class="billing-filter-bar" style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; background: rgba(255,255,255,0.01); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
      
      <!-- Red Trash/Delete selected button -->
      <button class="admin-btn" id="btn-delete-selected" style="background: #EF4444; border: none; height: 38px; width: 38px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; color: #fff;" title="Xóa các mục đã chọn">
        🗑️
      </button>

      <!-- Upgrade Package Dropdown -->
      <select id="filter-package" class="admin-select" style="height: 38px; min-width: 210px; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 0.75rem;">
        <option value="">--Chọn loại thanh toán--</option>
        <option value="STANDARD">Standard</option>
        <option value="SILVER">Silver</option>
        <option value="GOLD">Gold</option>
        <option value="DIAMOND">Diamond</option>
      </select>

      <!-- Custom Date Pickers -->
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <input type="date" id="filter-start-date" class="admin-input" style="height: 38px; width: 140px; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 0.5rem;" placeholder="Từ ngày">
        <span style="color: var(--text-muted); font-size: 0.85rem;">đến</span>
        <input type="date" id="filter-end-date" class="admin-input" style="height: 38px; width: 140px; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 0.5rem;" placeholder="Đến ngày">
      </div>

      <!-- Keyword Search input -->
      <div style="display: flex; flex: 1; min-width: 250px;">
        <input type="text" id="filter-search" class="admin-input" style="height: 38px; flex: 1; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.1); border-top-left-radius: 6px; border-bottom-left-radius: 6px; border-top-right-radius: 0; border-bottom-right-radius: 0; padding: 0 0.75rem; color: #fff;" placeholder="Từ khóa tìm kiếm...">
        <button id="btn-search-trigger" style="height: 38px; width: 45px; background: #312E81; border: 1px solid rgba(255,255,255,0.1); border-left: none; border-top-right-radius: 6px; border-bottom-right-radius: 6px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          🔍
        </button>
      </div>
    </div>

    <!-- Table content container -->
    <div id="invoice-list-container">
      <div class="admin-loading"><div class="admin-spinner"></div> Đang tải dữ liệu...</div>
    </div>
  `;

  // Bind filter controls events
  contentEl.querySelector('#btn-delete-selected')?.addEventListener('click', () => {
    deleteSelected(contentEl);
  });

  contentEl.querySelector('#filter-package')?.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
    renderInvoiceTable(contentEl);
  });

  contentEl.querySelector('#filter-start-date')?.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
    renderInvoiceTable(contentEl);
  });

  contentEl.querySelector('#filter-end-date')?.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
    renderInvoiceTable(contentEl);
  });

  contentEl.querySelector('#btn-search-trigger')?.addEventListener('click', () => {
    currentPage = 1;
    applyFilters();
    renderInvoiceTable(contentEl);
  });

  contentEl.querySelector('#filter-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentPage = 1;
      applyFilters();
      renderInvoiceTable(contentEl);
    }
  });

  // Hydrate data
  await reloadData(contentEl);
}

async function reloadData(contentEl) {
  try {
    await fetchPlansIfNeeded();
    
    // Fetch all invoices using large limit
    const res = await API().get(EP().ADMIN_BILLING_INVOICES + '?limit=1000');
    allInvoices = res.data || res || [];
    
    applyFilters();
    renderInvoiceTable(contentEl);
  } catch (err) {
    const listEl = contentEl.querySelector('#invoice-list-container');
    if (listEl) {
      listEl.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Lỗi tải hóa đơn</div>
          <div class="empty-desc">${esc(err.message)}</div>
        </div>
      `;
    }
  }
}

function applyFilters() {
  const selectedPackage = document.getElementById('filter-package')?.value || '';
  const startDateStr = document.getElementById('filter-start-date')?.value || '';
  const endDateStr = document.getElementById('filter-end-date')?.value || '';
  const searchText = (document.getElementById('filter-search')?.value || '').trim().toLowerCase();

  filteredInvoices = allInvoices.filter(inv => {
    // 1. Exclude deleted invoices
    if (deletedInvoiceIds.includes(inv.id)) {
      return false;
    }

    // 2. Adjust local simulated status
    if (approvedInvoiceIds.includes(inv.id)) {
      inv.status = 'PAID';
    } else if (voidedInvoiceIds.includes(inv.id)) {
      inv.status = 'VOID';
    }

    // 3. Package filter
    if (selectedPackage) {
      const tier = getInvoiceTier(inv.amount);
      if (tier !== selectedPackage) return false;
    }

    // 4. Date filters
    if (startDateStr) {
      const start = new Date(startDateStr);
      const created = new Date(inv.createdAt);
      if (created < start) return false;
    }
    if (endDateStr) {
      const end = new Date(endDateStr + 'T23:59:59');
      const created = new Date(inv.createdAt);
      if (created > end) return false;
    }

    // 5. Keyword search filter
    if (searchText) {
      const matchId = String(inv.id).toLowerCase().includes(searchText);
      const matchName = String(inv.user?.fullName || '').toLowerCase().includes(searchText);
      const matchEmail = String(inv.user?.email || '').toLowerCase().includes(searchText);
      const matchAmount = String(inv.amount).includes(searchText);
      if (!matchId && !matchName && !matchEmail && !matchAmount) {
        return false;
      }
    }

    return true;
  });
}

function renderInvoiceTable(container) {
  const listEl = container.querySelector('#invoice-list-container');
  if (!listEl) return;

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageItems = filteredInvoices.slice(startIndex, endIndex);

  if (totalItems === 0) {
    listEl.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;"><input type="checkbox" id="check-all-invoices" style="cursor:pointer; width:16px; height:16px;"></th>
              <th style="width: 60px;">STT</th>
              <th>Thông tin</th>
              <th>Gói nâng cấp</th>
              <th>Phê duyệt</th>
              <th style="width: 80px; text-align: center;">#</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.9rem;">
                Không tìm thấy dữ liệu!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  listEl.innerHTML = `
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;"><input type="checkbox" id="check-all-invoices" style="cursor:pointer; width:16px; height:16px;"></th>
            <th style="width: 60px;">STT</th>
            <th>Thông tin</th>
            <th>Gói nâng cấp</th>
            <th>Phê duyệt</th>
            <th style="width: 80px; text-align: center;">#</th>
          </tr>
        </thead>
        <tbody>
          ${pageItems.map((inv, idx) => {
            const stt = startIndex + idx + 1;
            const tier = getInvoiceTier(inv.amount);
            const isPending = inv.status === 'DRAFT' || inv.status === 'OPEN';
            
            let approvalHtml = '';
            if (isPending) {
              approvalHtml = `
                <div style="display:flex; gap:0.4rem;">
                  <button class="admin-btn admin-btn-sm btn-open-approve-modal" data-id="${inv.id}" style="background:var(--success); color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:600; cursor:pointer;">Duyệt</button>
                  <button class="admin-btn admin-btn-sm btn-reject-invoice" data-id="${inv.id}" style="background:rgba(239,68,68,0.15); color:#EF4444; border:1px solid rgba(239,68,68,0.25); padding:4px 8px; border-radius:4px; font-weight:600; cursor:pointer;">Từ chối</button>
                </div>
              `;
            } else {
              approvalHtml = statusBadge(inv.status);
            }

            return `
              <tr data-row-id="${inv.id}">
                <td style="text-align: center;"><input type="checkbox" class="invoice-row-checkbox" data-id="${inv.id}" style="cursor:pointer; width:15px; height:15px;"></td>
                <td>${stt}</td>
                <td>
                  <div style="font-weight: 700; color: #fff;">${esc(inv.user?.fullName || 'Khách vãng lai')}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${esc(inv.user?.email || '—')}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">Hạn thanh toán: ${formatDate(inv.dueDate)}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Ngày tạo: ${formatDate(inv.createdAt)}</div>
                </td>
                <td>
                  <div style="margin-bottom: 0.25rem;">${tierBadge(tier)}</div>
                  <div style="font-weight: 700; color: var(--purple-glow); font-size: 0.9rem;">${formatNumber(inv.amount)}đ</div>
                </td>
                <td>${approvalHtml}</td>
                <td style="text-align: center;">
                  <button class="admin-btn admin-btn-sm btn-delete-row" data-id="${inv.id}" style="background:var(--danger); border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" title="Xóa">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Pagination Footer -->
      <div class="admin-pagination">
        <div class="admin-pagination-info">
          Hiển thị ${startIndex + 1}-${endIndex} / ${totalItems} hóa đơn
        </div>
        <div class="admin-pagination-controls">
          <button class="admin-page-btn" id="btn-prev-page" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
          <span style="font-size: 0.825rem; color: var(--text-secondary); margin: 0 0.5rem;">Trang ${currentPage} / ${totalPages}</span>
          <button class="admin-page-btn" id="btn-next-page" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>
  `;

  // Bind pagination actions
  listEl.querySelector('#btn-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderInvoiceTable(container);
    }
  });
  listEl.querySelector('#btn-next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderInvoiceTable(container);
    }
  });

  // Bind Checkbox select-all events
  const checkAll = listEl.querySelector('#check-all-invoices');
  const checkboxes = listEl.querySelectorAll('.invoice-row-checkbox');
  
  checkAll?.addEventListener('change', (e) => {
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const allChecked = Array.from(checkboxes).every(c => c.checked);
      if (checkAll) checkAll.checked = allChecked;
    });
  });

  // Bind open approve modal click event (Matches requirements)
  const modalEl = document.getElementById('invoice-detail-modal');
  listEl.querySelectorAll('.btn-open-approve-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const inv = allInvoices.find(i => String(i.id) === String(id));
      if (!inv) {
        showToast('Không tìm thấy dữ liệu hóa đơn!', 'error');
        return;
      }

      const amount = Number(inv.amount);
      const plan = subscriptionPlans.find(p => Number(p.price) === amount) || subscriptionPlans[0];
      if (!plan) {
        showToast('Không tìm thấy gói cước phù hợp!', 'error');
        return;
      }

      // Populate details to modal fields
      document.getElementById('modal-invoice-id').textContent = '#' + inv.id;
      document.getElementById('modal-user-name').textContent = inv.user?.fullName || 'Khách vãng lai';
      document.getElementById('modal-user-email').textContent = inv.user?.email || '—';
      document.getElementById('modal-upgrade-package').innerHTML = tierBadge(getInvoiceTier(inv.amount));
      document.getElementById('modal-amount').textContent = formatNumber(inv.amount) + 'đ';
      document.getElementById('modal-created-at').textContent = formatDate(inv.createdAt);
      document.getElementById('modal-due-date').textContent = formatDate(inv.dueDate);

      // Re-create confirm button to clear old event listeners safely
      const oldConfirmBtn = document.getElementById('modal-confirm-approve-btn');
      const newConfirmBtn = oldConfirmBtn.cloneNode(true);
      oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);

      // Bind confirm action
      newConfirmBtn.addEventListener('click', async () => {
        newConfirmBtn.disabled = true;
        try {
          const payload = {
            provider: 'MANUAL',
            providerId: `manual_sim_tx_${Date.now()}`,
            invoiceId: String(inv.id),
            amount: amount,
            idempotencyKey: `idem_key_${Date.now()}_${inv.id}`,
            planId: plan.id,
            timestamp: Date.now()
          };

          const signature = await computeSignature(payload);
          
          await API().post('/billing/webhook', payload, {
            headers: {
              'x-webhook-signature': signature
            }
          });

          // Save approved locally to keep list refreshed before DB updates
          approvedInvoiceIds.push(inv.id);
          saveStorage();

          showToast('Phê duyệt thanh toán hóa đơn thành công!', 'success');

          // Sync profile if current logged-in user is the invoice owner (immediate client upgrades)
          const currentUser = window.FintopInfra?.AppState?.getState('user') || {};
          if (inv.user?.email && currentUser.email && inv.user.email.toLowerCase() === currentUser.email.toLowerCase()) {
            try {
              await window.FintopInfra.AuthManager.loadUserProfile();
              showToast('Đã nâng cấp quyền hạn tài khoản thành công!', 'success');
            } catch (profileErr) {
              console.error('Failed to reload user profile:', profileErr);
            }
          }

          // Close modal
          modalEl.style.display = 'none';

          // Reload data
          await reloadData(container);
        } catch (err) {
          showToast(`Lỗi phê duyệt: ${err.message}`, 'error');
          newConfirmBtn.disabled = false;
        }
      });

      // Display the modal
      modalEl.style.display = 'flex';
    });
  });

  // Bind reject button click event
  listEl.querySelectorAll('.btn-reject-invoice').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (!confirm(`Bạn có chắc muốn TỪ CHỐI / HỦY BỎ hóa đơn #${id}? (Simulated)`)) {
        return;
      }
      voidedInvoiceIds.push(id);
      saveStorage();
      showToast('Đã từ chối hóa đơn thành công!', 'success');
      
      // Update display list
      applyFilters();
      renderInvoiceTable(container);
    });
  });

  // Bind single delete row button click event
  listEl.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (!confirm(`Bạn có chắc muốn xóa hoàn toàn hóa đơn #${id} khỏi danh sách? (Simulated)`)) {
        return;
      }
      deletedInvoiceIds.push(id);
      saveStorage();
      showToast('Đã xóa hóa đơn thành công!', 'success');
      
      // Update display list
      applyFilters();
      renderInvoiceTable(container);
    });
  });
}

function deleteSelected(container) {
  const checkboxes = container.querySelectorAll('.invoice-row-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('Vui lòng chọn ít nhất một hóa đơn để xóa!', 'error');
    return;
  }

  if (!confirm(`Bạn có chắc muốn xóa ${checkboxes.length} hóa đơn đã chọn? (Simulated)`)) {
    return;
  }

  checkboxes.forEach(cb => {
    const id = cb.dataset.id;
    if (!deletedInvoiceIds.includes(id)) {
      deletedInvoiceIds.push(id);
    }
  });

  saveStorage();
  showToast(`Đã xóa ${checkboxes.length} hóa đơn thành công!`, 'success');
  
  // Refresh table UI
  applyFilters();
  renderInvoiceTable(container);
}
