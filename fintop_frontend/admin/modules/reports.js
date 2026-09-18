/**
 * reports.js — Admin Report Management Module
 * ============================================================
 * Quản lý Báo cáo Phân tích (Doanh nghiệp, Ngành & Vĩ mô)
 * Preserves exact fields & formatting matching the user-side reports page (#panel-stock-reports):
 *   - STT
 *   - Phân loại (doanh-nghiep / nganh-vimo)
 *   - Mã cổ phiếu / Ngành
 *   - Nội dung (Tiêu đề báo cáo)
 *   - Ngày phát hành
 *   - Nguồn (FINTOP, FPTS, Mirae, PHS, KBSV, VNDIRECT, SSI...)
 *   - Link chi tiết
 *   - Gói hội viên (STANDARD, PRO, VIP, DIAMOND)
 *   - Trạng thái (PUBLISHED, DRAFT)
 */

import { esc, showToast, statusBadge, tierBadge, formatDate } from '../admin-shell.js';

const API = () => window.FintopInfra?.ApiClient;
const STORAGE_KEY = 'fintop_admin_reports_v1';

let currentCategory = 'ALL'; // ALL | doanh-nghiep | nganh-vimo
let searchKeyword = '';
let selectedSource = '';
let selectedTier = '';
let selectedStatus = '';
let reportsList = [];

