/**
 * handbook.js — Investor Guides & Tutorials CMS Manager
 */
import { esc, showToast } from '../admin-shell.js';

let selectedTopicId = 'trading';
let localTopics = {};

function loadLocalTopics() {
  const cached = localStorage.getItem('fintop_handbook_topics');
  if (cached) {
    localTopics = JSON.parse(cached);
  } else {
    // If not loaded yet, we can set up standard defaults or try to fetch them
    localTopics = {
      trading: { label: "Giao dịch & Đầu tư", title: "Lộ trình giao dịch", intro: "Chọn cổ phiếu", lessons: [], checklist: [], rows: [] }
    };
  }
}

function saveLocalTopics() {
  localStorage.setItem('fintop_handbook_topics', JSON.stringify(localTopics));
  showToast('Đã lưu thay đổi cẩm nang thành công!', 'success');
}

export default {
  id: 'handbook',
  label: 'Cẩm nang nhà đầu tư',
  icon: '🏥',

  async render(container) {
    loadLocalTopics();

    container.innerHTML = `
      <div class="admin-portfolio-layout">
        <div class="admin-table-container" style="margin-bottom:1.5rem;">
          <div class="admin-table-toolbar">
            <div class="admin-table-title">📖 Quản trị Cẩm nang & Hướng dẫn</div>
            <div class="admin-table-actions">
              <select id="handbook-topic-select" class="admin-select" style="min-width:250px;">
                ${Object.keys(localTopics).map(k => `
                  <option value="${k}" ${k === selectedTopicId ? 'selected' : ''}>${esc(localTopics[k].label || k)}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <div id="handbook-editor-content"></div>
      </div>
    `;

    const selectEl = container.querySelector('#handbook-topic-select');
    selectEl.addEventListener('change', (e) => {
      selectedTopicId = e.target.value;
      renderEditor(container.querySelector('#handbook-editor-content'));
    });

    renderEditor(container.querySelector('#handbook-editor-content'));
  },

  destroy() {}
};

function renderEditor(contentEl) {
  const topic = localTopics[selectedTopicId];
  if (!topic) {
    contentEl.innerHTML = '<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Chủ đề không tồn tại</div></div>';
    return;
  }

  contentEl.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr; gap: 1.5rem;">
      <!-- Title & Intro Form -->
      <div class="admin-form-container" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:1.5rem; border-radius:8px;">
        <h3 style="font-size:1.1rem;margin-bottom:1rem;color:#fff;">ℹ️ Thông tin chung chủ đề</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Tên Tab hiển thị</label>
            <input type="text" id="topic-label" class="admin-input" style="width:100%;" value="${esc(topic.label)}">
          </div>
          <div>
            <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Tiêu đề chính (H2)</label>
            <input type="text" id="topic-title" class="admin-input" style="width:100%;" value="${esc(topic.title)}">
          </div>
        </div>
        <div style="margin-bottom:1rem;">
          <label class="admin-label" style="display:block;margin-bottom:0.25rem;">Mô tả ngắn lộ trình (Intro)</label>
          <textarea id="topic-intro" class="admin-input" style="width:100%; height:80px;">${esc(topic.intro)}</textarea>
        </div>
        <button class="admin-btn" id="save-topic-info-btn">Lưu thông tin chung</button>
      </div>

      <!-- Lessons Manager -->
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">📚 Danh sách bài học (${topic.lessons?.length || 0})</div>
          <div class="admin-table-actions">
            <button class="admin-btn admin-btn-sm" id="add-lesson-btn" style="background:var(--success);">➕ Thêm bài học</button>
          </div>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:30%;">Tên bài học</th>
              <th>Nội dung bài học</th>
              <th style="width:150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody id="lessons-tbody">
            ${(!topic.lessons || topic.lessons.length === 0) ? `
              <tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Chưa có bài học nào.</td></tr>
            ` : topic.lessons.map((l, index) => `
              <tr>
                <td><strong>${esc(l[0])}</strong></td>
                <td>${esc(l[1])}</td>
                <td>
                  <button class="admin-btn admin-btn-sm btn-edit-lesson" data-index="${index}" style="margin-right:0.25rem;">✏️ Sửa</button>
                  <button class="admin-btn admin-btn-sm btn-delete-lesson" data-index="${index}" style="background:var(--danger);">🗑️ Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Checklist Manager -->
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">✅ Checklist thực hành (${topic.checklist?.length || 0})</div>
          <div class="admin-table-actions">
            <button class="admin-btn admin-btn-sm" id="add-checklist-btn" style="background:var(--success);">➕ Thêm checklist</button>
          </div>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Mục checklist</th>
              <th style="width:150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody id="checklist-tbody">
            ${(!topic.checklist || topic.checklist.length === 0) ? `
              <tr><td colspan="2" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Chưa có checklist nào.</td></tr>
            ` : topic.checklist.map((c, index) => `
              <tr>
                <td>${esc(c)}</td>
                <td>
                  <button class="admin-btn admin-btn-sm btn-edit-checklist" data-index="${index}" style="margin-right:0.25rem;">✏️ Sửa</button>
                  <button class="admin-btn admin-btn-sm btn-delete-checklist" data-index="${index}" style="background:var(--danger);">🗑️ Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Application Table Manager -->
      <div class="admin-table-container">
        <div class="admin-table-toolbar">
          <div class="admin-table-title">📊 Bảng ứng dụng mẫu (${topic.rows?.length || 0})</div>
          <div class="admin-table-actions">
            <button class="admin-btn admin-btn-sm" id="add-row-btn" style="background:var(--success);">➕ Thêm dòng</button>
          </div>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Mã/Module</th>
              <th>Tín hiệu</th>
              <th>Hành động ứng dụng</th>
              <th style="width:150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody id="rows-tbody">
            ${(!topic.rows || topic.rows.length === 0) ? `
              <tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Chưa có dòng dữ liệu nào.</td></tr>
            ` : topic.rows.map((r, index) => `
              <tr>
                <td><strong>${esc(r[0])}</strong></td>
                <td><span class="admin-badge">${esc(r[1])}</span></td>
                <td>${esc(r[2])}</td>
                <td>
                  <button class="admin-btn admin-btn-sm btn-edit-row" data-index="${index}" style="margin-right:0.25rem;">✏️ Sửa</button>
                  <button class="admin-btn admin-btn-sm btn-delete-row" data-index="${index}" style="background:var(--danger);">🗑️ Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind save topic info
  contentEl.querySelector('#save-topic-info-btn').addEventListener('click', () => {
    topic.label = contentEl.querySelector('#topic-label').value;
    topic.title = contentEl.querySelector('#topic-title').value;
    topic.intro = contentEl.querySelector('#topic-intro').value;
    saveLocalTopics();
  });

  // Bind Lesson actions
  contentEl.querySelector('#add-lesson-btn').addEventListener('click', () => {
    const name = prompt('Nhập tên bài học:');
    if (!name) return;
    const desc = prompt('Nhập nội dung/mô tả bài học:');
    if (!desc) return;
    if (!topic.lessons) topic.lessons = [];
    topic.lessons.push([name, desc]);
    saveLocalTopics();
    renderEditor(contentEl);
  });

  contentEl.querySelectorAll('.btn-edit-lesson').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      const l = topic.lessons[idx];
      const name = prompt('Sửa tên bài học:', l[0]);
      if (!name) return;
      const desc = prompt('Sửa nội dung bài học:', l[1]);
      if (!desc) return;
      topic.lessons[idx] = [name, desc];
      saveLocalTopics();
      renderEditor(contentEl);
    });
  });

  contentEl.querySelectorAll('.btn-delete-lesson').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
        topic.lessons.splice(idx, 1);
        saveLocalTopics();
        renderEditor(contentEl);
      }
    });
  });

  // Bind Checklist actions
  contentEl.querySelector('#add-checklist-btn').addEventListener('click', () => {
    const text = prompt('Nhập mục checklist thực hành mới:');
    if (!text) return;
    if (!topic.checklist) topic.checklist = [];
    topic.checklist.push(text);
    saveLocalTopics();
    renderEditor(contentEl);
  });

  contentEl.querySelectorAll('.btn-edit-checklist').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      const text = prompt('Sửa mục checklist:', topic.checklist[idx]);
      if (!text) return;
      topic.checklist[idx] = text;
      saveLocalTopics();
      renderEditor(contentEl);
    });
  });

  contentEl.querySelectorAll('.btn-delete-checklist').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      if (confirm('Bạn có chắc chắn muốn xóa checklist này?')) {
        topic.checklist.splice(idx, 1);
        saveLocalTopics();
        renderEditor(contentEl);
      }
    });
  });

  // Bind Row actions
  contentEl.querySelector('#add-row-btn').addEventListener('click', () => {
    const symbol = prompt('Nhập Mã/Module:');
    if (!symbol) return;
    const signal = prompt('Nhập trạng thái/Tín hiệu:');
    if (!signal) return;
    const action = prompt('Nhập hành động demo:');
    if (!action) return;
    if (!topic.rows) topic.rows = [];
    topic.rows.push([symbol, signal, action]);
    saveLocalTopics();
    renderEditor(contentEl);
  });

  contentEl.querySelectorAll('.btn-edit-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      const r = topic.rows[idx];
      const symbol = prompt('Sửa Mã/Module:', r[0]);
      if (!symbol) return;
      const signal = prompt('Sửa trạng thái/Tín hiệu:', r[1]);
      if (!signal) return;
      const action = prompt('Sửa hành động demo:', r[2]);
      if (!action) return;
      topic.rows[idx] = [symbol, signal, action];
      saveLocalTopics();
      renderEditor(contentEl);
    });
  });

  contentEl.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      if (confirm('Bạn có chắc chắn muốn xóa dòng dữ liệu mẫu này?')) {
        topic.rows.splice(idx, 1);
        saveLocalTopics();
        renderEditor(contentEl);
      }
    });
  });
}
