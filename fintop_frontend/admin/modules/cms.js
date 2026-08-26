/**
 * cms.js — Blog & Report Management Module
 */
import { AdminTable, esc, statusBadge, tierBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let activeTab = 'blogs';
let isCreating = false;
let editingBlog = null;
let currentPage = 1;
let selectedCategory = '';
let searchQuery = '';

let AVAILABLE_CATEGORIES = [];

const DEFAULT_CATEGORIES = [
  { id: 1, slug: 'thi-truong', name: 'Thị trường' },
  { id: 2, slug: 'pro-research', name: 'PRO Research' },
  { id: 3, slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
  { id: 4, slug: 'ncpt-nganh', name: 'NCPT Ngành' },
  { id: 5, slug: 'pro-data', name: 'PRO Data' },
  { id: 6, slug: 'dinh-luong', name: 'Định lượng' }
];

async function loadCategories() {
  try {
    const res = await API().get(EP().BLOG_CATEGORIES);
    const list = res.data || res || [];
    AVAILABLE_CATEGORIES = Array.isArray(list) ? [...list] : [];
  } catch (err) {
    console.error('Failed to load categories from database, using fallback:', err);
    AVAILABLE_CATEGORIES = [];
  }

  // Ensure all 6 required categories are present
  DEFAULT_CATEGORIES.forEach(defCat => {
    if (!AVAILABLE_CATEGORIES.some(c => c.slug === defCat.slug)) {
      AVAILABLE_CATEGORIES.push(defCat);
    }
  });
}

function ensureCKEditor(callback) {
  if (window.CKEDITOR) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdn.ckeditor.com/4.22.1/full/ckeditor.js';
  script.onload = () => {
    callback();
  };
  document.head.appendChild(script);
}

export default {
  id: 'cms',
  label: 'Quản trị bài viết',
  icon: '📅',

  async render(container) {
    injectStyles();
    await loadCategories();

    if (isCreating) {
      renderCreateForm(container, editingBlog);
      return;
    }

    container.innerHTML = `
      <div class="admin-tabs">
        <button class="admin-tab ${activeTab === 'blogs' ? 'active' : ''}" data-tab="blogs">📝 Bài viết</button>
        <button class="admin-tab ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">📄 Báo cáo</button>
      </div>
      <div id="cms-content"></div>
    `;

    container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        container.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
        renderTab(container.querySelector('#cms-content'), container);
      });
    });

    renderTab(container.querySelector('#cms-content'), container);
  },

  destroy() {
    if (window.CKEDITOR && window.CKEDITOR.instances['blog-content']) {
      window.CKEDITOR.instances['blog-content'].destroy();
    }
    document.body.style.overflow = '';
  },
};

