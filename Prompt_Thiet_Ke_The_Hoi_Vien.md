# PROMPT CHO AI AGENT — THIẾT KẾ LẠI THẺ "ĐẶC QUYỀN HỘI VIÊN" (FinTop DATA)

> Bối cảnh: Đã xem trực tiếp các mockup hiện có trong file "Bảng tính TK HỘI VIÊN" (3 lớp thiết kế đang tồn tại song song cho cùng 1 nội dung — xem mục 1). Nhiệm vụ của Agent: **dựng lại component thẻ Hội viên dùng chung cho 4 hạng mục Standard/PRO/V.I.P/Diamond**, giữ đúng cấu trúc/form mẫu của bản cũ, nhưng nâng cấp UI và bắt buộc đồng bộ màu sắc giữa các "ô" (icon, bullet, viền, nút) trong cùng 1 thẻ và giữa 4 thẻ với nhau.

---

## 1. Hiện trạng — 3 lớp thiết kế đang trộn lẫn (Agent cần nắm để tránh lặp lại lỗi)

Trong file nguồn hiện có **3 kiểu trình bày khác nhau cho cùng 1 nội dung gói hội viên**, gây thiếu đồng bộ:

1. **Card mẫu cũ (web hiện tại — form gốc cần kế thừa cấu trúc):**
   Nền đỏ-nâu/maroon đậm → thanh tiêu đề "ĐẶC QUYỀN HỘI VIÊN" (nền xanh navy, chữ trắng) → panel trong cùng nền navy chứa icon khối lập phương + tên hạng mục + danh sách bullet (chấm tròn) + 2 nút bước (Bước 1/Bước 2) với CTA dạng pill bo tròn (xanh lá "ĐĂNG KÝ" / "ĐĂNG NHẬP") → nút "ĐÓNG" hồng nhỏ góc dưới.
   → **Đây là cấu trúc/khung (layout template) cần giữ lại**, vì là "mẫu form có sẵn" mà sếp muốn kế thừa.

2. **Card "cái gốc" (được note màu đỏ trong file, dùng làm tham chiếu phối màu — nhưng mỗi hạng mục lại một màu nền khác nhau, KHÔNG đồng bộ):**
   - Standard: nền tím than (violet) đậm, chữ trắng, nút "Đăng ký" xanh dương.
   - PRO: nền tím magenta đậm, icon ngôi sao vàng, nút "Đăng ký" gradient tím.
   - V.I.P: nền xanh lục (emerald) đậm, chữ vàng gold, nút "Đăng ký" xanh lá.
   - Diamond: **không có card tham chiếu riêng** trong file gốc.
   → Đây chính là nguồn gốc lỗi thiếu đồng bộ: ghi chú gốc chỉ nói "lấy màu/nền tương thích với cái gốc *này*" cho từng hạng mục riêng lẻ, dẫn đến 4 nền màu rời rạc không ăn nhập nhau.

3. **Bản demo web mới hiện tại (đã build một phần, dạng section phẳng không phải card nổi):**
   Panel nền navy đơn giản, icon + bullet list, nhãn hạng mục bên dưới, CTA dạng link chữ. Mỗi hạng mục lại dùng 1 tông accent khác: Standard xanh dương, PRO trắng (thiếu màu nhận diện, có lỗi chính tả "RROFESSIONAL"), V.I.P vàng gold.

**Kết luận vấn đề cần giải quyết:** Cấu trúc (layout) thì đã ổn và nên giữ theo bản (1), nhưng **bảng màu đang bị chắp vá theo cảm tính từng hạng mục** (mỗi card một nền khác hẳn, không theo hệ thống) → đây chính là điều cần cải tiến và đồng bộ hoá triệt để.

---

## 2. Yêu cầu thiết kế