const DEFAULT_REPORTS = [
  // Doanh nghiệp
  { id: 1, category: 'doanh-nghiep', symbol: 'QNS', title: 'Báo cáo phân tích doanh nghiệp QNS Q2/2026', publishedAt: '2026-05-29', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 2, category: 'doanh-nghiep', symbol: 'FPT', title: 'Cập nhật kết quả kinh doanh FPT & Triển vọng AI', publishedAt: '2026-05-22', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 3, category: 'doanh-nghiep', symbol: 'SAB', title: 'Phân tích hoạt động kinh doanh & Biên lợi nhuận SAB', publishedAt: '2026-05-15', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 4, category: 'doanh-nghiep', symbol: 'VNM', title: 'Đánh giá sức mua ngành sữa & Chiến lược VNM', publishedAt: '2026-05-10', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 5, category: 'doanh-nghiep', symbol: 'VIB', title: 'Báo cáo cập nhật tình hình tăng trưởng tín dụng VIB', publishedAt: '2026-04-17', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 6, category: 'doanh-nghiep', symbol: 'DCM', title: 'Phân tích tác động giá phân bón Ure tới DCM', publishedAt: '2020-11-18', source: 'FPTS', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 7, category: 'doanh-nghiep', symbol: 'VCB', title: 'Cập nhật chất lượng tài sản & Nợ xấu VCB', publishedAt: '2020-11-12', source: 'Mirae', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 8, category: 'doanh-nghiep', symbol: 'POW', title: 'Phân tích sản lượng điện & Tiến độ nhà máy POW', publishedAt: '2020-11-05', source: 'Mirae', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 9, category: 'doanh-nghiep', symbol: 'STK', title: 'Đánh giá đơn hàng dệt may & Phục hồi sản xuất STK', publishedAt: '2020-11-05', source: 'Mirae', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 10, category: 'doanh-nghiep', symbol: 'FMC', title: 'Cập nhật kim ngạch xuất khẩu tôm FMC', publishedAt: '2020-10-30', source: 'PHS', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 11, category: 'doanh-nghiep', symbol: 'PLC', title: 'Triển vọng đầu tư công & Tiêu thụ nhựa đường PLC', publishedAt: '2020-10-30', source: 'Mirae', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 12, category: 'doanh-nghiep', symbol: 'DXG', title: 'Cập nhật tiến độ mở bán các dự án BĐS DXG', publishedAt: '2020-10-27', source: 'KBSV', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 13, category: 'doanh-nghiep', symbol: 'VCB', title: 'Báo cáo phân tích chuyên sâu vị thế ngân hàng VCB', publishedAt: '2020-10-27', source: 'VNDIRECT', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 14, category: 'doanh-nghiep', symbol: 'PVT', title: 'Phân tích cước vận tải biển & Đội tàu PVT', publishedAt: '2020-10-22', source: 'FPTS', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },

  // Ngành & Vĩ mô
  { id: 15, category: 'nganh-vimo', symbol: 'Vĩ mô', title: 'Báo cáo chiến lược kinh tế vĩ mô Q2/2026', publishedAt: '2026-05-28', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 16, category: 'nganh-vimo', symbol: 'Ngân hàng', title: 'Báo cáo triển vọng nhóm Ngân hàng 2026', publishedAt: '2026-05-20', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 17, category: 'nganh-vimo', symbol: 'Thép', title: 'Phân tích chu kỳ nhóm Thép & Thép XD', publishedAt: '2026-05-14', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 18, category: 'nganh-vimo', symbol: 'Vĩ mô', title: 'Tác động lạm phát & chính sách lãi suất NHNN', publishedAt: '2026-05-08', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 19, category: 'nganh-vimo', symbol: 'Công nghệ', title: 'Báo cáo chuỗi giá trị Công nghệ & Bán dẫn', publishedAt: '2026-04-12', source: 'FINTOP', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 20, category: 'nganh-vimo', symbol: 'Bất động sản', title: 'Bất động sản KCN: Làn sóng FDI thế hệ mới', publishedAt: '2020-11-15', source: 'SSI', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 21, category: 'nganh-vimo', symbol: 'Tài chính', title: 'Báo cáo xu hướng tỷ giá USD/VND & Dòng tiền ngoại', publishedAt: '2020-11-10', source: 'VNDIRECT', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 22, category: 'nganh-vimo', symbol: 'Bán lẻ', title: 'Báo cáo tổng quan ngành Bán lẻ & Tiêu dùng', publishedAt: '2020-11-02', source: 'Mirae', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 23, category: 'nganh-vimo', symbol: 'Dầu khí', title: 'Dầu khí: Cập nhật tiến độ dự án Lô B Ô Môn', publishedAt: '2020-10-28', source: 'KBSV', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
  { id: 24, category: 'nganh-vimo', symbol: 'Thị trường', title: 'Báo cáo chiến lược dòng tiền & Thanh khoản thị trường', publishedAt: '2020-10-25', source: 'FPTS', fileUrl: '#', minTierAccess: 'STANDARD', status: 'PUBLISHED' },
];

function formatReportSymbol(symbol, category) {
  if (!symbol) return '';
  const str = String(symbol).trim();
  if (category === 'doanh-nghiep') {
    return str.toUpperCase();
  }
  if (str === str.toUpperCase() && str.length > 3) {
    return str.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
  }
  return str;
}

function getStoredReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(r => ({
          ...r,
          symbol: formatReportSymbol(r.symbol, r.category)
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored reports', e);
  }
  return [...DEFAULT_REPORTS];
}

function saveStoredReports(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Trigger custom event so open tabs/user pages can sync if needed
    window.dispatchEvent(new CustomEvent('fintop-reports-updated', { detail: list }));
  } catch (e) {
    console.warn('Failed to save reports to localStorage', e);
  }
}

export default {
  id: 'reports',
  label: 'Quản lý Báo cáo',
  icon: '📄',

  async render(container) {
    injectStyles();

    container.innerHTML = `
      <div id="report-modal-area"></div>

      <div class="admin-portfolio-layout">
        <!-- Top Control Bar -->
        <div class="reports-header-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:1rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button class="admin-btn" id="btn-add-report" style="background:#22c55e; color:#fff; font-weight:700;" title="Thêm báo cáo mới">
              ➕ Thêm Báo Cáo
            </button>
            <button class="admin-btn" id="btn-delete-selected-reports" style="background:#ef4444; color:#fff;" title="Xóa các báo cáo đã chọn">
              🗑️ Xóa đã chọn
            </button>
          </div>

          <!-- Category Segmented Tabs -->
          <div class="reports-segmented-tab" style="display:inline-flex; background:rgba(15,23,42,0.85); padding:4px; border-radius:12px; border:1px solid rgba(168,85,247,0.35);">
            <button class="rep-tab-item ${currentCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">
              <span>Tất cả</span>
            </button>
            <button class="rep-tab-item ${currentCategory === 'doanh-nghiep' ? 'active' : ''}" data-cat="doanh-nghiep">
              <span>📊 Phân tích Doanh nghiệp</span>
            </button>
            <button class="rep-tab-item ${currentCategory === 'nganh-vimo' ? 'active' : ''}" data-cat="nganh-vimo">
              <span>🌐 Ngành & Vĩ mô</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap; align-items:center;">
          <div style="flex:1; min-width:260px; position:relative;">
            <input type="text" id="report-search-input" class="admin-input" placeholder="Tìm kiếm theo Mã CP, Nội dung, Nguồn..." value="${esc(searchKeyword)}" style="padding-right:36px;" />
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none;">🔍</span>
          </div>

          <select id="report-source-filter" class="admin-select" style="min-width:140px;">
            <option value="">Tất cả Nguồn</option>
            <option value="FINTOP" ${selectedSource === 'FINTOP' ? 'selected' : ''}>FINTOP</option>
            <option value="FPTS" ${selectedSource === 'FPTS' ? 'selected' : ''}>FPTS</option>
            <option value="Mirae" ${selectedSource === 'Mirae' ? 'selected' : ''}>Mirae Asset</option>
            <option value="PHS" ${selectedSource === 'PHS' ? 'selected' : ''}>PHS</option>
            <option value="KBSV" ${selectedSource === 'KBSV' ? 'selected' : ''}>KBSV</option>
            <option value="VNDIRECT" ${selectedSource === 'VNDIRECT' ? 'selected' : ''}>VNDIRECT</option>
            <option value="SSI" ${selectedSource === 'SSI' ? 'selected' : ''}>SSI</option>
          </select>

          <select id="report-tier-filter" class="admin-select" style="min-width:140px;">
            <option value="">Tất cả Gói</option>
            <option value="STANDARD" ${selectedTier === 'STANDARD' ? 'selected' : ''}>Standard</option>
            <option value="SILVER" ${selectedTier === 'SILVER' ? 'selected' : ''}>PRO (Silver)</option>
            <option value="GOLD" ${selectedTier === 'GOLD' ? 'selected' : ''}>VIP (Gold)</option>
            <option value="DIAMOND" ${selectedTier === 'DIAMOND' ? 'selected' : ''}>Diamond</option>
          </select>

          <select id="report-status-filter" class="admin-select" style="min-width:130px;">
            <option value="">Tất cả Trạng thái</option>
            <option value="PUBLISHED" ${selectedStatus === 'PUBLISHED' ? 'selected' : ''}>Xuất bản</option>
            <option value="DRAFT" ${selectedStatus === 'DRAFT' ? 'selected' : ''}>Bản nháp</option>
          </select>

          <button class="admin-btn" id="btn-reset-report-filters" style="background:rgba(255,255,255,0.05); color:var(--text-muted); border:1px solid var(--purple-border);" title="Đặt lại bộ lọc">
            🔄
          </button>
        </div>

        <!-- Table Container matching User Page Header & Theme -->
        <div class="admin-table-container">
          <table class="admin-table" style="width:100%; border-collapse:collapse; table-layout:auto;">
            <thead>
              <tr style="background:#2b3c58; color:#ffffff;">
                <th style="width:40px; text-align:center; white-space:nowrap !important;"><input type="checkbox" id="chk-all-reports" /></th>
                <th style="width:65px; min-width:65px; text-align:center; white-space:nowrap !important; word-break:keep-all !important; padding:10px 4px !important;">STT</th>
                <th style="width:140px; min-width:140px; text-align:center; white-space:nowrap !important;">Phân loại</th>
                <th style="width:130px; min-width:130px; text-align:center; white-space:nowrap !important;">Mã / Ngành</th>
                <th class="col-content" style="text-align:left;">Nội dung bài báo cáo</th>
                <th style="width:130px; min-width:130px; text-align:center; white-space:nowrap !important; word-break:keep-all !important;">Ngày PH</th>
                <th style="width:110px; min-width:110px; text-align:center; white-space:nowrap !important;">Nguồn</th>
                <th style="width:120px; min-width:120px; text-align:center; white-space:nowrap !important;">Yêu cầu Gói</th>
                <th style="width:110px; min-width:110px; text-align:center; white-space:nowrap !important;">Trạng thái</th>
                <th style="width:130px; min-width:130px; text-align:center; white-space:nowrap !important;">Thao tác</th>
              </tr>
            </thead>
            <tbody id="reports-tbody">
              <tr><td colspan="10" style="text-align:center; padding:2rem;"><div class="admin-spinner"></div> Đang tải dữ liệu báo cáo...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = container.querySelector('#reports-tbody');

    // Tab switching
    container.querySelectorAll('.rep-tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.rep-tab-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        loadReports(tbody);
      });
    });

    // Search & Filters
    const searchInput = container.querySelector('#report-search-input');
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchKeyword = e.target.value.trim();
        loadReports(tbody);
      }, 300);
    });

    container.querySelector('#report-source-filter').addEventListener('change', (e) => {
      selectedSource = e.target.value;
      loadReports(tbody);
    });

    container.querySelector('#report-tier-filter').addEventListener('change', (e) => {
      selectedTier = e.target.value;
      loadReports(tbody);
    });

    container.querySelector('#report-status-filter').addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      loadReports(tbody);
    });

    container.querySelector('#btn-reset-report-filters').addEventListener('click', () => {
      searchKeyword = '';
      selectedSource = '';
      selectedTier = '';
      selectedStatus = '';
      searchInput.value = '';
      container.querySelector('#report-source-filter').value = '';
      container.querySelector('#report-tier-filter').value = '';
      container.querySelector('#report-status-filter').value = '';
      loadReports(tbody);
    });

    // Add Report Button
    container.querySelector('#btn-add-report').addEventListener('click', () => {
      showReportModal(null, tbody);
    });

    // Delete Selected Reports
    container.querySelector('#btn-delete-selected-reports').addEventListener('click', async () => {
      const checked = container.querySelectorAll('.chk-rep-item:checked');
      if (checked.length === 0) {
        showToast('Vui lòng chọn ít nhất một báo cáo để xóa.', 'error');
        return;
      }
      const ids = Array.from(checked).map(c => c.value);
      if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} bài báo cáo đã chọn?`)) return;

      try {
        if (API()) {
          await Promise.all(ids.map(id => API().delete(`/admin/reports/${id}`).catch(() => null)));
        }
        // Sync local storage state
        let currentList = getStoredReports();
        currentList = currentList.filter(r => !ids.includes(String(r.id)));
        saveStoredReports(currentList);

        showToast(`Đã xóa thành công ${ids.length} bài báo cáo!`);
        loadReports(tbody);
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa bài báo cáo', 'error');
      }
    });

    // Select all checkboxes
    container.querySelector('#chk-all-reports').addEventListener('change', (e) => {
      container.querySelectorAll('.chk-rep-item').forEach(chk => {
        chk.checked = e.target.checked;
      });
    });

    // Initial Load
    await loadReports(tbody);
  },

  destroy() {}
};

