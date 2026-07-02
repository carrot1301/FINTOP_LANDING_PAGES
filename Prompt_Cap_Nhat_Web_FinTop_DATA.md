# PROMPT CHO AI AGENT — CẬP NHẬT WEBSITE FINTOP DATA (2026)

> File này được tổng hợp từ file Excel "Bản mới - Triển khai Web & dữ liệu Fintech - FinTop DATA 2026" do team nội bộ ghi chú sau khi duyệt demo. Mục tiêu: AI Agent đọc và thực hiện chỉnh sửa trực tiếp trên codebase/CMS của website demo.

## 0. Bối cảnh dự án

- **Web FinTop cũ:** https://fintopdata.vn/
- **Demo Web FinTop MỚI (đang triển khai):** https://fintop-landing-pages.vercel.app/
- Phạm vi công việc gồm 3 nhóm việc lớn (theo ghi chú gốc):
  1. Cập nhật INPUT — bảng biểu dữ liệu bên trong (Trang Quản trị).
  2. Cập nhật OUTPUT — giao diện hiển thị ra ngoài (Frontend) theo thiết kế mới.
  3. Cập nhật, hiệu chỉnh các phần còn lại để đồng bộ với bản WEB mới.
- **Lưu ý Header:** Không dùng cụm "Tài Chính & Đầu Tư" ở Header nữa. Có thể bỏ hẳn chữ mô tả, hoặc thay bằng "Dữ Liệu Chứng Khoán", hoặc một cụm khác phù hợp hơn (cần Agent đề xuất 2–3 phương án nếu không chắc).

---

## 1. ƯU TIÊN CAO NHẤT: Sửa lỗi ngắt dòng (line-break) không hợp lý

### 1.1 Mô tả lỗi
Trong nội dung gốc (nhập từ Excel), nhiều đoạn text bị **chèn xuống dòng cứng** (ký tự xuống dòng thủ công, kiểu Alt+Enter) ngay trong câu. Khi đẩy nguyên văn các đoạn này lên web, nếu code dùng `<br>` cứng hoặc giữ nguyên ký tự xuống dòng thay vì để CSS tự bọc chữ (`white-space`, `word-wrap`), văn bản sẽ bị:
- Ngắt giữa câu một cách vô lý trên màn hình rộng (xuất hiện dòng cụt rất ngắn).
- Bố cục lệch, không responsive tốt trên mobile (vì điểm ngắt dòng cố định không phụ thuộc độ rộng màn hình thực tế).
- Một số ô còn dư ký tự xuống dòng thừa ở cuối (dòng trống vô nghĩa).

### 1.2 Quy tắc xử lý chung cho AI Agent
1. **Mặc định: bỏ ngắt dòng cứng, để CSS tự động word-wrap** theo chiều rộng khung chứa (đặc biệt với các đoạn văn dài, mô tả, disclaimer).
2. **Chỉ giữ ngắt dòng có chủ đích thiết kế** (ví dụ: tiêu đề 2 dòng ngắn gọn cho hero banner, card chuyên gia) — nhưng nên implement bằng CSS (`<br>` ẩn/hiện theo breakpoint, hoặc giới hạn max-width) thay vì hard-code 1 vị trí ngắt cố định cho mọi kích thước màn hình.
3. Với các trường **thời gian/ngày tháng** (giờ + ngày), không ngắt dòng giữa giờ và ngày — hiển thị liền trên 1 dòng, có thể dùng `white-space: nowrap` hoặc tách thành 2 cột riêng nếu bảng quá hẹp, thay vì để Excel tự xuống dòng.
4. Xoá các ký tự xuống dòng thừa/trailing ở cuối nội dung (dòng trống không có nghĩa).
5. Rà soát toàn bộ nội dung tĩnh (label, mô tả, disclaimer, câu chuyện công ty, testimonial) để áp dụng đồng bộ quy tắc trên trước khi đẩy lên CMS/component.

### 1.3 Danh sách các vị trí phát hiện lỗi ngắt dòng (từ dữ liệu gốc) cần rà soát & sửa

