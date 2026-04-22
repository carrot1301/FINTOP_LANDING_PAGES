# 🚀 FinTop DATA — Landing Page Design Specification
> Tài liệu triển khai giao diện web. Phiên bản: 2026. Tham khảo: TradingView + Finbox.

---

## 1. TỔNG QUAN DỰ ÁN

| Hạng mục | Chi tiết |
|---|---|
| **Tên dự án** | FinTop DATA — Web Fintech |
| **Phong cách** | Dark Premium · Tím thạch anh · Gold accent |
| **Font chữ** | Propins (ưu tiên) · Fallback: `Plus Jakarta Sans`, `Be Vietnam Pro` |
| **Tham khảo** | TradingView.com · Finbox.com |
| **Mục tiêu** | Nhà đầu tư thế hệ mới — Data + AI + Chuyên gia |

---

## 2. HỆ THỐNG MÀU SẮC (GAME MÀU)

```css
/* === HOME — Dark Premium === */
--bg-primary:       #0A0A0F;   /* Đen tuyệt đối */
--bg-secondary:     #0F0F1A;   /* Đen xanh nhẹ */
--bg-card:          #13131F;   /* Card nền */
--bg-glass:         rgba(139, 92, 246, 0.06); /* Glassmorphism tím */

--purple-core:      #7C3AED;   /* Tím thạch anh chủ đạo */
--purple-glow:      #A855F7;   /* Tím sáng highlight */
--purple-soft:      #6D28D9;   /* Tím trầm */
--purple-border:    rgba(139, 92, 246, 0.25);

--gold-primary:     #F59E0B;   /* Vàng gold accent */
--gold-light:       #FCD34D;   /* Vàng sáng */
--gold-glow:        rgba(245, 158, 11, 0.3);

--text-primary:     #F8FAFC;   /* Trắng tinh */
--text-secondary:   #94A3B8;   /* Xám nhạt */
--text-muted:       #475569;   /* Xám tối */

/* === INNER PAGES — Light Clean === */
--inner-bg:         #FFFFFF;
--inner-bg-alt:     #F8F9FE;
--inner-accent:     #7C3AED;   /* Tím tinh gọn */
--inner-border:     #E5E7F0;
--inner-text:       #1E1B4B;

/* === STATUS COLORS (Bảng dữ liệu) === */
--status-very-pos:  #10B981;   /* RẤT TÍCH CỰC */
--status-pos:       #34D399;   /* TÍCH CỰC */
--status-ok:        #60A5FA;   /* KHẢ QUAN */
--status-neutral:   #94A3B8;   /* TRUNG LẬP */
--status-neg-light: #FBBF24;   /* KO TÍCH CỰC */
--status-neg:       #F87171;   /* TIÊU CỰC */
```

---

## 3. TYPOGRAPHY

```css
/* Font stack */
font-family: 'Propins', 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;

/* Hierarchy */
--font-hero:    clamp(2.5rem, 6vw, 5rem);    /* H1 Hero */
--font-h2:      clamp(1.8rem, 3.5vw, 2.8rem);
--font-h3:      clamp(1.2rem, 2vw, 1.5rem);
--font-body:    1rem;
--font-small:   0.875rem;
--font-xs:      0.75rem;

/* Weight */
--weight-black:  900;
--weight-bold:   700;
--weight-medium: 500;
--weight-normal: 400;
```

---

## 4. CẤU TRÚC TỔNG THỂ (SITEMAP)

```
HOME (/)
├── HEADER (sticky)
├── SECTION 1 — Hero: "Kỷ Nguyên Đầu Tư Cùng FinTop DATA"
├── SECTION 2 — "Dữ Liệu Cho Nhà Đầu Tư Thế Hệ Mới" [scroll transition]
├── SECTION 3 — 3 Trụ cột: Data · Chuyên Gia · AI
├── SECTION 4 — Gói Hội Viên (Pricing)
├── SECTION 5 — CTA cuối trang
└── FOOTER

HỘI VIÊN (/hoi-vien)
FINTOP DATA (/fintop-data)
  ├── Tra Cứu CP
  ├── Bộ Lọc CP
  ├── Tín Hiệu CG
  └── Danh Mục CG
CHUYÊN GIA (/chuyen-gia)
FINTOP AI (/fintop-ai)
STOCK DATA (/stock-data)
HƯỚNG DẪN (/huong-dan)
```