function injectStyles() {
  if (document.getElementById('cms-custom-styles')) return;
  const style = document.createElement('style');
  style.id = 'cms-custom-styles';
  style.textContent = `
    .cms-control-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      background: transparent;
    }
    .cms-btn-add {
      background-color: #2ecc71;
      color: #fff;
      border: none;
      width: 44px;
      height: 40px;
      border-radius: 6px;
      font-size: 1.4rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .cms-btn-add:hover {
      background-color: #27ae60;
    }
    .cms-btn-delete {
      background-color: #e74c3c;
      color: #fff;
      border: none;
      width: 44px;
      height: 40px;
      border-radius: 6px;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .cms-btn-delete:hover {
      background-color: #c0392b;
    }
    .cms-select-cat {
      background-color: #ffffff;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0 16px;
      height: 40px;
      font-size: 0.9rem;
      min-width: 200px;
      outline: none;
    }
    .cms-search-wrapper {
      display: flex;
      gap: 6px;
      margin-left: auto;
    }
    .cms-search-input {
      background-color: #ffffff;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0 16px;
      height: 40px;
      font-size: 0.9rem;
      width: 280px;
      outline: none;
    }
    .cms-btn-search {
      background-color: #1a233a;
      color: #fff;
      border: 1px solid #2d3748;
      width: 50px;
      height: 40px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .cms-btn-search:hover {
      background-color: #0f172a;
    }
    .cms-table-wrapper {
      background: #151b2e;
      border: 1px solid #2d3748;
      border-radius: 8px;
      overflow: hidden;
    }
    .cms-table {
      width: 100%;
      border-collapse: collapse;
      color: #e2e8f0;
      font-size: 0.875rem;
    }
    .cms-table th {
      background-color: #1f293d;
      color: #cbd5e1;
      padding: 14px 10px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.8rem;
      border-bottom: 1px solid #2d3748;
      border-right: 1px solid #2d3748;
      text-align: center;
    }
    .cms-table th:last-child {
      border-right: none;
    }
    .cms-table td {
      padding: 14px 10px;
      border-bottom: 1px solid #2d3748;
      border-right: 1px solid #2d3748;
      vertical-align: middle;
      text-align: center;
    }
    .cms-table td:last-child {
      border-right: none;
    }
    .cms-table td.text-left {
      text-align: left;
    }
    .cms-table tbody tr {
      background-color: #1a233a;
      transition: background-color 0.15s;
    }
    .cms-table tbody tr:hover {
      background-color: #242f4c;
    }
    .cms-img-container {
      width: 80px;
      height: 80px;
      background-color: #12182b;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 1px solid #2d3748;
    }
    .cms-img-thumbnail {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
    .cms-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .cms-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .cms-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #4b5563;
      transition: .3s;
      border-radius: 24px;
    }
    .cms-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .cms-slider {
      background-color: #2ecc71;
    }
    input:checked + .cms-slider:before {
      transform: translateX(20px);
    }
    .cms-action-btn {
      width: 44px;
      height: 34px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 4px;
      transition: opacity 0.2s;
    }
    .cms-action-btn:hover {
      opacity: 0.85;
    }
    .cms-btn-view {
      background-color: #ffffff;
      color: #27ae60;
      border: 1.5px solid #27ae60;
    }
    .cms-btn-edit {
      background-color: #f97316;
      color: white;
    }
    .cms-btn-view svg, .cms-btn-edit svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    .cms-table-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    
    /* CMS Edit Overlay Styles */
    .cms-edit-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #1e2540; /* Dark navy */
      z-index: 9999;
      display: flex;
      flex-direction: column;
      color: #fff;
      font-family: 'Be Vietnam Pro', sans-serif;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .cms-edit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background-color: #1e2540;
    }
    .cms-edit-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .cms-edit-close-btn {
      background-color: #ffffff;
      color: #000000;
      border: none;
      font-weight: bold;
      font-size: 14px;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }
    .cms-edit-close-btn:hover {
      opacity: 0.8;
    }
    .cms-edit-form {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .cms-edit-body {
      flex: 1;
      display: flex;
      gap: 24px;
      padding: 24px;
    }
    .cms-edit-left {
      flex: 7;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cms-edit-right {
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background-color: transparent;
    }
    .cms-form-group {
      display: flex;
      flex-direction: column;
    }
    .cms-edit-label {
      font-size: 14px;
      font-weight: 500;
      color: #a0aec0;
      margin-bottom: 8px;
    }
    .cms-required {
      color: #e53e3e;
      margin-left: 2px;
    }
    .cms-edit-input {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #4a5568;
      background-color: #ffffff;
      color: #000000;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    .cms-edit-input::placeholder {
      color: #a0aec0;
    }
    .cms-edit-select {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #4a5568;
      background-color: #ffffff;
      color: #000000;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      appearance: auto;
    }
    .cms-btn-image {
      align-self: flex-start;
      background-color: #ffffff;
      color: #000000;
      border: 1px solid #cbd5e1;
      font-weight: bold;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cms-btn-image:hover {
      background-color: #f1f5f9;
    }
    .cms-status-checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cms-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .cms-checkbox-label {
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
      cursor: pointer;
      user-select: none;
    }
    .cms-edit-actions {
      display: flex;
      gap: 12px;
    }
    .cms-btn-submit {
      background-color: #4A6CF7;
      color: #ffffff;
      border: none;
      font-weight: bold;
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cms-btn-submit:hover {
      background-color: #3b5bdb;
    }
    .cms-btn-close {
      background-color: #ffffff;
      color: #000000;
      border: 1px solid #cbd5e1;
      font-weight: bold;
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cms-btn-close:hover {
      background-color: #f1f5f9;
    }
    .cke_notification_warning,
    .cms-editor-warning-alert {
      display: none !important;
    }
    .cms-editor-warning-alert {
      position: absolute;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #BA3D3D;
      color: #ffffff;
      padding: 10px 16px;
      font-size: 13px;
      font-family: Arial, sans-serif;
      border-radius: 3px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .cms-editor-warning-alert span {
      white-space: nowrap;
    }
    .cms-alert-close {
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
      opacity: 0.8;
      padding: 2px 6px;
      border-radius: 3px;
      transition: opacity 0.2s;
    }
    .cms-alert-close:hover {
      opacity: 1;
      background-color: rgba(255,255,255,0.1);
    }
    
    /* CMS Preview Overlay Styles matching the user page */
    .cms-preview-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #07070D; /* Match user background */
      z-index: 10000;
      display: flex;
      flex-direction: column;
      color: #fff;
      font-family: 'Be Vietnam Pro', sans-serif;
      box-sizing: border-box;
    }
    .cms-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      background-color: #0d0d15;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .cms-preview-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .cms-preview-close-btn {
      background-color: #7c3aed;
      color: #ffffff;
      border: none;
      font-weight: bold;
      font-size: 14px;
      width: 80px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .cms-preview-close-btn:hover {
      background-color: #6d28d9;
    }
    .cms-preview-body {
      flex: 1;
      overflow-y: auto;
      padding: 32px 16px;
      background-color: #07070D;
    }
    .cms-preview-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      margin: 0 auto;
      max-width: 960px;
      color: #1e293b;
      overflow: hidden;
      padding: 0;
    }
    .cms-preview-header-banner {
      background-image: linear-gradient(135deg, rgba(20, 5, 38, 0.9), rgba(55, 10, 85, 0.82)), url("../assets/images/bgctys.jpg");
      background-size: cover;
      background-position: center 30%;
      min-height: 175px;
      display: flex;
      align-items: center;
      padding: 1.25rem 2.5rem;
      position: relative;
      gap: 1.5rem;
      border-bottom: 2px solid rgba(168, 85, 247, 0.45);
    }
    .cms-preview-banner-logo-box {
      background: transparent;
      border: 3px solid rgba(216, 180, 254, 0.85);
      padding: 0;
      width: 135px;
      height: 135px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.6);
      border-radius: 50%;
      flex-shrink: 0;
      overflow: hidden;
    }
    .cms-preview-banner-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .cms-preview-banner-title {
      color: #ffffff;
      font-size: 1.75rem;
      font-weight: 800;
      text-transform: uppercase;
      line-height: 1.35;
      text-shadow: 0 3px 8px rgba(0, 0, 0, 0.9);
      flex-grow: 1;
      text-align: center;
      margin: 0;
      padding-right: 65px;
    }
    @media (max-width: 768px) {
      .cms-preview-banner-title {
        padding-right: 0;
      }
      .cms-preview-header-banner {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1.5rem;
      }
    }
    .cms-preview-date-bar {
      background: linear-gradient(90deg, #4a006c, #620986, #4a006c);
      color: #ffffff;
      padding: 10px 3rem;
      font-size: 0.92rem;
      font-weight: 600;
      text-align: right;
      border-bottom: 2px solid rgba(216, 180, 254, 0.3);
      letter-spacing: 0.5px;
    }
    .cms-preview-body-wrapper {
      padding: 2.5rem 3rem;
      position: relative;
      background-color: #ffffff;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280' viewBox='0 0 280 280'%3E%3Ctext x='50%25' y='50%25' fill='rgba(0, 0, 0, 0.025)' font-size='30' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle' transform='rotate(-32, 140, 140)'%3EFINTOP%3C/text%3E%3C/svg%3E");
      background-repeat: repeat;
      min-height: 400px;
    }
    .cms-preview-article-content,
    .cms-preview-article-content * {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    .cms-preview-article-content {
      font-size: 16px;
      line-height: 1.8;
      color: #000000;
      text-align: justify;
    }
    .cms-preview-article-content p,
    .cms-preview-article-content blockquote {
      margin-bottom: 1.5rem;
      color: #000000;
    }
    .cms-preview-article-content ul, 
    .cms-preview-article-content ol {
      padding-left: 1.75rem;
      margin-bottom: 1.5rem;
    }
    .cms-preview-article-content li {
      margin-bottom: 0.6rem;
      color: #000000;
    }
    .cms-preview-article-content a {
      color: #0056b3;
      text-decoration: underline;
    }
    .cms-preview-article-content a:hover {
      color: #a855f7;
    }
    .cms-preview-article-content img {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      display: block;
      margin: 2rem auto;
      border-radius: 4px;
    }
    .cms-preview-article-content iframe {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 450px;
      display: block;
      margin: 2rem auto;
      border: none;
    }
    .cms-preview-article-content h1 {
      font-size: 1.6rem;
      color: #000000;
      font-weight: bold;
      margin-top: 2.2rem;
      margin-bottom: 1.1rem;
    }
    .cms-preview-article-content h2 {
      font-size: 1.4rem;
      color: #000000;
      font-weight: bold;
      margin-top: 1.8rem;
      margin-bottom: 0.9rem;
    }
    .cms-preview-article-content h3 {
      font-size: 1.2rem;
      color: #000000;
      font-weight: bold;
      margin-top: 1.6rem;
      margin-bottom: 0.8rem;
    }
    .cms-preview-article-content h4,
    .cms-preview-article-content h5,
    .cms-preview-article-content h6 {
      font-size: 1.1rem;
      color: #000000;
      font-weight: bold;
      margin-top: 1.4rem;
      margin-bottom: 0.8rem;
    }
    .cms-preview-article-content table {
      width: 100% !important;
      border-collapse: collapse;
      margin: 2.5rem 0;
      background: #ffffff;
      border: 1px solid #dddddd;
    }
    .cms-preview-article-content th, .cms-preview-article-content td {
      border: 1px solid #dddddd;
      padding: 12px 15px;
      text-align: left;
      font-size: 0.92rem;
    }
    .cms-preview-article-content th {
      background-color: #f2f2f2;
      color: #333333;
      font-weight: bold;
    }
    .cms-preview-article-content td {
      color: #264451;
    }
    .cms-preview-article-content tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  `;
  document.head.appendChild(style);
}

function renderTab(contentEl, mainContainer) {
  if (activeTab === 'blogs') {
    renderBlogs(contentEl, mainContainer);
  } else {
    renderReports(contentEl);
  }
}