| Khu vực | Nội dung gốc (có ngắt dòng `\n`) | Đề xuất xử lý |
|---|---|---|
| HOME – Hero | "Kỷ Nguyên Đầu Tư / Cùng FinTop DATA" | Có thể giữ ngắt 2 dòng cho hero (chủ đích thiết kế), nhưng cần đảm bảo responsive tốt trên mobile, không vỡ dòng xấu. |
| HOME – Đội ngũ chuyên gia | "Thạc sĩ Kinh tế chiến lược (FSU JENA, Đức)" | Bỏ ngắt dòng cứng giữa học vị và tên trường, để tự wrap theo khung card. |
| HOME – Đội ngũ chuyên gia | "Thạc sĩ Tài chính số - FinTech (Loughborough Uni, Anh)" | Tương tự — bỏ ngắt cứng, để tự wrap. |
| Menu/Submenu – Mục Dữ liệu | "- Đổi tên từ CẨM NANG ĐẦU TƯ cũ / - Cập nhật BCPT của CTCK, stock data..." | Đây là 2 ý ghi chú nội bộ, nên tách thành 2 dòng/2 bullet rõ ràng trong tài liệu yêu cầu (không phải nội dung hiển thị lên web). |
| Menu/Submenu – Mục Dữ liệu | Ghi chú kỹ thuật "rel=nofollow / target=_blank..." | Nội dung ghi chú kỹ thuật cho dev, không phải text hiển thị — xem mục 2.6. |
| Hội viên – Đăng ký PRO | "Đăng ký Hội viên PRO FinTop DATA" | Bỏ ngắt dòng cứng, để tự wrap theo độ rộng nút/khung. |
| Hội viên – Liên kết TK | "Liên kết tài khoản chứng khoán (ID FinTop)" / "Liên kết tài khoản Diamond (NAV từ 1 tỷ VND)" | Bỏ ngắt dòng cứng giữa tên mục và phần chú thích trong ngoặc; để tự wrap. |
| Hội viên – Hướng dẫn mở TK (B1) | "B1: Chưa có tài khoản, chọn 1 phương thức mở TK chứng khoán. + Mở TKCK VPS... + Mở TKCK TCBS..." | Chuyển thành danh sách có cấu trúc (list/step), không dùng `\n` thô — mỗi gạch đầu dòng là 1 item riêng trong component hướng dẫn từng bước. |
| Hội viên – Hướng dẫn liên kết TK (B2) | "B2: Liên kết User - Tài khoản chứng khoán. + Nhập số TKCK liên kết: + Tên công ty chứng khoán:" | Tương tự — chuyển thành form fields/list step rõ ràng, không phải đoạn text ngắt dòng thô. |
| Hội viên – Nội dung chuyển khoản PRO1/PRO2/PRO3 | "Ngân hàng: MBBank... / Số tài khoản: ... / Chủ tài khoản: ... / Nội dung: ... / Ví dụ: ..." | Đây là khối thông tin nhiều dòng có chủ đích (mỗi dòng 1 trường thông tin) — **giữ nguyên dạng nhiều dòng nhưng implement bằng list/table rõ field**, không phải 1 đoạn text dồn `\n`. |
| Hội viên – Ghi chú phê duyệt | "- TK có thời hạn... - TK mặc định" (có `\n` thừa ở cuối) | Xoá dòng trống thừa ở cuối; trình bày dạng 2 bullet rõ ràng. |
| Stock Data – Bảng dữ liệu | Tiêu đề cột: "Trạng thái Model", "Sức mạnh xu hướng Dòng tiền - RSI/MFI", "Vùng kiểm định kỹ thuật", "Vùng kháng cự kỹ thuật", "Vùng hỗ trợ kỹ thuật" | Đây là tiêu đề cột bảng — ngắt dòng có thể giữ để header gọn (2 dòng), nhưng cần đồng bộ cho **tất cả** các bảng dùng cùng tiêu đề (hiện đang lặp lại ở nhiều vị trí), tránh mỗi nơi style khác nhau. |
| Stock Data – Cột Update time | "23:26\n05/03" (lặp lại nhiều dòng: VEA, DST, DGW, MWG, PNJ...) | **Lỗi rõ nhất**: giờ và ngày đang bị tách dòng cứng theo cách nhập liệu Excel, không phải chủ đích thiết kế. Theo ghi chú gốc "Thời gian chỉ hiển thị giờ : phút, bỏ giây đi" → hiển thị 1 dòng dạng `23:26 05/03`, bỏ giây, không ngắt dòng. |
| Stock Data – Box tra cứu mã CP | "Box nhập mã CP + enter nó sẽ nhảy mã ở bên dưới. TỐI ĐA 10 MÃ, quá thì tự động xóa mã đầu tiên." | Đây là ghi chú chức năng cho dev (không phải text hiển thị) — bỏ `\n` thừa, viết liền mạch trong tài liệu spec (xem mục 2.4). |
| Stock Data – Disclaimer | "Dữ liệu chỉ mang tính chất tham khảo, không khuyến nghị và tư vấn đầu tư. Người dùng chịu hoàn toàn trách nhiệm trước các quyết định đầu tư của mình." (lặp lại ở nhiều popup/khối) | Bỏ ngắt dòng cứng giữa 2 câu, để text tự wrap theo khung popup/khối. Đồng bộ 1 nội dung disclaimer duy nhất dùng chung (component tái sử dụng), tránh copy nhiều bản rải rác dễ lệch nội dung. |
| Stock Data – Mô tả Bộ lọc cổ phiếu | Đoạn mô tả dài "Bảng tổng hợp danh mục cổ phiếu theo Trạng thái và Kết quả thuật toán..." | Bỏ ngắt dòng kép `\n\n` giữa 2 đoạn nếu hiển thị trong khung hẹp; nếu là tooltip/hướng dẫn dạng 2 đoạn thì giữ xuống dòng nhưng style bằng `<p>` riêng từng đoạn, không dùng `\n` thô trong chuỗi. |