### 2.1 Giữ nguyên cấu trúc khung thẻ (kế thừa từ bản cũ)
Component `MembershipCard` cần có đủ các vùng sau, theo đúng thứ tự của mẫu cũ:
1. Thanh tiêu đề trên cùng: "ĐẶC QUYỀN HỘI VIÊN" + icon mũi tên/mở rộng góc phải.
2. Khối icon đại diện (icon khối lập phương 3D) + tên hạng mục (VD: "Hội viên Tiêu chuẩn", "Hội viên PRO", "Hội viên V.I.P", "Hội viên Diamond").
3. Danh sách quyền lợi dạng bullet (mỗi hạng mục 3–6 dòng, lấy đúng nội dung đã tổng hợp ở bảng quyền lợi 4 gói trong tài liệu yêu cầu nội dung trước đó).
4. Khu vực hành động (CTA): tuỳ hạng mục — Standard/PRO dùng 2 bước (Bước 1/Bước 2 hoặc Phương thức 1/Phương thức 2); V.I.P/Diamond dùng "Mở tài khoản" / "Liên kết tài khoản".
5. Nút đóng (nếu card hiển thị dạng modal/popup).

### 2.2 Bắt buộc: hệ thống màu đồng bộ (Design Tokens)

**Nguyên tắc:** Tất cả 4 thẻ dùng **chung 1 nền (base) tối**, không đổi màu nền theo từng hạng mục như bản cũ. Sự khác biệt giữa các hạng mục chỉ thể hiện qua **1 màu nhấn (accent color) riêng**, được áp dụng nhất quán cho TẤT CẢ các "ô"/thành phần trong thẻ: icon, chấm bullet, viền/ribbon trên cùng, chữ tên hạng mục, nút CTA. Đây chính là cách đảm bảo "từng ô liên kết phải có sự đồng bộ" mà sếp yêu cầu.

```css
/* ===== NỀN DÙNG CHUNG CHO CẢ 4 THẺ ===== */
--card-bg: linear-gradient(160deg, #1A1F36 0%, #241522 100%); /* navy → maroon nhẹ, gợi nhắc bản cũ nhưng hiện đại hơn */
--card-bg-inner-panel: #12172B; /* panel chứa icon + bullet, đồng nhất cho cả 4 thẻ */
--text-primary: #FFFFFF;
--text-secondary: #B7BCD6;

/* ===== ACCENT RIÊNG TỪNG HẠNG MỤC (áp dụng cho: icon, bullet, viền trên, tên hạng mục, nút CTA) ===== */
--accent-standard: #4DA3FF;   /* xanh dương — giữ đúng màu icon thương hiệu hiện tại */
--accent-pro:      #9B6BFF;   /* tím — kế thừa tông tím của card "gốc" PRO, đồng bộ hoá độ đậm/nhạt với standard */
--accent-vip:      #F2C94C;   /* vàng gold — kế thừa đúng tông vàng đã dùng cho V.I.P ở cả 2 bản tham chiếu */
--accent-diamond:  #7FE6E0;   /* xanh ngọc/diamond — mới, đặt cao hơn vàng VIP về thứ bậc, gợi cảm giác "kim cương/băng" */

/* Gradient nút CTA = accent của hạng mục đó, không dùng xanh lá/hồng rời rạc như bản cũ */
--btn-gradient-standard: linear-gradient(90deg, #4DA3FF, #2F8FE0);
--btn-gradient-pro:      linear-gradient(90deg, #9B6BFF, #7A4DFF);
--btn-gradient-vip:      linear-gradient(90deg, #F2C94C, #E0A800);
--btn-gradient-diamond:  linear-gradient(90deg, #7FE6E0, #4FC9C2);
```

**Quy tắc áp dụng accent (để mỗi "ô" trong thẻ đồng bộ với nhau):**
- Icon khối lập phương: viền/glow theo accent của hạng mục đó (thay vì lúc xanh lúc vàng tuỳ ý).
- Chấm bullet đầu dòng: cùng 1 màu accent, cùng kích thước/kiểu (chấm tròn hoặc ✦ — chọn 1 kiểu duy nhất dùng cho cả 4 thẻ, không lúc chấm tròn lúc ngôi sao như hiện tại).
- Viền trên cùng / ribbon "ĐẶC QUYỀN HỘI VIÊN": dùng accent làm viền 1–2px hoặc gradient mỏng, thay vì giữ nguyên màu navy/đỏ cố định.
- Tên hạng mục + 1–2 dòng quyền lợi nổi bật nhất: tô màu accent (in đậm) để tạo phân cấp thị giác, các dòng còn lại dùng `--text-secondary`.
- Nút CTA chính: nền gradient theo accent tương ứng; nút phụ (VD "Liên hệ", "Đăng nhập"): viền accent + nền trong suốt (outline button), không dùng màu hồng/xanh lá rời rạc như bản cũ.

