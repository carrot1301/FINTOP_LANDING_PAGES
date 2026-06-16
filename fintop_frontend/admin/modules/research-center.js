/**
 * research-center.js — Automated Research Center Dashboard
 * ============================================================
 */
import { esc, formatNumber, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

let containerEl = null;
let activeReport = null;
let reportHistory = [];
let templates = [];
let portfolios = [];

export default {
  id: 'research-center',
  label: 'Research Center',
  icon: '📝',

  async render(container) {
    containerEl = container;
    containerEl.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải cấu hình Research Center...</div>';

    await Promise.all([
      loadHistory(),
      loadTemplates(),
      loadPortfolios()
    ]);

    renderUI();
  },

  destroy() {
    containerEl = null;
    activeReport = null;
    reportHistory = [];
    templates = [];
    portfolios = [];
  }
};

async function loadHistory() {
  try {
    const res = await API().get(EP().RESEARCH_HISTORY);
    reportHistory = res.data || res || [];
  } catch (err) {
    console.error('Error fetching research history:', err);
    showToast('Lỗi tải lịch sử báo cáo.', 'error');
  }
}

async function loadTemplates() {
  try {
    const res = await API().get(EP().RESEARCH_TEMPLATES);
    templates = res.data || res || [];
  } catch (err) {
    console.error('Error fetching research templates:', err);
  }
}

async function loadPortfolios() {
  try {
    const res = await API().get('/portfolios');
    portfolios = res.data || res || [];
  } catch (err) {
    console.error('Error fetching portfolios:', err);
  }
}

async function handleGenerate(formData) {
  const btn = containerEl.querySelector('#btn-generate-report');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="admin-spinner"></span> Đang tạo báo cáo...';
  }

  showToast('Đang tổng hợp dữ liệu & phân tích AI...');
  try {
    const res = await API().post(EP().RESEARCH_GENERATE, formData);
    activeReport = res.data || res;
    showToast('Tạo báo cáo nghiên cứu thành công!');
    await loadHistory();
    renderUI();
  } catch (err) {
    console.error('Error generating report:', err);
    showToast(err.message || 'Lỗi tạo báo cáo nghiên cứu.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '📝 Tạo Báo Cáo';
    }
  }
}

function handleDownload(id, format) {
  const baseUrl = window.FintopInfra.FintopEnv.API_BASE_URL;
  const url = `${baseUrl}${EP().RESEARCH_EXPORT(id)}?format=${format}`;
  window.open(url, '_blank');
}

