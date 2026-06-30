# PROMPT CHO AI AGENT — THIẾT KẾ LẠI TRANG ĐĂNG KÝ & ĐĂNG NHẬP (FinTop DATA)

> Yêu cầu: giữ **nội dung/luồng nghiệp vụ** theo bản web cũ (đã có sẵn field, đã có góp ý chốt lại cách chia bước trong các comment trao đổi nội bộ), nhưng **thiết kế lại giao diện hoàn toàn** theo hướng đẹp, tối giản, hiện đại — không kế thừa phong cách giao diện cũ (nền đen, input pill bo tròn kiểu mặc định, banner đỏ-vàng tương phản gắt).

---

## 1. Hiện trạng bản cũ & các quyết định đã chốt qua trao đổi nội bộ

Bản cũ có luồng đăng ký **4 bước** (hiển thị bằng thanh stepper ngang dưới form): *Thông tin cơ bản → Thông tin tài khoản → Xác thực thông tin → Thành công*.

Qua trao đổi góp ý (đính kèm ảnh chụp màn hình + comment), team đã **chốt lại cách phân bổ field giữa các bước** như sau — đây là phần nội dung Agent cần tuân theo, KHÔNG phải thiết kế cũ về giao diện:

- Bước 1 nên **đơn giản hoá tối đa**, chỉ giữ lại các field thiết yếu nhất; bỏ Sinh nhật và Địa chỉ ra khỏi bước 1, chuyển sang bước 2.
- Phần "Đặt mật khẩu" nên gộp sang bước 3 (Xác thực) cùng với mã xác thực (OTP), thay vì để ở bước 2 — mục đích là giảm cảm giác "phải nhập quá nhiều thứ" ở bước thông tin tài khoản, và để bước 3 trở thành bước "chốt" cuối cùng trước khi thành công.
- Bước 4 ("Thành công") thực chất chỉ là màn hình kết quả/xác nhận, không yêu cầu nhập liệu — nên về cảm nhận người dùng, luồng chỉ còn **3 bước nhập liệu thực sự**.

### Nội dung từng bước (đã chốt)

**Bước 1 — Thông tin cơ bản**
| Field | Bắt buộc |
|---|---|
| Họ và tên | Có |
| Số điện thoại / Zalo | Có |
| Email | Có |
| ID người giới thiệu | Không |
| Tên người giới thiệu | Không |

**Bước 2 — Thông tin tài khoản**
| Field | Loại | Bắt buộc |
|---|---|---|
| Sinh nhật | date picker (dd/mm/yyyy) | Có |
| Tỉnh/Thành phố hiện tại | text/select | Có |
| Thời gian đầu tư | radio: 0-3 tháng / 3-6 tháng / 6-12 tháng / Trên 1 năm | Có |
| Khẩu vị đầu tư | radio: Lướt sóng ngắn hạn / Trung và dài hạn / Linh hoạt kết hợp | Có |
| Công ty chứng khoán | radio: Chưa TKCK / VPS / SSI / VND / Công ty khác | Có |
| Số tài khoản chứng khoán (nếu có) | text, hiện khi đã chọn 1 công ty chứng khoán cụ thể | Không |

**Bước 3 — Xác thực thông tin**
| Field | Loại | Bắt buộc |
|---|---|---|
| Đặt mật khẩu | password, có icon hiện/ẩn mật khẩu | Có |
| Nhập lại mật khẩu | password, có icon hiện/ẩn mật khẩu | Có |
| Mã xác thực (OTP qua SĐT hoặc Email) | text/number, có nút "Gửi lại mã" + đếm ngược | Có |

→ Bấm "Đăng ký" / "Hoàn tất" sau bước 3 sẽ điều hướng sang màn hình kết quả.

**Bước 4 — Thành công**
- Màn hình xác nhận đăng ký thành công, không có form nhập liệu.
- Gợi ý nội dung: thông báo thành công + CTA "Đăng nhập ngay" hoặc tự động chuyển hướng vào tài khoản.

---

## 2. Trang Đăng nhập (Đăng nhập)

> Lưu ý: chưa có mockup bản cũ cho trang Đăng nhập trong dữ liệu hiện có. Agent thiết kế theo chuẩn UX phổ biến, tối giản, đồng bộ ngôn ngữ thiết kế với trang Đăng ký, và cần xác nhận lại với team nội dung trước khi lên production nếu có yêu cầu đặc thù khác (ví dụ đăng nhập bằng OTP thay vì mật khẩu).

Đề xuất nội dung mặc định:
- Số điện thoại hoặc Email (1 field dùng chung).
- Mật khẩu (có icon hiện/ẩn).
- Link "Quên mật khẩu?".
- Nút "Đăng nhập" (CTA chính).
- Link phụ "Chưa có tài khoản? Đăng ký ngay" dẫn sang luồng đăng ký ở mục 1.
- (Tuỳ chọn, cần xác nhận) Đăng nhập nhanh qua mạng xã hội hoặc OTP.

---

## 3. Yêu cầu thiết kế UI — đẹp, tối giản, hiện đại