### 2.3 Cải tiến UI/UX cụ thể (so với cả 3 bản hiện có)
- **Phân cấp rõ ràng giữa 4 hạng mục:** dùng độ "rực" của accent tăng dần Standard → PRO → V.I.P → Diamond (có thể thêm hiệu ứng glow/shadow nhẹ tăng dần) để người dùng cảm nhận được thứ bậc nâng cấp.
- **Badge "Phổ biến nhất" / "Khuyến nghị":** gắn ở 1 hạng mục trung tâm (đề xuất PRO hoặc V.I.P) để định hướng người dùng, theo accent màu của chính hạng mục đó.
- **Trạng thái hover/active/disabled** cho nút CTA: cần định nghĩa rõ (hiện cả 3 bản mockup đều chưa có).
- **Responsive:** trên mobile, 4 thẻ xếp dọc hoặc carousel vuốt ngang, giữ nguyên tỷ lệ và bảng màu, không cắt/vỡ bullet list.
- **Đồng nhất icon set:** dùng 1 bộ icon line/duotone nhất quán cho khối lập phương + các icon nhỏ khác (hiện bản cũ và bản demo dùng style icon khác nhau).
- **Sửa lỗi chính tả** đã thấy trong bản demo: "RROFESSIONAL" → "PROFESSIONAL".
- **Card thanh toán PRO (QR code)** và **dải giá PRO1/PRO2/PRO3, VIP1/VIP2/VIP3**: áp dụng cùng accent của hạng mục tương ứng cho khung giá/CTA, thay vì giữ nguyên nền maroon mặc định như hiện tại.

### 2.4 Yêu cầu kỹ thuật
- Xây dựng **1 component `MembershipCard` dùng chung**, nhận prop `tier` (`standard | pro | vip | diamond`) để tự động áp accent tương ứng từ bảng token ở mục 2.2 — không hard-code màu riêng từng hạng mục trong từng file/section khác nhau (đây là nguyên nhân gốc gây mất đồng bộ ở bản hiện tại).
- Định nghĩa token màu tập trung (CSS variables / theme config), để khi cần đổi 1 màu accent thì chỉ sửa 1 nơi, áp dụng lại cho toàn bộ vị trí dùng (thẻ ở trang chủ, thẻ ở trang Hội viên, card thanh toán, badge...).
- Đảm bảo nội dung từng hạng mục đúng theo bảng quyền lợi đã tổng hợp (Standard/PRO/V.I.P/Diamond) trong tài liệu yêu cầu nội dung trước đó — không thay đổi nội dung, chỉ thiết kế lại phần trình bày & màu sắc.

---

## 3. Checklist cho Agent

- [ ] Dựng component thẻ dùng chung theo khung cấu trúc ở mục 2.1 (kế thừa bản cũ).
- [ ] Áp dụng đúng bộ token màu nền chung + accent riêng từng hạng mục ở mục 2.2 cho toàn bộ vị trí xuất hiện thẻ hội viên trên site (trang chủ, trang Hội viên, popup thanh toán, badge giá).
- [ ] Đảm bảo trong cùng 1 thẻ, icon — bullet — viền — tên hạng mục — nút CTA đều dùng chung 1 accent (không phối nhiều màu rời rạc như bản cũ).
- [ ] Thêm phân cấp thị giác tăng dần Standard → Diamond (độ rực màu/hiệu ứng glow).
- [ ] Chuẩn hoá 1 bộ icon dùng xuyên suốt, sửa lỗi chính tả "RROFESSIONAL".
- [ ] Thiết kế trạng thái hover/active cho nút CTA.
- [ ] Responsive tốt trên mobile (xếp dọc/carousel), không vỡ layout bullet list.
- [ ] Card thanh toán (QR + thông tin ngân hàng) và dải giá theo kỳ hạn dùng accent đồng bộ theo hạng mục tương ứng.