function renderUI() {
  if (!containerEl) return;

  const sectorsList = [
    { code: 'CNTT', name: 'Công nghệ thông tin' },
    { code: 'NH', name: 'Ngân hàng' },
    { code: 'BDS', name: 'Bất động sản' },
    { code: 'TC', name: 'Tài chính' },
    { code: 'BL', name: 'Bán lẻ' },
    { code: 'DK', name: 'Dầu khí' },
    { code: 'YT', name: 'Y tế' },
    { code: 'THEP', name: 'Thép' }
  ];

  containerEl.innerHTML = `
    <!-- Top Layout -->
    <div style="display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; margin-bottom: 1.5rem;" class="mi-responsive-grid-2">
      
      <!-- Left Config panel -->
      <div class="admin-detail-panel" style="margin-top: 0; padding: 1.5rem; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05);">
        <div class="admin-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div class="admin-detail-title" style="font-size: 1.1rem; color: #fff; font-weight: 700;">⚙️ Cấu Hình Phân Tích</div>
        </div>

        <form id="form-research-config" style="display: flex; flex-direction: column; gap: 1rem;">
          
          <!-- 1. Report Type -->
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">LOẠI BÁO CÁO</label>
            <select id="sel-report-type" name="report_type" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
              <option value="company">Nghiên cứu & Phân tích Doanh nghiệp</option>
              <option value="sector">Nghiên cứu & Phân tích Ngành</option>
              <option value="weekly_market">Nghiên cứu & Phân tích Thị trường Tuần</option>
              <option value="portfolio">Nghiên cứu & Phân tích Danh mục</option>
              <option value="market_brief">Tóm tắt Thông tin Thị trường</option>
            </select>
          </div>

          <!-- 2. Subject Input (Dynamic) -->
          <div id="subject-container">
            <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">MÃ CỔ PHIẾU (TICKER)</label>
            <input type="text" name="subject" class="admin-search" placeholder="Ví dụ: FPT, VCB" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 12px;" required />
          </div>

          <!-- 3. Date Range (only for market/weekly) -->
          <div id="date-range-container" style="display: none; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">TỪ NGÀY</label>
              <input type="date" name="start_date" class="admin-search" style="width: 100%; height: 36px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 8px;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">ĐẾN NGÀY</label>
              <input type="date" name="end_date" class="admin-search" style="width: 100%; height: 36px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 8px;" />
            </div>
          </div>

          <!-- 4. Language Selector -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">NGÔN NGỮ</label>
              <select name="language" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">ĐỊNH DẠNG</label>
              <select name="format" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="docx">DOCX Word</option>
              </select>
            </div>
          </div>

          <!-- 5. Chart Include Toggle -->
          <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <input type="checkbox" id="chk-include-charts" name="include_charts" checked style="width: 16px; height: 16px; accent-color: var(--purple-glow);" />
            <label for="chk-include-charts" style="font-size: 0.85rem; color: #cbd5e1; cursor: pointer; user-select: none;">Nhúng biểu đồ trực quan</label>
          </div>

          <!-- 6. Action Button -->
          <button type="submit" id="btn-generate-report" class="admin-btn admin-btn-primary" style="width: 100%; height: 42px; font-weight: bold; background: linear-gradient(135deg, var(--purple-glow), #4F46E5); border: none; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
            📝 Tạo Báo Cáo
          </button>
        </form>

        <!-- Warnings Log Pane -->
        <div id="ui-warnings-pane" style="margin-top: 1.5rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; padding: 10px; font-size: 0.8rem;">
          <div style="color: #f87171; font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ⚠️ Lưu ý Tích hợp Hệ thống
          </div>
          <ul style="padding-left: 18px; margin: 0; color: #cbd5e1; line-height: 1.5; display: flex; flex-direction: column; gap: 4px;">
            <li>Backtest Engine hiện chưa tích hợp trực tiếp.</li>
            <li>Optimizer Engine hiện chưa tích hợp trực tiếp.</li>
            <li>Các phần dữ liệu tương ứng sẽ ghi "Dữ liệu chưa có sẵn (Data unavailable)".</li>
          </ul>
        </div>
      </div>

      <!-- Right Preview panel -->
      <div class="admin-detail-panel" style="margin-top: 0; padding: 1.5rem; display: flex; flex-direction: column; min-height: 500px; max-height: 600px; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05);">
        
        <!-- Preview Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div class="admin-detail-title" style="font-size: 1.1rem; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            📄 Xem Trước Báo Cáo
          </div>
          
          ${activeReport ? `
            <div style="display: flex; gap: 8px;">
              <button class="admin-btn admin-btn-secondary" id="btn-export-doc" style="height: 30px; font-size: 0.75rem; padding: 0 10px;">⬇️ DOCX Word</button>
              <button class="admin-btn admin-btn-secondary" id="btn-export-md" style="height: 30px; font-size: 0.75rem; padding: 0 10px;">📄 Markdown</button>
              <button class="admin-btn admin-btn-secondary" id="btn-export-json" style="height: 30px; font-size: 0.75rem; padding: 0 10px;">🗂️ JSON</button>
              <button class="admin-btn admin-btn-secondary" id="btn-export-pdf" style="height: 30px; font-size: 0.75rem; padding: 0 10px; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color:#f87171;">📄 PDF</button>
            </div>
          ` : ''}
        </div>

        <!-- Preview content scrollable -->
        <div id="preview-container" style="flex: 1; overflow-y: auto; padding-right: 8px; font-size: 0.95rem; color: #cbd5e1;">
          ${activeReport ? renderMarkdownToHtml(activeReport.content) : `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; gap: 12px; padding: 2rem;">
              <div style="font-size: 3rem;">📭</div>
              <div style="font-weight: bold; color: #94a3b8;">Chưa có báo cáo nào được chọn hoặc tạo mới</div>
              <div style="font-size: 0.85rem; max-width: 320px;">Điền cấu hình ở khung bên trái và bấm nút "Tạo Báo Cáo" hoặc chọn báo cáo trong danh sách lịch sử bên dưới.</div>
            </div>
          `}
        </div>

        <!-- Preview Warning notifications -->
        ${activeReport && activeReport.metadata?.warnings?.length > 0 ? `
          <div style="margin-top: 1rem; padding: 8px 12px; background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 0.8rem; color: #f59e0b;">
            <strong>Cảnh báo dữ liệu:</strong> ${activeReport.metadata.warnings.join('; ')}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Bottom History Panel -->
    <div class="admin-table-container">
      <div class="admin-table-toolbar" style="padding: 1rem 1.5rem;">
        <div class="admin-table-title">📜 Lịch Sử Báo Cáo Đã Tạo</div>
      </div>
      
      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Tiêu đề báo cáo</th>
              <th>Mã / Ngành</th>
              <th>Ngôn ngữ</th>
              <th>Định dạng gốc</th>
              <th style="text-align: right; padding-right: 1.5rem;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${reportHistory.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                  Chưa có lịch sử báo cáo nào được tạo.
                </td>
              </tr>
            ` : reportHistory.map(r => `
              <tr style="cursor: pointer;" class="history-row" data-id="${r.id}">
                <td>${formatDate(new Date(r.generatedAt))}</td>
                <td><strong style="color: #fff;">${esc(r.title)}</strong></td>
                <td><span class="admin-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-weight: bold; padding: 2px 6px; border-radius: 4px;">${esc(r.subject.toUpperCase())}</span></td>
                <td>${r.language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</td>
                <td><code style="color: #60a5fa;">${esc(r.format.toUpperCase())}</code></td>
                <td style="text-align: right; padding-right: 1.5rem;" class="action-td">
                  <div style="display: inline-flex; gap: 6px;">
                    <button class="admin-btn btn-history-view" data-id="${r.id}" style="padding: 3px 8px; font-size: 0.75rem; height: 26px;">👁️ Xem</button>
                    <button class="admin-btn btn-history-download-docx" data-id="${r.id}" style="padding: 3px 8px; font-size: 0.75rem; height: 26px; background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.2); color:#60a5fa;">Word</button>
                    <button class="admin-btn btn-history-download-md" data-id="${r.id}" style="padding: 3px 8px; font-size: 0.75rem; height: 26px;">MD</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  if (!containerEl) return;

  const form = containerEl.querySelector('#form-research-config');
  const typeSelect = containerEl.querySelector('#sel-report-type');
  const subjectContainer = containerEl.querySelector('#subject-container');
  const dateRangeContainer = containerEl.querySelector('#date-range-container');

  // Dynamic config form layout
  typeSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'company') {
      subjectContainer.innerHTML = `
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">MÃ CỔ PHIẾU (TICKER)</label>
        <input type="text" name="subject" class="admin-search" placeholder="Ví dụ: FPT, VCB" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 12px;" required />
      `;
      dateRangeContainer.style.display = 'none';
    } else if (val === 'sector') {
      subjectContainer.innerHTML = `
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">NHÓM NGÀNH</label>
        <select name="subject" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
          <option value="Công nghệ thông tin">Công nghệ thông tin (CNTT)</option>
          <option value="Ngân hàng">Ngân hàng</option>
          <option value="Bất động sản">Bất động sản</option>
          <option value="Tài chính">Tài chính</option>
          <option value="Bán lẻ">Bán lẻ</option>
          <option value="Dầu khí">Dầu khí</option>
          <option value="Y tế">Y tế</option>
          <option value="Thép">Thép</option>
        </select>
      `;
      dateRangeContainer.style.display = 'none';
    } else if (val === 'portfolio') {
      const options = portfolios.map(p => `<option value="${p.id}">${esc(p.name)} (NAV: ${formatNumber(p.currentNav)}đ)</option>`).join('');
      subjectContainer.innerHTML = `
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">CHỌN DANH MỤC ĐẦU TƯ</label>
        <select name="subject" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
          ${options || '<option value="Default">Default Portfolio</option>'}
        </select>
      `;
      dateRangeContainer.style.display = 'none';
    } else { // weekly_market, market_brief
      subjectContainer.innerHTML = `
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">CHỈ SỐ THAM CHIẾU</label>
        <select name="subject" class="admin-select" style="width: 100%; height: 38px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; padding: 0 10px;">
          <option value="VNINDEX">VNINDEX</option>
          <option value="VN30">VN30</option>
          <option value="HNXINDEX">HNXINDEX</option>
        </select>
      `;
      dateRangeContainer.style.display = 'grid';
    }
  });

  // Form submit handler
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      report_type: fd.get('report_type'),
      subject: fd.get('subject'),
      language: fd.get('language'),
      format: fd.get('format'),
      include_charts: fd.get('include_charts') === 'on'
    };

    if (data.report_type === 'weekly_market' || data.report_type === 'market_brief') {
      const start = fd.get('start_date');
      const end = fd.get('end_date');
      if (start && end) {
        data.date_range = { start_date: start, end_date: end };
      }
    }

    handleGenerate(data);
  });

  // Preview downloads
  containerEl.querySelector('#btn-export-doc')?.addEventListener('click', () => {
    if (activeReport) handleDownload(activeReport.id, 'docx');
  });
  containerEl.querySelector('#btn-export-md')?.addEventListener('click', () => {
    if (activeReport) handleDownload(activeReport.id, 'markdown');
  });
  containerEl.querySelector('#btn-export-json')?.addEventListener('click', () => {
    if (activeReport) handleDownload(activeReport.id, 'json');
  });
  containerEl.querySelector('#btn-export-pdf')?.addEventListener('click', () => {
    showToast('Tải PDF: Vui lòng nhấn Ctrl + P trong ô Xem Trước hoặc bấm Print để lưu PDF.', 'warning');
  });

  // History row interaction
  containerEl.querySelectorAll('.history-row').forEach(row => {
    row.addEventListener('click', async (e) => {
      // Ignore click on actions column buttons
      if (e.target.closest('.action-td')) return;
      
      const id = row.dataset.id;
      showToast('Đang tải báo cáo...');
      try {
        // Find in reportHistory or fetch from DB. Since content is not in history list select, let's query it or simulate finding it.
        // Wait, does getHistory return full content? No, select title/id/type/etc. We can fetch full report details from history list if we have a detail endpoint, 
        // or wait, let's check if the controllers have a GET /research/:id or we can fetch via generate or download.
        // Wait! How do we get the content? We can do a GET to the database or export JSON to read it!
        // Yes! GET /research/export/:id?format=json returns the full report object with the report content in it!
        const res = await API().get(`${EP().RESEARCH_EXPORT(id)}?format=json`);
        activeReport = res.data || res;
        renderUI();
      } catch (err) {
        console.error('Error loading report preview:', err);
        showToast('Lỗi tải thông tin chi tiết báo cáo.', 'error');
      }
    });
  });

  // History action buttons
  containerEl.querySelectorAll('.btn-history-view').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      showToast('Đang tải báo cáo...');
      try {
        const res = await API().get(`${EP().RESEARCH_EXPORT(id)}?format=json`);
        activeReport = res.data || res;
        renderUI();
      } catch (err) {
        console.error('Error loading report:', err);
        showToast('Lỗi tải báo cáo.', 'error');
      }
    });
  });

  containerEl.querySelectorAll('.btn-history-download-docx').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDownload(btn.dataset.id, 'docx');
    });
  });

  containerEl.querySelectorAll('.btn-history-download-md').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDownload(btn.dataset.id, 'markdown');
    });
  });
}