> **Lưu ý cho Agent:** Bảng trên chỉ liệt kê các vị trí phát hiện được trong dữ liệu gốc. Khi thao tác trên code thực tế, Agent cần **search toàn bộ source nội dung** (CMS content, JSON/i18n, hoặc component hard-code) để tìm các đoạn có `\n`, `<br>` dư thừa hoặc các đoạn bị wrap cứng theo style cũ, rồi áp dụng quy tắc ở mục 1.2.

---

## 2. Cập nhật nội dung & cấu trúc theo từng khu vực

### 2.1 Header / Menu chính
- Header hiện có: Logo "FinTop DATA" | Ô tìm kiếm (Ctrl+K) | Menu: Hội Viên, FinTop Data, Phân tích, Stock Data, Hướng Dẫn | icon Tài khoản | Đăng nhập.
- **Không dùng** "Tài Chính & Đầu Tư" trong header; cân nhắc bỏ hẳn dòng mô tả phụ hoặc đổi thành "Dữ Liệu Chứng Khoán" (hoặc cụm phù hợp hơn).
- Mục "Giới thiệu" (Giới thiệu FINTOP) → **gộp vào trang HOME**, không tách thành menu riêng.

### 2.2 Trang HOME
Nội dung & khối hiển thị theo thứ tự:
1. Hero: Tiêu đề "Kỷ Nguyên Đầu Tư Cùng FinTop DATA", mô tả "Nơi hội tụ Data - Chuyên gia - Công nghệ & AI. Tinh gọn và hiệu quả.", CTA "Bắt đầu miễn phí".
2. Khối "Dữ liệu đầu tư thế hệ mới!" — 3 cột: DATA (Tra cứu Cổ phiếu, Bộ lọc Cổ phiếu, Phân tích định lượng, Stock Data), CHUYÊN GIA (Nghiên cứu thị trường, Phân tích chuyên sâu, Phân tích Doanh nghiệp, Phân tích Ngành), AI PHÂN TÍCH (Công cụ FinTop AI, Phân tích Sentiment, Phân tích biên độ giá, Phân tích QTRR).
3. Khối "Hệ sinh thái phân tích thông minh" — tagline: "Đồng hành trên +10,000 nhà đầu tư tại Việt Nam làm chủ dòng tiền đầu tư thông minh bằng bộ công cụ dữ liệu tiêu chuẩn quốc tế." (gộp 1 đoạn liền mạch, không ngắt dòng cứng).
4. Bảng "Chọn gói Hội viên": 4 gói STANDARD / PRO / V.I.P / DIAMOND, mỗi gói có tên phụ (Tiêu chuẩn/Chuyên nghiệp/Cao cấp/Kim cương), 3 dòng quyền lợi tương ứng, nút "Đăng ký" cho từng gói (chi tiết quyền lợi xem mục 2.3).
5. Khối "Đội ngũ Chuyên gia" — mô tả: "Đồng hành cùng Chuyên gia trên nền tảng Công nghệ & Dữ liệu FinTop DATA." Danh sách chuyên gia:
   - Nguyễn Đình Hải (Mr) — Giám đốc NC&PT Dữ liệu đầu tư — Nghiên cứu thị trường & Quản trị chiến lược.
   - Nguyễn Thành Phúc (Mr) — Chuyên gia Nghiên cứu & Phân tích — Dữ liệu Doanh nghiệp & Cổ phiếu.
   - Trần Khánh Linh (Mr) — Chuyên gia Nghiên cứu & Phân tích — Doanh nghiệp & Ngành kinh tế.
   - Nguyễn Minh Hạnh (Ms) — Chuyên gia NC&PT Vĩ mô - Ngành — Thạc sĩ Kinh tế chiến lược (FSU JENA, Đức).
   - Mai Tiến Dũng (Mr) — Chuyên gia NC&PT Doanh nghiệp — Thạc sĩ Tài chính số - FinTech (Loughborough Uni, Anh).
