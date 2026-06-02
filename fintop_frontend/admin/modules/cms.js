/**
 * cms.js — Blog & Report Management Module
 */
import { AdminTable, esc, statusBadge, tierBadge, formatDate } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let activeTab = 'blogs';

export default {
  id: 'cms',
  label: 'Nội dung',
  icon: '📝',

  async render(container) {
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
        renderTab(container.querySelector('#cms-content'));
      });
    });

    renderTab(container.querySelector('#cms-content'));
  },

  destroy() {},
};

function renderTab(contentEl) {
  if (activeTab === 'blogs') renderBlogs(contentEl);
  else renderReports(contentEl);
}

function renderBlogs(contentEl) {
  new AdminTable({
    container: contentEl,
    title: 'Bài viết',
    columns: ['ID', 'Tiêu đề', 'Danh mục', 'Trạng thái', 'Hiển thị', 'Gói', 'Tác giả', 'Ngày'],
    searchable: false,
    filters: {
      status: {
        label: 'trạng thái',
        options: [
          { value: 'DRAFT', label: 'Bản nháp' },
          { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
          { value: 'PUBLISHED', label: 'Đã xuất bản' },
          { value: 'UNPUBLISHED', label: 'Hủy xuất bản' },
        ],
      },
    },
    fetchData: async (page, filters) => {
      const qs = API().toQuery({ page, limit: 15, status: filters.status });
      const res = await API().get(EP().ADMIN_BLOGS + qs);
      return res;
    },
    renderRow: (b) => `
      <tr>
        <td>${b.id}</td>
        <td><strong>${esc(b.title)}</strong><div style="font-size:0.7rem;color:var(--text-muted);">/${esc(b.slug)}</div></td>
        <td style="font-size:0.8rem;">${esc(b.category?.name) || '—'}</td>
        <td>${statusBadge(b.status)}</td>
        <td style="font-size:0.78rem;">${esc(b.visibility)}</td>
        <td>${tierBadge(b.minTierAccess)}</td>
        <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(b.author?.fullName) || '—'}</td>
        <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(b.publishedAt || b.createdAt)}</td>
      </tr>
    `,
  });
}

function renderReports(contentEl) {
  new AdminTable({
    container: contentEl,
    title: 'Báo cáo',
    columns: ['ID', 'Tiêu đề', 'Loại', 'Trạng thái', 'Gói', 'Kích thước', 'Người tải', 'Ngày'],
    searchable: false,
    fetchData: async (page) => {
      const qs = API().toQuery({ page, limit: 15 });
      const res = await API().get(EP().ADMIN_REPORTS + qs);
      return res;
    },
    renderRow: (r) => `
      <tr>
        <td>${r.id}</td>
        <td><strong>${esc(r.title)}</strong></td>
        <td style="font-size:0.78rem;">${esc(r.reportType)}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${tierBadge(r.minTierAccess)}</td>
        <td style="font-size:0.78rem;color:var(--text-muted);">${r.fileSize ? Math.round(r.fileSize / 1024) + ' KB' : '—'}</td>
        <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(r.uploader?.fullName) || '—'}</td>
        <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(r.publishedAt || r.createdAt)}</td>
      </tr>
    `,
  });
}