// Simple Markdown to HTML parser
function renderMarkdownToHtml(markdown) {
  if (!markdown) return '<div style="color:var(--text-muted);text-align:center;padding:2rem;">Không có nội dung báo cáo.</div>';
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Handle blockquotes/alerts
    if (line.startsWith('>')) {
      if (!inBlockquote) {
        html += '<div class="disclaimer-box" style="background:rgba(59, 130, 246, 0.05);border-left:4px solid #3b82f6;padding:12px;margin:16px 0;border-radius:4px;color:#94a3b8;font-style:italic;">';
        inBlockquote = true;
      }
      let cleanText = line.substring(1).trim();
      if (cleanText.startsWith('[!IMPORTANT]') || cleanText.startsWith('[!WARNING]') || cleanText.startsWith('[!NOTE]')) {
        cleanText = cleanText.replace(/\[!(IMPORTANT|WARNING|NOTE)\]/, '').trim();
      }
      html += `<p style="margin:0 0 8px 0;">${replaceMarkdownStyles(cleanText)}</p>`;
      continue;
    } else if (inBlockquote) {
      html += '</div>';
      inBlockquote = false;
    }

    if (!line.startsWith('|') && inTable) {
      html += '</tbody></table>';
      inTable = false;
    }

    if (!line.startsWith('-') && !line.startsWith('*') && !/^\d+\./.test(line) && inList) {
      html += '</ul>';
      inList = false;
    }

    if (line === '') {
      continue;
    }

    if (line.startsWith('# ')) {
      html += `<h1 style="color:#f8fafc;font-size:1.8rem;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;margin-top:24px;margin-bottom:16px;">${replaceMarkdownStyles(line.substring(2))}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2 style="color:#e2e8f0;font-size:1.4rem;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:6px;margin-top:20px;margin-bottom:12px;">${replaceMarkdownStyles(line.substring(3))}</h2>`;
    } else if (line.startsWith('### ')) {
      html += `<h3 style="color:#cbd5e1;font-size:1.15rem;margin-top:16px;margin-bottom:8px;">${replaceMarkdownStyles(line.substring(4))}</h3>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul style="padding-left:20px;margin-bottom:16px;color:#cbd5e1;line-height:1.6;">';
        inList = true;
      }
      html += `<li style="margin-bottom:6px;">${replaceMarkdownStyles(line.substring(2))}</li>`;
    } else if (line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter((p, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (parts.every(p => p.startsWith('-') || p.includes(':-') || p.includes('-:'))) {
        continue;
      }
      if (!inTable) {
        html += '<table class="admin-table" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.9rem;"><thead><tr>';
        parts.forEach(p => {
          html += `<th style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:10px;text-align:left;color:#fff;font-weight:600;">${replaceMarkdownStyles(p)}</th>`;
        });
        html += '</tr></thead><tbody>';
        inTable = true;
      } else {
        html += '<tr>';
        parts.forEach(p => {
          html += `<td style="border:1px solid rgba(255,255,255,0.05);padding:8px 10px;color:#cbd5e1;">${replaceMarkdownStyles(p)}</td>`;
        });
        html += '</tr>';
      }
    } else {
      html += `<p style="color:#cbd5e1;line-height:1.6;margin-bottom:16px;">${replaceMarkdownStyles(line)}</p>`;
    }
  }

  if (inBlockquote) html += '</div>';
  if (inTable) html += '</tbody></table>';
  if (inList) html += '</ul>';

  return html;
}

function replaceMarkdownStyles(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fff;">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:#94a3b8;">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;color:#f472b6;font-family:monospace;font-size:0.85rem;">$1</code>');
}
