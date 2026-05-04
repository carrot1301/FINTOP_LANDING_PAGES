# 🚀 FinTop DATA — Tài Liệu Kỹ Thuật Dự Án Landing Page

> Phiên bản: 2026-05-04 | Dành cho: Đội IT nội bộ

---

## 1. TỔNG QUAN DỰ ÁN

| Hạng mục | Chi tiết |
|---|---|
| **Tên dự án** | FinTop DATA — Landing Page (Web Fintech) |
| **Phong cách** | Dark Premium · Tím thạch anh · Gold accent |
| **Công nghệ** | HTML5 + CSS3 (inline) + Vanilla JS + GSAP ScrollTrigger |
| **Hosting** | GitHub Pages / Static web server |
| **Mục tiêu** | Nhà đầu tư thế hệ mới — Data + AI + Chuyên gia |

---

## 2. CẤU TRÚC THƯ MỤC

```
f:\FT\
├── index.html                    ← Trang chủ (file chính, ~2700 dòng)
│                                    Bao gồm: inline CSS + inline JS + HTML
│
├── assets/                       ← Tài nguyên tĩnh
│   ├── css/
│   │   ├── variables.css         ← Biến CSS toàn cục (màu sắc, font, kích thước)
│   │   ├── base.css              ← Kiểu dáng nền tảng (reset, body, typography)
│   │   ├── components.css        ← Thành phần UI tái sử dụng (header, card, table, footer)
│   │   └── pages/                ← CSS riêng cho từng trang con (nếu có)
│   ├── js/
│   │   ├── scroll-animation.js   ← Hiệu ứng cuộn điện ảnh (GSAP ScrollTrigger)
│   │   ├── counter.js            ← Hiệu ứng đếm số thống kê
│   │   └── table.js              ← Popup hướng dẫn sử dụng bảng dữ liệu
│   ├── images/                   ← Hình ảnh (logo, avatar đội ngũ, icon)
│   ├── fonts/
│   │   └── Propins/              ← Font chữ tùy chỉnh
│   └── videos/
│       └── Smooth_transition_between_*.mp4  ← Video nền trang chủ (65MB)
│
├── chuyen-gia/index.html         ← Trang Chuyên gia (placeholder)
├── fintop-ai/index.html          ← Trang FinTop AI (placeholder)
├── fintop-data/                  ← Trang FinTop Data
│   ├── index.html                ← Trang chính FinTop Data (có bảng dữ liệu)
│   ├── bo-loc/index.html         ← Bộ lọc cổ phiếu
│   ├── tin-hieu/index.html       ← Tín hiệu từ chuyên gia
│   └── danh-muc/index.html       ← Danh mục chuyên gia
├── hoi-vien/index.html           ← Trang Hội viên (placeholder)
├── huong-dan/index.html          ← Trang Hướng dẫn (placeholder)
├── stock-data/index.html         ← Trang Stock Data (placeholder)
│
├── docs/                         ← Tài liệu nội bộ
│   └── quant_proposal.tex        ← Đề xuất phân tích định lượng (LaTeX)
├── _dev_scripts/                 ← Script phát triển/sửa lỗi (không deploy)
│   ├── final_fix.py
│   └── fix_about_footer.ps1
│
├── FinTop_DATA_LandingPage_Spec.md  ← Tài liệu kỹ thuật này
└── README.md                     ← Hướng dẫn nhanh cho đội IT
```

---

## 3. LUỒNG THỰC THI TRANG CHỦ (`index.html`)

### 3.1 Khi trình duyệt tải trang

```
1. Tải HTML → Bắt đầu render <head>
2. Tải CSS bên ngoài (theo thứ tự):
   ├── variables.css   → Biến CSS toàn cục
   ├── base.css        → Reset + Typography
   └── components.css  → Thành phần UI chung
3. Tải CSS inline (<style> trong <head>)
   → Chứa TẤT CẢ kiểu dáng chính cho trang chủ
   → Khoảng 1700 dòng CSS: video nền, header, mega menu,
     bảng dữ liệu, biểu đồ, hiệu ứng cuộn, pricing, team, footer
4. Tải JS bên ngoài (defer — chờ DOM load xong):
   ├── gsap.min.js         → Thư viện hiệu ứng GSAP
   ├── ScrollTrigger.min.js → Plugin cuộn GSAP
   ├── scroll-animation.js → Hiệu ứng chuyển cảnh
   └── counter.js          → Đếm số thống kê
5. Render <body> HTML
6. Thực thi JS inline (<script> cuối <body>)
   → Chứa TOÀN BỘ logic ứng dụng (~400 dòng)
```

