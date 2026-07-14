import { esc, formatDate, showToast } from '../admin-shell.js';

const API = () => window.FintopInfra.ApiClient;
const EP = () => window.FintopInfra.FintopEnv.API_ENDPOINTS;

export default {
  id: 'profile',
  label: 'Thông tin cá nhân',
  icon: '👤',

  async render(container) {
    container.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div> Đang tải thông tin cá nhân...</div>';

    try {
      const currentUser = window.FintopInfra.AppState.getState('user') || {};
      if (!currentUser.id) {
        throw new Error('Không tìm thấy thông tin đăng nhập.');
      }

      const res = await API().get(EP().ADMIN_USER_DETAIL(currentUser.id));
      const u = res.data || res;

      const birthDate = u.dob ? new Date(u.dob).toISOString().split('T')[0] : '';
      const joinDate = u.joinDate ? new Date(u.joinDate).toISOString().split('T')[0] : '';
      const phone = u.phone || '';
      const address = u.address || '';
      const company = u.company || '';
      const position = u.position || '';
      const staffCode = u.staffCode || String(u.id);

      // Bulletproof avatar fallback to prevent broken images
      let avatarUrl = u.avatarUrl || u.avatar || '';
      const hasAvatar = !!avatarUrl && !avatarUrl.includes('avatar_default.png');

      container.innerHTML = `
        <!-- Embedded Local Styles to match screenshot exactly -->
        <style>
          .profile-container {
            display: flex;
            gap: 24px;
            margin-top: 1rem;
            flex-wrap: wrap;
          }
          .profile-left {
            flex: 2;
            min-width: 500px;
          }
          .profile-right {
            flex: 1;
            min-width: 300px;
          }
          .profile-card {
            background: #1d2440;
            border-radius: 8px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 24px;
          }
          .profile-card-header {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 12px;
          }
          .profile-section-title {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .profile-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .profile-form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .profile-form-group.full-width {
            grid-column: span 2;
          }
          .profile-form-group.third-width {
            grid-column: span 1;
          }
          @media (max-width: 768px) {
            .profile-form-grid {
              grid-template-columns: 1fr;
            }
            .profile-form-group.full-width, .profile-form-group.third-width {
              grid-column: span 1;
            }
          }
          .profile-label {
            font-size: 0.8rem;
            color: #94a3b8;
            font-weight: 500;
          }
          .profile-input {
            background: #171c30;
            border: 1px solid rgba(255,255,255,0.05);
            color: #fff;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 0.9rem;
            width: 100%;
            outline: none;
            box-sizing: border-box;
          }
          .profile-input:disabled {
            background: #111524;
            color: #64748b;
            border-color: rgba(255,255,255,0.02);
            cursor: not-allowed;
          }
          .profile-input:not(:disabled) {
            background: #2d3748;
            border-color: rgba(255,255,255,0.1);
          }
          .profile-right-card {
            background: #1d2440;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            overflow: hidden;
            text-align: center;
            padding-bottom: 32px;
          }
          .profile-bg-header {
            height: 140px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            position: relative;
          }
          .profile-avatar-container {
            margin-top: -70px;
            position: relative;
            display: inline-block;
          }
          .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #1d2440;
            background: #2d3748;
          }
          .profile-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #fff;
            margin-top: 16px;
            margin-bottom: 8px;
          }
          .profile-meta-text {
            font-size: 0.9rem;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          .profile-highlight-red {
            color: #f43f5e;
            font-weight: 600;
          }
          /* Premium Referral Styles */
          .ref-link-card {
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 18px;
            margin: 20px 24px 0 24px;
            text-align: left;
            box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.03);
          }
          .ref-link-title {
            font-size: 0.75rem;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .ref-link-input-group {
            display: flex;
            background: #0d1222;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            overflow: hidden;
            align-items: center;
            padding: 2px;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .ref-link-input-group:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
          }
          .ref-link-value {
            flex: 1;
            border: none;
            background: transparent;
            color: #60a5fa;
            font-weight: 600;
            font-size: 0.8rem;
            padding: 8px 10px;
            outline: none;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
            word-break: break-all;
            line-height: 1.4;
          }
          .ref-link-value:hover {
            color: #93c5fd;
            text-decoration: underline;
          }
          .ref-link-btn {
            background: #1e293b;
            border: none;
            border-radius: 6px;
            color: #fff;
            padding: 8px 12px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            margin: 2px;
            align-self: center;
          }
          .ref-link-btn:hover {
            background: #334155;
          }
          .ref-link-btn:active {
            transform: scale(0.97);
          }
          .btn-blue {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-blue:hover {
            background: #1d4ed8;
          }
          .btn-orange {
            background: #d97706;
            color: #fff;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
          }
          .btn-orange:hover {
            background: #b45309;
          }
          .btn-green {
            background: #10b981;
            color: #fff;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
          }
          .btn-green:hover {
            background: #059669;
          }
          .btn-cancel-profile {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-cancel-profile:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        </style>

        <div class="profile-container">
          <!-- Left Column: Form Info -->
          <div class="profile-left">
            <div class="profile-card">
              <div class="profile-card-header">
                <button class="btn-blue" id="btn-profile-change-pass">🔑 Đổi mật khẩu</button>
                <button class="btn-orange" id="btn-profile-edit-toggle">✏️ Chỉnh sửa</button>
                <button class="btn-green" id="btn-profile-save" style="display:none;">💾 Lưu thay đổi</button>
                <button class="btn-cancel-profile" id="btn-profile-cancel" style="display:none;">Hủy</button>
              </div>

              <div class="profile-section-title">Thông tin người dùng</div>
              <div class="profile-form-grid">
                <div class="profile-form-group">
                  <label class="profile-label">Tên</label>
                  <input disabled class="profile-input" type="text" id="prof-fullname" value="${esc(u.fullName)}" />
                </div>
                <div class="profile-form-group">
                  <label class="profile-label">Địa chỉ Email</label>
                  <input disabled class="profile-input" type="email" id="prof-email" value="${esc(u.email)}" />
                </div>
                <div class="profile-form-group">
                  <label class="profile-label">Ngày sinh</label>
                  <input disabled class="profile-input" type="date" id="prof-dob" value="${birthDate}" />
                </div>
                <div class="profile-form-group">
                  <label class="profile-label">Số điện thoại</label>
                  <input disabled class="profile-input" type="text" id="prof-phone" value="${esc(phone)}" />
                </div>
              </div>

              <div class="profile-section-title">Thông tin liên lạc</div>
              <div class="profile-form-grid">
                <div class="profile-form-group full-width">
                  <label class="profile-label">Địa chỉ</label>
                  <input disabled class="profile-input" type="text" id="prof-address" value="${esc(address)}" />
                </div>
                <div class="profile-form-group third-width">
                  <label class="profile-label">Công ty</label>
                  <input disabled class="profile-input" type="text" id="prof-company" value="${esc(company)}" />
                </div>
                <div class="profile-form-group third-width">
                  <label class="profile-label">Chức vụ</label>
                  <input disabled class="profile-input" type="text" id="prof-position" value="${esc(position)}" />
                </div>
                <div class="profile-form-group third-width">
                  <label class="profile-label">Gia nhập ngày</label>
                  <input disabled class="profile-input" type="date" value="${joinDate}" />
                </div>
              </div>

              <!-- Avatar Uploader (Only visible in edit mode) -->
              <div class="profile-form-group full-width" id="prof-avatar-uploader-area" style="display:none; margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.5rem;">
                <label class="profile-label" style="font-weight:bold; margin-bottom:8px;">Thay đổi ảnh đại diện</label>
                <div>
                  <button type="button" class="admin-btn admin-btn-secondary" id="btn-profile-select-avatar" style="background:#fff; color:#000; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;">Chọn ảnh mới</button>
                  <input type="file" id="input-profile-avatar-file" accept="image/*" style="display:none;" />
                </div>
              </div>

            </div>
          </div>

          <!-- Right Column: Avatar & Summary -->
          <div class="profile-right">
            <div class="profile-right-card">
              <div class="profile-bg-header"></div>
              <div class="profile-avatar-container">
                <img src="${esc(avatarUrl)}" class="profile-avatar" id="img-profile-avatar-display" alt="Avatar" style="display: ${hasAvatar ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('profile-avatar-fallback').style.display='flex';">
                <div id="profile-avatar-fallback" style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); display: ${hasAvatar ? 'none' : 'flex'}; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 700; color: #fff; border: 4px solid #1d2440; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                  ${u.fullName ? u.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'US'}
                </div>
              </div>
              <div class="profile-name" id="text-profile-name-display">${esc(u.fullName)}</div>
              <div class="profile-meta-text">ID hội viên: <span class="profile-highlight-red">#${esc(u.id)}</span></div>
              ${staffCode ? `
                <div class="profile-meta-text">ID nhân sự: <span style="color: #ffb200; font-weight: 700;">${esc(staffCode)}</span></div>
                
                <div class="ref-link-card">
                  <div class="ref-link-title">
                    <span>Link giới thiệu</span>
                  </div>
                  <div class="ref-link-input-group">
                    <a href="${window.location.origin}/?ref=${esc(staffCode)}" target="_blank" class="ref-link-value" title="Mở link đăng ký" id="prof-reflink-anchor">
                      https://fintopdata.vn/dangky/${esc(staffCode)}
                    </a>
                    <button class="ref-link-btn" id="btn-copy-reflink" title="Copy link giới thiệu">
                      <span>📋 Copy</span>
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Password Change Modal Area -->
        <div id="prof-change-pass-modal-area"></div>
      `;

      // ── BIND EVENT LISTENERS ──

      const editToggleBtn = container.querySelector('#btn-profile-edit-toggle');
      const saveBtn = container.querySelector('#btn-profile-save');
      const cancelBtn = container.querySelector('#btn-profile-cancel');
      const uploaderArea = container.querySelector('#prof-avatar-uploader-area');
      const editableInputs = container.querySelectorAll('#prof-fullname, #prof-dob, #prof-phone, #prof-address, #prof-company, #prof-position');
      const imgAvatarDisplay = container.querySelector('#img-profile-avatar-display');
      const nameDisplay = container.querySelector('#text-profile-name-display');

      let currentAvatarUrl = u.avatarUrl || u.avatar || '';

      // Toggle Edit Mode
      editToggleBtn.addEventListener('click', () => {
        editableInputs.forEach(input => input.disabled = false);
        editToggleBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        uploaderArea.style.display = 'block';
      });

      // Cancel Edit
      cancelBtn.addEventListener('click', () => {
        editableInputs.forEach(input => input.disabled = true);
        editToggleBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        uploaderArea.style.display = 'none';
        
        // Reset values
        container.querySelector('#prof-fullname').value = u.fullName;
        container.querySelector('#prof-dob').value = birthDate;
        container.querySelector('#prof-phone').value = phone;
        container.querySelector('#prof-address').value = address;
        container.querySelector('#prof-company').value = company;
        container.querySelector('#prof-position').value = position;
        imgAvatarDisplay.src = avatarUrl;
        imgAvatarDisplay.style.display = hasAvatar ? 'block' : 'none';
        const fallbackEl = container.querySelector('#profile-avatar-fallback');
        if (fallbackEl) fallbackEl.style.display = hasAvatar ? 'none' : 'flex';
        currentAvatarUrl = u.avatarUrl || u.avatar || '';
      });

      // Avatar File Uploader
      const btnSelectAvatar = container.querySelector('#btn-profile-select-avatar');
      const inputAvatarFile = container.querySelector('#input-profile-avatar-file');

      btnSelectAvatar.addEventListener('click', () => {
        inputAvatarFile.click();
      });

      inputAvatarFile.addEventListener('change', async () => {
        const file = inputAvatarFile.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('upload', file);

        try {
          showToast('Đang tải ảnh lên...');
          const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
          const response = await fetch('/blogs/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          if (!response.ok) throw new Error('Không thể tải ảnh lên');
          const result = await response.json();
          currentAvatarUrl = result.url;
          imgAvatarDisplay.src = result.url;
          imgAvatarDisplay.style.display = 'block';
          const fallbackEl = container.querySelector('#profile-avatar-fallback');
          if (fallbackEl) fallbackEl.style.display = 'none';
          showToast('Tải ảnh lên thành công!');
        } catch (err) {
          showToast(err.message || 'Lỗi tải ảnh lên', 'error');
        }
      });

      // Save changes
      saveBtn.addEventListener('click', async () => {
        const payload = {
          fullName: container.querySelector('#prof-fullname').value,
          birthDate: container.querySelector('#prof-dob').value,
          phone: container.querySelector('#prof-phone').value,
          address: container.querySelector('#prof-address').value,
          company: container.querySelector('#prof-company').value,
          position: container.querySelector('#prof-position').value,
          avatarUrl: currentAvatarUrl,
        };

        saveBtn.disabled = true;
        try {
          await API().patch(EP().ADMIN_USER_DETAIL(u.id), payload);
          
          // Update local AppState user name/avatar if it was the logged in user
          const updatedUser = { ...currentUser, fullName: payload.fullName, avatarUrl: payload.avatarUrl };
          window.FintopInfra.AppState.setState('user', updatedUser);
          
          showToast('Đã cập nhật thông tin cá nhân thành công!');
          
          // Reload page
          this.render(container);
          
          // Update shell header user badge
          const badgeNameEl = document.querySelector('.admin-user-name');
          const badgeAvatarEl = document.querySelector('.admin-user-avatar');
          if (badgeNameEl) badgeNameEl.textContent = payload.fullName;
          if (badgeAvatarEl) {
            const initials = payload.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            badgeAvatarEl.textContent = initials;
          }
        } catch (err) {
          showToast(err.message || 'Lỗi cập nhật', 'error');
          saveBtn.disabled = false;
        }
      });

      // Change Password Trigger
      container.querySelector('#btn-profile-change-pass').addEventListener('click', () => {
        showChangePasswordModal(u.id, u.fullName);
      });

      // Copy Referral Link Event Listener
      const copyRefBtn = container.querySelector('#btn-copy-reflink');
      if (copyRefBtn && staffCode) {
        copyRefBtn.addEventListener('click', () => {
          const cleanRefLink = `https://fintopdata.vn/dangky/${staffCode}`;
          navigator.clipboard.writeText(cleanRefLink).then(() => {
            copyRefBtn.textContent = '✅ Đã copy!';
            setTimeout(() => { copyRefBtn.textContent = '📋 Copy'; }, 2000);
          }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = cleanRefLink;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copyRefBtn.textContent = '✅ Đã copy!';
            setTimeout(() => { copyRefBtn.textContent = '📋 Copy'; }, 2000);
          });
        });
      }

    } catch (err) {
      container.innerHTML = `<div class="admin-empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi tải thông tin</div><div class="empty-desc">${esc(err.message)}</div></div>`;
    }
  },

  destroy() {}
};