---

## 5. HEADER (Sticky Navigation)

### Cấu trúc
```
[Logo: FinTop DATA]  [Nav Menu]                    [Search] [icon TK] [Đăng nhập]
```

### Nav Menu Items (theo thứ tự)
1. **Hội Viên**
2. **FinTop Data** → Dropdown: Tra cứu CP · Bộ Lọc CP · Tín Hiệu CG · Danh Mục CG
3. **Chuyên Gia**
4. **FinTop AI**
5. **Stock Data**
6. **Hướng Dẫn**

### Dropdown FinTop Data
| Sub-menu | Tier |
|---|---|
| Tra cứu CP | Standard |
| Bộ Lọc CP | Pro |
| Tín Hiệu CG | Chuyên gia / V.I.P |
| Danh Mục CG | Chuyên gia / V.I.P |

### Styling Header
```css
/* Glassmorphism sticky nav */
background: rgba(10, 10, 15, 0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid var(--purple-border);
padding: 0 2rem;
height: 64px;

/* Logo */
color: var(--purple-glow);
font-weight: 900;
font-size: 1.4rem;
letter-spacing: -0.02em;

/* CTA Button */
background: linear-gradient(135deg, var(--purple-core), var(--gold-primary));
border-radius: 8px;
padding: 8px 20px;
```

---

## 6. HERO SECTION — Trang đầu (Section 1)

### Nội dung
```
[HEADLINE]
Kỷ Nguyên Đầu Tư
Cùng FinTop DATA

[SUB]
Nơi hội tụ Data - Chuyên gia - Công nghệ & AI
Tinh gọn và hiệu quả.

[CTA]
[ Bắt đầu miễn phí → ]    [ Khám phá tính năng ]
```

### Background Effect
- **Ảnh 1**: `add_multiple_orbital_202604220943.jpeg` — làm nền fullscreen
- Overlay: `radial-gradient` tím từ tâm + noise texture 3% opacity
- Particle effect nhẹ (CSS only hoặc tsparticles)
- Animated gradient border dọc bên trái

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [Bg: Image 1 — FinTop DATA orbital AI visual]      │
│                                                     │
│    Kỷ Nguyên Đầu Tư                                 │
│    Cùng FinTop DATA          ┌──────────────────┐   │
│                              │  [Floating card] │   │
│    Nơi hội tụ Data...        │  Live data tick  │   │
│                              └──────────────────┘   │
│    [Bắt đầu miễn phí]                               │
│    [Khám phá tính năng]                             │
│                                                     │
│              ↓ SCROLL ↓                             │
└─────────────────────────────────────────────────────┘
```

### Scroll Transition sang Section 2
```javascript
// Kỹ thuật: Parallax + opacity fade
// Khi scroll 0% → 50vh: Image1 opacity 1→0, scale 1→1.1
// Khi scroll 50vh: Image2 bắt đầu fade in từ dưới
// Dùng: IntersectionObserver + CSS transform/opacity transition

// Hoặc dùng GSAP ScrollTrigger:
gsap.timeline({
  scrollTrigger: {
    trigger: "#section2",
    start: "top bottom",
    end: "top top",
    scrub: 1
  }
})
.fromTo("#hero-image", { opacity: 1 }, { opacity: 0 })
.fromTo("#section2-image", { opacity: 0, y: 60 }, { opacity: 1, y: 0 });
```

---

## 7. SECTION 2 — "Dữ Liệu Cho Nhà Đầu Tư Thế Hệ Mới"

### Nội dung
```
[HEADLINE]
Dữ Liệu Cho Nhà Đầu Tư
Thế Hệ Mới