### 3.2 Cấu trúc HTML trong `<body>`

```
<body>
├── VIDEO NỀN CỐ ĐỊNH (autoplay loop muted)
│   └── Overlay tối 40%
│
├── THANH ĐIỀU HƯỚNG (fixed top)
│   ├── Logo FinTop DATA
│   ├── Menu: Trang chủ | Hội viên | FinTop Data ▼ | Chuyên gia ▼ | ...
│   └── Nút: Ngôn ngữ | Tài khoản | Bắt đầu
│
├── PANEL TRA CỨU CỔ PHIẾU (ẩn, hiện khi click menu)
│   ├── Thanh tìm kiếm mã CP
│   ├── Bảng lịch sử tra cứu (10 mã gần nhất)
│   └── Biểu đồ giá FireAnt (widget nhúng)
│
├── PANEL BỘ LỌC CỔ PHIẾU (ẩn, hiện khi click menu)
│   ├── Hướng dẫn sử dụng
│   ├── Bảng dữ liệu kỹ thuật (fetch từ Google Sheets)
│   ├── Biểu đồ kỹ thuật FireAnt
│   └── Miễn trừ trách nhiệm
│
├── VÙNG CUỘN HIỆU ỨNG ĐIỆN ẢNH (#cinematic-container)
│   ├── Scene 1: Hero — "Kỷ Nguyên Đầu Tư Cùng FinTop DATA"
│   │   ├── Tiêu đề + Mô tả + CTA
│   │   └── Widget giả lập FinTop AI
│   └── Scene 2: Tính năng — 3 cột (DATA / CHUYÊN GIA / AI)
│
├── TRÌNH DIỄN GIAO DIỆN TERMINAL (Product Showcase)
│
├── THỐNG KÊ SỐ LIỆU (Stats) — Đếm số khi cuộn tới
│
├── BẢNG GIÁ HỘI VIÊN (Pricing) — 4 gói: Standard/Pro/VIP/Diamond
│
├── ĐỘI NGŨ CHUYÊN GIA (Team) — 5 thành viên, 3 hàng
│
├── GIỚI THIỆU FINTOP (About) — Mô tả + 5 lĩnh vực
│
├── ĐÁNH GIÁ TỪ NGƯỜI DÙNG (Testimonials) — 3 thẻ
│
├── CTA CUỐI TRANG + FOOTER
│
└── <script> INLINE — Logic ứng dụng chính
```

### 3.3 Các hàm JavaScript quan trọng (inline trong `<script>`)

| Hàm | Mục đích |
|-----|----------|
| `openPanel(panelId, link)` | Mở panel Tra cứu/Bộ lọc, đóng panel khác |
| `closeAllPanels()` | Đóng tất cả panel |
| `toggleDropdownPin(id)` | Ghim/bỏ ghim dropdown menu |
| `searchStock()` | Tìm kiếm cổ phiếu theo mã |
| `loadChart(ticker, target)` | Tải biểu đồ FireAnt cho mã CP |
| `renderFireAntWidget(ticker, target)` | Render widget biểu đồ giá |
| `getChartTarget(target)` | Xác định biểu đồ đích (tracuu/boloc) |
| `getChartConfig(target)` | Lấy config biểu đồ theo panel |
| `loadFireAntScript(callback)` | Nạp thư viện FireAnt (lazy load) |

---

## 4. HỆ THỐNG MÀU SẮC

### Chế độ Tối (Trang chủ)
| Biến | Giá trị | Mô tả |
|------|---------|-------|
| `--bg-primary` | `#0A0A0F` | Nền chính — đen tuyệt đối |
| `--purple-core` | `#7C3AED` | Tím thạch anh — màu chủ đạo |
| `--purple-glow` | `#A855F7` | Tím sáng — highlight |
| `--gold-primary` | `#F59E0B` | Vàng gold — accent |
| `--text-primary` | `#F8FAFC` | Chữ trắng |
| `--text-secondary` | `#94A3B8` | Chữ xám nhạt |

