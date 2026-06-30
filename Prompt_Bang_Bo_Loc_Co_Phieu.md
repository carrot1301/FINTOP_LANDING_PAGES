# PROMPT CHO AI AGENT — DỰNG BẢNG "BỘ LỌC CỔ PHIẾU - TOP TRẠNG THÁI KỸ THUẬT NGÀNH ĐẦU TƯ"

> Yêu cầu: build lại đúng bảng dữ liệu theo mẫu màu trong ảnh chụp tham chiếu (đã đo màu chính xác từ ảnh gốc). Bảng dùng cho khu vực "Bộ lọc cổ phiếu" trên web FinTop DATA, có tô màu theo điều kiện (conditional formatting) dựa trên giá trị dữ liệu.

## 1. Cấu trúc bảng

| STT | Mã CP | Sàn | Ngành HĐKD | Cán bộ | Update time | Mô tả Mô hình kỹ thuật (Model) | Trạng thái Model | Sức mạnh xu hướng Dòng tiền - RSI/MFI | Vùng kiểm định kỹ thuật | Vùng kháng cự kỹ thuật | Vùng hỗ trợ kỹ thuật |
|---|---|---|---|---|---|---|---|---|---|---|---|

- Tiêu đề trang phía trên bảng: **"Bộ lọc cổ phiếu - TOP trạng thái kỹ thuật Ngành đầu tư"**.
- 2 cột cuối "Vùng kiểm định kỹ thuật" / "Vùng kháng cự kỹ thuật" hiển thị bình thường, không tô màu nền.
- Cột "Vùng hỗ trợ kỹ thuật" luôn tô màu nền vàng (xem token màu).
- Bên dưới bảng có khối "Miễn trừ trách nhiệm" dạng khung viền, căn giữa.

## 2. Design tokens — màu sắc (đo chính xác từ ảnh mẫu)

```css
/* Khối tiêu đề trang */
--title-bg: #E7CBD7;        /* nền hồng lavender nhạt, full chiều rộng bảng */
--title-text: #8A2BFA;      /* chữ tím, in đậm, font lớn, căn giữa */

/* Header bảng (dòng tên cột) */
--table-header-bg: #2C2068; /* nền tím than đậm */
--table-header-text: #FFFFFF; /* chữ trắng, in đậm */

/* Nội dung bảng mặc định */
--row-bg: #FFFFFF;
--row-text: #000000;

/* Cột "Trạng thái Model" — TÔ MÀU NỀN CẢ Ô theo giá trị, chữ đen đậm */
--status-rat-tich-cuc-bg: #FF2AFA;  /* RẤT TÍCH CỰC — hồng magenta */
--status-tich-cuc-bg:     #00D92B;  /* TÍCH CỰC — xanh lá */
--status-kha-quan-bg:     #C3FB33;  /* KHẢ QUAN — vàng chanh */
--status-text: #000000; /* chữ đen, in đậm, cho cả 3 trạng thái trên */

/* Cột "Sức mạnh xu hướng Dòng tiền - RSI/MFI" — nền PEACH cố định cho mọi dòng,
   chỉ đổi MÀU CHỮ theo giá trị */
--strength-bg: #FDE0C7;             /* nền cam đào nhạt — áp dụng cho mọi giá trị trong cột này */
--strength-tang-manh-text: #FF2AFA; /* TĂNG MẠNH — chữ hồng magenta đậm */
--strength-tang-text:      #234418; /* TĂNG — chữ xanh rêu đậm */
--strength-tang-dan-text:  #000000; /* TĂNG DẦN — chữ đen */

/* Cột "Vùng hỗ trợ kỹ thuật" — luôn tô nền vàng, chữ đỏ đậm, mọi dòng */
--support-bg: #FFFB33;
--support-text: #FF0004;
```

## 3. Quy tắc tô màu theo điều kiện (conditional formatting logic)

Agent cần implement bằng hàm map giá trị → màu (không hard-code màu theo từng dòng dữ liệu, để khi dữ liệu thay đổi màu vẫn tự cập nhật đúng):

```js
const STATUS_COLORS = {
  "RẤT TÍCH CỰC": { bg: "#FF2AFA", text: "#000000" },
  "TÍCH CỰC":     { bg: "#00D92B", text: "#000000" },
  "KHẢ QUAN":     { bg: "#C3FB33", text: "#000000" },
  // các trạng thái khác (TRUNG LẬP, KO TÍCH CỰC, TIÊU CỰC...) — cần bổ sung màu khi có đủ dữ liệu mẫu,
  // tạm thời để nền trắng/chữ đen mặc định nếu chưa có chỉ định màu.
};

const STRENGTH_TEXT_COLORS = {
  "TĂNG MẠNH": "#FF2AFA",
  "TĂNG":      "#234418",
  "TĂNG DẦN":  "#000000",
};
// Nền cột Sức mạnh xu hướng LUÔN là #FDE0C7 bất kể giá trị gì.

// Cột Vùng hỗ trợ kỹ thuật: nền #FFFB33 + chữ #FF0004 áp dụng cho MỌI dòng có giá trị (không phụ thuộc điều kiện).
```