function extractFirstImage(content) {
  if (!content) return '../assets/images/placeholder.png';
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  const mdM = content.match(/!\[.*?\]\((.*?)\)/);
  if (mdM) return mdM[1];
  return '../assets/images/placeholder.png';
}

function formatDateStr(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function renderBlogs(contentEl, mainContainer) {
  contentEl.innerHTML = `
    <div class="cms-control-bar">
      <button class="cms-btn-add" id="cms-add-btn" title="Thêm bài viết mới">+</button>
      <button class="cms-btn-delete" id="cms-delete-btn" title="Xóa các bài viết đã chọn">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
      <select class="cms-select-cat" id="cms-cat-select">
        <option value="">-- Chọn thể loại --</option>
        ${AVAILABLE_CATEGORIES.map(c => `<option value="${c.id}" ${selectedCategory == c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
      <div class="cms-search-wrapper">
        <input class="cms-search-input" id="cms-search-inp" placeholder="Tìm kiếm..." value="${esc(searchQuery)}">
        <button class="cms-btn-search" id="cms-search-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="cms-table-wrapper">
      <div id="cms-table-loading" class="admin-loading"><div class="admin-spinner"></div> Đang tải danh sách bài viết...</div>
      <div id="cms-table-content"></div>
    </div>
    <div id="cms-pagination" style="margin-top:15px;"></div>
  `;

  // Bind controls
  const addBtn = contentEl.querySelector('#cms-add-btn');
  addBtn.addEventListener('click', () => {
    isCreating = true;
    editingBlog = null;
    renderCreateForm(mainContainer, null);
  });

  const catSelect = contentEl.querySelector('#cms-cat-select');
  catSelect.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    currentPage = 1;
    fetchAndRenderBlogs(contentEl, mainContainer);
  });

  const searchInp = contentEl.querySelector('#cms-search-inp');
  searchInp.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchQuery = searchInp.value;
      currentPage = 1;
      fetchAndRenderBlogs(contentEl, mainContainer);
    }
  });

  const searchBtn = contentEl.querySelector('#cms-search-btn');
  searchBtn.addEventListener('click', () => {
    searchQuery = searchInp.value;
    currentPage = 1;
    fetchAndRenderBlogs(contentEl, mainContainer);
  });

  const deleteBtn = contentEl.querySelector('#cms-delete-btn');
  deleteBtn.addEventListener('click', async () => {
    const checkedBoxes = contentEl.querySelectorAll('.cms-row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất một bài viết để xóa.', 'error');
      return;
    }
    const ids = Array.from(checkedBoxes).map(cb => cb.dataset.id);
    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} bài viết đã chọn không?`)) {
      try {
        for (const id of ids) {
          await API().delete(`/blogs/${id}`);
        }
        showToast(`Đã xóa thành công ${ids.length} bài viết!`, 'success');
        fetchAndRenderBlogs(contentEl, mainContainer);
      } catch (err) {
        showToast(`Lỗi xóa: ${err.message}`, 'error');
      }
    }
  });

  fetchAndRenderBlogs(contentEl, mainContainer);
}

async function fetchAndRenderBlogs(contentEl, mainContainer) {
  const tableContent = contentEl.querySelector('#cms-table-content');
  const tableLoading = contentEl.querySelector('#cms-table-loading');
  const paginationEl = contentEl.querySelector('#cms-pagination');

  if (tableLoading) tableLoading.style.display = 'flex';
  if (tableContent) tableContent.innerHTML = '';
  if (paginationEl) paginationEl.innerHTML = '';

  try {
    const qs = API().toQuery({ 
      page: currentPage, 
      limit: 10, 
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined
    });
    const res = await API().get(EP().ADMIN_BLOGS + qs);
    const list = res.data || res || [];
    const meta = res.meta || { total: list.length, page: currentPage, limit: 10, totalPages: 1 };

    if (tableLoading) tableLoading.style.display = 'none';

    if (list.length === 0) {
      tableContent.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">Không có bài viết</div>
          <div class="empty-desc">Không tìm thấy bài viết nào phù hợp.</div>
        </div>
      `;
      return;
    }

    tableContent.innerHTML = `
      <table class="cms-table">
        <thead>
          <tr>
            <th style="width: 40px;"><input type="checkbox" id="cms-header-checkbox" class="cms-table-checkbox"></th>
            <th style="width: 60px;">STT</th>
            <th style="width: 180px;">Ngày thêm</th>
            <th class="text-left">Tên bài viết</th>
            <th style="width: 150px;">Thể loại</th>
            <th style="width: 100px;">Ảnh</th>
            <th style="width: 120px;">Loại</th>
            <th style="width: 120px;">Trạng thái</th>
            <th style="width: 120px;">#</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((b, idx) => {
            const stt = (currentPage - 1) * meta.limit + idx + 1;
            const img = extractFirstImage(b.content);
            const isPublished = b.status === 'PUBLISHED';
            const dateStr = formatDateStr(b.publishedAt || b.createdAt);
            const tierMap = { STANDARD: 'Standard', SILVER: 'PRO', GOLD: 'VIP', DIAMOND: 'Diamond' };
            const typeStr = tierMap[b.minTierAccess] || (b.visibility === 'PUBLIC' ? 'Standard' : 'PRO');
            return `
              <tr data-id="${b.id}">
                <td><input type="checkbox" class="cms-row-checkbox cms-table-checkbox" data-id="${b.id}"></td>
                <td>${stt}</td>
                <td>${dateStr}</td>
                <td class="text-left" style="font-weight: 500;">
                  ${esc(b.title)}
                  <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">/${esc(b.slug)}</div>
                </td>
                <td><span style="font-weight: 600; color: #a78bfa;">${esc(b.category?.name || 'Chưa phân loại')}</span></td>
                <td>
                  <div class="cms-img-container">
                    <img src="${img}" alt="${esc(b.title)}" class="cms-img-thumbnail" onerror="this.src='../assets/images/placeholder.png'">
                  </div>
                </td>
                <td><span class="admin-badge tier-${(b.minTierAccess || 'standard').toLowerCase()}">${esc(typeStr)}</span></td>
                <td>
                  <label class="cms-switch">
                    <input type="checkbox" class="cms-status-toggle" data-id="${b.id}" ${isPublished ? 'checked' : ''}>
                    <span class="cms-slider"></span>
                  </label>
                </td>
                <td>
                  <button class="cms-action-btn cms-btn-view" data-action="view" data-id="${b.id}" data-slug="${b.slug}" title="Xem bài viết">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="cms-action-btn cms-btn-edit" data-action="edit" data-id="${b.id}" title="Sửa bài viết">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    const headerCheckbox = tableContent.querySelector('#cms-header-checkbox');
    headerCheckbox.addEventListener('change', (e) => {
      const rowCheckboxes = tableContent.querySelectorAll('.cms-row-checkbox');
      rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
    });

    tableContent.querySelectorAll('.cms-status-toggle').forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const publish = e.target.checked;
        const targetStatus = publish ? 'PUBLISHED' : 'DRAFT';
        try {
          if (publish) {
            await API().patch(`/blogs/${id}/status`, { status: 'PENDING_REVIEW' });
          }
          await API().patch(`/blogs/${id}/status`, { status: targetStatus });
          showToast(`Đã chuyển trạng thái bài viết thành ${publish ? 'Xuất bản' : 'Bản nháp'}!`, 'success');
        } catch (err) {
          showToast(`Lỗi đổi trạng thái: ${err.message}`, 'error');
          e.target.checked = !publish;
        }
      });
    });

    tableContent.querySelectorAll('.cms-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'view') {
          const id = parseInt(btn.dataset.id, 10);
          const blog = list.find(item => item.id === id);
          if (blog) {
            renderPreviewOverlay(mainContainer, blog);
          }
        } else if (action === 'edit') {
          const id = parseInt(btn.dataset.id, 10);
          const blog = list.find(item => item.id === id);
          if (blog) {
            isCreating = true;
            editingBlog = blog;
            renderCreateForm(mainContainer, blog);
          }
        }
      });
    });

    renderPagination(meta, paginationEl, contentEl, mainContainer);

  } catch (err) {
    if (tableLoading) tableLoading.style.display = 'none';
    if (tableContent) {
      tableContent.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Lỗi tải dữ liệu</div>
          <div class="empty-desc">${esc(err.message || 'Unknown error')}</div>
        </div>
      `;
    }
  }
}

