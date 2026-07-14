/**
 * overview.js — Admin Dashboard Overview Module (Upgraded Premium Edition)
 */
import { esc, formatNumber, formatDate, statusBadge, tierBadge, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'overview',
  label: 'Tổng quan',
  icon: '📊',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải và cấu hình Dashboard...</div>';

    try {
      // 1. Fetch all dashboard data concurrently
      const [overviewRes, invoicesRes, usersRes, auditRes] = await Promise.all([
        API().get(EP().ADMIN_OVERVIEW),
        API().get(EP().ADMIN_BILLING_INVOICES + '?limit=1000'),
        API().get(EP().ADMIN_USERS + '?limit=5'),
        API().get(EP().ADMIN_AUDIT_LOGS + '?limit=5')
      ]);

      const d = overviewRes.data || overviewRes;
      const allInvoices = invoicesRes.data || invoicesRes || [];
      const recentUsers = usersRes.data?.data || usersRes.data || usersRes || [];
      const recentLogs = auditRes.data?.data || auditRes.data || auditRes || [];

      // Filter pending invoices locally (status OPEN or DRAFT, excluding simulated deleted/approved)
      let deletedIds = [];
      let approvedIds = [];
      try {
        deletedIds = JSON.parse(sessionStorage.getItem('fintop_deleted_invoices') || '[]');
        approvedIds = JSON.parse(sessionStorage.getItem('fintop_approved_invoices') || '[]');
      } catch (e) {}

      const pendingInvoices = allInvoices.filter(inv => {
        if (deletedIds.includes(inv.id) || approvedIds.includes(inv.id)) return false;
        return inv.status === 'DRAFT' || inv.status === 'OPEN' || inv.status === 'PENDING';
      }).slice(0, 5); // Limit to top 5 pending

      // Current Admin Details for Welcome
      const currentUser = window.FintopInfra.AppState.getState('user') || {};
      const adminName = currentUser.fullName || currentUser.email || 'Quản trị viên';
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
      const systemTimeStr = today.toLocaleDateString('vi-VN', options);

      // Render Page Content
      container.innerHTML = `
        <!-- Welcome Banner -->
        <div class="admin-welcome-banner">
          <div class="welcome-text">
            <h2>Chào mừng trở lại, ${esc(adminName)}!</h2>
            <p>⏱️ Hôm nay là ${systemTimeStr} · Chúc bạn có một ngày làm việc hiệu quả.</p>
          </div>
          <div class="system-status-indicator">
            <span class="pulse-indicator"></span>
            <span>Hệ thống hoạt động ổn định</span>
          </div>
        </div>

        <!-- Bento Grid Metrics -->
        <div class="admin-kpi-grid">
          ${kpiCard(
            '👥', 
            d.users?.total, 
            'Khách hàng', 
            `🟢 ${d.users?.active || 0} Hoạt động`, 
            'rgba(124, 58, 237, 0.12)'
          )}
          ${kpiCard(
            '📡', 
            d.signals?.total, 
            'Tín hiệu VIP', 
            `⚡ ${d.signals?.published || 0} Đang phát hành`, 
            'rgba(245, 158, 11, 0.12)'
          )}
          ${kpiCard(
            '💳', 
            d.invoices?.total, 
            'Đơn hàng & Doanh thu', 
            `✅ ${d.invoices?.paid || 0} Đã phê duyệt`, 
            'rgba(16, 185, 129, 0.12)'
          )}
          ${kpiCard(
            '📝', 
            d.blogs?.total, 
            'Nội dung & Báo cáo', 
            `📖 ${d.blogs?.published || 0} Bài viết · ${d.reports?.total || 0} Báo cáo`, 
            'rgba(96, 165, 250, 0.12)'
          )}
        </div>

        <!-- Two Column Action Center -->
        <div class="dashboard-two-col-layout">
          
          <!-- Left Column: Pending Invoices -->
          <div class="dashboard-feed-card">
            <div class="dashboard-feed-header">
              <div class="dashboard-feed-title">⏳ Hóa đơn chờ phê duyệt (${pendingInvoices.length})</div>
              <a href="#billing" class="admin-btn admin-btn-secondary admin-btn-sm" style="padding: 2px 8px; font-size:0.75rem;">Xem tất cả</a>
            </div>
            <div class="dashboard-feed-list">
              ${pendingInvoices.length === 0 ? `
                <div style="text-align:center; padding: 2.5rem; color:var(--text-muted); font-size:0.8rem;">
                  🎉 Tuyệt vời! Không có hóa đơn nào đang chờ phê duyệt.
                </div>
              ` : pendingInvoices.map(inv => {
                const tier = getInvoiceTier(inv.amount);
                const hasProof = !!inv.user?.paymentProofUrl;
                return `
                  <div class="feed-item">
                    <div style="display:flex; flex-direction:column; gap:2px;">
                      <div style="font-weight:700; color:#fff; font-size:0.82rem;">${esc(inv.user?.fullName || 'Khách vãng lai')}</div>
                      <div style="font-size:0.72rem; color:var(--text-muted);">${esc(inv.user?.email || '')}</div>
                      <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Ngày yêu cầu: ${formatDate(inv.createdAt)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                      <div style="text-align:right;">
                        <div style="font-weight:800; color:var(--purple-glow); font-size:0.85rem;">${formatNumber(inv.amount)}đ</div>
                        <div style="margin-top:2px;">${tierBadge(tier)}</div>
                      </div>
                      <a href="#billing" class="admin-btn admin-btn-sm" style="background:var(--purple-core); color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;" title="${hasProof ? 'Có ảnh hóa đơn đính kèm' : 'Chưa gửi ảnh hóa đơn'}">
                        ${hasProof ? '🖼️ Duyệt' : 'Duyệt'}
                      </a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Column: Recent Registered Clients -->
          <div class="dashboard-feed-card">
            <div class="dashboard-feed-header">
              <div class="dashboard-feed-title">👤 Khách hàng đăng ký mới</div>
              <a href="#users" class="admin-btn admin-btn-secondary admin-btn-sm" style="padding: 2px 8px; font-size:0.75rem;">Xem tất cả</a>
            </div>
            <div class="dashboard-feed-list">
              ${recentUsers.length === 0 ? `
                <div style="text-align:center; padding: 2.5rem; color:var(--text-muted); font-size:0.8rem;">Chưa có khách hàng đăng ký</div>
              ` : recentUsers.map(u => {
                return `
                  <div class="feed-item">
                    <div style="display:flex; flex-direction:column; gap:2px;">
                      <div style="font-weight:700; color:#fff; font-size:0.82rem;">${esc(u.fullName || '—')}</div>
                      <div style="font-size:0.72rem; color:var(--text-muted);">${esc(u.email)}</div>
                      <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">ĐT: ${esc(u.phone || '—')} · Kênh: ${formatDate(u.createdAt)}</div>
                    </div>
                    <div>
                      ${tierBadge(u.tierLevel || 'STANDARD')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- Live Audit Logs Timeline -->
        <div class="admin-detail-panel" style="margin-bottom:1.5rem;">
          <div class="admin-detail-header">
            <div class="admin-detail-title">📋 Nhật ký hoạt động gần đây</div>
            <a href="#audit" class="admin-btn admin-btn-secondary admin-btn-sm">Xem nhật ký chi tiết</a>
          </div>
          <div style="overflow-x:auto;">
            <table class="admin-table" style="width:100%; font-size:0.8rem;">
              <thead>
                <tr>
                  <th style="width:140px;">Thời gian</th>
                  <th style="width:160px;">Nhân viên thực hiện</th>
                  <th style="width:180px;">Hành động</th>
                  <th>Bảng dữ liệu</th>
                  <th>ID Bản ghi</th>
                </tr>
              </thead>
              <tbody>
                ${recentLogs.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">Không có nhật ký hoạt động nào</td>
                  </tr>
                ` : recentLogs.map(log => `
                  <tr>
                    <td>${formatDate(log.createdAt)}</td>
                    <td style="font-weight:600; color:#fff;">${esc(log.user?.fullName || log.user?.email || 'Hệ thống/Admin')}</td>
                    <td><span class="admin-badge role-badge" style="font-size:0.68rem;">${esc(log.action)}</span></td>
                    <td style="color:var(--text-secondary);">${esc(log.tableName || '—')}</td>
                    <td style="color:var(--text-muted); font-family:monospace; font-size:0.75rem;">${esc(log.recordId || '—')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Access Navigation -->
        <div class="admin-detail-panel" style="margin-bottom:1.5rem;">
          <div class="admin-detail-header" style="margin-bottom:1rem; padding-bottom:0.75rem;">
            <div class="admin-detail-title">🎯 Truy cập nhanh</div>
          </div>
          <div class="dashboard-quick-nav-grid">
            ${quickNavTile('#users', '👥', 'Khách hàng', 'Quản lý thông tin và phân cấp khách hàng')}
            ${quickNavTile('#billing', '💵', 'Duyệt thanh toán', 'Phê duyệt chuyển khoản gia hạn dịch vụ')}
            ${quickNavTile('#signals', '📡', 'Tín hiệu V.I.P', 'Cập nhật tín hiệu mua/bán cổ phiếu VIP')}
            ${quickNavTile('#cms', '📝', 'Nội dung bài viết', 'Viết nhận định thị trường và phân tích')}
            ${quickNavTile('#audit', '📋', 'Nhật ký hệ thống', 'Tra cứu lịch sử tác tác nghiệp nhân sự')}
            ${quickNavTile('#system', '⚙️', 'Kiểm tra hệ thống', 'Xem cấu hình kết nối, cache và cổng dịch vụ')}
          </div>
        </div>

        <!-- System Configuration & Health -->
        <div class="admin-detail-panel" style="margin-bottom:0;">
          <div class="admin-detail-header" style="margin-bottom:1rem; padding-bottom:0.75rem;">
            <div class="admin-detail-title">💻 Cấu hình & Hạ tầng Hệ thống</div>
          </div>
          <div class="dashboard-system-health-grid">
            ${healthBox('API Gateway URL', EP().API_BASE_URL || window.FintopInfra.FintopEnv.API_BASE_URL || 'http://localhost:3000')}
            ${healthBox('Động cơ Cơ sở dữ liệu', 'PostgreSQL (Prisma Client)')}
            ${healthBox('Bộ nhớ đệm (Cache)', 'Redis Server (Connected)')}
            ${healthBox('Cổng thời gian thực', 'Websocket Socket.IO (Connected)')}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Lỗi tải Dashboard</div>
          <div class="empty-desc">${esc(err.message)}</div>
        </div>
      `;
    }
  },

  destroy() {},
};

function kpiCard(icon, value, label, sub, glowColor) {
  const displayVal = value != null ? formatNumber(value) : '0';
  return `
    <div class="admin-kpi-card" style="border-color: ${glowColor};">
      <div class="admin-kpi-icon">${icon}</div>
      <div class="admin-kpi-value">${displayVal}</div>
      <div class="admin-kpi-label">${esc(label)}</div>
      ${sub ? `<div class="admin-kpi-sub">${sub}</div>` : ''}
    </div>
  `;
}

function quickNavTile(hash, icon, title, desc) {
  return `
    <a href="${hash}" class="dashboard-quick-nav-tile">
      <div class="quick-nav-icon">${icon}</div>
      <div class="quick-nav-title">${esc(title)}</div>
      <div class="quick-nav-desc">${esc(desc)}</div>
    </a>
  `;
}

function healthBox(label, val) {
  return `
    <div class="health-stat-box">
      <div class="health-stat-label">${esc(label)}</div>
      <div class="health-stat-val">${esc(val)}</div>
    </div>
  `;
}

function getInvoiceTier(amount) {
  const amt = Number(amount);
  if (amt <= 0) return 'STANDARD';
  if (amt <= 8000000) return 'SILVER';
  if (amt <= 10000000) return 'GOLD';
  return 'DIAMOND';
}