> **Lưu ý quan trọng:** Trong ảnh mẫu chỉ xuất hiện 3 mức trạng thái (RẤT TÍCH CỰC / TÍCH CỰC / KHẢ QUAN) và 3 mức sức mạnh xu hướng (TĂNG MẠNH / TĂNG / TĂNG DẦN). Theo dữ liệu nhập liệu gốc của hệ thống còn có thêm các trạng thái khác: TRUNG LẬP, KO TÍCH CỰC, TIÊU CỰC. **Agent cần hỏi lại team nội dung/thiết kế để xin bảng màu cho các trạng thái còn thiếu này** trước khi lên production, tránh tự suy đoán màu (gợi ý theo logic tông màu nóng-lạnh hiện có: các trạng thái xấu hơn nên chuyển dần sang tông cam/đỏ, đối lập với xanh lá/hồng magenta dùng cho trạng thái tích cực — nhưng cần xác nhận chính thức).

## 4. Chi tiết khác

- Font chữ: in đậm (bold) cho toàn bộ giá trị trong các cột có tô màu (Trạng thái Model, Sức mạnh xu hướng, Vùng hỗ trợ kỹ thuật), để đảm bảo độ tương phản và dễ đọc trên nền màu.
- Căn giữa (text-align: center) cho tất cả các cột trừ "Mô tả Mô hình kỹ thuật (Model)" có thể căn trái hoặc giữa tuỳ độ dài nội dung.
- Cột "Update time": hiển thị 1 dòng dạng `giờ:phút ngày/tháng` (ví dụ `23:26 05/03`), không ngắt dòng giữa giờ và ngày (đã nêu ở yêu cầu trước — tham chiếu file `Prompt_Cap_Nhat_Web_FinTop_DATA.md`, mục 1.3).
- Khối "Miễn trừ trách nhiệm" bên dưới bảng: tiêu đề "MIỄN TRỪ TRÁCH NHIỆM!" màu đỏ in đậm, nội dung "Dữ liệu chỉ mang tính chất tham khảo, không khuyến nghị và tư vấn đầu tư. Người dùng chịu hoàn toàn trách nhiệm trước các quyết định đầu tư của mình." màu đen, đặt trong khung viền mảnh, căn giữa toàn bảng.
- Đảm bảo bảng responsive: trên mobile, nếu không đủ chỗ hiển thị hết các cột, ưu tiên giữ lại Mã CP, Trạng thái Model, Sức mạnh xu hướng và Vùng hỗ trợ kỹ thuật (các cột có tô màu, mang tính trực quan cao nhất), các cột còn lại có thể cuộn ngang hoặc ẩn vào chi tiết mở rộng.
- Có sẵn nút lọc (icon 3 gạch/mũi tên xuống) ở cột "Trạng thái Model" và "Sức mạnh xu hướng" để người dùng tự lọc theo từng mức màu — theo đúng ghi chú đã có trong tài liệu yêu cầu trước đó.

## 5. Checklist cho Agent

- [ ] Header bảng nền `#2C2068`, chữ trắng đậm.
- [ ] Tiêu đề trang nền `#E7CBD7`, chữ `#8A2BFA` đậm, căn giữa.
- [ ] Cột Trạng thái Model: tô nền cả ô theo bảng `STATUS_COLORS`, chữ đen đậm.
- [ ] Cột Sức mạnh xu hướng: nền cố định `#FDE0C7` cho mọi dòng, chữ đổi màu theo `STRENGTH_TEXT_COLORS`.
- [ ] Cột Vùng hỗ trợ kỹ thuật: nền `#FFFB33`, chữ `#FF0004` đậm, áp dụng mọi dòng.
- [ ] Cột Vùng kiểm định / Vùng kháng cự: nền trắng, không tô màu đặc biệt.
- [ ] Xác nhận với team bảng màu cho các trạng thái còn thiếu (TRUNG LẬP, KO TÍCH CỰC, TIÊU CỰC...) trước khi lên production.
- [ ] Khối Miễn trừ trách nhiệm hiển thị đúng vị trí, đúng màu, căn giữa dưới bảng.
- [ ] Responsive: ưu tiên hiển thị các cột có màu trên mobile.