### Màu trạng thái cổ phiếu
| Trạng thái | Màu | Biến CSS |
|------------|-----|----------|
| RẤT TÍCH CỰC | Xanh lá `#10B981` | `--status-very-pos` |
| TÍCH CỰC | Xanh nhạt `#34D399` | `--status-pos` |
| KHẢ QUAN | Xanh dương `#60A5FA` | `--status-ok` |
| TRUNG LẬP | Xám `#94A3B8` | `--status-neutral` |
| KHÔNG TÍCH CỰC | Vàng `#FBBF24` | `--status-neg-light` |
| TIÊU CỰC | Đỏ `#F87171` | `--status-neg` |

---

## 5. PHỤ THUỘC BÊN NGOÀI

| Thư viện | Phiên bản | Mục đích | CDN |
|----------|-----------|----------|-----|
| GSAP | 3.12.5 | Hiệu ứng cuộn điện ảnh | cdnjs |
| ScrollTrigger | 3.12.5 | Plugin cuộn GSAP | cdnjs |
| Google Fonts | — | Be Vietnam Pro, Plus Jakarta Sans, Poppins | Google |
| FireAnt Widget | — | Biểu đồ giá cổ phiếu | fireant.vn |

---

## 6. NGUỒN DỮ LIỆU

| Dữ liệu | Nguồn | Cách lấy |
|----------|-------|----------|
| Bảng bộ lọc cổ phiếu | Google Sheets | Fetch CSV qua URL công khai |
| Biểu đồ giá | FireAnt Widget API | Nhúng widget JS |
| Thông tin mã CP | Inline JS (hardcoded) | Tìm kiếm trong mảng |

---

## 7. HƯỚNG DẪN BẢO TRÌ

### 7.1 Thêm/sửa nội dung
- Mọi nội dung hiển thị nằm trong `index.html`
- Tìm kiếm theo từ khóa tiếng Việt để tìm vị trí cần sửa
- **KHÔNG tách inline CSS/JS ra file riêng** — sẽ phá vỡ logic

### 7.2 Cập nhật biểu đồ
- Biểu đồ lấy từ FireAnt (fireant.vn)
- Mã cổ phiếu mặc định: VN30
- Hàm `loadChart()` xử lý việc tải biểu đồ mới

### 7.3 Cập nhật dữ liệu bảng
- Bảng bộ lọc đọc từ Google Sheets
- URL nguồn dữ liệu nằm trong hàm `fetchBoLocData()` (inline JS)

### 7.4 Thêm thành viên đội ngũ
- Tìm comment `<!-- PHẦN 5: ĐỘI NGŨ CHUYÊN GIA -->`
- Copy template HTML của `.team-member` hiện có
- Thêm ảnh avatar vào `assets/images/`

### 7.5 Deploy
```bash
# Cách 1: GitHub Pages
git push origin main
# → Tự động deploy nếu đã bật GitHub Pages

# Cách 2: Upload thủ công
# Nén toàn bộ thư mục (trừ .git, _dev_scripts)
# Upload lên hosting tĩnh (Vercel, Netlify, VPS)
```

---

## 8. LƯU Ý QUAN TRỌNG

> ⚠️ **Cấu trúc file `index.html`:**
> File này chứa TOÀN BỘ CSS inline + JS inline (~2700 dòng).
> Đây là thiết kế có chủ đích — KHÔNG được tách ra file riêng
> vì các hàm JS phụ thuộc lẫn nhau và cần scope toàn cục.

> ⚠️ **Video nền:**
> File video nặng 65MB. Khi deploy production, cân nhắc:
> - Nén video xuống WebM/MP4 tối ưu
> - Hoặc dùng CDN riêng cho video

> ⚠️ **Miễn trừ trách nhiệm:**
> Phải hiển thị ở: (1) Panel bộ lọc, (2) Footer, (3) Popup lần đầu.
> Đây là yêu cầu pháp lý bắt buộc.

---

*Tài liệu cập nhật: 2026-05-04 — FinTop DATA Team*
