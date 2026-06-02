/**
 * signals.js — VIP Signal Management Module
 */
import { AdminTable, esc, statusBadge, tierBadge, directionBadge, formatDate, formatNumber } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'signals',
  label: 'Tín hiệu VIP',
  icon: '📡',

  async render(container) {
    new AdminTable({
      container,
      title: 'Tín hiệu VIP',
      columns: ['ID', 'Mã CK', 'Hướng', 'Entry', 'Target', 'Cut Loss', 'Trạng thái', 'Gói tối thiểu', 'Tác giả', 'Ngày'],
      searchable: false,
      filters: {
        status: {
          label: 'trạng thái',
          options: [
            { value: 'DRAFT', label: 'Bản nháp' },
            { value: 'PUBLISHED', label: 'Đang phát hành' },
            { value: 'REACHED_TARGET', label: 'Đạt mục tiêu' },
            { value: 'CUT_LOSS', label: 'Cắt lỗ' },
            { value: 'CLOSED', label: 'Đã đóng' },
          ],
        },
      },
      fetchData: async (page, filters) => {
        const qs = API().toQuery({ page, limit: 15, status: filters.status });
        const res = await API().get(EP().ADMIN_SIGNALS + qs);
        return res;
      },
      renderRow: (s) => `
        <tr>
          <td>${s.id}</td>
          <td><strong>${esc(s.symbol)}</strong><div style="font-size:0.7rem;color:var(--text-muted);">${esc(s.companyName)}</div></td>
          <td>${directionBadge(s.direction)}</td>
          <td>${formatNumber(s.entryPrice)}</td>
          <td style="color:#34D399;">${formatNumber(s.targetPrice)}</td>
          <td style="color:#F87171;">${formatNumber(s.cutLossPrice)}</td>
          <td>${statusBadge(s.status)}</td>
          <td>${tierBadge(s.minTierAccess)}</td>
          <td style="font-size:0.78rem;color:var(--text-secondary);">${esc(s.author?.fullName) || '—'}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(s.publishedAt || s.createdAt)}</td>
        </tr>
      `,
    });
  },

  destroy() {},
};