6. Khối "Giới thiệu FINTOP" (đã gộp vào HOME) — đoạn giới thiệu công ty đầy đủ: "Công Ty TNHH Đầu Tư & Phát Triển FINTOP là doanh nghiệp Fintech & Data hoạt động và định hướng phát triển trong lĩnh vực Công nghệ Tài chính, Nghiên cứu - Phân tích - Xử lý - Xuất bản Dữ liệu..." (giữ nguyên nội dung, chỉ chuẩn hoá định dạng đoạn văn — không ngắt dòng cứng giữa câu).
7. Khối Testimonial (3 đánh giá khách hàng):
   - (Anh) Lê Văn Long — Giám đốc Tư vấn đầu tư, CTCP Chứng khoán VPS.
   - (Chị) Trần Thị Hồng Lịch — Nhà đầu tư, Khách hàng Đối tác FINTOP.
   - (Chị) Helena Hạnh Đặng — Khách hàng Đối tác, Chuyên gia Đào tạo Tài chính.
   (Nội dung trích dẫn giữ nguyên, chuẩn hoá định dạng dấu ngoặc kép, không ngắt dòng giữa câu.)

### 2.3 Cấu trúc Menu/Submenu tổng hợp (Sitemap)

| STT | Tên Menu | Ghi chú | Submenu | Phân quyền |
|---|---|---|---|---|
| 0.0 | HOME | Trình bày trang chủ; **bỏ mục Giới thiệu riêng, gộp vào HOME** | — | — |
| 1.0 | Hội viên | Nâng cấp tài khoản hội viên FINTOP — cần note rõ phân quyền user | — | — |
| 2.0 | FinTop Data | Cập nhật/bổ sung | Tra cứu cổ phiếu | Standard |
| | | | Bộ lọc cổ phiếu | PRO |
| | | | FinTop AI | Standard (tích hợp phụ: đo lường tốc độ tăng/giảm giá CP theo thời gian → đánh giá tiềm năng sinh lời/rủi ro; kết hợp dữ liệu định giá từ FireAnt/FiinTrade để AI phân tích độ an toàn & tiềm năng doanh nghiệp) |
| | | | Copy Trade Chuyên gia | Mở TKCK TCBS — trang đơn giản, tinh gọn, hiển thị sau (FinTop sẽ đẩy nội dung lên sau) |
| 3.0 | Nghiên cứu | — | Thị trường | Standard |
| | | | PRO Research | PRO |
| | | | Doanh nghiệp | Standard |
| | | | NCPT Ngành | Standard |
| 4.0 | Dữ liệu | Đổi tên từ "CẨM NANG ĐẦU TƯ" cũ; cập nhật BCPT của CTCK, stock data tương tự sheet bảng cẩm nang cũ | Tổng quan | Standard |
| | | | PRO Data | PRO — gồm Báo cáo phân tích các CTCK |
| | | | Định lượng | Standard — Hiệu suất đầu tư cổ phiếu (tính theo mã, theo ngành, trong 1 khoảng thời gian) |
| | | | Báo cáo | Bảng danh mục (kèm link), trình bày như mục Hướng dẫn; nguồn tổng hợp từ Công ty Chứng khoán |
| 5.0 | Hướng dẫn | Lấy nội dung hướng dẫn từ cẩm nang cũ đẩy sang | Giao dịch & Đầu tư | Standard |
| | | | Phân tích kỹ thuật (TA) | |
| | | | Phân tích cơ bản (FA) | |
| | | | Tủ sách đầu tư | |