function renderPagination(meta, paginationEl, contentEl, mainContainer) {
  if (meta.totalPages <= 1) return;
  const pages = [];
  for (let i = 1; i <= meta.totalPages; i++) {
    pages.push(`<button class="admin-page-btn ${i === meta.page ? 'active' : ''}" data-page="${i}">${i}</button>`);
  }
  paginationEl.innerHTML = `
    <div class="admin-pagination" style="background:#151b2e; border: 1px solid #2d3748; border-radius: 8px;">
      <div class="admin-pagination-info">Hiển thị ${meta.page}/${meta.totalPages} trang · ${meta.total} bản ghi</div>
      <div class="admin-pagination-controls">
        <button class="admin-page-btn" data-page="${Math.max(1, meta.page - 1)}" ${meta.page <= 1 ? 'disabled' : ''}>‹</button>
        ${pages.join('')}
        <button class="admin-page-btn" data-page="${Math.min(meta.totalPages, meta.page + 1)}" ${meta.page >= meta.totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>
  `;

  paginationEl.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      fetchAndRenderBlogs(contentEl, mainContainer);
    });
  });
}

function renderPreviewOverlay(container, blog) {
  document.body.style.overflow = 'hidden';
  
  const pubDate = blog.publishedAt ? new Date(blog.publishedAt) : new Date(blog.createdAt);
  const dd = String(pubDate.getDate()).padStart(2, '0');
  const mm = String(pubDate.getMonth() + 1).padStart(2, '0');
  const yyyy = pubDate.getFullYear();
  const dateStr = `${dd}/${mm}/${yyyy}`;

  // Clean the featured image from content to prevent duplicating it if it was embedded at the top
  let displayContent = blog.content || '';
  const featuredImgRegex = /<img[^>]+(?:class=["']cms-featured-image["']|style=["'][^"']*display:\s*none[^"']*["'])[^>]*>/gi;
  displayContent = displayContent.replace(featuredImgRegex, '');

  const overlay = document.createElement('div');
  overlay.className = 'cms-preview-overlay';
  overlay.innerHTML = `
    <div class="cms-preview-header">
      <h2 class="cms-preview-title">Xem trước bài viết (Giao diện người dùng)</h2>
      <button type="button" class="cms-preview-close-btn" id="cms-preview-close-x">Đóng</button>
    </div>
    
    <div class="cms-preview-body">
      <div class="cms-preview-card">
        <!-- Full Width Header Banner -->
        <div class="cms-preview-header-banner">
          <div class="cms-preview-banner-logo-box">
            <img src="../assets/images/LogoFinTop_notbg.jpg" alt="FinTop Logo" onerror="this.src='../../assets/images/LogoFinTop_notbg.jpg'">
          </div>
          <h1 class="cms-preview-banner-title">${esc(blog.title)}</h1>
        </div>

        <!-- Red Publication Date Bar -->
        <div class="cms-preview-date-bar">
          Ngày xuất bản: <span>${dateStr}</span>
        </div>

        <!-- Watermarked Content Wrapper -->
        <div class="cms-preview-body-wrapper">
          <div class="cms-preview-article-content">
            ${displayContent || 'Nội dung bài viết trống.'}
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.appendChild(overlay);
  
  const handleClose = () => {
    document.body.style.overflow = '';
    overlay.remove();
  };
  
  overlay.querySelector('#cms-preview-close-x').addEventListener('click', handleClose);
}

function ensureImportLibraries(callback) {
  let loadedCount = 0;
  const totalLibs = 3; // mammoth, xlsx, pdf.js
  
  function checkDone() {
    loadedCount++;
    if (loadedCount === totalLibs) {
      callback();
    }
  }

  // Load mammoth
  if (window.mammoth) {
    checkDone();
  } else {
    const s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    s1.onload = checkDone;
    document.head.appendChild(s1);
  }

  // Load SheetJS (XLSX)
  if (window.XLSX) {
    checkDone();
  } else {
    const s2 = document.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s2.onload = checkDone;
    document.head.appendChild(s2);
  }

  // Load PDF.js
  if (window.pdfjsLib) {
    checkDone();
  } else {
    const s3 = document.createElement('script');
    s3.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    s3.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      checkDone();
    };
    document.head.appendChild(s3);
  }
}

async function parseFileToHtml(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const html = text.split('\n').map(line => `<p>${esc(line)}</p>`).join('');
        resolve(html);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  if (['doc', 'docx'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
          .then(result => {
            resolve(result.value);
          })
          .catch(reject);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
          const workbook = window.XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          let html = window.XLSX.utils.sheet_to_html(worksheet);
          html = html.replace('<table', '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;"');
          resolve(html);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  if (ext === 'pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target.result);
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `<p>${esc(pageText)}</p>`;
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  throw new Error('Định dạng file không hỗ trợ trích xuất nội dung.');
}

function renderCreateForm(container, blogToEdit = null) {
  const isEdit = !!blogToEdit;
  document.body.style.overflow = 'hidden';
  let hasImportedFile = isEdit;

  // Extract and clean featured image from content
  let featuredImageUrl = '';
  let initialContent = blogToEdit?.content || '';
  
  const featuredImgRegex = /<img[^>]+(?:class=["']cms-featured-image["']|style=["'][^"']*display:\s*none[^"']*["'])[^>]*>/gi;
  const matchTag = initialContent.match(featuredImgRegex);
  
  if (matchTag && matchTag.length > 0) {
    const srcMatch = matchTag[0].match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      featuredImageUrl = srcMatch[1];
    }
    initialContent = initialContent.replace(featuredImgRegex, '');
  } else {
    const firstImg = extractFirstImage(initialContent);
    if (firstImg && firstImg !== '../assets/images/placeholder.png') {
      featuredImageUrl = firstImg;
    }
  }

  const currentTier = blogToEdit ? (blogToEdit.minTierAccess || 'STANDARD') : 'STANDARD';
  const isPublished = blogToEdit ? blogToEdit.status === 'PUBLISHED' : true;

  // Keep the 6 categories corresponding to research and user data pages
  const ALLOWED_SLUGS = ['thi-truong', 'pro-research', 'doanh-nghiep', 'ncpt-nganh', 'pro-data', 'dinh-luong'];
  const displayedCategories = AVAILABLE_CATEGORIES.filter(c => ALLOWED_SLUGS.includes(c.slug));

  // If editing an existing article with a category outside the 4 allowed, keep/append it so it is pre-selected and preserved
  if (isEdit && blogToEdit) {
    const currentCatId = blogToEdit.categoryId || blogToEdit.category?.id;
    const currentCatSlug = blogToEdit.category?.slug;
    
    const isIncluded = displayedCategories.some(c => 
      (currentCatId && c.id === currentCatId) || 
      (currentCatSlug && c.slug === currentCatSlug)
    );
    
    if (!isIncluded) {
      const originalCat = AVAILABLE_CATEGORIES.find(c => 
        (currentCatId && c.id === currentCatId) || 
        (currentCatSlug && c.slug === currentCatSlug)
      );
      if (originalCat) {
        displayedCategories.push(originalCat);
      }
    }
  }

  container.innerHTML = `
    <div class="cms-edit-overlay">
      <div class="cms-edit-header">
        <h2 class="cms-edit-title">${isEdit ? 'Cập nhật bài viết' : 'Thêm bài viết'}</h2>
        <button type="button" class="cms-edit-close-btn" id="cms-btn-close-x">X</button>
      </div>
      
      <form id="create-blog-form" class="cms-edit-form">
        <div class="cms-edit-body">
          <!-- Left Column (70%) -->
          <div class="cms-edit-left">
            <div class="cms-form-group">
              <label class="cms-edit-label">Tiêu đề <span class="cms-required">*</span></label>
              <input type="text" id="blog-title" class="cms-edit-input" placeholder="Nhập tiêu đề..." value="${esc(blogToEdit?.title || '')}" required>
            </div>
            
            <div class="cms-form-group" style="position: relative;">
              <label class="cms-edit-label">Nội dung</label>
              <textarea id="blog-content" class="cms-edit-textarea" placeholder="Nhập nội dung bài viết..." style="visibility: hidden; display: none;">${esc(initialContent)}</textarea>
            </div>
          </div>
          
          <!-- Right Column (30%) -->
          <div class="cms-edit-right">
            <div class="cms-form-group">
              <label class="cms-edit-label">Thể loại <span class="cms-required">*</span></label>
              <select id="blog-category" class="cms-edit-select" required>
                <option value="">-- Chọn thể loại --</option>
                ${displayedCategories.map(c => {
                  const isSelected = (blogToEdit?.categoryId === c.id) || 
                                     (blogToEdit?.category?.id === c.id) || 
                                     (blogToEdit?.category?.slug === c.slug);
                  return `<option value="${c.id}" ${isSelected ? 'selected' : ''}>${esc(c.name)}</option>`;
                }).join('')}
              </select>
            </div>
            
            <div class="cms-form-group">
              <label class="cms-edit-label">Loại bài viết <span class="cms-required">*</span></label>
              <select id="blog-tier" class="cms-edit-select" required>
                <option value="STANDARD" ${currentTier === 'STANDARD' ? 'selected' : ''}>Standard</option>
                <option value="SILVER" ${currentTier === 'SILVER' ? 'selected' : ''}>PRO</option>
                <option value="GOLD" ${currentTier === 'GOLD' ? 'selected' : ''}>VIP</option>
                <option value="DIAMOND" ${currentTier === 'DIAMOND' ? 'selected' : ''}>Diamond</option>
              </select>
            </div>
            
            <div class="cms-form-group">
              <label class="cms-edit-label">Ảnh đại diện bài viết</label>
              <div class="cms-thumbnail-preview-container" style="border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 12px; background: rgba(0,0,0,0.2); position: relative; min-height: 140px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
                <img id="cms-thumbnail-preview" src="${esc(featuredImageUrl)}" style="max-width: 100%; max-height: 120px; border-radius: 4px; object-fit: cover; display: ${featuredImageUrl ? 'block' : 'none'};" />
                <div id="cms-thumbnail-placeholder" style="display: ${featuredImageUrl ? 'none' : 'block'}; color: #a0aec0; font-size: 0.85rem;">
                  <span style="font-size: 2rem; display: block; margin-bottom: 4px;">🖼️</span>
                  Chưa có ảnh đại diện
                </div>
                <button type="button" id="cms-btn-remove-thumbnail" style="display: ${featuredImageUrl ? 'block' : 'none'}; position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;" title="Xóa ảnh đại diện">✕</button>
              </div>
              <button type="button" class="cms-btn-image" id="cms-btn-select-thumbnail" style="width: 100%; margin-bottom: 16px;">Chọn ảnh đại diện</button>
              <input type="file" id="cms-file-thumbnail" style="display:none;" accept="image/*">
            </div>

            <div class="cms-form-group">
              <label class="cms-edit-label">Tài liệu & Nội dung</label>
              <div style="display: flex; gap: 12px;">
                <button type="button" class="cms-btn-image" id="cms-btn-select-image" style="margin-bottom:0; flex:1; font-size: 0.85rem; padding: 8px 12px;">Chèn ảnh nội dung</button>
                <button type="button" class="cms-btn-image" id="cms-btn-select-file" style="margin-bottom:0; flex:1; font-size: 0.85rem; padding: 8px 12px;">Tải file lên</button>
              </div>
              <input type="file" id="cms-file-image" style="display:none;" accept="image/*">
              <input type="file" id="cms-file-doc" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv">
            </div>
            
            <div class="cms-form-group" style="margin-top: 1.5rem;">
              <label class="cms-edit-label">Trạng thái</label>
              <div class="cms-status-checkbox-wrapper">
                <input type="checkbox" id="blog-status" class="cms-checkbox" ${isPublished ? 'checked' : ''}>
                <label for="blog-status" class="cms-checkbox-label">Hoạt động</label>
              </div>
            </div>
            
            <div class="cms-edit-actions" style="margin-top: 2rem;">
              <button type="submit" class="cms-btn-submit">${isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
              <button type="button" class="cms-btn-close" id="cms-btn-close-bottom">Đóng</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;

  // Close and cancel handlers
  const handleClose = () => {
    if (window.CKEDITOR && window.CKEDITOR.instances['blog-content']) {
      window.CKEDITOR.instances['blog-content'].destroy();
    }
    document.body.style.overflow = '';
    isCreating = false;
    editingBlog = null;
    const mod = defaultExport();
    mod.render(container);
  };

  container.querySelector('#cms-btn-close-x').addEventListener('click', handleClose);
  container.querySelector('#cms-btn-close-bottom').addEventListener('click', handleClose);

  // Helper to auto-compress high resolution images (e.g. 5MB-10MB photos down to ~150KB-300KB JPG)
  async function compressImageFile(file, maxWidth = 1600, quality = 0.82) {
    if (!file || !file.type.startsWith('image/')) return file;
    if (file.size < 300 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png')) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  }

  // Thumbnail / Featured Image handler
  const thumbnailBtn = container.querySelector('#cms-btn-select-thumbnail');
  const thumbnailInput = container.querySelector('#cms-file-thumbnail');
  const thumbnailPreview = container.querySelector('#cms-thumbnail-preview');
  const thumbnailPlaceholder = container.querySelector('#cms-thumbnail-placeholder');
  const removeThumbnailBtn = container.querySelector('#cms-btn-remove-thumbnail');

  thumbnailBtn.addEventListener('click', () => {
    thumbnailInput.click();
  });

  thumbnailInput.addEventListener('change', async () => {
    const file = thumbnailInput.files[0];
    if (file) {
      try {
        showToast('Đang tối ưu & nén ảnh đại diện...', 'info');
        const compressed = await compressImageFile(file);
        const formData = new FormData();
        formData.append('upload', compressed);

        showToast('Đang tải ảnh đại diện lên máy chủ...', 'info');
        const res = await API().post('/blogs/upload', formData);
        const url = res.url || res.data?.url || res.data;
        if (url) {
          featuredImageUrl = url;
          thumbnailPreview.src = url;
          thumbnailPreview.style.display = 'block';
          thumbnailPlaceholder.style.display = 'none';
          removeThumbnailBtn.style.display = 'block';
          showToast('Đã tải lên ảnh đại diện bài viết!', 'success');
        } else {
          showToast('Không lấy được URL ảnh tải lên.', 'error');
        }
      } catch (err) {
        console.error('Error uploading thumbnail:', err);
        showToast(`Lỗi tải ảnh đại diện: ${err.message}`, 'error');
      } finally {
        thumbnailInput.value = '';
      }
    }
  });

  removeThumbnailBtn.addEventListener('click', () => {
    featuredImageUrl = '';
    thumbnailPreview.removeAttribute('src');
    thumbnailPreview.style.display = 'none';
    thumbnailPlaceholder.style.display = 'block';
    removeThumbnailBtn.style.display = 'none';
    showToast('Đã gỡ ảnh đại diện bài viết.', 'success');
  });

  // Select/insert image handler (for inserting images inside the content editor)
  const imgBtn = container.querySelector('#cms-btn-select-image');
  const fileInput = container.querySelector('#cms-file-image');
  
  imgBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (file) {
      try {
        showToast('Đang tối ưu & nén ảnh nội dung...', 'info');
        const compressed = await compressImageFile(file);
        const formData = new FormData();
        formData.append('upload', compressed);

        showToast('Đang tải ảnh nội dung lên máy chủ...', 'info');
        const res = await API().post('/blogs/upload', formData);
        const url = res.url || res.data?.url || res.data;
        if (url) {
          if (window.CKEDITOR && window.CKEDITOR.instances['blog-content']) {
            const imgHtml = `<img src="${url}" alt="${esc(file.name)}" style="max-width:100%; height:auto;" />`;
            window.CKEDITOR.instances['blog-content'].insertHtml(imgHtml);
            showToast('Đã tải lên và chèn ảnh vào nội dung bài viết!', 'success');
          } else {
            showToast('Lỗi: Editor chưa sẵn sàng.', 'error');
          }
        } else {
          showToast('Không lấy được URL ảnh tải lên.', 'error');
        }
      } catch (err) {
        console.error('Error uploading content image:', err);
        showToast(`Lỗi tải ảnh nội dung: ${err.message}`, 'error');
      } finally {
        fileInput.value = '';
      }
    }
  });

  // Select/insert document handler (always parse and load content)
  const fileBtn = container.querySelector('#cms-btn-select-file');
  const docInput = container.querySelector('#cms-file-doc');
  
  fileBtn.addEventListener('click', () => {
    docInput.click();
  });
  
  docInput.addEventListener('change', () => {
    const file = docInput.files[0];
    if (file) {
      const maxSizeBytes = 50 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        showToast('Lỗi: File vượt quá dung lượng cho phép (tối đa 50MB).', 'error');
        docInput.value = '';
        return;
      }
      
      showToast('Đang tải file lên server...', 'info');
      ensureImportLibraries(async () => {
        try {
          // Upload file to server first to keep the original file URL
          const formData = new FormData();
          formData.append('upload', file);
          const uploadRes = await API().post('/blogs/upload', formData);
          const fileUrl = uploadRes.data?.url || uploadRes.url;
          
          if (!fileUrl) {
            throw new Error('Không nhận được URL file từ server.');
          }

          const ext = file.name.split('.').pop().toLowerCase();
          let htmlContent = '';

          if (ext === 'pdf') {
            // PDF: Embed natively inside an iframe to preserve exact layout and formatting, and provide a view/download link
            htmlContent = `
              <div class="cms-original-file-box" style="margin-bottom: 20px; padding: 15px; background: rgba(168, 85, 247, 0.1); border: 1px dashed #a855f7; border-radius: 8px; text-align: center;">
                  <span style="font-size: 1.2rem; margin-right: 10px;">📄</span>
                  <strong>Bài viết đính kèm file gốc:</strong> 
                  <a href="${fileUrl}" target="_blank" style="color: #c084fc; text-decoration: underline; font-weight: bold; margin-left: 5px;">Xem/Tải file gốc (PDF)</a>
              </div>
              <iframe src="${fileUrl}" width="100%" height="800px" style="border: none; border-radius: 8px; background: #fff; margin-top: 15px;"></iframe>
            `;
          } else {
            // Word, Excel, CSV: Parse content for editor and prepend a download link to original file
            showToast('Đang trích xuất nội dung file...', 'info');
            const parsedHtml = await parseFileToHtml(file);
            htmlContent = `
              <div class="cms-original-file-box" style="margin-bottom: 20px; padding: 15px; background: rgba(168, 85, 247, 0.1); border: 1px dashed #a855f7; border-radius: 8px; text-align: center;">
                  <span style="font-size: 1.2rem; margin-right: 10px;">📄</span>
                  <strong>Bài viết đính kèm file gốc:</strong> 
                  <a href="${fileUrl}" target="_blank" style="color: #c084fc; text-decoration: underline; font-weight: bold; margin-left: 5px;">Tải file gốc (${esc(file.name)})</a>
              </div>
              ${parsedHtml}
            `;
          }

          if (window.CKEDITOR && window.CKEDITOR.instances['blog-content']) {
            window.CKEDITOR.instances['blog-content'].setData(htmlContent);
            hasImportedFile = true;
            showToast(`Đã nhập nội dung từ file "${file.name}" thành công!`, 'success');
          } else {
            showToast('Lỗi: Editor chưa sẵn sàng.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast(`Lỗi xử lý file: ${err.message}`, 'error');
        }
        docInput.value = '';
      });
    }
  });

  // Load and initialize CKEditor
  ensureCKEditor(() => {
    if (!document.getElementById('blog-content')) return;
    if (window.CKEDITOR && window.CKEDITOR.config) {
      window.CKEDITOR.config.versionCheck = false;
    }
    window.CKEDITOR.replace('blog-content', {
      height: 480,
      versionCheck: false,
      removePlugins: 'exportpdf'
    });
  });

  // Submit form handler
  container.querySelector('#create-blog-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = container.querySelector('#blog-title').value;
    const categoryId = parseInt(container.querySelector('#blog-category').value, 10);

    if (!title || !title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết.', 'error');
      return;
    }

    if (!categoryId || isNaN(categoryId)) {
      showToast('Vui lòng chọn thể loại bài viết.', 'error');
      return;
    }

    const tierValue = container.querySelector('#blog-tier').value;
    const visibility = tierValue === 'STANDARD' ? 'PUBLIC' : 'PREMIUM';
    const minTierAccess = tierValue;

    let content = window.CKEDITOR && window.CKEDITOR.instances['blog-content']
      ? window.CKEDITOR.instances['blog-content'].getData()
      : container.querySelector('#blog-content').value;

    if (!content.trim()) {
      showToast('Nội dung bài viết không được để trống.', 'error');
      return;
    }

    if (featuredImageUrl) {
      content = `<img class="cms-featured-image" src="${featuredImageUrl}" style="display:none;" />` + content;
    }

    // Auto excerpt - clean HTML tags & decode entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content || '';
    let plainText = tempDiv.textContent || tempDiv.innerText || content.replace(/<[^>]*>/g, ' ');
    const txtArea = document.createElement('textarea');
    txtArea.innerHTML = plainText;
    plainText = txtArea.value;
    txtArea.innerHTML = plainText;
    plainText = txtArea.value.trim().replace(/\s+/g, ' ');
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // Auto slug
    let slug = blogToEdit?.slug || '';
    if (!slug || title !== blogToEdit?.title) {
      slug = title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      // Add short timestamp suffix to ensure uniqueness
      if (!isEdit) {
        slug += '-' + Date.now().toString(36);
      }
    }

    const isActive = container.querySelector('#blog-status').checked;
    const targetStatus = isActive ? 'PUBLISHED' : 'DRAFT';

    try {
      if (isEdit) {
        await API().patch(`/blogs/${blogToEdit.id}`, {
          title,
          slug,
          categoryId,
          visibility,
          minTierAccess,
          excerpt,
          content
        });

        if (blogToEdit.status !== targetStatus) {
          try {
            await API().patch(`/blogs/${blogToEdit.id}/status`, { status: targetStatus });
          } catch (patchErr) {
            console.warn('Status update warning:', patchErr);
          }
        }
        showToast('Đã cập nhật bài viết thành công!', 'success');
      } else {
        const res = await API().post('/blogs', {
          title,
          slug,
          categoryId,
          visibility,
          minTierAccess,
          excerpt,
          content
        });

        const savedBlog = res?.data || res;
        const blogId = savedBlog?.id || savedBlog?.data?.id;

        if (blogId && isActive) {
          try {
            await API().patch(`/blogs/${blogId}/status`, { status: targetStatus });
          } catch (statusErr) {
            console.warn('Status patch notice:', statusErr);
          }
        }
        showToast('Đã tạo bài viết mới thành công!', 'success');
      }

      // Cleanup and go back
      if (window.CKEDITOR && window.CKEDITOR.instances['blog-content']) {
        window.CKEDITOR.instances['blog-content'].destroy();
      }
      document.body.style.overflow = '';
      isCreating = false;
      editingBlog = null;
      const mod = defaultExport();
      mod.render(container);
    } catch (err) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  });
}

function renderReports(contentEl, mainContainer) {
  let reportsTable;

  reportsTable = new AdminTable({
    container: contentEl,
    title: '📄 Quản lý Báo cáo Phân tích Doanh nghiệp & Thị trường',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã CP, tiêu đề, nguồn...',
    columns: ['ID', 'Tiêu đề / Mã CP', 'Loại BCPT', 'Nguồn', 'Ngôn ngữ', 'Trạng thái', 'Gói hội viên', 'Kích thước', 'Ngày phát hành', 'Thao tác'],
    toolbarExtra: () => `
      <button type="button" class="admin-btn admin-btn-primary" id="btn-create-report" style="background: linear-gradient(135deg, #a855f7, #7e22ce); border: none; color: #fff; font-weight: bold; padding: 6px 14px; border-radius: 6px; cursor: pointer;">
        ➕ Thêm Báo Cáo Mới
      </button>
    `,
    fetchData: async (page, filters) => {
      const qs = API().toQuery({ page, limit: 15, search: filters?.search || '' });
      const res = await API().get(EP().ADMIN_REPORTS + qs);
      return res;
    },
    renderRow: (r) => {
      const isFintop = (r.source || '').toUpperCase() === 'FINTOP';
      const sourceBadgeHtml = isFintop
        ? `<span class="admin-badge" style="background: rgba(217, 70, 239, 0.2); color: #d946ef; font-weight: 800;">FINTOP</span>`
        : `<span class="admin-badge" style="background: rgba(255, 255, 255, 0.1); color: #e2e8f0; font-weight: 800;">${esc(r.source || 'FINTOP')}</span>`;

      return `
        <tr>
          <td>${r.id}</td>
          <td><strong style="color: #f43f5e; font-size: 0.95rem;">${esc(r.title)}</strong></td>
          <td style="font-size:0.78rem;">${esc(r.reportType || 'MARKET_SUMMARY')}</td>
          <td>${sourceBadgeHtml}</td>
          <td style="font-size:0.8rem; color:#cbd5e1;">${esc(r.language || 'Tiếng Việt')}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${tierBadge(r.minTierAccess)}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${r.fileSize ? Math.round(r.fileSize / 1024) + ' KB' : '—'}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(r.publishedAt || r.createdAt)}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="admin-btn admin-btn-sm admin-btn-secondary" data-action="edit-report" data-id="${r.id}" style="padding: 3px 8px; font-size: 0.75rem;">✏️ Sửa</button>
              <button type="button" class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete-report" data-id="${r.id}" style="padding: 3px 8px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">🗑️ Xóa</button>
            </div>
          </td>
        </tr>
      `;
    },
    onRowAction: async (action, id) => {
      const reportId = parseInt(id, 10);
      if (action === 'edit-report') {
        try {
          const res = await API().get(EP().ADMIN_REPORTS + `?limit=100`);
          const list = res?.data || res?.data?.data || [];
          const target = list.find(r => r.id === reportId);
          renderReportFormModal(mainContainer, target || { id: reportId }, () => reportsTable.refresh());
        } catch (err) {
          showToast(`Lỗi tải chi tiết báo cáo: ${err.message}`, 'error');
        }
      } else if (action === 'delete-report') {
        if (confirm(`Bạn có chắc chắn muốn xóa báo cáo ID #${reportId}?`)) {
          try {
            await API().delete(`/admin/reports/${reportId}`);
            showToast('Đã xóa báo cáo thành công!', 'success');
            reportsTable.refresh();
          } catch (err) {
            showToast(`Lỗi xóa báo cáo: ${err.message}`, 'error');
          }
        }
      }
    }
  });

  setTimeout(() => {
    const addBtn = contentEl.querySelector('#btn-create-report');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        renderReportFormModal(mainContainer, null, () => reportsTable.refresh());
      });
    }
  }, 100);
}