async function loadReports(tbody) {
  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:2rem;"><div class="admin-spinner"></div></td></tr>';

  try {
    let apiData = null;
    if (API()) {
      try {
        const res = await API().get('/admin/reports?limit=100');
        apiData = res.data || res || [];
      } catch (err) {
        console.warn('API /admin/reports failed, fallback to stored local data:', err);
      }
    }

    if (Array.isArray(apiData) && apiData.length > 0) {
      // Map API reports to UI format
      reportsList = apiData.map(r => ({
        id: r.id,
        category: r.reportType === 'MACRO_SUMMARY' || r.reportType === 'SECTOR' ? 'nganh-vimo' : 'doanh-nghiep',
        symbol: r.symbol || r.title.split(' ')[0] || 'FINTOP',
        title: r.title,
        publishedAt: r.publishedAt ? r.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        source: r.source || 'FINTOP',
        fileUrl: r.fileUrl || '#',
        minTierAccess: r.minTierAccess || 'STANDARD',
        status: r.status || 'PUBLISHED'
      }));
    } else {
      reportsList = getStoredReports();
    }

    // Filter list
    let filtered = reportsList.filter(r => {
      if (currentCategory !== 'ALL' && r.category !== currentCategory) return false;
      if (selectedSource && (r.source || '').toUpperCase() !== selectedSource.toUpperCase()) return false;
      if (selectedTier && (r.minTierAccess || 'STANDARD').toUpperCase() !== selectedTier.toUpperCase()) return false;
      if (selectedStatus && (r.status || 'PUBLISHED').toUpperCase() !== selectedStatus.toUpperCase()) return false;

      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const symMatch = (r.symbol || '').toLowerCase().includes(kw);
        const titleMatch = (r.title || '').toLowerCase().includes(kw);
        const sourceMatch = (r.source || '').toLowerCase().includes(kw);
        if (!symMatch && !titleMatch && !sourceMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; color:var(--text-muted); padding:2.5rem;">
            Không tìm thấy báo cáo nào khớp với bộ lọc.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((rep, idx) => {
      const isDn = rep.category === 'doanh-nghiep';
      const catLabel = isDn ? 'Doanh nghiệp' : 'Ngành & Vĩ mô';
      const catBadgeBg = isDn ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      const catBadgeColor = isDn ? '#c084fc' : '#60a5fa';

      const formattedDate = formatDateDisplay(rep.publishedAt);

      return `
        <tr data-repid="${rep.id}">
          <td style="text-align:center; vertical-align:middle; white-space:nowrap;">
            <input type="checkbox" class="chk-rep-item" value="${rep.id}" />
          </td>
          <td style="text-align:center; vertical-align:middle; font-weight:700; color:var(--text-muted); white-space:nowrap !important; padding:8px 4px !important;">${idx + 1}</td>
          <td style="text-align:center; vertical-align:middle; white-space:nowrap;">
            <span class="admin-badge" style="background:${catBadgeBg}; color:${catBadgeColor}; border:1px solid ${catBadgeColor}33; white-space:nowrap;">
              ${catLabel}
            </span>
          </td>
          <td style="text-align:center; vertical-align:middle; font-weight:800; color:#c084fc; font-size:0.95rem; white-space:nowrap;">
            ${esc(formatReportSymbol(rep.symbol, rep.category) || '—')}
          </td>
          <td class="col-content" style="vertical-align:middle; font-weight:600; color:#f8fafc; text-align:left;">
            ${esc(rep.title)}
          </td>
          <td style="text-align:center; vertical-align:middle; font-weight:600; white-space:nowrap;">
            ${formattedDate}
          </td>
          <td style="text-align:center; vertical-align:middle; font-weight:700; color:#f8fafc; white-space:nowrap;">
            ${esc(rep.source || 'FINTOP')}
          </td>
          <td style="text-align:center; vertical-align:middle; white-space:nowrap;">
            ${tierBadge(rep.minTierAccess || 'STANDARD')}
          </td>
          <td style="text-align:center; vertical-align:middle; white-space:nowrap;">
            ${statusBadge(rep.status || 'PUBLISHED')}
          </td>
          <td style="text-align:center; vertical-align:middle; white-space:nowrap;">
            <div style="display:flex; gap:0.35rem; justify-content:center;">
              <a href="${esc(rep.fileUrl || '#')}" target="_blank" class="admin-btn admin-btn-sm" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center;" title="Xem bài / Chi tiết">
                🔗
              </a>
              <button class="admin-btn admin-btn-sm btn-edit-rep" data-id="${rep.id}" style="background:#f97316; color:#fff; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center;" title="Sửa báo cáo">
                ✏️
              </button>
              <button class="admin-btn admin-btn-sm btn-del-rep" data-id="${rep.id}" style="background:#ef4444; color:#fff; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center;" title="Xóa báo cáo">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Edit Buttons
    tbody.querySelectorAll('.btn-edit-rep').forEach(btn => {
      btn.addEventListener('click', () => {
        const repId = btn.dataset.id;
        const rep = reportsList.find(r => String(r.id) === String(repId));
        if (rep) showReportModal(rep, tbody);
      });
    });

    // Bind Delete Buttons
    tbody.querySelectorAll('.btn-del-rep').forEach(btn => {
      btn.addEventListener('click', async () => {
        const repId = btn.dataset.id;
        const rep = reportsList.find(r => String(r.id) === String(repId));
        if (!rep) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa bài báo cáo: "${rep.title}"?`)) return;

        try {
          if (API()) {
            await API().delete(`/admin/reports/${repId}`).catch(() => null);
          }
          let currentList = getStoredReports();
          currentList = currentList.filter(r => String(r.id) !== String(repId));
          saveStoredReports(currentList);

          showToast('Xóa báo cáo thành công!');
          loadReports(tbody);
        } catch (err) {
          showToast(err.message || 'Lỗi khi xóa báo cáo', 'error');
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#ef4444; padding:2rem;">Lỗi tải dữ liệu: ${esc(err.message)}</td></tr>`;
  }
}

function showReportModal(rep, tbody) {
  const modalArea = document.getElementById('report-modal-area');
  if (!modalArea) return;

  const isEdit = !!rep;
  const defaultCategory = isEdit ? rep.category : (currentCategory === 'ALL' ? 'doanh-nghiep' : currentCategory);

  modalArea.innerHTML = `
    <div class="admin-modal-overlay" id="rep-modal-overlay" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:9999; backdrop-filter:blur(4px);">
      <div class="admin-modal" style="max-width:680px; width:92%; background:#151b2e; border-radius:12px; padding:1.75rem 2rem; border:1px solid rgba(168,85,247,0.3); position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.6);">
        
        <button class="admin-btn-close" id="btn-close-rep-modal" style="position:absolute; top:1.25rem; right:1.25rem; background:none; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer; font-weight:bold;">✕</button>
        
        <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:1.5rem; color:#fff; display:flex; align-items:center; gap:8px;">
          <span>${isEdit ? '✏️ Cập nhật Báo cáo' : '➕ Thêm Báo cáo Phân tích mới'}</span>
        </h2>
        
        <div class="admin-modal-body" style="display:flex; flex-direction:column; gap:1.1rem; max-height:75vh; overflow-y:auto; padding-right:4px;">
          
          <!-- Phân loại báo cáo -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Phân loại <span style="color:#ef4444;">*</span></label>
            <select id="modal-rep-category" class="admin-select" style="flex:1; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; padding:9px 12px;">
              <option value="doanh-nghiep" ${defaultCategory === 'doanh-nghiep' ? 'selected' : ''}>📊 Phân tích Doanh nghiệp</option>
              <option value="nganh-vimo" ${defaultCategory === 'nganh-vimo' ? 'selected' : ''}>🌐 Ngành & Vĩ mô</option>
            </select>
          </div>

          <!-- Mã cổ phiếu / Ngành -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Mã cổ phiếu / Ngành <span style="color:#ef4444;">*</span></label>
            <input type="text" id="modal-rep-symbol" class="admin-input" style="flex:1;" value="${isEdit && rep.symbol ? esc(rep.symbol) : ''}" placeholder="VD: FPT, QNS, VNM, Vĩ mô, Ngân hàng, Thép..." />
          </div>

          <!-- Tiêu đề / Nội dung báo cáo -->
          <div style="display:flex; align-items:flex-start;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem; margin-top:8px;">Nội dung bài báo cáo <span style="color:#ef4444;">*</span></label>
            <textarea id="modal-rep-title" class="admin-textarea" style="flex:1; min-height:70px;" placeholder="VD: Báo cáo phân tích doanh nghiệp QNS Q2/2026...">${isEdit && rep.title ? esc(rep.title) : ''}</textarea>
          </div>

          <!-- Ngày phát hành -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Ngày phát hành <span style="color:#ef4444;">*</span></label>
            <input type="date" id="modal-rep-date" class="admin-input" style="flex:1;" value="${isEdit && rep.publishedAt ? rep.publishedAt : new Date().toISOString().split('T')[0]}" />
          </div>

          <!-- Nguồn phát hành -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Nguồn phát hành <span style="color:#ef4444;">*</span></label>
            <input type="text" id="modal-rep-source" class="admin-input" style="flex:1;" value="${isEdit && rep.source ? esc(rep.source) : 'FINTOP'}" placeholder="VD: FINTOP, FPTS, Mirae, PHS, KBSV, VNDIRECT, SSI..." />
          </div>

          <!-- Link chi tiết / File PDF -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Link chi tiết / PDF <span style="color:#ef4444;">*</span></label>
            <input type="text" id="modal-rep-link" class="admin-input" style="flex:1;" value="${isEdit && rep.fileUrl ? esc(rep.fileUrl) : '#'}" placeholder="https://... hoặc /documents/baocao.pdf" />
          </div>

          <!-- Gói hội viên yêu cầu -->
          <div style="display:flex; align-items:center;">
            <label style="width:32%; font-weight:600; color:#cbd5e1; font-size:0.88rem;">Yêu cầu Gói hội viên</label>
            <select id="modal-rep-tier" class="admin-select" style="flex:1; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; padding:9px 12px;">
              <option value="STANDARD" ${!isEdit || rep.minTierAccess === 'STANDARD' ? 'selected' : ''}>Standard (Tất cả thành viên)</option>
              <option value="SILVER" ${isEdit && rep.minTierAccess === 'SILVER' ? 'selected' : ''}>PRO (Thành viên Silver/PRO trở lên)</option>
              <option value="GOLD" ${isEdit && rep.minTierAccess === 'GOLD' ? 'selected' : ''}>VIP (Thành viên Gold/VIP trở lên)</option>
              <option value="DIAMOND" ${isEdit && rep.minTierAccess === 'DIAMOND' ? 'selected' : ''}>Diamond (Thành viên Diamond)</option>
            </select>
          </div>

          <!-- Trạng thái xuất bản -->
          <div style="display:flex; align-items:center; padding-left:32%;">
            <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; color:#cbd5e1; font-size:0.9rem; font-weight:600;">
              <input type="checkbox" id="modal-rep-status" ${!isEdit || rep.status === 'PUBLISHED' ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
              Xuất bản bài báo cáo (PUBLISHED)
            </label>
          </div>

        </div>

        <div class="admin-modal-footer" style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem; margin-top:1.25rem;">
          <button class="admin-btn" id="btn-save-rep-modal" style="background:#7c3aed; color:#fff; font-weight:700; border-radius:8px; padding:9px 22px; border:none; cursor:pointer;">
            ${isEdit ? 'Cập Nhật Báo Cáo' : 'Tạo Báo Cáo Mới'}
          </button>
          <button class="admin-btn" id="btn-cancel-rep-modal" style="background:rgba(255,255,255,0.05); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:9px 20px; cursor:pointer;">
            Hủy Bỏ
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalArea.innerHTML = ''; };
  modalArea.querySelector('#btn-close-rep-modal').addEventListener('click', closeModal);
  modalArea.querySelector('#btn-cancel-rep-modal').addEventListener('click', closeModal);
  modalArea.querySelector('#rep-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'rep-modal-overlay') closeModal();
  });

  // Save Event Handler
  modalArea.querySelector('#btn-save-rep-modal').addEventListener('click', async (e) => {
    const category = modalArea.querySelector('#modal-rep-category').value;
    const symbol = modalArea.querySelector('#modal-rep-symbol').value.trim();
    const title = modalArea.querySelector('#modal-rep-title').value.trim();
    const publishedAt = modalArea.querySelector('#modal-rep-date').value;
    const source = modalArea.querySelector('#modal-rep-source').value.trim();
    const fileUrl = modalArea.querySelector('#modal-rep-link').value.trim();
    const minTierAccess = modalArea.querySelector('#modal-rep-tier').value;
    const status = modalArea.querySelector('#modal-rep-status').checked ? 'PUBLISHED' : 'DRAFT';

    if (!symbol) {
      showToast('Vui lòng nhập Mã cổ phiếu hoặc Tên Ngành.', 'error');
      return;
    }
    if (!title) {
      showToast('Vui lòng nhập Nội dung bài báo cáo.', 'error');
      return;
    }
    if (!source) {
      showToast('Vui lòng nhập Nguồn phát hành báo cáo.', 'error');
      return;
    }

    e.target.disabled = true;
    e.target.textContent = 'Đang lưu...';

    const payload = {
      category,
      symbol: formatReportSymbol(symbol, category),
      title,
      publishedAt,
      source,
      fileUrl: fileUrl || '#',
      minTierAccess,
      status,
      reportType: category === 'nganh-vimo' ? 'MACRO_SUMMARY' : 'COMPANY_ANALYSIS'
    };

    try {
      if (API()) {
        if (isEdit) {
          await API().patch(`/admin/reports/${rep.id}`, payload).catch(() => null);
        } else {
          await API().post('/admin/reports', payload).catch(() => null);
        }
      }

      // Sync local storage state
      let currentList = getStoredReports();
      if (isEdit) {
        currentList = currentList.map(r => String(r.id) === String(rep.id) ? { ...r, ...payload } : r);
      } else {
        const newId = Date.now();
        currentList.unshift({ id: newId, ...payload });
      }
      saveStoredReports(currentList);

      showToast(isEdit ? 'Cập nhật bài báo cáo thành công!' : 'Thêm báo cáo mới thành công!');
      closeModal();
      loadReports(tbody);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu bài báo cáo', 'error');
      e.target.disabled = false;
      e.target.textContent = isEdit ? 'Cập Nhật Báo Cáo' : 'Tạo Báo Cáo Mới';
    }
  });
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

function injectStyles() {
  if (document.getElementById('reports-custom-styles')) return;
  const style = document.createElement('style');
  style.id = 'reports-custom-styles';
  style.textContent = `
    .reports-segmented-tab .rep-tab-item {
      background: transparent;
      color: #94a3b8;
      border: none;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 7px 16px;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.25s ease;
      white-space: nowrap;
    }
    .reports-segmented-tab .rep-tab-item:hover {
      color: #fff;
    }
    .reports-segmented-tab .rep-tab-item.active {
      background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
      color: #ffffff !important;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.45);
    }
    table.admin-table th,
    table.admin-table td {
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
      padding: 10px 8px !important;
    }
    table.admin-table th.col-content,
    table.admin-table td.col-content {
      white-space: normal !important;
      word-break: break-word !important;
    }
  `;
  document.head.appendChild(style);
}
