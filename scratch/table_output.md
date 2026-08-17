# BẢNG DANH SÁCH TÀI KHOẢN NHÂN SỰ VÀ VAI TRÒ HỆ THỐNG

## I. DANH SÁCH VAI TRÒ NHÂN SỰ TRONG HỆ THỐNG (RBAC ROLES)

| STT | Mã Vai Trò (Role Code) | Tên Vai Trò | Mô Tả | Nhóm Vai Trò |
| --- | --- | --- | --- | --- |
| 1 | `SUPER_ADMIN` | Quản trị viên tối cao | Quyền hạn tối cao trên toàn hệ thống | Ban Quản Trị |
| 2 | `CEO` | Giám đốc điều hành | Quản lý toàn bộ vận hành & kinh doanh | Ban Điều Hành |
| 3 | `ASSISTANT_CEO` | Trợ lý Giám đốc | Hỗ trợ quản lý và giám sát hoạt động | Ban Điều Hành |
| 4 | `EDITOR_ADMIN` | Quản trị Biên tập | Quản lý bài viết, tin tức & báo cáo VIP | Khối Nội Dung |
| 5 | `EDITOR_PRO` | Biên tập viên Cao cấp | Soạn thảo phân tích & tín hiệu VIP | Khối Nội Dung |
| 6 | `EDITOR` | Biên tập viên | Viết và quản lý bài viết tin tức | Khối Nội Dung |
| 7 | `SALE_ADMIN` | Quản lý Kinh doanh | Quản lý đội ngũ Sale & chỉ tiêu kinh doanh | Khối Kinh Doanh |
| 8 | `SALE` | Chuyên viên Môi giới / Sale | Chăm sóc khách hàng & tư vấn đầu tư | Khối Kinh Doanh |
| 9 | `EXPERT` | Chuyên gia Phân tích | Cung cấp tín hiệu & chiến lược đầu tư | Khối Phân Tích |
| 10 | `CLIENT_VIP` | Khách hàng VIP | Tài khoản khách hàng đăng ký gói VIP | Khách Hàng |
| 11 | `CLIENT` | Khách hàng Thường | Tài khoản khách hàng mặc định | Khách Hàng |
| 12 | `DEVELOPER` | Lập trình viên / IT | Phát triển, bảo trì phần mềm & hạ tầng | Khối Công Nghệ |

---

## II. BẢNG DANH SÁCH TÀI KHOẢN NHÂN SỰ (45 TÀI KHOẢN)

