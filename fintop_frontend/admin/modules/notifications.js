/**
 * notifications.js — Notification Management & Broadcast Module
 */
import { AdminTable, esc, statusBadge, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let table = null;

export default {
  id: 'notifications',
  label: 'Thông báo',
  icon: '🔔',

  async render(container) {
    container.innerHTML = `
      <div class="admin-detail-panel" id="notif-broadcast-panel">
        <div class="admin-detail-header">
          <div class="admin-detail-title">📢 Gửi thông báo</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="admin-form-group">
            <label class="admin-form-label">Tiêu đề</label>
            <input class="admin-input" id="notif-title" placeholder="Tiêu đề thông báo">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">User IDs (phân cách bằng dấu phẩy)</label>
            <input class="admin-input" id="notif-user-ids" placeholder="1, 2, 3">
          </div>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Nội dung</label>
          <textarea class="admin-textarea" id="notif-content" placeholder="Nội dung thông báo..."></textarea>
        </div>
        <button class="admin-btn admin-btn-primary" id="notif-send-btn">📤 Gửi thông báo</button>
      </div>

      <div id="notif-table-area"></div>
    `;

    // Send handler
    document.getElementById('notif-send-btn')?.addEventListener('click', sendBroadcast);

    // Notification list
    table = new AdminTable({
      container: container.querySelector('#notif-table-area'),
      title: 'Tất cả thông báo',
      columns: ['ID', 'Người dùng', 'Tiêu đề', 'Nội dung', 'Ưu tiên', 'Trạng thái', 'Ngày'],
      searchable: false,
      fetchData: async (page) => {
        const qs = API().toQuery({ page, limit: 15 });
        const res = await API().get(EP().ADMIN_NOTIFICATIONS + qs);
        return res;
      },
      renderRow: (n) => `
        <tr>
          <td style="font-size:0.75rem;color:var(--text-muted);">${esc(n.id)}</td>
          <td>${esc(n.user?.fullName) || '—'}<div style="font-size:0.7rem;color:var(--text-muted);">${esc(n.user?.email)}</div></td>
          <td><strong>${esc(n.title)}</strong></td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.8rem;color:var(--text-secondary);">${esc(n.content)}</td>
          <td style="font-size:0.78rem;">${esc(n.priority)}</td>
          <td>${statusBadge(n.status)}</td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(n.createdAt)}</td>
        </tr>
      `,
    });
  },

  destroy() { table = null; },
};

async function sendBroadcast() {
  const title = document.getElementById('notif-title')?.value?.trim();
  const content = document.getElementById('notif-content')?.value?.trim();
  const userIdsRaw = document.getElementById('notif-user-ids')?.value?.trim();

  if (!title || !content || !userIdsRaw) {
    showToast('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }

  const userIds = userIdsRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (userIds.length === 0) {
    showToast('User IDs không hợp lệ', 'error');
    return;
  }

  // Confirmation gate
  if (!confirm(`Bạn có chắc chắn muốn phát thông báo này đến ${userIds.length} người dùng đã nhập không?`)) {
    return;
  }

  try {
    const res = await API().post(EP().ADMIN_NOTIFICATION_BROADCAST, { title, content, userIds });
    const data = res.data || res;
    showToast(`Đã gửi ${data.sent || 0} thông báo thành công!`);

    // Clear form
    document.getElementById('notif-title').value = '';
    document.getElementById('notif-content').value = '';
    document.getElementById('notif-user-ids').value = '';

    // Refresh table
    if (table) table.refresh();
  } catch (err) {
    showToast(err.message || 'Lỗi gửi thông báo', 'error');
  }
}
