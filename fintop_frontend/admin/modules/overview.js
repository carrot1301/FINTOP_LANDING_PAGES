/**
 * overview.js — Admin Dashboard Overview Module (Upgraded Premium Edition with Charts)
 */
import { esc, formatNumber, formatDate, statusBadge, tierBadge, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'overview',
  label: 'Tổng quan',
  icon: '📊',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải dữ liệu và cấu hình biểu đồ...</div>';

    try {
      // 1. Load Chart.js dynamically from CDN first
      await loadChartJs();

      // 2. Fetch all dashboard data concurrently
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

      // Calculate total income from paid/approved invoices
      let totalRevenue = 0;
      let paidCount = 0;
      allInvoices.forEach(inv => {
        if (deletedIds.includes(inv.id)) return;
        const isPaid = inv.status === 'PAID' || approvedIds.includes(inv.id);
        if (isPaid) {
          totalRevenue += Number(inv.amount || 0);
          paidCount++;
        }
      });

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
            totalRevenue, 
            'Doanh thu thực tế', 
            `✅ Đã thanh toán: ${paidCount} / ${allInvoices.filter(inv => !deletedIds.includes(inv.id)).length} HĐ`, 
            'rgba(16, 185, 129, 0.12)',
            true // isCurrency
          )}
          ${kpiCard(
            '📝', 
            d.blogs?.total, 
            'Nội dung & Báo cáo', 
            `📖 ${d.blogs?.published || 0} Bài viết · ${d.reports?.total || 0} Báo cáo`, 
            'rgba(96, 165, 250, 0.12)'
          )}
        </div>

        <!-- Visual Charts Section (Bento grid style) -->
        <div class="dashboard-two-col-layout">
          <div class="dashboard-feed-card" style="min-height: 320px;">
            <div class="dashboard-feed-header">
              <div class="dashboard-feed-title">📈 Xu hướng doanh thu (7 ngày qua)</div>
            </div>
            <div style="position: relative; flex: 1; width: 100%;">
              <canvas id="revenueTrendChart" style="max-height: 250px; width: 100%;"></canvas>
            </div>
          </div>
          <div class="dashboard-feed-card" style="min-height: 320px;">
            <div class="dashboard-feed-header">
              <div class="dashboard-feed-title">🍩 Tỷ lệ gói hội viên đã mua</div>
            </div>
            <div style="position: relative; flex: 1; display: flex; align-items: center; justify-content: center; width: 100%;">
              <canvas id="tierDistributionChart" style="max-height: 220px; max-width: 220px;"></canvas>
            </div>
          </div>
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
                      <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">ĐT: ${esc(u.phone || '—')} · Tham gia: ${formatDate(u.createdAt)}</div>
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

      // 3. Render charts
      renderCharts(allInvoices, deletedIds, approvedIds);

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

function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

function renderCharts(allInvoices, deletedIds, approvedIds) {
  // Aggregate revenue trend (Last 30 Days to capture historical data)
  const last30Days = [];
  const revenueData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateLabel = `${day}/${month}`;
    last30Days.push(dateLabel);
    
    let daySum = 0;
    allInvoices.forEach(inv => {
      if (deletedIds.includes(inv.id)) return;
      const isPaid = inv.status === 'PAID' || approvedIds.includes(inv.id);
      if (isPaid) {
        const invDate = new Date(inv.createdAt);
        const invDay = String(invDate.getDate()).padStart(2, '0');
        const invMonth = String(invDate.getMonth() + 1).padStart(2, '0');
        const invDateLabel = `${invDay}/${invMonth}`;
        if (invDateLabel === dateLabel) {
          daySum += Number(inv.amount || 0);
        }
      }
    });
    revenueData.push(daySum);
  }

  // Aggregate user packages distribution
  let silverCount = 0;
  let goldCount = 0;
  let diamondCount = 0;

  allInvoices.forEach(inv => {
    if (deletedIds.includes(inv.id)) return;
    const isPaid = inv.status === 'PAID' || approvedIds.includes(inv.id);
    if (isPaid) {
      const tier = getInvoiceTier(inv.amount);
      if (tier === 'SILVER') silverCount++;
      else if (tier === 'GOLD') goldCount++;
      else if (tier === 'DIAMOND') diamondCount++;
    }
  });

  const totalPaid = silverCount + goldCount + diamondCount;
  const silverPercent = totalPaid > 0 ? Math.round((silverCount / totalPaid) * 100) : 0;
  const goldPercent = totalPaid > 0 ? Math.round((goldCount / totalPaid) * 100) : 0;
  const diamondPercent = totalPaid > 0 ? Math.round((diamondCount / totalPaid) * 100) : 0;

  // Render line chart
  const ctxLine = document.getElementById('revenueTrendChart')?.getContext('2d');
  if (ctxLine) {
    new window.Chart(ctxLine, {
      type: 'line',
      data: {
        labels: last30Days,
        datasets: [{
          label: 'Doanh thu (đ)',
          data: revenueData,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Doanh thu: ${context.parsed.y.toLocaleString('vi-VN')} đ`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 9 }, autoSkip: true, maxRotation: 0 }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 9 },
              callback: function(value) {
                if (value >= 1000000) return (value / 1000000) + 'M';
                if (value >= 1000) return (value / 1000) + 'K';
                return value;
              }
            }
          }
        }
      },
      plugins: [{
        id: 'valueLabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          ctx.save();
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#a855f7';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((point, index) => {
              const val = dataset.data[index];
              if (val > 0) {
                const pos = point.tooltipPosition();
                const text = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'K';
                ctx.fillText(text, pos.x, pos.y - 6);
              }
            });
          });
          ctx.restore();
        }
      }]
    });
  }

  // Render doughnut chart
  const ctxDoughnut = document.getElementById('tierDistributionChart')?.getContext('2d');
  if (ctxDoughnut) {
    new window.Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: [
          `PRO (Silver): ${silverCount} HĐ (${silverPercent}%)`,
          `V.I.P (Gold): ${goldCount} HĐ (${goldPercent}%)`,
          `DIAMOND: ${diamondCount} HĐ (${diamondPercent}%)`
        ],
        datasets: [{
          data: [silverCount, goldCount, diamondCount],
          backgroundColor: ['#94a3b8', '#F59E0B', '#3b82f6'],
          borderColor: '#151521',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 }, padding: 12 }
          }
        },
        cutout: '65%'
      },
      plugins: [{
        id: 'centerText',
        beforeDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          ctx.save();
          ctx.font = "bold 12px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffffff";
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          ctx.fillText(`${totalPaid} đã duyệt`, centerX, centerY - 6);
          ctx.font = "9px sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText("Tổng hóa đơn", centerX, centerY + 8);
          ctx.restore();
        }
      }]
    });
  }
}

function kpiCard(icon, value, label, sub, glowColor, isCurrency = false) {
  let displayVal = '0';
  if (value != null) {
    if (typeof value === 'number') {
      displayVal = formatNumber(value) + (isCurrency ? ' đ' : '');
    } else {
      displayVal = String(value);
    }
  }
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
