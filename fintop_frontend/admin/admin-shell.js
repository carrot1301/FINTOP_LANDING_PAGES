/**
 * ============================================================
 * admin-shell.js — Admin Console Shell Controller
 * ============================================================
 * ADMIN_PROD_1: Production Admin Console
 *
 * PURPOSE:
 *   1. Auth gate — block non-admin users
 *   2. Sidebar navigation with hash-routing
 *   3. Dynamic module loading via import()
 *   4. Shared utilities (table, pagination, badges, toast)
 *
 * ARCHITECTURE:
 *   - SPA-like shell with hash routing (#overview, #users, etc.)
 *   - Each module in ./modules/*.js exports { id, label, icon, render, destroy }
 *   - Reuses window.FintopInfra for all API/auth/RBAC operations
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// WAIT FOR INFRA
// ─────────────────────────────────────────────────────────────

const MODULES = [
  { id: 'overview',          label: 'Trang Chủ',            icon: '🏠', section: 'Chính',      permission: null },
  { id: 'billing',           label: 'Phê duyệt',            icon: '💵', section: 'Chính',      permission: null },
  { id: 'copilot',           label: 'AI Copilot',           icon: '🧠', section: 'Chính',      permission: null, hidden: true },
  { id: 'signals',           label: 'Tín Hiệu V.I.P',       icon: '📊', section: 'Dữ liệu',   permission: 'UPDATE_SIGNAL', hidden: true },
  { id: 'copy-trade',        label: 'Copy Trade',           icon: '🔄', section: 'Dữ liệu',   permission: 'UPDATE_SIGNAL', hidden: true },
  { id: 'market',            label: 'Dữ liệu',              icon: '🪙', section: 'Dữ liệu',   permission: null },
  { id: 'market-intelligence', label: 'Market Intelligence', icon: '📈', section: 'Dữ liệu',   permission: null, hidden: true },
  { id: 'research-center',   label: 'Research Center',      icon: '📝', section: 'Dữ liệu',   permission: null, hidden: true },
  { id: 'cms',               label: 'Bài viết',             icon: '📅', section: 'Nội dung',   permission: 'UPDATE_BLOG' },
  { id: 'rbac',              label: 'Nhân sự',              icon: '👥', section: 'Quản lý',   permission: 'MANAGE_ROLES' },
  { id: 'users',             label: 'Khách hàng',           icon: '👥', section: 'Quản lý',   permission: 'MANAGE_USERS' },
  { id: 'portfolio-manager', label: 'Danh mục Web',         icon: '📅', section: 'Quản lý',   permission: null },
  { id: 'handbook',          label: 'Hướng dẫn',            icon: '🏥', section: 'Nội dung',   permission: null },
  { id: 'profile',           label: 'Thông tin cá nhân',    icon: '👤', section: 'Tài khoản',  permission: null },
  
  // Hidden modules (preserved for code stability, E2E checks and URL routing)
  { id: 'notifications', label: 'Thông báo',       icon: '🔔', section: 'Hệ thống',   permission: null, hidden: true },
  { id: 'portfolios',    label: 'Danh mục cũ',     icon: '💼', section: 'Hệ thống',   permission: null, hidden: true },
  { id: 'audit',         label: 'Nhật ký',         icon: '📋', section: 'Hệ thống',   permission: 'VIEW_AUDIT_LOGS', hidden: true },
  { id: 'system',        label: 'Hệ thống',        icon: '⚙️', section: 'Hệ thống',   permission: null, hidden: true },
  { id: 'ai-ops',        label: 'AI Ops / QA',     icon: '🤖', section: 'Hệ thống',   permission: null, hidden: true },
];

let currentModule = null;
let Infra = null;

// ─────────────────────────────────────────────────────────────
// ADMIN TABLE UTILITY
// ─────────────────────────────────────────────────────────────

export class AdminTable {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {string} opts.title
   * @param {string[]} opts.columns - Column headers
   * @param {Function} opts.renderRow - (item) => '<tr>...</tr>'
   * @param {Function} opts.fetchData - (page, filters) => { data, meta }
   * @param {Object} [opts.filters] - { key: { label, options: [{value,label}] } }
   * @param {boolean} [opts.searchable]
   * @param {string} [opts.searchPlaceholder]
   * @param {Function} [opts.toolbarExtra] - () => HTML string for extra toolbar buttons
   */
  constructor(opts) {
    this.opts = opts;
    this.page = 1;
    this.filters = {};
    this.searchQuery = '';
    this._debounceTimer = null;
    this.render();
  }

  async render() {
    const c = this.opts.container;
    c.innerHTML = `
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">${this.opts.title}</div>
          <div class="admin-table-actions">
            ${this.opts.searchable ? `<input class="admin-search" placeholder="${this.opts.searchPlaceholder || 'Tìm kiếm...'}" value="${esc(this.searchQuery)}">` : ''}
            ${this._renderFilters()}
            ${this.opts.toolbarExtra ? this.opts.toolbarExtra() : ''}
          </div>
        </div>
        <div class="at-body">
          <div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>
        </div>
      </div>
    `;

    // Bind search
    if (this.opts.searchable) {
      const searchEl = c.querySelector('.admin-search');
      searchEl?.addEventListener('input', (e) => {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.page = 1;
          this.loadData();
        }, 350);
      });
    }

    // Bind filter selects
    c.querySelectorAll('.admin-select[data-filter-key]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        this.filters[e.target.dataset.filterKey] = e.target.value;
        this.page = 1;
        this.loadData();
      });
    });

    await this.loadData();
  }

  _renderFilters() {
    if (!this.opts.filters) return '';
    return Object.entries(this.opts.filters).map(([key, cfg]) => {
      const options = cfg.options.map(o =>
        `<option value="${esc(o.value)}" ${this.filters[key] === o.value ? 'selected' : ''}>${esc(o.label)}</option>`
      ).join('');
      return `<select class="admin-select" data-filter-key="${key}"><option value="">Tất cả ${cfg.label}</option>${options}</select>`;
    }).join('');
  }

  async loadData() {
    const bodyEl = this.opts.container.querySelector('.at-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải...</div>';

    try {
      const result = await this.opts.fetchData(this.page, { search: this.searchQuery, ...this.filters });
      const data = result.data || [];
      const meta = result.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

      if (data.length === 0) {
        bodyEl.innerHTML = `
          <div class="admin-empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-title">Không có dữ liệu</div>
            <div class="empty-desc">Không tìm thấy kết quả nào.</div>
          </div>
        `;
        return;
      }

      bodyEl.innerHTML = `
        <table class="admin-table">
          <thead><tr>${this.opts.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${data.map(item => this.opts.renderRow(item)).join('')}</tbody>
        </table>
        ${this._renderPagination(meta)}
      `;

      // Bind pagination
      bodyEl.querySelectorAll('.admin-page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.page = parseInt(btn.dataset.page);
          this.loadData();
        });
      });

      // Bind row actions
      if (this.opts.onRowAction) {
        bodyEl.querySelectorAll('[data-action]').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.opts.onRowAction(el.dataset.action, el.dataset.id, el.dataset);
          });
        });
      }
    } catch (err) {
      bodyEl.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Lỗi tải dữ liệu</div>
          <div class="empty-desc">${esc(err.message || 'Unknown error')}</div>
        </div>
      `;
    }
  }

  _renderPagination(meta) {
    if (meta.totalPages <= 1) return '';
    const pages = [];
    for (let i = 1; i <= Math.min(meta.totalPages, 7); i++) {
      pages.push(`<button class="admin-page-btn ${i === meta.page ? 'active' : ''}" data-page="${i}">${i}</button>`);
    }
    return `
      <div class="admin-pagination">
        <div class="admin-pagination-info">Hiển thị ${meta.page}/${meta.totalPages} trang · ${meta.total} bản ghi</div>
        <div class="admin-pagination-controls">
          <button class="admin-page-btn" data-page="${Math.max(1, meta.page - 1)}" ${meta.page <= 1 ? 'disabled' : ''}>‹</button>
          ${pages.join('')}
          <button class="admin-page-btn" data-page="${Math.min(meta.totalPages, meta.page + 1)}" ${meta.page >= meta.totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    `;
  }

  refresh() { this.loadData(); }
}

// ─────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────

export function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function badge(text, cls) {
  return `<span class="admin-badge ${cls}">${esc(text)}</span>`;
}

export function statusBadge(status) {
  const s = (status || '').toLowerCase();
  return badge(status, `status-${s}`);
}

export function tierBadge(tier) {
  const t = (tier || '').toLowerCase();
  const labels = { standard: 'Standard', silver: 'Bạc', gold: 'Vàng', diamond: 'Kim Cương' };
  return badge(labels[t] || tier, `tier-${t}`);
}

export function roleBadge(code) {
  return badge(code, 'role-badge');
}

export function directionBadge(dir) {
  const d = (dir || '').toLowerCase();
  return badge(dir, `direction-${d}`);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export function formatNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

export function showToast(message, type = 'success') {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${esc(message)}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─────────────────────────────────────────────────────────────
// SHELL CONTROLLER
// ─────────────────────────────────────────────────────────────

async function initShell() {
  // Wait for FintopInfra to be available
  let attempts = 0;
  while (!window.FintopInfra && attempts < 50) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  Infra = window.FintopInfra;
  if (!Infra) {
    document.getElementById('admin-boot').innerHTML = `
      <div style="color:#F87171;text-align:center;">
        <div style="font-size:2rem;margin-bottom:1rem;">⚠️</div>
        <div>Không thể tải hệ thống cơ sở. Vui lòng tải lại trang.</div>
      </div>
    `;
    return;
  }

  // Wait for auth to be initialized
  await new Promise(r => setTimeout(r, 300));

  const isAuth = Infra.RbacEvaluator.isAuthenticated();
  const isSuperAdmin = Infra.RbacEvaluator.isSuperAdmin();

  // Check if user has any admin-level permission
  const hasAdminAccess = isSuperAdmin ||
    Infra.RbacEvaluator.hasPermission('MANAGE_USERS') ||
    Infra.RbacEvaluator.hasPermission('MANAGE_ROLES') ||
    Infra.RbacEvaluator.hasPermission('VIEW_AUDIT_LOGS') ||
    Infra.RbacEvaluator.hasPermission('CREATE_SIGNAL') ||
    Infra.RbacEvaluator.hasPermission('UPDATE_SIGNAL') ||
    Infra.RbacEvaluator.hasPermission('CREATE_BLOG') ||
    Infra.RbacEvaluator.hasPermission('UPDATE_BLOG');

  document.getElementById('admin-boot').style.display = 'none';

  if (!isAuth) {
    // Show access denied with login option
    document.getElementById('admin-denied').style.display = 'flex';
    document.getElementById('admin-denied-login')?.addEventListener('click', () => {
      if (Infra.AuthUI && typeof Infra.AuthUI.openModal === 'function') {
        Infra.AuthUI.openModal('login');
      } else if (typeof openAuthModal === 'function') {
        openAuthModal('login');
      } else {
        window.location.href = '/';
      }
    });

    // Re-check after login
    Infra.AppState.on(Infra.AppState.EVENTS?.AUTH_CHANGED || 'auth:changed', () => {
      window.location.reload();
    });
    return;
  }

  if (!hasAdminAccess) {
    document.getElementById('admin-denied').style.display = 'flex';
    document.querySelector('.denied-desc').textContent =
      'Tài khoản của bạn không có quyền quản trị. Liên hệ Super Admin để được cấp quyền.';
    return;
  }

  // Auth OK → show admin shell
  document.getElementById('admin-app').style.display = 'flex';

  // Populate sidebar
  buildSidebar(isSuperAdmin);

  // Populate user badge
  buildUserBadge();

  // Dropdown toggle logic
  const dropdown = document.getElementById('admin-user-dropdown');
  const trigger = document.getElementById('admin-dropdown-trigger');
  
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // Close dropdown on navigating to any page (hash change)
  window.addEventListener('hashchange', () => {
    dropdown?.classList.remove('active');
  });

  // Logout handler
  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    if (Infra.AuthManager && typeof Infra.AuthManager.logout === 'function') {
      await Infra.AuthManager.logout();
    }
    window.location.href = '/';
  });

  // Hash routing
  window.addEventListener('hashchange', onHashChange);
  onHashChange();
}

function buildSidebar(isSuperAdmin) {
  const nav = document.getElementById('admin-nav');
  let currentSection = '';
  let html = '';

  for (const mod of MODULES) {
    if (mod.hidden) {
      continue;
    }
    // Permission check for tab visibility
    if (mod.permission && !isSuperAdmin && !Infra.RbacEvaluator.hasPermission(mod.permission)) {
      continue;
    }

    if (mod.section !== currentSection) {
      currentSection = mod.section;
      html += `<div class="admin-nav-section">${esc(mod.section)}</div>`;
    }

    html += `
      <div class="admin-nav-item" data-module="${mod.id}" id="nav-${mod.id}">
        <span class="nav-icon">${mod.icon}</span>
        <span>${esc(mod.label)}</span>
      </div>
    `;
  }

  nav.innerHTML = html;

  // Click handlers
  nav.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      window.location.hash = item.dataset.module;
    });
  });
}

function buildUserBadge() {
  const badge = document.getElementById('admin-user-badge');
  const user = Infra.AppState.getState('user') || {};
  const name = user.fullName || user.email || 'Admin';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roles = (user.roles || []).join(', ') || 'Admin';

  if (badge) {
    badge.innerHTML = `
      <div class="admin-user-avatar">${initials}</div>
      <div class="admin-user-info">
        <div class="admin-user-name">${esc(name)}</div>
        <div class="admin-user-role">${esc(roles)}</div>
      </div>
    `;
  }

  // Populate username in topbar dropdown trigger
  const headerUsernameEl = document.getElementById('admin-header-username');
  if (headerUsernameEl) {
    headerUsernameEl.textContent = name;
  }
}

async function onHashChange() {
  const hash = (window.location.hash || '#overview').replace('#', '');
  const moduleConfig = MODULES.find(m => m.id === hash) || MODULES[0];
  const moduleId = moduleConfig.id;

  // Update active nav
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.module === moduleId);
  });

  // Update topbar title
  document.getElementById('admin-topbar-title').textContent = moduleConfig.label;

  // Destroy current module
  if (currentModule && currentModule.destroy) {
    try { currentModule.destroy(); } catch (e) { /* ignore */ }
  }

  const container = document.getElementById('admin-content');
  container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải module...</div>';

  try {
    const mod = await import(`./modules/${moduleId}.js`);
    const moduleExport = mod.default || mod;
    currentModule = moduleExport;

    container.innerHTML = '';
    await moduleExport.render(container);
  } catch (err) {
    console.error(`[Admin] Failed to load module "${moduleId}":`, err);
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Không thể tải module "${esc(moduleId)}"</div>
        <div class="empty-desc">${esc(err.message)}</div>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShell);
} else {
  initShell();
}
