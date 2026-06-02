/**
 * audit.js — Audit Log Viewer Module
 */
import { AdminTable, esc, formatDate } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'audit',
  label: 'Nhật ký',
  icon: '📋',

  async render(container) {
    new AdminTable({
      container,
      title: 'Nhật ký kiểm toán hệ thống',
      columns: ['ID', 'Hành động', 'Nguồn', 'Bảng', 'Record ID', 'Người thực hiện', 'IP', 'Thời gian'],
      searchable: true,
      searchPlaceholder: 'Lọc theo hành động...',
      fetchData: async (page, filters) => {
        const qs = API().toQuery({ page, limit: 20, action: filters.search || undefined });
        const res = await API().get(EP().ADMIN_AUDIT_LOGS + qs);
        return res;
      },
      renderRow: (l) => `
        <tr>
          <td style="font-size:0.7rem;color:var(--text-muted);max-width:80px;overflow:hidden;text-overflow:ellipsis;">${esc(l.id)}</td>
          <td><strong style="font-size:0.8rem;color:var(--purple-glow);">${esc(l.action)}</strong></td>
          <td style="font-size:0.78rem;">${esc(l.source)}</td>
          <td style="font-family:monospace;font-size:0.75rem;color:var(--text-secondary);">${esc(l.tableName)}</td>
          <td style="font-size:0.75rem;color:var(--text-muted);">${esc(l.recordId) || '—'}</td>
          <td>${esc(l.user?.fullName) || '<span style="color:var(--text-muted);">System</span>'}<div style="font-size:0.68rem;color:var(--text-muted);">${esc(l.user?.email) || ''}</div></td>
          <td style="font-family:monospace;font-size:0.73rem;color:var(--text-muted);">${esc(l.ipAddress) || '—'}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(l.createdAt)}</td>
        </tr>
      `,
    });
  },

  destroy() {},
};
