/**
 * system.js — System Health & Diagnostics Module
 */
import { esc, formatDate, statusBadge } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'system',
  label: 'Hệ thống',
  icon: '⚙️',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang kiểm tra hệ thống...</div>';

    try {
      const [healthRes, readinessRes, livenessRes] = await Promise.allSettled([
        API().get(EP().HEALTH),
        API().get(EP().HEALTH_READINESS),
        API().get(EP().HEALTH_LIVENESS),
      ]);

      const health = healthRes.status === 'fulfilled' ? (healthRes.value.data || healthRes.value) : null;
      const readiness = readinessRes.status === 'fulfilled' ? (readinessRes.value.data || readinessRes.value) : null;
      const liveness = livenessRes.status === 'fulfilled' ? (livenessRes.value.data || livenessRes.value) : null;

      container.innerHTML = `
        <div class="admin-kpi-grid">
          ${healthCard('🏥', 'Sức khỏe chung', health)}
          ${healthCard('✅', 'Readiness', readiness)}
          ${healthCard('💚', 'Liveness', liveness)}
          ${infoCard('🖥️', 'Frontend', `${window.location.origin}`)}
          ${infoCard('🔗', 'Backend', window.FintopInfra.FintopEnv.API_BASE_URL || 'localhost:3000')}
          ${infoCard('🕐', 'Thời gian kiểm tra', formatDate(new Date().toISOString()))}
        </div>

        ${health ? renderHealthDetails(health) : ''}

        <div class="admin-detail-panel" style="margin-top:1.5rem;">
          <div class="admin-detail-header">
            <div class="admin-detail-title">🔍 Kiểm tra nhanh</div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <button class="admin-btn admin-btn-secondary" id="sys-refresh">🔄 Kiểm tra lại</button>
            <button class="admin-btn admin-btn-secondary" id="sys-clear-cache">🗑️ Xóa cache frontend</button>
          </div>
        </div>
      `;

      document.getElementById('sys-refresh')?.addEventListener('click', () => this.render(container));
      document.getElementById('sys-clear-cache')?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      });
    } catch (err) {
      container.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi kiểm tra hệ thống</div><div class="empty-desc">${esc(err.message)}</div></div>`;
    }
  },

  destroy() {},
};

function healthCard(icon, label, data) {
  const isUp = data && (data.status === 'ok' || data.status === 'up' || data.healthy === true);
  const color = isUp ? '#34D399' : (data ? '#F87171' : '#94A3B8');
  const text = isUp ? 'Bình thường' : (data ? 'Có vấn đề' : 'Không xác định');

  return `
    <div class="admin-kpi-card">
      <div class="admin-kpi-icon">${icon}</div>
      <div class="admin-kpi-value" style="color:${color};font-size:1.2rem;">${text}</div>
      <div class="admin-kpi-label">${esc(label)}</div>
      <div class="admin-kpi-sub">${data ? esc(data.status || JSON.stringify(data).slice(0, 50)) : 'N/A'}</div>
    </div>
  `;
}

function infoCard(icon, label, value) {
  return `
    <div class="admin-kpi-card">
      <div class="admin-kpi-icon">${icon}</div>
      <div class="admin-kpi-value" style="font-size:0.9rem;word-break:break-all;">${esc(value)}</div>
      <div class="admin-kpi-label">${esc(label)}</div>
    </div>
  `;
}

function renderHealthDetails(health) {
  if (!health.info && !health.details) return '';
  const details = health.info || health.details || {};
  const entries = Object.entries(details);
  if (entries.length === 0) return '';

  return `
    <div class="admin-detail-panel" style="margin-top:1.5rem;">
      <div class="admin-detail-header">
        <div class="admin-detail-title">📊 Chi tiết dịch vụ</div>
      </div>
      <div class="admin-detail-grid">
        ${entries.map(([key, val]) => {
          const status = val?.status || (typeof val === 'object' ? JSON.stringify(val) : String(val));
          const isUp = status === 'up' || status === 'ok';
          return `
            <div class="admin-detail-field">
              <div class="admin-detail-label">${esc(key)}</div>
              <div class="admin-detail-value" style="color:${isUp ? '#34D399' : '#F87171'};">${esc(status)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