### 2.4 Khu vực Hội viên (Tài khoản & Gói)

**Bảng so sánh 4 gói (hiển thị ở trang chủ và trang Hội viên):**

| | STANDARD (Tiêu chuẩn) | PRO (Chuyên nghiệp) | V.I.P (Cao cấp) | DIAMOND (Kim cương) |
|---|---|---|---|---|
| Quyền lợi 1 | Tra cứu cổ phiếu | Bộ lọc cổ phiếu | Đặc quyền PRO | Đặc quyền V.I.P |
| Quyền lợi 2 | Phân tích cơ bản | Pro Research/Analysis | Kết nối Chuyên gia | Đặc quyền PRO |
| Quyền lợi 3 | Tool & Dữ liệu cơ bản | Pro Data | Phân tích Chuyên gia | Cố vấn 1-1 Chuyên gia |
| Hành động | Đăng ký miễn phí | Đăng ký PRO | Liên kết V.I.P | Liên kết Diamond |

**Luồng thao tác (chuyển thành step-by-step UI, không phải đoạn text liền):**
- *STANDARD:* Bước 1 – Đăng ký tài khoản FinTop DATA miễn phí → Bước 2 – Đăng nhập và truy cập miễn phí. (Khách click "Đăng ký" → điều hướng sang trang đăng ký tài khoản. Sau khi đăng ký xong, hiển thị thông báo thành công kèm gợi ý "Nâng cấp tài khoản" nếu khách có nhu cầu.)
- *PRO:* Bước 1 – Chọn gói (PRO1/PRO2/PRO3) và thanh toán → Bước 2 – Tải ảnh xác nhận thanh toán và bấm "Yêu cầu phê duyệt".
  - Bảng giá (đã gồm VAT 10%): PRO1 (3 tháng) = 2.500.000 VND; PRO2 (6 tháng) = 4.500.000 VND; PRO3 (12 tháng) = 8.000.000 VND.
  - Thông tin chuyển khoản (hiển thị dạng list field rõ ràng, không gộp 1 đoạn text):
    - Ngân hàng: MBBank – Ngân hàng TMCP Quân đội
    - Số tài khoản: 86 286 243 8886
    - Chủ tài khoản: CÔNG TY TNHH ĐẦU TƯ VÀ PHÁT TRIỂN FINTOP
    - Nội dung chuyển khoản: `[HỌ TÊN]_[SỐ ĐIỆN THOẠI]_[GÓI PROx - x THÁNG]` (ví dụ minh hoạ theo từng gói PRO1/PRO2/PRO3)
  - **Bỏ phương thức thanh toán thứ 2** (chỉ giữ phương thức chuyển khoản + tải ảnh xác nhận, không hỗ trợ nộp tiền trực tiếp như bản cũ).
  - Sau khi bấm "Yêu cầu phê duyệt": hiển thị popup "Yêu cầu phê duyệt thành công! Thông tin phê duyệt của Anh/Chị sẽ được xử lý trong 1–3 ngày làm việc."
  - Đồng bộ màu logo, font chữ, icon đầu dòng (sao) theo đúng bản gốc/demo mới.
