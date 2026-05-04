# FinTop DATA — Landing Page

> Landing page cho nền tảng đầu tư tài chính FinTop DATA.  
> Phong cách: Dark Premium · Tím thạch anh · Gold accent.

## 🚀 Chạy dự án

Mở file `index.html` trực tiếp trong trình duyệt:

```
Cách 1: Nhấp đúp vào file index.html
Cách 2: Dùng VS Code → cài Live Server → chuột phải index.html → Open with Live Server
```

## 📁 Cấu trúc thư mục

```
├── index.html              ← Trang chủ (file chính)
├── assets/                 ← Tài nguyên tĩnh (CSS, JS, hình ảnh, video, font)
├── chuyen-gia/             ← Trang Chuyên gia
├── fintop-ai/              ← Trang FinTop AI
├── fintop-data/            ← Trang FinTop Data (Tra cứu, Bộ lọc, Tín hiệu, Danh mục)
├── hoi-vien/               ← Trang Hội viên
├── huong-dan/              ← Trang Hướng dẫn
├── stock-data/             ← Trang Stock Data
├── docs/                   ← Tài liệu nội bộ
└── _dev_scripts/           ← Script phát triển (không deploy)
```

## 📖 Tài liệu kỹ thuật

Xem chi tiết tại: [FinTop_DATA_LandingPage_Spec.md](FinTop_DATA_LandingPage_Spec.md)

## ⚙️ Công nghệ

- **HTML5** + **CSS3** (inline) + **Vanilla JavaScript**
- **GSAP 3.12.5** + **ScrollTrigger** — Hiệu ứng cuộn điện ảnh
- **FireAnt Widget** — Biểu đồ cổ phiếu
- **Google Fonts** — Be Vietnam Pro, Plus Jakarta Sans, Poppins

## 📦 Đóng gói để gửi

```powershell
# Tạo file ZIP (PowerShell):
Compress-Archive -Path "f:\FT\*" -DestinationPath "f:\FinTop_DATA_LandingPage.zip" -Force
```

> ⚠️ Lưu ý: File video nền nặng ~65MB, nên tổng ZIP khoảng ~80MB.

---

*© 2026 FinTop DATA Team*
