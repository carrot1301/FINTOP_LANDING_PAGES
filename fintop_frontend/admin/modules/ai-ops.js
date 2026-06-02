/**
 * ai-ops.js — Admin AI Operations & Runtime QA Dashboard
 */
import { esc, formatDate, badge, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;

/**
 * Normalize an API response into a plain array.
 * The ApiClient wraps all successful responses as { data, meta, timestamp }.
 * The underlying Python service may return a plain array, { tasks: [] }, { data: [] }, { items: [] }, etc.
 * This helper safely extracts the array regardless of shape.
 */
function normalizeList(res) {
  if (!res) return [];
  // Already a plain array (shouldn't happen with current ApiClient, but safe)
  if (Array.isArray(res)) return res;
  // Standard ApiClient envelope: { data: [...] }
  if (res.data !== undefined) {
    if (Array.isArray(res.data)) return res.data;
    // data itself might be wrapped: { data: { tasks: [] } }
    if (res.data && typeof res.data === 'object') {
      if (Array.isArray(res.data.tasks)) return res.data.tasks;
      if (Array.isArray(res.data.items)) return res.data.items;
      if (Array.isArray(res.data.data)) return res.data.data;
    }
  }
  // Direct wrapper from agent: { tasks: [] }
  if (Array.isArray(res.tasks)) return res.tasks;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

/**
 * Unwrap a single-object API response.
 * Returns res.data if it exists, otherwise res itself.
 */
function unwrap(res) {
  if (!res) return res;
  if (typeof res === 'object' && 'data' in res) return res.data;
  return res;
}

export default {
  id: 'ai-ops',
  label: 'AI Ops / QA',
  icon: '🤖',
  pollInterval: null,

  async render(container) {
    container.innerHTML = `
      <div class="ai-ops-container">
        <!-- Top Bar Control Panel -->
        <div class="ai-ops-header-panel">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem;">
            <div>
              <div class="ops-eyebrow">SYSTEM GOVERNANCE</div>
              <h2 class="ops-title">🤖 AI Operations &amp; Runtime QA</h2>
              <p class="ops-subtitle">Giám sát hệ thống thời gian thực, độ tươi dữ liệu, và tự động hóa kiểm thử tích hợp (ADK Agent)</p>
            </div>
            <button class="admin-btn admin-btn-primary" id="btn-trigger-qa" style="display:flex; align-items:center; gap:0.6rem; padding: 0.65rem 1.25rem; font-weight:700;">
              <span class="pulse-icon">🩺</span> Chạy chuẩn đoán hệ thống
            </button>
          </div>
        </div>

        <div class="ai-ops-grid" style="display:grid; grid-template-columns: 1fr 2fr; gap:1.5rem;">
          <!-- Left Column: Tasks Log & History -->
          <div class="admin-detail-panel" style="min-height:550px; background: rgba(15, 23, 42, 0.45); border-color: rgba(124, 58, 237, 0.15);">
            <div class="admin-detail-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
              <div class="admin-detail-title" style="font-weight: 700; color: #F1F5F9; display: flex; align-items: center; gap: 0.5rem;">📋 Nhật ký chẩn đoán</div>
            </div>
            <div id="ops-task-list" class="ops-task-list-container" style="margin-top: 1rem;">
              <div class="admin-loading"><div class="admin-spinner"></div> Đang tải lịch sử...</div>
            </div>
          </div>

          <!-- Right Column: Live Run Console & AI Report -->
          <div class="ai-ops-main-panel" style="display:flex; flex-direction:column; gap:1.5rem;">
            <!-- Task Detail & Live Progress -->
            <div class="admin-detail-panel" id="panel-task-detail" style="display:none; background: rgba(15, 23, 42, 0.45); border-color: rgba(124, 58, 237, 0.15);">
              <div class="admin-detail-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
                <div class="admin-detail-title" id="detail-task-title" style="font-weight: 700; color: #F1F5F9;">Chi tiết nhiệm vụ</div>
                <div id="detail-task-badge"></div>
              </div>
              
              <!-- Progress steps -->
              <div class="ops-steps-progress" id="ops-steps-progress">
                <!-- Dynamically populated -->
              </div>
              
              <div id="panel-resume-container" style="display:none; margin-top:1.5rem; text-align:right;">
                <button class="admin-btn admin-btn-secondary" id="btn-resume-task" style="gap:0.5rem; display:inline-flex; align-items:center; border-color: rgba(124, 58, 237, 0.3);">
                  🔄 Sửa lỗi xong &amp; chạy lại
                </button>
              </div>
            </div>

            <!-- Markdown Report Panel -->
            <div class="admin-detail-panel" id="panel-report-view" style="display:none; background: rgba(15, 23, 42, 0.45); border-color: rgba(124, 58, 237, 0.15);">
              <div class="admin-detail-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
                <div class="admin-detail-title" style="font-weight: 700; color: #F1F5F9; display: flex; align-items: center; gap: 0.5rem;">📄 Báo cáo chuẩn đoán thông minh (AI)</div>
                <div id="report-risk-badge"></div>
              </div>
              <div class="ops-report-content markdown-body" id="ops-report-content" style="max-height: 550px; overflow-y: auto; padding-right: 0.5rem;">
                <!-- Dynamically populated markdown -->
              </div>
            </div>
            
            <!-- Welcome placeholder -->
            <div class="admin-detail-panel" id="panel-ops-placeholder" style="display:flex; align-items:center; justify-content:center; flex-direction:column; min-height:400px; text-align:center; color:#94A3B8; background: rgba(15, 23, 42, 0.35); border-color: rgba(124, 58, 237, 0.1);">
              <div style="font-size:3.5rem; margin-bottom:1rem; filter: drop-shadow(0 0 15px rgba(124,58,237,0.35));">🩺</div>
              <h3 style="color:#F8FAFC; margin:0 0 0.5rem 0; font-size:1.2rem; font-weight:700;">Hệ thống chuẩn đoán tự động</h3>
              <p style="max-width:340px; font-size:0.85rem; line-height:1.5; color: #94A3B8;">Chọn một đợt chạy chẩn đoán từ danh sách bên trái hoặc nhấn nút "Chạy chuẩn đoán hệ thống" để bắt đầu quét toàn bộ hiệu năng hệ thống.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add required custom dashboard styles dynamically to prevent file conflicts
    this.addCustomStyles();

    // Bind triggers
    const triggerBtn = document.getElementById('btn-trigger-qa');
    triggerBtn?.addEventListener('click', () => this.triggerDiagnostics());

    // Fetch initial task list
    await this.fetchTasksList(true);

    // Setup task list polling
    this.pollInterval = setInterval(() => this.fetchTasksList(false), 5000);
  },

  destroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  },

  async triggerDiagnostics() {
    const triggerBtn = document.getElementById('btn-trigger-qa');
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.innerHTML = `<span>⏳</span> Đang khởi chạy...`;
    }

    try {
      const raw = await API().post('/admin/agent/run-runtime-check');
      const res = unwrap(raw);
      if (res && res.taskId) {
        showToast('Đã kích hoạt QA diagnostics agent!', 'success');
        await this.fetchTasksList(true);
        this.selectTask(res.taskId);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khởi chạy agent', 'error');
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `<span class="pulse-icon">🩺</span> Chạy chuẩn đoán hệ thống`;
      }
    }
  },

  async fetchTasksList(selectFirst = false) {
    try {
      const tasks = normalizeList(await API().get('/admin/agent/tasks'));
      const listContainer = document.getElementById('ops-task-list');
      if (!listContainer) return;

      if (!tasks || tasks.length === 0) {
        listContainer.innerHTML = `
          <div class="admin-empty-state" style="padding:2rem 0;">
            <div class="empty-icon">📂</div>
            <div class="empty-title">Không có lịch sử chẩn đoán</div>
          </div>
        `;
        return;
      }

      let activeTaskId = this.getActiveTaskId();

      listContainer.innerHTML = tasks.map(t => {
        const isSelected = t.id === activeTaskId;
        const total = t.steps ? t.steps.length : 0;
        const passed = t.steps ? t.steps.filter(s => s.status === 'SUCCEEDED').length : 0;

        let statusClass = 'status-pending';
        let label = 'PENDING';

        if (t.status === 'SUCCEEDED') {
          statusClass = 'status-success';
          label = 'THÀNH CÔNG';
        } else if (t.status === 'FAILED') {
          statusClass = 'status-failed';
          label = 'THẤT BẠI';
        } else if (t.status === 'RUNNING') {
          statusClass = 'status-running';
          label = 'ĐANG CHẠY';
        }

        return `
          <div class="ops-task-item ${isSelected ? 'active' : ''}" data-task-id="${t.id}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-weight:700; font-size:0.8rem; font-family:monospace; color:#A78BFA; letter-spacing:0.02em;">#${t.id.slice(0, 8)}</span>
              <span class="ops-badge ${statusClass}"><span class="ops-badge-dot"></span> ${label}</span>
            </div>
            <div style="font-size:0.75rem; color:#94A3B8; display:flex; justify-content:space-between; font-weight:500;">
              <span>📅 ${formatDate(t.created_at)}</span>
              <span style="font-variant-numeric: tabular-nums;">🔄 ${passed}/${total} Đạt</span>
            </div>
          </div>
        `;
      }).join('');

      // Bind click handlers
      listContainer.querySelectorAll('.ops-task-item').forEach(item => {
        item.addEventListener('click', () => {
          this.selectTask(item.dataset.taskId);
        });
      });

      if (selectFirst && tasks.length > 0 && !activeTaskId) {
        this.selectTask(tasks[0].id);
      }
    } catch (err) {
      const listContainer = document.getElementById('ops-task-list');
      if (listContainer) {
        listContainer.innerHTML = `<div style="color:#F87171; text-align:center; padding:1rem; font-size:0.8rem;">⚠️ ${esc(err.message)}</div>`;
      }
    }
  },

  getActiveTaskId() {
    const activeEl = document.querySelector('.ops-task-item.active');
    return activeEl ? activeEl.dataset.taskId : null;
  },

  async selectTask(taskId) {
    // Set active item in UI list
    document.querySelectorAll('.ops-task-item').forEach(item => {
      item.classList.toggle('active', item.dataset.taskId === taskId);
    });

    // Hide placeholder
    const placeholder = document.getElementById('panel-ops-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Show details
    const detailPanel = document.getElementById('panel-task-detail');
    if (detailPanel) detailPanel.style.display = 'block';

    await this.loadTaskDetails(taskId);
  },

  async loadTaskDetails(taskId) {
    try {
      // Find task in local list
      const tasks = normalizeList(await API().get('/admin/agent/tasks'));
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update basic detail
      const titleEl = document.getElementById('detail-task-title');
      if (titleEl) titleEl.innerHTML = `🩺 Khảo sát chẩn đoán <span style="font-family:monospace; color:#A78BFA; font-size:1.15rem; font-weight:700;">#${task.id.slice(0, 8)}</span>`;

      const badgeEl = document.getElementById('detail-task-badge');
      if (badgeEl) {
        let cls = 'status-pending';
        let lbl = 'PENDING';
        if (task.status === 'SUCCEEDED') { cls = 'status-success'; lbl = 'THÀNH CÔNG'; }
        if (task.status === 'FAILED') { cls = 'status-failed'; lbl = 'THẤT BẠI'; }
        if (task.status === 'RUNNING') { cls = 'status-running'; lbl = 'ĐANG CHẠY'; }
        badgeEl.innerHTML = `<span class="ops-badge ${cls}"><span class="ops-badge-dot"></span> ${lbl}</span>`;
      }

      // Populate Steps
      const stepsContainer = document.getElementById('ops-steps-progress');
      if (stepsContainer) {
        if (!task.steps || task.steps.length === 0) {
          stepsContainer.innerHTML = `
            <div style="padding:1.5rem; color:#94A3B8; text-align:center;">
              <span class="admin-spinner"></span> Đang sắp xếp các tiến trình quét...
            </div>
          `;
        } else {
          stepsContainer.innerHTML = task.steps.map(s => {
            let statusIcon = '⚪';
            let stepClass = 'step-pending';

            if (s.status === 'SUCCEEDED') {
              statusIcon = '🟢';
              stepClass = 'step-success';
            } else if (s.status === 'FAILED') {
              statusIcon = '🔴';
              stepClass = 'step-failed';
            } else if (s.status === 'RUNNING') {
              statusIcon = '🟡';
              stepClass = 'step-running';
            }

            const nameClean = s.name.toUpperCase().replace('CHECK_', '').replace('RUN_', '').replace('_', ' ');

            return `
              <div class="ops-step-card ${stepClass}">
                <div class="ops-step-main">
                  <div style="flex-grow:1;">
                    <div class="ops-step-title">${esc(nameClean)}</div>
                    <div class="ops-step-msg">${esc(s.message || 'Waiting to start...')}</div>
                  </div>
                </div>
                ${s.error ? `
                  <div class="ops-step-error-box">
                    <strong>Nhật ký lỗi chi tiết:</strong>
                    <pre>${esc(s.error)}</pre>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');
        }
      }

      // Resume task visibility
      const resumePanel = document.getElementById('panel-resume-container');
      if (resumePanel) {
        if (task.status === 'FAILED') {
          resumePanel.style.display = 'block';
          const resumeBtn = document.getElementById('btn-resume-task');
          if (resumeBtn) {
            // Re-bind to prevent duplication
            resumeBtn.onclick = () => this.resumeDiagnostics(task.id);
          }
        } else {
          resumePanel.style.display = 'none';
        }
      }

      // Load AI report
      const reportPanel = document.getElementById('panel-report-view');
      const reportContent = document.getElementById('ops-report-content');
      const riskBadge = document.getElementById('report-risk-badge');

      if (task.status === 'SUCCEEDED' || task.status === 'FAILED') {
        try {
          const report = unwrap(await API().get(`/admin/agent/reports/${task.id}`));
          if (reportPanel && reportContent) {
            reportPanel.style.display = 'block';
            reportContent.innerHTML = this.parseMarkdown(report.markdown_report);

            if (riskBadge) {
              let cls = 'status-success';
              let lbl = 'THẤP';
              if (report.risk_score === 'MEDIUM') { cls = 'status-running'; lbl = 'TRUNG BÌNH'; }
              if (report.risk_score === 'HIGH') { cls = 'status-failed'; lbl = 'CAO'; }
              riskBadge.innerHTML = `<span class="ops-badge ${cls}"><span class="ops-badge-dot"></span> RỦI RO: ${lbl}</span>`;
            }
          }
        } catch {
          if (reportPanel) reportPanel.style.display = 'none';
        }
      } else {
        if (reportPanel) reportPanel.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
    }
  },

  async resumeDiagnostics(taskId) {
    const btn = document.getElementById('btn-resume-task');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> Đang chạy lại...`;
    }

    try {
      const raw = await API().post('/admin/agent/resume-task', { taskId });
      const res = unwrap(raw);
      if (res && res.success) {
        showToast('Đã khởi chạy lại các bước bị lỗi!', 'success');
        await this.fetchTasksList(false);
        this.selectTask(taskId);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi resume task', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `🔄 Sửa lỗi xong &amp; chạy lại`;
      }
    }
  },

  parseMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Parse Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="color:#C084FC; margin:1.2rem 0 0.5rem 0; font-weight:600; font-size:1.05rem;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="color:#F1F5F9; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.4rem; margin:1.5rem 0 0.8rem 0; font-weight:700; font-size:1.2rem;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="color:#F8FAFC; margin:0 0 1rem 0; font-weight:800; font-size:1.4rem;">$1</h2>');

    // Parse Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E2E8F0; font-weight:600;">$1</strong>');

    // Parse List bullet
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left:1rem; margin-bottom:0.4rem; list-style-type:disc; color:#CBD5E1; font-size:0.85rem;">$1</li>');

    // Parse Inline code
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.06); padding:0.15rem 0.35rem; border-radius:4px; font-family:monospace; color:#F472B6; font-size:0.8rem;">$1</code>');

    // Parse Paragraphs (ignore lists & headers)
    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<l') || p.startsWith('<c') || p.startsWith('---')) return p;
      return `<p style="line-height:1.6; color:#94A3B8; font-size:0.88rem; margin-bottom:0.8rem; font-weight:400;">${p}</p>`;
    }).join('\n');

    // Parse horizontal rules
    html = html.replace(/---/g, '<hr style="border:0; border-top:1px solid rgba(255,255,255,0.06); margin:1.2rem 0;">');

    return html;
  },

  addCustomStyles() {
    // Avoid appending if already exists
    if (document.getElementById('ai-ops-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-ops-styles';
    style.innerHTML = `
      .ai-ops-container {
        animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ai-ops-header-panel {
        background: linear-gradient(135deg, rgba(26, 21, 44, 0.65) 0%, rgba(13, 10, 24, 0.75) 100%);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 16px;
        padding: 1.5rem 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255,255,255,0.03);
        backdrop-filter: blur(16px);
      }
      .ops-eyebrow {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: #a78bfa;
        text-transform: uppercase;
        margin-bottom: 0.4rem;
      }
      .ops-title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #F8FAFC;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      }
      .ops-subtitle {
        margin: 0.35rem 0 0 0;
        font-size: 0.85rem;
        color: #94A3B8;
        line-height: 1.5;
      }
      .pulse-icon {
        display: inline-block;
        animation: pulse 2s infinite ease-in-out;
      }
      @keyframes pulse {
        0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(124, 58, 237, 0.5)); }
        50% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.8)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(124, 58, 237, 0.5)); }
      }

      .ops-task-list-container {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        max-height: 580px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .ops-task-list-container::-webkit-scrollbar,
      .ops-report-content::-webkit-scrollbar {
        width: 6px;
      }
      .ops-task-list-container::-webkit-scrollbar-track,
      .ops-report-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.01);
      }
      .ops-task-list-container::-webkit-scrollbar-thumb,
      .ops-report-content::-webkit-scrollbar-thumb {
        background: rgba(124, 58, 237, 0.2);
        border-radius: 4px;
      }
      .ops-task-list-container::-webkit-scrollbar-thumb:hover,
      .ops-report-content::-webkit-scrollbar-thumb:hover {
        background: rgba(124, 58, 237, 0.4);
      }

      .ops-task-item {
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        overflow: hidden;
      }
      .ops-task-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: transparent;
        transition: background-color 0.3s;
      }
      .ops-task-item:hover {
        background: rgba(30, 41, 59, 0.5);
        border-color: rgba(124, 58, 237, 0.25);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .ops-task-item:hover::before {
        background: rgba(124, 58, 237, 0.5);
      }
      .ops-task-item.active {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(76, 29, 149, 0.12) 100%);
        border-color: rgba(124, 58, 237, 0.45);
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.02);
      }
      .ops-task-item.active::before {
        background: #7C3AED;
      }

      .ops-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.65rem;
        border-radius: 6px;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        font-family: sans-serif;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
      .ops-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
      }

      .status-pending { 
        background: rgba(148, 163, 184, 0.1); 
        color: #94A3B8; 
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .status-pending .ops-badge-dot { background: #94A3B8; }

      .status-running { 
        background: rgba(245, 158, 11, 0.1); 
        color: #F59E0B; 
        border: 1px solid rgba(245, 158, 11, 0.2);
      }
      .status-running .ops-badge-dot { 
        background: #F59E0B; 
        animation: glowPulse 1.5s infinite ease-in-out;
      }

      .status-success { 
        background: rgba(16, 185, 129, 0.1); 
        color: #10B981; 
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .status-success .ops-badge-dot { background: #10B981; }

      .status-failed { 
        background: rgba(239, 68, 68, 0.15); 
        color: #EF4444; 
        border: 1px solid rgba(239, 68, 68, 0.25);
      }
      .status-failed .ops-badge-dot { 
        background: #EF4444; 
        animation: glowPulseRed 1.5s infinite ease-in-out;
      }

      @keyframes glowPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
        70% { transform: scale(1.3); box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
      }
      @keyframes glowPulseRed {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.3); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }

      .ops-steps-progress {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
        position: relative;
        padding-left: 1.5rem;
      }
      .ops-steps-progress::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: rgba(255, 255, 255, 0.05);
        z-index: 1;
      }

      .ops-step-card {
        background: rgba(15, 23, 42, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        padding: 1rem;
        position: relative;
        z-index: 2;
        transition: all 0.3s;
      }
      .ops-step-card::after {
        content: '';
        position: absolute;
        left: -20px;
        top: 20px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #334155;
        border: 2px solid #0f172a;
        z-index: 3;
        transition: all 0.3s;
      }

      .ops-step-main {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
      }
      .ops-step-title {
        font-weight: 700;
        font-size: 0.85rem;
        color: #F1F5F9;
        letter-spacing: -0.01em;
      }
      .ops-step-msg {
        font-size: 0.78rem;
        color: #94A3B8;
        margin-top: 0.25rem;
        line-height: 1.4;
      }

      .step-success { 
        border-color: rgba(16, 185, 129, 0.15); 
        background: rgba(16, 185, 129, 0.02); 
      }
      .step-success::after {
        background: #10B981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
      }

      .step-failed { 
        border-color: rgba(239, 68, 68, 0.15); 
        background: rgba(239, 68, 68, 0.02); 
      }
      .step-failed::after {
        background: #EF4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
      }

      .step-running { 
        border-color: rgba(245, 158, 11, 0.15); 
        background: rgba(245, 158, 11, 0.02); 
      }
      .step-running::after {
        background: #F59E0B;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        animation: runningStep 1s infinite ease-in-out;
      }
      @keyframes runningStep {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      .ops-step-error-box {
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(10, 10, 12, 0.8);
        border-radius: 8px;
        font-size: 0.72rem;
        color: #FCA5A5;
        border-left: 4px solid #EF4444;
        font-family: monospace;
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
      }
      .ops-step-error-box strong {
        color: #EF4444;
        font-weight: 700;
        margin-bottom: 0.25rem;
        display: block;
      }
      .ops-step-error-box pre {
        margin: 0.25rem 0 0 0;
        font-family: 'Fira Code', 'Courier New', Courier, monospace;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 180px;
        overflow-y: auto;
        line-height: 1.4;
      }

      .ops-report-content {
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 15, 30, 0.6) 100%);
        border: 1px solid rgba(124, 58, 237, 0.15);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0,0,0,0.15);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
};