- *V.I.P:* Bước 1 – Mở tài khoản chứng khoán (nếu chưa có): Mở TKCK VPS – FinTop ID: BOJE / Mở TKCK TCBS – ID: 105CN48886 → Bước 2 – Liên kết tài khoản chứng khoán (nếu đã có): nhập số TKCK + tên công ty chứng khoán → Bấm "Yêu cầu phê duyệt".
- *DIAMOND:* Tương tự V.I.P, chỉ khác nội dung đặc quyền (Full đặc quyền PRO + Full đặc quyền V.I.P + Cố vấn 1-1 Chuyên gia). Điều kiện: liên kết tài khoản Diamond yêu cầu NAV từ 1 tỷ VND.

**Trang quản trị (Admin) – Quản lý tài khoản hội viên:**
- Hiển thị thông tin user: Thông tin khách hàng + Thông tin phê duyệt.
  - Gói PRO: hiển thị Gói đăng ký đã chọn + Ảnh thanh toán (có thời hạn).
  - Gói V.I.P/DIAMOND: hiển thị số TKCK và Công ty chứng khoán (mặc định, không thời hạn trừ khi cấu hình khác).
- Khu vực "Phê duyệt": 2 tab — *Chưa phê duyệt* / *Đã phê duyệt*. Click vào khách hàng để xử lý phê duyệt thời hạn:
  - Mặc định: CEO/Trợ lý CEO gạt switch xanh → tài khoản truy cập vô thời hạn cho đến khi bị reset.
  - Có thời hạn: CEO/Trợ lý CEO chọn ngày kết thúc gói → tài khoản tự hết hạn, chuyển về tài khoản thường.
  - Danh sách tài khoản có thời hạn nên sắp xếp theo ngày gần hết hạn nhất lên đầu, để CSKH chủ động báo gia hạn.
- Menu trang Quản trị: Trang chủ, Phê duyệt, Dữ liệu, Bài viết, Nhân sự, Khách hàng, Danh mục Web, Hướng dẫn.

**Ghi chú riêng — Chính sách "FinTop Team" (nội bộ, không public):**
- Chuyên gia "FinTop Team": là các chuyên gia hợp tác sử dụng dữ liệu & quảng bá cho FinTop DATA, có cơ chế chính sách riêng/đặc biệt (truyền thông nội bộ).
- Chính sách này KHÔNG công khai/truyền thông trên trang web tổng của FinTop DATA, vì không phải nguồn thu trực tiếp của FinTop DATA — chỉ là công cụ để các chuyên gia FinTop tự truyền thông/tư vấn "đặc quyền riêng" nhằm convert khách hàng cho cá nhân họ.
- **→ Agent lưu ý: không đưa nội dung này lên giao diện public, chỉ dùng làm tài liệu nội bộ/CRM.**

### 2.5 Trang FinTop Data — Khu vực "Tra cứu cổ phiếu" (Trang Quản trị nhập liệu)

**Bảng nhập liệu (Trang Quản trị → Dữ liệu chứng khoán)** gồm các cột: STT, Mã CP, Sàn, Ngành HĐKD, Cán bộ, Update time, Mô tả Mô hình kỹ thuật (Model), Trạng thái Model, Sức mạnh xu hướng Dòng tiền (RSI/MFI), Vùng kiểm định kỹ thuật, Vùng kháng cự kỹ thuật, Vùng hỗ trợ kỹ thuật.