function renderReportFormModal(container, reportToEdit = null, onSaved = null) {
  const isEdit = !!(reportToEdit && reportToEdit.title);
  document.body.style.overflow = 'hidden';

  const overlay = document.createElement('div');
  overlay.className = 'cms-edit-overlay';
  overlay.style.zIndex = '9999';

  const pubDateValue = reportToEdit?.publishedAt 
    ? new Date(reportToEdit.publishedAt).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  overlay.innerHTML = `
    <div class="cms-edit-header">
      <h2 class="cms-edit-title">${isEdit ? 'Cập nhật báo cáo phân tích' : 'Thêm báo cáo mới'}</h2>
      <button type="button" class="cms-edit-close-btn" id="report-modal-close-x">✕</button>
    </div>
    
    <form id="report-form" class="cms-edit-form">
      <div class="cms-edit-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left Section -->
        <div>
          <div class="cms-form-group">
            <label class="cms-edit-label">Tiêu đề / Mã cổ phiếu / Nội dung BCPT <span class="cms-required">*</span></label>
            <input type="text" id="report-title" class="cms-edit-input" placeholder="Ví dụ: QNS, FPT, SAB, Báo cáo Vĩ mô Q2..." value="${esc(reportToEdit?.title || '')}" required>
          </div>

          <div class="cms-form-group">
            <label class="cms-edit-label">Nguồn phát hành <span class="cms-required">*</span></label>
            <input type="text" id="report-source" class="cms-edit-input" placeholder="FINTOP, FPTS, Mirae, PHS, KBSV, VNDIRECT..." value="${esc(reportToEdit?.source || 'FINTOP')}" required>
          </div>

          <div class="cms-form-group">
            <label class="cms-edit-label">Ngôn ngữ</label>
            <select id="report-language" class="cms-edit-select">
              <option value="Tiếng Việt" ${(reportToEdit?.language || 'Tiếng Việt') === 'Tiếng Việt' ? 'selected' : ''}>Tiếng Việt</option>
              <option value="Tiếng Anh" ${reportToEdit?.language === 'Tiếng Anh' ? 'selected' : ''}>Tiếng Anh</option>
            </select>
          </div>

          <div class="cms-form-group">
            <label class="cms-edit-label">Loại báo cáo</label>
            <select id="report-type" class="cms-edit-select">
              <option value="MARKET_SUMMARY" ${(reportToEdit?.reportType || 'MARKET_SUMMARY') === 'MARKET_SUMMARY' ? 'selected' : ''}>Báo cáo Phân tích Doanh nghiệp / Thị trường</option>
              <option value="VIP_RECOMMENDATION" ${reportToEdit?.reportType === 'VIP_RECOMMENDATION' ? 'selected' : ''}>Báo cáo Khuyến nghị VIP</option>
              <option value="MACRO_ANALYSIS" ${reportToEdit?.reportType === 'MACRO_ANALYSIS' ? 'selected' : ''}>Báo cáo Phân tích Vĩ mô</option>
            </select>
          </div>
        </div>

        <!-- Right Section -->
        <div>
          <div class="cms-form-group">
            <label class="cms-edit-label">Gói Hội viên yêu cầu</label>
            <select id="report-tier" class="cms-edit-select">
              <option value="STANDARD" ${(reportToEdit?.minTierAccess || 'STANDARD') === 'STANDARD' ? 'selected' : ''}>Standard (Công khai)</option>
              <option value="SILVER" ${reportToEdit?.minTierAccess === 'SILVER' ? 'selected' : ''}>PRO (Hội viên Pro)</option>
              <option value="GOLD" ${reportToEdit?.minTierAccess === 'GOLD' ? 'selected' : ''}>VIP (Hội viên VIP)</option>
              <option value="DIAMOND" ${reportToEdit?.minTierAccess === 'DIAMOND' ? 'selected' : ''}>Diamond (Hội viên Diamond)</option>
            </select>
          </div>

          <div class="cms-form-group">
            <label class="cms-edit-label">Ngày phát hành</label>
            <input type="date" id="report-date" class="cms-edit-input" value="${pubDateValue}">
          </div>

          <div class="cms-form-group">
            <label class="cms-edit-label">Link tài liệu / File đính kèm</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="report-file-url" class="cms-edit-input" placeholder="https://... hoặc tải file PDF/Doc" value="${esc(reportToEdit?.fileUrl || '')}" style="flex: 1;">
              <button type="button" class="cms-btn-image" id="report-btn-upload-file" style="margin-bottom:0; font-size: 0.85rem; padding: 6px 12px; white-space: nowrap;">📁 Upload</button>
            </div>
            <input type="file" id="report-file-input" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt">
          </div>

          <div class="cms-form-group" style="margin-top: 1rem;">
            <label class="cms-edit-label">Trạng thái xuất bản</label>
            <div class="cms-status-checkbox-wrapper">
              <input type="checkbox" id="report-status" class="cms-checkbox" ${(reportToEdit ? reportToEdit.status === 'PUBLISHED' : true) ? 'checked' : ''}>
              <label for="report-status" class="cms-checkbox-label">Xuất bản ngay (Hoạt động)</label>
            </div>
          </div>
        </div>
      </div>

      <div class="cms-edit-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 12px;">
        <button type="button" class="cms-btn-close" id="report-modal-cancel">Hủy</button>
        <button type="submit" class="cms-btn-submit">${isEdit ? 'Cập nhật' : 'Tạo mới'}</button>
      </div>
    </form>
  `;

  container.appendChild(overlay);

  const closeModal = () => {
    document.body.style.overflow = '';
    overlay.remove();
  };

  overlay.querySelector('#report-modal-close-x').addEventListener('click', closeModal);
  overlay.querySelector('#report-modal-cancel').addEventListener('click', closeModal);

  const uploadBtn = overlay.querySelector('#report-btn-upload-file');
  const fileInput = overlay.querySelector('#report-file-input');
  const fileUrlInput = overlay.querySelector('#report-file-url');

  let uploadedFileSize = reportToEdit?.fileSize || 0;

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (file) {
      try {
        uploadedFileSize = file.size;
        showToast('Đang tải file báo cáo lên server...', 'info');
        const formData = new FormData();
        formData.append('upload', file);
        const res = await API().post('/blogs/upload', formData);
        const url = res.url || res.data?.url || res.data;
        if (url) {
          fileUrlInput.value = url;
          showToast('Đã tải file báo cáo thành công!', 'success');
        } else {
          showToast('Không nhận được URL file.', 'error');
        }
      } catch (err) {
        showToast(`Lỗi upload file: ${err.message}`, 'error');
      } finally {
        fileInput.value = '';
      }
    }
  });

  overlay.querySelector('#report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = overlay.querySelector('#report-title').value.trim();
    const source = overlay.querySelector('#report-source').value.trim() || 'FINTOP';
    const language = overlay.querySelector('#report-language').value;
    const reportType = overlay.querySelector('#report-type').value;
    const minTierAccess = overlay.querySelector('#report-tier').value;
    const publishedAtStr = overlay.querySelector('#report-date').value;
    const fileUrl = overlay.querySelector('#report-file-url').value.trim() || '#';
    const isActive = overlay.querySelector('#report-status').checked;

    if (!title) {
      showToast('Vui lòng nhập tiêu đề / Mã cổ phiếu.', 'error');
      return;
    }

    const payload = {
      title,
      source,
      language,
      reportType,
      minTierAccess,
      publishedAt: publishedAtStr ? new Date(publishedAtStr).toISOString() : new Date().toISOString(),
      fileUrl,
      fileSize: uploadedFileSize,
      status: isActive ? 'PUBLISHED' : 'DRAFT',
    };

    try {
      if (isEdit) {
        await API().patch(`/admin/reports/${reportToEdit.id}`, payload);
        showToast('Đã cập nhật báo cáo thành công!', 'success');
      } else {
        await API().post('/admin/reports', payload);
        showToast('Đã tạo mới báo cáo thành công!', 'success');
      }
      closeModal();
      if (typeof onSaved === 'function') onSaved();
    } catch (err) {
      showToast(`Lỗi lưu báo cáo: ${err.message}`, 'error');
    }
  });
}

function defaultExport() {
  return {
    id: 'cms',
    label: 'Quản trị bài viết',
    icon: '📅',
    render: async (container) => {
      isCreating = false;
      editingBlog = null;
      await loadCategories();
      container.innerHTML = `
        <div class="admin-tabs">
          <button class="admin-tab ${activeTab === 'blogs' ? 'active' : ''}" data-tab="blogs">📝 Bài viết</button>
          <button class="admin-tab ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">📄 Báo cáo</button>
        </div>
        <div id="cms-content"></div>
      `;

      container.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          activeTab = tab.dataset.tab;
          container.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
          renderTab(container.querySelector('#cms-content'), container);
        });
      });

      renderTab(container.querySelector('#cms-content'), container);
    }
  };
}