function showChangePasswordModal(userId, fullName) {
  const modalArea = document.getElementById('prof-change-pass-modal-area');
  if (!modalArea) return;

  modalArea.innerHTML = `
    <div class="admin-modal-overlay" id="change-pass-overlay">
      <div class="admin-modal" style="max-width:400px; margin-top: 10%;">
        <div class="admin-modal-header">
          <h3>🔑 Đổi mật khẩu cá nhân</h3>
          <button class="admin-btn admin-btn-secondary admin-btn-sm" id="btn-close-change-pass">✕</button>
        </div>
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label class="profile-label" style="margin-bottom:6px;">Mật khẩu mới cho tài khoản của bạn</label>
            <input type="password" class="admin-input" id="change-pass-input" placeholder="Nhập mật khẩu mới..." style="background:#fff; color:#000; padding:10px; border-radius:6px; border:1px solid #ccc; width:100%;" />
          </div>
        </div>
        <div class="admin-modal-footer" style="display:flex; justify-content:space-between; margin-top:15px;">
          <button class="admin-btn admin-btn-secondary" id="btn-cancel-change-pass">Hủy</button>
          <button class="admin-btn admin-btn-primary" id="btn-save-change-pass" style="background:#3b82f6; color:#fff;">Lưu mật khẩu</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalArea.innerHTML = ''; };
  modalArea.querySelector('#btn-close-change-pass').addEventListener('click', closeModal);
  modalArea.querySelector('#btn-cancel-change-pass').addEventListener('click', closeModal);
  modalArea.querySelector('#change-pass-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'change-pass-overlay') closeModal();
  });

  modalArea.querySelector('#btn-save-change-pass').addEventListener('click', async () => {
    const newPassword = modalArea.querySelector('#change-pass-input').value;
    if (!newPassword || newPassword.trim().length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    try {
      await API().patch(EP().ADMIN_USER_DETAIL(userId), { password: newPassword });
      showToast('Đổi mật khẩu thành công!');
      closeModal();
    } catch (err) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error');
    }
  });
}