**Thay đổi cấu trúc cột (theo ghi chú):**
- Bỏ cột "Xếp hạng TA".
- Bỏ cột "Xếp hạng FA".
- Bỏ cột "Thông tin/Phân tích".
- Thêm 1 cột "Trạng thái Model" ngay bên phải cột "Mô tả".
- Đổi tên cột "Tín hiệu hành động" → "Kết quả Model".
- Trường "Điểm QTRR" (thuộc nhóm Kết quả Model) là trường **không bắt buộc** nhập.
- Cột "Update time": **chỉ hiển thị giờ:phút, bỏ giây** (ví dụ hiển thị "23:26 05/03", không tách dòng giữa giờ và ngày — xem mục 1.3).

**Khối "Tra cứu cổ phiếu" (Frontend hiển thị ra ngoài):**
- Ô nhập mã CP + nút "Tra cứu" (Enter để tìm).
- Sau khi nhập mã + Enter, mã cổ phiếu sẽ tự nhảy xuống danh sách bên dưới (tối đa hiển thị 10 mã gần nhất; nếu vượt quá 10 mã, tự động xoá mã được tra cứu đầu tiên — theo cơ chế FIFO).
- Bảng kết quả hiển thị các cột: STT, Mã CP, Sàn, Ngành HĐKD, Update time, Mô tả Mô hình kỹ thuật, Trạng thái Model. (Phần này **chỉ hiển thị đến cột Trạng thái Model**; cột "Kết quả Model → Điểm QTRR" chỉ hiển thị ở phần Bộ lọc, không hiển thị ở phần Tra cứu.)
- Ghi chú thuật toán (hiển thị cho người dùng): "Thuật toán Mô hình (Model) sử dụng tích hợp AI và các Indicators (MA, Bollinger Band - Kênh xu hướng, RSI, Nến, ...) trên các khung thời gian để hiển thị các Trạng thái Mô hình (Model)."
- Disclaimer (popup khi click ở trạng thái chưa đăng nhập — hiển thị mỗi lần click): "MIỄN TRỪ TRÁCH NHIỆM! Dữ liệu chỉ mang tính chất tham khảo, không khuyến nghị và tư vấn đầu tư. Người dùng chịu hoàn toàn trách nhiệm trước các quyết định đầu tư của mình."
- Với người dùng đã đăng nhập: popup thông báo tương tự chỉ hiển thị **1 lần duy nhất**, có nút "TÔI ĐỒNG Ý".

**Khối "Bộ lọc cổ phiếu — TOP trạng thái kỹ thuật Ngành đầu tư":**
- Bảng đầy đủ các cột (giống bảng nhập liệu gốc, gồm cả Trạng thái Model, Sức mạnh xu hướng, Vùng kiểm định/kháng cự/hỗ trợ kỹ thuật).
- Thêm nút lọc (icon 3 gạch/mũi tên xuống) ở cột "Trạng thái Model" và "Kết quả Model" để khách hàng tự lọc dữ liệu.
- Có khối "Hướng dẫn sử dụng Bộ lọc" mô tả: "Bảng tổng hợp danh mục cổ phiếu theo Trạng thái và Kết quả thuật toán của Mô hình (Model) theo phương pháp phân tích định lượng, được trích xuất hoàn toàn tự động và tổng hợp theo các nhóm ngành. Đây là công cụ lọc và phân loại dữ liệu khách quan, hỗ trợ người dùng có thêm góc nhìn tổng quan về thị trường. Thuật toán Mô hình (Model) sử dụng AI phân tích và các Indicators (MA, Bollinger Band - Kênh xu hướng, RSI, Nến, ...) trên các khung thời gian để hiển thị các Trạng thái Mô hình (Model)." (Trình bày 2 đoạn văn riêng biệt — không ngắt dòng cứng trong 1 chuỗi.)
- Disclaimer tương tự khối Tra cứu, đặt cố định cuối bảng/khối.