[SUB]
Tra cứu · Bộ lọc · Tín hiệu · AI phân tích
```

### Background
- **Ảnh 2**: `abstract_technology_and_202604220949.jpeg` — AI chip circuit board
- Chuyển cảnh mượt từ Section 1 (scroll-driven animation)
- Thêm scan-line overlay nhẹ 2% opacity

### Layout — 3 cột tính năng nổi bật
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  📊 DATA     │  │  👤 CHUYÊN   │  │  🤖 AI       │
│  Tra cứu CP  │  │  GIA         │  │  PHÂN TÍCH   │
│  Bộ lọc CP   │  │  Tín hiệu   │  │  FinTop AI   │
│  Stock Data  │  │  Danh mục   │  │  Tự động     │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Card Style
```css
.feature-card {
  background: var(--bg-glass);
  border: 1px solid var(--purple-border);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.feature-card:hover {
  border-color: var(--purple-glow);
  box-shadow: 0 0 40px var(--bg-glass);
  transform: translateY(-4px);
}
```

---

## 8. SECTION 3 — Gói Hội Viên (Pricing)

### 4 Gói theo dữ liệu Excel sheet "HỘI VIÊN"

| Gói | Màu | Nội dung |
|---|---|---|
| **Standard** | Text trắng | Tra cứu CP · Các truy cập Free · Đăng ký TK là oke |
| **Pro** ⭐ | Border tím glow | Bộ Lọc CP · Pro Analysis · Mua gói dữ liệu Pro |
| **V.I.P** | Border gold | Tín Hiệu CG · Danh Mục CG · Có TKCK VPS |
| **Diamond** | Gradient tím+vàng | Full V.I.P + Pro · Cố vấn 1-1 · NAV từ 1 tỷ VND |

### Layout Pricing Cards
```
┌──────────┐  ┌──────────────────┐  ┌──────────┐  ┌──────────┐
│ Standard │  │      PRO  ⭐     │  │  V.I.P   │  │ Diamond  │
│          │  │  [Most Popular]  │  │          │  │  💎      │
│  Free    │  │   [Giá/tháng]   │  │ [TKCK]   │  │ 1 tỷ+    │
│  [Đăng   │  │  [Mua ngay →]   │  │ [Liên    │  │ [Kết nối]│
│   ký]    │  │                  │  │  hệ]     │  │          │
└──────────┘  └──────────────────┘  └──────────┘  └──────────┘
```

### Pricing Card Style
```css
.card-pro {
  background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(245,158,11,0.08));
  border: 2px solid var(--purple-glow);
  box-shadow: 0 0 60px rgba(124,58,237,0.2);
  transform: scale(1.05); /* Featured */
}
.card-diamond {
  background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(245,158,11,0.12));
  border: 2px solid var(--gold-primary);
  box-shadow: 0 0 60px var(--gold-glow);
}
```

---

## 9. BẢNG DỮ LIỆU — FinTop Data (Inner Page)

### Cấu trúc bảng (từ Excel sheet "FINTOP DATA")

| Cột | Dữ liệu |
|---|---|
| STT | Số thứ tự |
| Mã CP | VEA, DST, DGW... |
| Sàn | UPCOM · HNX · HOSE |
| Ngành HĐKD | Bán buôn, bán lẻ... |
| Cán bộ | Tên phụ trách |
| Update time | Timestamp |
| Mô tả Model | Mô hình kỹ thuật |
| Trạng thái Model | Badge màu |
| Kết quả Model | STRONG ENTRY / ENTRY / SMALL ENTRY |
| Vùng giá Tham chiếu | Range giá |
| Vùng giá Kháng cự | Range giá |
| Điểm QTRR | Số điểm |

### Badge Trạng thái
```
RẤT TÍCH CỰC  → Badge xanh lá  (#10B981)
TÍCH CỰC       → Badge xanh nhạt (#34D399)
KHẢ QUAN       → Badge xanh dương (#60A5FA)
TRUNG LẬP      → Badge xám (#94A3B8)
KO TÍCH CỰC   → Badge vàng (#FBBF24)
TIÊU CỰC       → Badge đỏ (#F87171)
```

### Badge Kết quả
```
STRONG ENTRY → Button gold solid
ENTRY        → Button tím outline
SMALL ENTRY  → Button xám outline
```

### Popup Hướng dẫn (lần đầu login)
```
Tiêu đề:  HƯỚNG DẪN SỬ DỤNG
Nội dung: Bảng tổng hợp danh mục cổ phiếu theo Trạng thái
          và Kết quả thuật toán của Mô hình (Model)...

Footer popup:
MIỄN TRỪ TRÁCH NHIỆM
Dữ liệu chỉ mang tính chất tham khảo, không phải
khuyến nghị đầu tư. Người dùng chịu hoàn toàn
trách nhiệm trước các quyết định đầu tư của mình.
```

### Table Styling (Inner page — Light)
```css
.data-table {
  font-family: 'Propins', sans-serif;
  background: #FFFFFF;
  border: 1px solid var(--inner-border);
  border-radius: 12px;
  overflow: hidden;
}
.data-table thead {
  background: #F1F0FF;
  color: var(--inner-accent);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.data-table tr:hover {
  background: #F8F7FF;
}
.badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
```

---

## 10. SCROLL ANIMATION — Chuyển cảnh 2 ảnh

### Kỹ thuật triển khai

```javascript
// === PHƯƠNG ÁN 1: CSS Scroll-Driven (native, không cần lib) ===
// Yêu cầu Chrome 115+ / Safari 17+

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(1.08); }
}

#hero-bg {
  animation: fadeOut linear;
  animation-timeline: scroll(root);
  animation-range: 0vh 60vh;
}

// === PHƯƠNG ÁN 2: GSAP ScrollTrigger (recommended — cross-browser) ===
// CDN: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
//      https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js

gsap.registerPlugin(ScrollTrigger);

// Pin Section 1, fade ra khi scroll
gsap.to("#section1-bg", {
  opacity: 0,
  scale: 1.1,
  ease: "none",
  scrollTrigger: {
    trigger: "#section1",
    start: "top top",
    end: "bottom top",
    scrub: true,
  }
});

// Section 2 fade vào
gsap.from("#section2-bg", {
  opacity: 0,
  y: 40,
  ease: "none",
  scrollTrigger: {
    trigger: "#section2",
    start: "top 80%",
    end: "top 20%",
    scrub: 1,
  }
});

// === PHƯƠNG ÁN 3: IntersectionObserver (lightweight, no lib) ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '-10% 0px' });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
```

### HTML Structure cho transition
```html
<!-- Section 1: Hero -->
<section id="section1" class="hero-section">
  <div class="hero-bg" style="background-image: url('images/orbital_ai.jpg')"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1>Kỷ Nguyên Đầu Tư<br>Cùng FinTop DATA</h1>
    <p>Nơi hội tụ Data - Chuyên gia - Công nghệ & AI. Tinh gọn và hiệu quả.</p>
    <div class="hero-ctas">
      <button class="btn-primary">Bắt đầu miễn phí →</button>
      <button class="btn-ghost">Khám phá tính năng</button>
    </div>
  </div>
</section>

<!-- Transition layer -->
<div class="scroll-transition-spacer"></div>

<!-- Section 2: "Dữ Liệu Cho Nhà Đầu Tư Thế Hệ Mới" -->
<section id="section2" class="data-hero-section">
  <div class="data-hero-bg" style="background-image: url('images/ai_circuit.jpg')"></div>
  <div class="data-hero-content scroll-reveal">
    <h2>Dữ Liệu Cho Nhà Đầu Tư<br><span class="gold">Thế Hệ Mới</span></h2>
    <p>Tra cứu · Bộ lọc · Tín hiệu · AI phân tích</p>
  </div>
</section>
```

---

## 11. FOOTER

### Nội dung
```
Left:   [Logo FinTop DATA]
        Nơi hội tụ Data - Chuyên gia - Công nghệ & AI

Center: Hội Viên | FinTop Data | Chuyên Gia | FinTop AI | Stock Data | Hướng Dẫn

Right:  [Social icons]
        © 2026 FinTop DATA. All rights reserved.
        Miễn trừ trách nhiệm: Dữ liệu chỉ mang tính tham khảo...
```

### Footer Style
```css
footer {
  background: #07070D;
  border-top: 1px solid var(--purple-border);
  padding: 3rem 2rem 1.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
```

---

## 12. MICRO-INTERACTIONS & EFFECTS

### Cursor (optional — desktop only)
```css
/* Custom cursor tím */
cursor: url('data:image/svg+xml,...'), auto;
```

### Button Hover
```css
.btn-primary {
  background: linear-gradient(135deg, var(--purple-core), var(--gold-primary));
  box-shadow: 0 4px 24px rgba(124,58,237,0.35);
  transition: all 0.3s ease;
}
.btn-primary:hover {
  box-shadow: 0 8px 40px rgba(124,58,237,0.55);
  transform: translateY(-2px);
}
```

### Number Counter (hero stats)
```javascript
// Animate số liệu khi vào viewport
// Ví dụ: "1,200+ Cổ phiếu" | "50+ Chuyên gia" | "98% Độ chính xác"
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const step = target / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, 16);
}
```

### Glassmorphism Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
}
```

---

## 13. RESPONSIVE BREAKPOINTS

```css
/* Desktop first */
@media (max-width: 1280px) { /* Large tablet */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile landscape — nav collapse */ }
@media (max-width: 480px)  { /* Mobile portrait — single column */ }

/* Mobile nav: hamburger menu → slide-in drawer */
/* Pricing: 4 col → 2 col → 1 col scroll */
/* Table: horizontal scroll với sticky cột Mã CP */
```

---

## 14. FILE & THƯ MỤC GỢI Ý

```
/
├── index.html              ← HOME
├── hoi-vien/
│   └── index.html
├── fintop-data/
│   ├── index.html          ← Tra cứu CP (default)
│   ├── bo-loc/index.html
│   ├── tin-hieu/index.html
│   └── danh-muc/index.html
├── chuyen-gia/index.html
├── fintop-ai/index.html
├── stock-data/index.html
├── huong-dan/index.html
├── assets/
│   ├── images/
│   │   ├── orbital_ai.jpg      ← Ảnh 1 (Hero)
│   │   └── ai_circuit.jpg      ← Ảnh 2 (Section 2)
│   ├── fonts/
│   │   └── Propins/
│   ├── css/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── components.css
│   │   └── pages/
│   └── js/
│       ├── scroll-animation.js
│       ├── counter.js
│       └── table.js
└── README.md
```

---

## 15. CHECKLIST TRIỂN KHAI

### Phase 1 — HOME
- [ ] Header sticky + nav dropdown
- [ ] Hero Section 1 (Ảnh 1 background + content)
- [ ] Scroll transition animation Section 1 → Section 2
- [ ] Section 2 (Ảnh 2 + "Dữ Liệu Cho Nhà Đầu Tư Thế Hệ Mới")
- [ ] 3-column feature cards
- [ ] Pricing section (4 gói)
- [ ] Footer
- [ ] Responsive mobile

### Phase 2 — Inner Pages
- [ ] Template inner page (white + accent tím)
- [ ] Bảng dữ liệu (Tra cứu CP) với badges màu
- [ ] Popup hướng dẫn lần đầu
- [ ] Bộ lọc CP (filter UI)
- [ ] Tín hiệu CG
- [ ] Danh mục CG
- [ ] Trang Hội Viên (pricing detail)

### Phase 3 — Polish
- [ ] Loading screen (FinTop DATA logo reveal)
- [ ] Page transitions
- [ ] Dark/Light mode inner pages
- [ ] SEO meta tags
- [ ] Performance (lazy images, font preload)

---

## 16. NOTES CHO DEVELOPER

> ⚠️ **Quan trọng:**
> - Font **Propins** cần được nhúng hoặc mua license nếu là commercial font
> - Ảnh nền cần được **tối ưu** (WebP, max 300KB) để performance tốt
> - Scroll animation dùng **GSAP ScrollTrigger** là khuyến nghị (cross-browser tốt nhất)
> - Bảng dữ liệu nên dùng **virtual scrolling** nếu > 200 rows
> - Tất cả màu trạng thái cổ phiếu cần **accessible** (WCAG AA contrast ratio)
> - **Miễn trừ trách nhiệm** phải xuất hiện ở footer và popup lần đầu của bảng dữ liệu

---

*Tài liệu được tổng hợp từ: FinTop DATA Cập nhật Web 2026.xlsx · Ảnh thiết kế FinTop DATA · Yêu cầu thiết kế theo chuẩn TradingView + Finbox*