| STT | ID | Mã NV | Họ và Tên | Email | Số Điện Thoại | Phòng Ban / Nhóm | Vai Trò Hệ Thống (Roles) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | **-** | Hệ thống Quản trị viên (Super Admin) | admin@fintop.vn | 0999999999 | Ban Điều Hành (Executive) | `DEVELOPER` |
| 2 | 6 | **BW9B** | Nguyễn Văn Tuấn | tuannv7105@gmail.com | 0865863045 | Khối Kinh doanh & Môi giới (Team 8043) | `DEVELOPER`, `CEO` |
| 3 | 52 | **-** | Nguyễn Ngọc Phương Anh | phuonganh2559@gmail.com | 0827858899 | Khối Kinh doanh & Môi giới (Team BSVA) | `CLIENT_VIP`, `CLIENT` |
| 4 | 59 | **-** | Dương Thị Huyền | huyentd03@gmail.com | 0339326103 | Khối Kinh doanh & Môi giới (Team BSPE) | `CLIENT`, `CLIENT_VIP` |
| 5 | 105 | **F000** | Nguyễn Công Luật | fintop.bashare@gmail.com | 0386358006 | Ban Điều Hành (Executive) (Team F000) | `DEVELOPER` |
| 6 | 110 | **BOJE** | FinTop_Admin | fintop.ba@gmail.com | 0386358007 | Ban Điều Hành (Executive) (Team BOJE) | `CEO` |
| 7 | 120 | **BOCR** | Trần Thị Thanh Thảo | tthanhthao250604.fam@gmail.com | 0983582655 | Khối Kinh doanh & Môi giới (Team BOCR) | `SALE` |
| 8 | 121 | **F861** | Đào Thị Ngọc Anh | withna0610@gmail.com | 0396727519 | Khối Kinh doanh & Môi giới (Team Đào Thị Ngọc Anh) | `ASSISTANT_CEO`, `DEVELOPER`, `SALE`, `CEO` |
| 9 | 122 | **8043** | Trần Khánh Linh | khanhlinhtran10150@gmail.com | 0971764531 | Khối Kinh doanh & Môi giới (Team 8043) | `CEO`, `DEVELOPER`, `ASSISTANT_CEO`, `SALE` |
| 10 | 123 | **5654** | Nguyễn Minh Hạnh | hanhnm91@gmail.com | 0934650459 | Khối Biên tập & Phân tích (Team Nguyễn Minh Hạnh) | `SALE`, `EDITOR_PRO` |
| 11 | 124 | **BJFS** | Nguyễn Như Quỳnh | nhuquynhnguyen16102002@gmail.com | 0362928667 | Khối Kinh doanh & Môi giới (Team Nguyễn Như Quỳnh) | `SALE` |
| 12 | 125 | **BEW5** | Nguyễn Duy An | nguyenduyan179202@gmail.com | 0965990173 | Khối Kinh doanh & Môi giới (Team Nguyễn Duy An) | `SALE` |
| 13 | 126 | **BM35** | Hoàng Thị Dịu | diuhoang517@gmail.com | 0796090848 | Khối Kinh doanh & Môi giới (Team Hoàng Thị Dịu) | `SALE` |
| 14 | 127 | **BLHG** | Vũ Hoàng Duy | duyhoangvu2692004@gmail.com | 0325414140 | Khối Kinh doanh & Môi giới (Team Vũ Hoàng Duy) | `SALE` |
| 15 | 128 | **BJYE** | Lê Đình Đức | leducvh02@gmail.com | 0869870233 | Khối Kinh doanh & Môi giới (Team Lê Đình Đức) | `SALE` |
| 16 | 129 | **BJ2S** | Nguyễn Thuận Khang | khangthuan07@gmail.com | 0356479959 | Khối Kinh doanh & Môi giới (Team Nguyễn Thuận Khang) | `SALE` |
| 17 | 130 | **6061** | Nguyễn Đình Hải | hailedylan889@gmail.com | 0357731889 | Khối Kinh doanh & Môi giới (Team 6061) | `SALE_ADMIN` |
| 18 | 131 | **BNSZ** | Phan Nữ Đan Nhi | dannhihht@gmail.com | 0845205955 | Khối Kinh doanh & Môi giới (Team Phan Nữ Đan Nhi) | `SALE` |
| 19 | 132 | **F003** | nguyễn bách đạt | nguyendat28112004@gmail.com | 0336646836 | Khối Kinh doanh & Môi giới (Team nguyen bach dat) | `SALE` |
| 20 | 133 | **BPJ4** | Trần Quốc Việt | viettb234@gmail.com | 0869391861 | Khối Kinh doanh & Môi giới (Team BPJ4) | `SALE` |
| 21 | 134 | **BF14** | Nguyễn Thành Phúc | thanhphucubqn@gmail.com | 0369879176 | Khối Kinh doanh & Môi giới (Team BF14) | `SALE_ADMIN`, `SALE`, `EDITOR_PRO` |
| 22 | 135 | **5016** | Hoài Thu Nguyễn | thugie79.93@gmail.com | 0972227823 | Khối Kinh doanh & Môi giới (Team 5016) | `SALE` |
| 23 | 136 | **BRRU** | Đoàn Phương Hạnh | doanphuonghanhmthh@gmail.com | 0347268359 | Khối Kinh doanh & Môi giới (Team Đoàn Phương Hạnh) | `SALE` |
| 24 | 137 | **BSPD** | Nguyễn Lê Phương Mai | phuongwmai281103@gmail.com | 0971120304 | Khối Kinh doanh & Môi giới (Team Nguyễn Lê Phương Mai) | `SALE` |
| 25 | 138 | **BRN4** | Nguyễn Thị Ngọc | ngoc.nt0899@gmail.com | 0979342651 | Khối Kinh doanh & Môi giới (Team Nguyễn Thị Ngọc) | `SALE` |
| 26 | 139 | **BSQW** | Nguyễn Mai Thy | nguyenmaithy04@gmail.com | 0943030604 | Khối Kinh doanh & Môi giới (Team Nguyễn Mai Thy) | `SALE` |
| 27 | 140 | **-** | Ngô Sơn Tùng | nstung234@gmail.com | 0392061651 | Khối Kinh doanh & Môi giới (Team S? di?n tho?i) | `SALE` |
| 28 | 141 | **BN32** | Nguyễn Thị Thùy Giang | giangthuy2711@gmail.com | 0921446885 | Khối Kinh doanh & Môi giới (Team Nguyễn Thị Thùy Giang) | `SALE` |
| 29 | 142 | **BSPB** | Vũ Thành Long | long2004ptit@gmail.com | 0977735502 | Khối Kinh doanh & Môi giới (Team Vũ Thành Long) | `SALE` |
| 30 | 143 | **BTJJ** | Hồ Phú Thịnh | hothinh338@gmail.com | 0898413118 | Khối Kinh doanh & Môi giới (Team Hồ Phú Thịnh) | `SALE` |
| 31 | 144 | **BSVA** | Dang Nhu Ngoc | olianbill2508@gmail.com | 0981101355 | Khối Kinh doanh & Môi giới (Team BSVA) | `SALE` |
| 32 | 145 | **BSVA** | Nguyễn Thị Phương Anh | phuonganh03ntt@gmail.com | 0963802731 | Khối Kinh doanh & Môi giới (Team BSVA) | `SALE` |
| 33 | 146 | **BT4O** | Lã Yến Nhi | la217112@gmail.com | 0977583620 | Khối Kinh doanh & Môi giới (Team Lã Yến Nhi) | `SALE` |
| 34 | 147 | **BTLT** | Nguyên Minh Dương | dmnguyen12977@gmail.com | 0707653497 | Khối Kinh doanh & Môi giới (Team Nguyễn Minh Dương) | `SALE` |
| 35 | 148 | **BTRN** | Nguyễn Thị Liễu | ntlieuxd2005@gmail.com | 0368266435 | Khối Kinh doanh & Môi giới (Team Nguyễn Thị Liễu) | `SALE` |
| 36 | 149 | **BTK7** | Nguyễn Trường Giang | giangjojo2004@gmail.com | 0704741767 | Khối Kinh doanh & Môi giới (Team Nguyễn Trường Giang) | `SALE` |
| 37 | 150 | **BSZD** | Lê Hà Trang | lehatrang21102004@gmail.com | 0337057530 | Khối Kinh doanh & Môi giới (Team Lê Hà Trang) | `SALE` |
| 38 | 151 | **BTRW** | Trần Thị Phương Loan | loanttp203@gmail.com | 0358035448 | Khối Kinh doanh & Môi giới (Team Trần Thị Phương Loan) | `SALE` |
| 39 | 152 | **5777** | Phạm Thị Ngọc Thu | thungocph@gmail.com | 0832888836 | Khối Kinh doanh & Môi giới (Team Phạm Thị Ngọc Thu) | `SALE` |
| 40 | 153 | **BW4D** | Trịnh Thành Nguyễn | nguyentrinhthanh05012005@gmail.com | 0835565799 | Khối Kinh doanh & Môi giới (Team Trịnh Thành Nguyễn) | `SALE` |
| 41 | 154 | **F101** | Trần Tuấn Nam | tnam19884@gmail.com | 0915985799 | Khối Kinh doanh & Môi giới (Team Trần Tuấn Nam) | `SALE` |
| 42 | 155 | **BW9B** | Nguyễn Văn Tuấn | tuanmv7105@gmail.com | 0985863045 | Khối Kinh doanh & Môi giới (Team BW9B) | `DEVELOPER` |
| 43 | 156 | **BWF6** | Đoàn Nguyên Trí | doantri12343@gmail.com | 0886871437 | Khối Kinh doanh & Môi giới (Team Đoàn Nguyên Trí) | `CEO`, `SALE`, `DEVELOPER`, `ASSISTANT_CEO` |
| 44 | 166 | **BT4O** | Lê Yến Nhi | le217112@gmail.com | 0977563620 | Khối Kinh doanh & Môi giới (Team Lã Yến Nhi) | `SALE` |
| 45 | 167 | **BW4O** | Trung Thành Nguyễn | nguyentrungthanh05012005@gmail.com | 0835955799 | Khối Kinh doanh & Môi giới (Team Trung Thành Nguyễn) | `SALE` |

---

## III. THỐNG KÊ SỐ LƯỢNG THEO VAI TRÒ

| Mã Vai Trò | Tên Vai Trò | Số Lượng Tài Khoản |
| --- | --- | --- |
| `SUPER_ADMIN` | Quản trị viên tối cao | 0 |
| `CEO` | Giám đốc điều hành | 5 |
| `DEVELOPER` | Lập trình viên / IT | 7 |
| `ASSISTANT_CEO` | Trợ lý Giám đốc | 3 |
| `EDITOR_ADMIN` | Quản trị Biên tập | 0 |
| `EDITOR_PRO` | Biên tập viên Cao cấp | 2 |
| `EDITOR` | Biên tập viên | 0 |
| `SALE_ADMIN` | Quản lý Kinh doanh | 2 |
| `SALE` | Chuyên viên Môi giới / Sale | 37 |
| `EXPERT` | Chuyên gia Phân tích | 0 |
| `CLIENT_VIP` | Khách hàng VIP | 12 |
| `CLIENT` | Khách hàng Thường | 78 |