### 2.6 Lưu ý kỹ thuật chung cho trang "Dữ liệu" (mục 4.0)
- Khi gắn các link dẫn ra ngoài (ví dụ link tới báo cáo phân tích của các CTCK), nên cài thuộc tính `rel="nofollow"` và/hoặc `target="_blank"` để: (1) người dùng không rời khỏi website hoàn toàn (mở tab mới), và (2) bảo vệ uy tín SEO của website.
- Nội dung "PRO Data" gồm Báo cáo phân tích các CTCK; nội dung "Định lượng" gồm Hiệu suất đầu tư cổ phiếu (tính theo mã, theo ngành, trong một khoảng thời gian); mục "Báo cáo" hiển thị dạng bảng danh mục kèm link (trình bày tương tự mục 5. Hướng dẫn), nguồn tổng hợp ghi rõ "Nguồn tổng hợp: Công ty Chứng khoán".

### 2.7 Trang Nghiên cứu / Chuyên gia / Stock Data / Hướng dẫn
- **Nghiên cứu:** gồm Thị trường (Standard), PRO Research (PRO), Doanh nghiệp (Standard), NCPT Ngành (Standard) — nội dung chi tiết theo từng submenu hiện đang để placeholder, cần team cung cấp nội dung bài viết thực tế trước khi Agent build trang.
- **Chuyên gia:** trang hiển thị dạng "Bài viết" — cần xác nhận chuyên mục/bố cục bài viết với team trước khi triển khai (hiện sheet gốc chỉ ghi chú ngắn gọn "BÀI VIẾT", chưa có nội dung chi tiết).
- **Stock Data:** trình bày dạng bài viết — tương tự, hiện chưa có nội dung chi tiết, cần bổ sung trước khi build.
- **Hướng dẫn:** lấy nội dung hướng dẫn từ "Cẩm nang đầu tư" bản cũ chuyển sang, gồm các submenu: Giao dịch & Đầu tư, Phân tích kỹ thuật (TA), Phân tích cơ bản (FA), Tủ sách đầu tư.

---

## 3. Checklist hoàn thành cho Agent

- [ ] Rà soát toàn bộ nội dung text trên cả site, loại bỏ ngắt dòng cứng không hợp lý theo quy tắc mục 1.2; áp dụng riêng cho danh sách ở bảng mục 1.3.
- [ ] Cập nhật header: bỏ "Tài Chính & Đầu Tư", thay bằng phương án phù hợp (đề xuất nếu cần).
- [ ] Gộp trang "Giới thiệu" vào trang HOME, xoá mục menu Giới thiệu riêng.
- [ ] Cập nhật bảng nhập liệu Trang Quản trị: bỏ cột Xếp hạng TA, Xếp hạng FA, Thông tin/Phân tích; thêm cột Trạng thái Model; đổi tên "Tín hiệu hành động" → "Kết quả Model"; đặt "Điểm QTRR" là trường không bắt buộc.
- [ ] Cột Update time chỉ hiển thị giờ:phút (bỏ giây), không ngắt dòng giữa giờ và ngày.
- [ ] Hoàn thiện cơ chế Tra cứu cổ phiếu (tối đa 10 mã, tự xoá mã cũ nhất khi vượt quá).
- [ ] Bổ sung nút lọc cho Trạng thái Model / Kết quả Model ở Bộ lọc cổ phiếu.
- [ ] Hoàn thiện luồng đăng ký/nâng cấp 4 gói hội viên (Standard/PRO/V.I.P/Diamond) theo step-by-step mô tả ở mục 2.4; bỏ phương thức thanh toán thứ 2 ở gói PRO.
- [ ] Hoàn thiện trang Quản trị: khu vực Phê duyệt (mặc định vô thời hạn / có thời hạn), hiển thị thông tin khách hàng theo từng gói.
- [ ] Đảm bảo không public chính sách riêng "FinTop Team" lên giao diện người dùng.
- [ ] Gắn `rel="nofollow"`/`target="_blank"` cho toàn bộ link ngoài trong mục Dữ liệu/Báo cáo.
- [ ] Đồng bộ nội dung Menu/Submenu, phân quyền Standard/PRO theo bảng mục 2.3.
- [ ] Liên hệ team nội dung để bổ sung bài viết cho mục Nghiên cứu, Chuyên gia, Stock Data trước khi build chi tiết (hiện chưa có content).