Bản cũ đang mắc các lỗi UI sau cần khắc phục triệt để (không kế thừa):
- Nền đen tuyền với hoạ tiết mờ phía sau, độ tương phản gắt, cảm giác nặng nề, thiếu chuyên nghiệp.
- Input dùng style pill bo tròn quá mức, nền xanh nhạt lệch tông với phần còn lại của giao diện.
- Banner bước "Các bước đăng ký tài khoản" dùng màu đỏ mận (maroon) + chữ vàng tương phản gắt, tách biệt hẳn với phần form phía trên — không có sự liền mạch trong bố cục.
- Stepper dùng 2 màu chấm tròn rời rạc (xanh lá cho bước hiện tại/đã xong, hồng cho bước chưa tới) thiếu tinh tế.

**Định hướng thiết kế mới:**
- Nền sáng hoặc nền tối trung tính (không dùng đen tuyền + hoạ tiết), ưu tiên bố cục 1 card trắng/nền nhẹ nổi trên nền trung tính, bo góc lớn (16–20px), đổ bóng mềm (soft shadow), nhiều khoảng trắng (whitespace) giữa các nhóm field.
- Input dùng 1 kiểu bo góc vừa phải (8–12px), viền mảnh 1px, nền trùng tông với card (không chênh tông xanh nhạt như cũ), trạng thái focus có viền màu accent rõ ràng + hiệu ứng chuyển động nhẹ.
- Stepper hiện đại hoá: dùng 1 thanh tiến trình (progress bar) liền mạch hoặc 3 chấm có đường nối, đổi màu dần theo tiến độ — tránh 2 màu tương phản gắt hồng/xanh lá như bản cũ; có thể dùng 1 màu accent chính duy nhất với 3 trạng thái (chưa tới: xám nhạt, đang ở: accent đậm + viền nổi, đã hoàn thành: accent + dấu tick).
- Gộp khối stepper vào cùng 1 hệ thống màu/bo góc với card form, không tách biệt thành 1 banner đối lập màu sắc như cũ.
- Nút CTA chính ("Tiếp tục", "Đăng ký", "Đăng nhập"): 1 màu accent nhất quán xuyên suốt cả luồng đăng ký lẫn đăng nhập (không đổi màu lung tung theo từng bước như bản cũ đang dùng xanh lá cho "Tiếp tục" nhưng lại khác màu các nút khác).
- Nút phụ ("Quay lại"): dạng outline/ghost button, không lấn át nút chính.
- Validation: hiển thị lỗi ngay dưới từng field bằng màu đỏ + icon cảnh báo nhỏ, không chỉ dựa vào dấu `*` đỏ ở label như bản cũ.
- Trường mật khẩu: thêm chỉ báo độ mạnh mật khẩu (yếu/trung bình/mạnh) dưới dạng thanh màu, cải thiện UX so với bản cũ (chỉ có icon hiện/ẩn).
- Responsive: trên mobile, các field 2–3 cột chuyển thành 1 cột, padding/font-size điều chỉnh phù hợp, stepper rút gọn còn số bước + label ngắn hoặc chỉ hiện progress bar.
- Vi chuyển động (micro-interaction): hiệu ứng chuyển bước mượt (slide/fade) thay vì load lại trang cứng nhắc.

---

## 4. Yêu cầu kỹ thuật

- Xây dựng 1 component `RegisterStepper` dùng chung cho 3 bước nhập liệu, quản lý state tập trung (không tách rời từng bước thành trang riêng biệt mất dữ liệu khi back/forward).
- Validate từng bước trước khi cho phép "Tiếp tục" — chặn chuyển bước nếu field bắt buộc còn trống hoặc sai định dạng (SĐT, Email, mật khẩu trùng khớp).
- Trường "Số tài khoản chứng khoán" chỉ hiện khi người dùng chọn 1 công ty chứng khoán cụ thể ở bước 2 (ẩn khi chọn "Chưa TKCK").
- OTP ở bước 3: có cơ chế gửi mã, đếm ngược thời gian hết hạn, nút gửi lại mã khi hết hạn hoặc khi người dùng yêu cầu.
- Trang Đăng nhập và luồng Đăng ký dùng chung 1 bộ token thiết kế (màu, bo góc, typography, input style) để đảm bảo nhất quán toàn bộ khu vực tài khoản.

---

## 5. Checklist cho Agent

- [ ] Bước 1 chỉ còn 5 field theo đúng bảng mục 1 (bỏ Sinh nhật, Địa chỉ).
- [ ] Bước 2 gồm Sinh nhật, Tỉnh/TP, Thời gian đầu tư, Khẩu vị đầu tư, Công ty chứng khoán, Số TKCK (ẩn/hiện theo lựa chọn).
- [ ] Bước 3 gồm Đặt mật khẩu, Nhập lại mật khẩu, Mã OTP — không còn ở bước 2 như bản cũ.
- [ ] Bước 4 chỉ là màn hình kết quả thành công, không có form.
- [ ] Thiết kế lại toàn bộ giao diện theo định hướng mục 3 — không kế thừa nền đen, input pill cũ, banner màu đối lập.
- [ ] Stepper mới đồng bộ màu/bo góc với card form, không tách biệt thành banner riêng.
- [ ] Trang Đăng nhập thiết kế đồng bộ ngôn ngữ thiết kế với Đăng ký; nội dung field cần xác nhận thêm với team nếu có yêu cầu đặc thù.
- [ ] Validate đầy đủ theo từng bước, có thông báo lỗi rõ ràng dưới field.
- [ ] Responsive tốt trên mobile, không vỡ layout nhiều cột.
