# FinTop DATA — Landing Page

> Landing page cho nền tảng đầu tư tài chính FinTop DATA.  
> Phong cách: Dark Premium · Tím thạch anh · Gold accent.

## 🚀 Chạy dự án

Mở file `index.html` trực tiếp trong trình duyệt:

```
Cách 1: Nhấp đúp vào file index.html
Cách 2: Dùng VS Code → cài Live Server → chuột phải index.html → Open with Live Server
```

Trang quản trị nội dung:

```
admin/index.html
```

Admin có khóa truy cập local theo trình duyệt để tránh mở nhầm khu vực quản trị khi chạy static. Đây không thay thế bảo mật production; khi deploy thật cần dùng Supabase Auth + RLS trong `supabase/schema.sql`.

Dữ liệu public dạng tĩnh nằm trong thư mục `data/`:

```
data/stock-search-data.js
data/stock-filter-data.js
data/signals-data.js
data/research-data.js
data/memberships-data.js
data/landing-content-data.js
```

Các module hiện có trong admin: Dashboard tổng quan, Tra cứu cổ phiếu, Bộ lọc cổ phiếu, Bài viết/Nghiên cứu, Copy Trade/Tín hiệu, Gói hội viên, Nội dung landing page.

Hiện `index.html` đọc trực tiếp các file `stock-search-data.js`, `stock-filter-data.js`, `signals-data.js`, `research-data.js`, `memberships-data.js` và `landing-content-data.js`. Admin cũng quản lý thêm `customers-data.js` để theo dõi khách hàng theo tier hội viên.

Commit baseline trước đợt productionize này:

```powershell
git log -1 --oneline
# e031017 update stock filter fields
```

## Supabase / DNT Quant Lab

Schema Supabase nằm tại:

```text
supabase/schema.sql
supabase/migrations/20260603170419_fintop_data_schema.sql
```

Workflow Supabase CLI:

```powershell
supabase login
supabase link --project-ref "<project-ref>"
supabase db push --dry-run
supabase db push
```

`--dry-run` nên chạy trước để xem migration sẽ apply. CLI config local nằm ở `supabase/config.toml`; metadata tạm trong `supabase/.temp/` đã được ignore bởi `supabase/.gitignore`.

Sync giá mới nhất từ DNT Quant Lab vào bảng `stock_prices`:

```powershell
$env:SUPABASE_URL="https://<project>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
$env:DNT_DATA_ENGINE_PATH="F:\DNT_Workspace\quant-engine\dnt_quant_lab\backend\core\data_engine.py"
$env:FINTOP_SYNC_TICKERS="FPT,HPG,VCB,TCB,SSI"
python scripts/sync_dnt_stock_prices.py
```

Frontend sẽ ưu tiên Supabase nếu trang được nạp kèm config:

```html
<script>
window.FINTOP_SUPABASE_CONFIG = {
  url: "https://<project>.supabase.co",
  anonKey: "<anon-key>"
};
</script>
```

Nếu không có config, site tự fallback về `data/*.js`.

## 📁 Cấu trúc thư mục

```
├── index.html              ← Trang chủ (file chính)
├── admin/                  ← Trang quản trị tĩnh cho dữ liệu/nội dung web
├── data/                   ← Dữ liệu public dùng chung cho trang chủ/admin
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
