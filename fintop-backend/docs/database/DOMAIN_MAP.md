# 🗺️ BẢN ĐỒ MIỀN NGHIỆP VỤ CƠ SỞ DỮ LIỆU (DATABASE DOMAIN MAP)

**Ngày thực hiện:** 18/05/2026  
**Mục tiêu:** Định nghĩa ranh giới sở hữu (ownership boundaries), trách nhiệm và ma trận phụ thuộc giữa 16 miền nghiệp vụ (Domains) trong cơ sở dữ liệu của hệ thống FinTop DATA trước khi triển khai mô hình quan hệ trên Prisma.

---

## 1. SƠ ĐỒ TƯƠNG TÁC MIỀN (DOMAIN INTERACTION MAP)

```mermaid
graph TD
    subgraph Core Platform [TẦNG NỀN TẢNG CỐT LÕI]
        Auth[1. Auth Domain] <--> RBAC[2. RBAC Domain]
        Auth --> User[3. User Domain]
        Sub[4. Subscription] <--> Bill[5. Billing & Payment]
    end

    subgraph Business Logic [TẦNG NGHIỆP VỤ ĐẦU TƯ]
        Market[6. Market Data] --> Screen[7. Screener]
        Market --> Sig[8. Signals]
        Sig --> Port[9. Portfolio]
        User --> Watch[10. Watchlist]
        Watch --> Market
    end

    subgraph Content & Comms [TẦNG NỘI DUNG & TƯƠNG TÁC]
        CMS[11. CMS & Reports] --> Notif[12. Notification]
        Sig --> Notif
        Bill --> Notif
    end

    subgraph Infra & Governance [TẦNG QUẢN TRỊ & HẠ TẦNG]
        Audit[13. Audit Log]
        Realtime[14. Realtime Gateway]
        Queue[15. Queue / Workers]
        Analyt[16. Analytics & BI]
    end

    RBAC -.->|Bảo vệ| Business Logic
    RBAC -.->|Bảo vệ| Content & Comms
    Core Platform --> Audit
    Business Logic --> Audit
```

---

## 2. QUY HOẠCH CHI TIẾT 16 DOMAINS (DOMAIN SPECIFICATIONS)

### 1. Auth Domain (Xác thực)
* **Mục đích:** Quản lý thông tin định danh, mật khẩu băm và phiên đăng nhập của người dùng.
* **Trách nhiệm:** Xác thực danh tính, sinh JWT, thu hồi token, theo dõi bảo mật thiết bị đăng nhập.
* **Sở hữu các bảng:** `UserSession`, `AuthToken`.
* **Miền phụ thuộc:** `RBAC` (Nạp role vào token), `User` (Khớp thông tin cá nhân).

### 2. RBAC Domain (Phân quyền)
* **Mục đích:** Kiểm soát ma trận quyền hạn dựa trên Vai trò (Role) và Quyền (Permission) độc lập.
* **Trách nhiệm:** Phân định ranh giới cho 8 Role Admin và 4 Tier Client; cung cấp dữ liệu cho Guard kiểm tra.
* **Sở hữu các bảng:** `Role`, `Permission`, `RolePermission`, `UserRole`.
* **Miền phụ thuộc:** `Auth` (Đính kèm quyền), `Audit` (Ghi log đổi quyền).

### 3. User Domain (Hồ sơ Khách hàng & Nhân sự)
* **Mục đích:** Lưu trữ thông tin cá nhân, định danh rủi ro và các mối quan hệ quản lý môi giới (Broker Assignment).
* **Trách nhiệm:** Phân bổ khách hàng cho Sale, lưu trữ thiết lập thông báo và rủi ro đầu tư.
* **Sở hữu các bảng:** `User`, `BrokerAssignment`, `UserNotificationSetting`.
* **Miền phụ thuộc:** `Subscription` (Theo dõi tier của user).

### 4. Subscription Domain (Gói Hội viên)
* **Mục đích:** Quản lý chu kỳ sử dụng dịch vụ, cấp bậc hội viên (Tier: Standard, Silver, Gold, Diamond).
* **Trách nhiệm:** Quyết định việc mở khóa các module phân tích VIP trên giao diện và API.
* **Sở hữu các bảng:** `SubscriptionPlan`, `UserSubscription`, `SubscriptionFeature`.
* **Miền phụ thuộc:** `Billing` (Kích hoạt sau khi thanh toán).

### 5. Billing & Payment Domain (Thanh toán & Hóa đơn)
* **Mục đích:** Xử lý và ghi nhận toàn bộ dòng tiền, tạo hóa đơn VietQR động và gạch nợ tự động qua Webhook.
* **Trách nhiệm:** Đối soát dòng tiền, sinh biên lai, chống trùng lặp giao dịch (Idempotency).
* **Sở hữu các bảng:** `Invoice`, `Transaction`, `PaymentMethod`.
* **Miền phụ thuộc:** `Subscription` (Kích hoạt gói), `Notification` (Gửi biên lai).

### 6. Market Data Domain (Dữ liệu Thị trường)
* **Mục đích:** Lưu trữ danh mục cổ phiếu, lịch sử giá (OHLCV) và bộ chỉ số định giá tài chính (TA/FA).
* **Trách nhiệm:** Cung cấp nguồn dữ liệu sạch cho biểu đồ, bộ lọc và các mô hình chấm điểm tự động.
* **Sở hữu các bảng:** `Sector`, `Stock`, `StockPriceDaily`, `FinancialIndicator`.
* **Miền phụ thuộc:** `Infrastructure` (ETL pipeline).

### 7. Screener Domain (Bộ lọc Kỹ thuật)
* **Mục đích:** Thực thi và lưu trữ các tiêu chí lọc chứng khoán phức tạp theo thời gian thực.
* **Trách nhiệm:** Hỗ trợ user tìm kiếm cổ phiếu theo tiêu chí cá nhân và lưu trữ bộ lọc yêu thích.
* **Sở hữu các bảng:** `ScreenerRule`, `UserSavedScreener`.
* **Miền phụ thuộc:** `Market Data` (Nguồn dữ liệu lọc), `Subscription` (Khóa tính năng theo tier).

### 8. Signals Domain (Tín hiệu V.I.P)
* **Mục đích:** Quản lý các khuyến nghị MUA/BÁN thực chiến từ đội ngũ chuyên gia.
* **Trách nhiệm:** Đẩy tín hiệu realtime, tự động theo dõi và cập nhật trạng thái chốt lời/cắt lỗ khi giá biến động.
* **Sở hữu các bảng:** `VipSignal`, `SignalTarget`.
* **Miền phụ thuộc:** `Market Data` (So khớp giá), `Notification` (Bắn Push).

### 9. Portfolio Domain (Danh mục Mẫu)
* **Mục đích:** Quản lý cấu trúc tài sản và tính toán giá trị ròng (NAV) của các danh mục đầu tư mẫu.
* **Trách nhiệm:** Minh bạch hóa hiệu suất đầu tư của FinTop, phục vụ riêng cho tệp khách hàng Diamond.
* **Sở hữu các bảng:** `RecommendedPortfolio`, `PortfolioItem`, `PortfolioNavHistory`.
* **Miền phụ thuộc:** `Market Data` (Tính giá thị trường).

### 10. Watchlist Domain (Danh mục Theo dõi)
* **Mục đích:** Cho phép nhà đầu tư tạo rổ cổ phiếu quan tâm và thiết lập ngưỡng cảnh báo cá nhân.
* **Trách nhiệm:** Giám sát giá trực tuyến và kích hoạt cảnh báo in-app/Zalo khi chạm ngưỡng.
* **Sở hữu các bảng:** `Watchlist`, `WatchlistItem`, `PriceAlert`.
* **Miền phụ thuộc:** `User`, `Market Data`.

### 11. Notification Domain (Thông báo Đa kênh)
* **Mục đích:** Điều phối việc gửi thông báo (In-app, Email, SMS, Web Push) đến người dùng.
* **Trách nhiệm:** Phân lô (Batching), giới hạn tần suất gửi (Throttling) và lưu trữ mẫu tin nhắn.
* **Sở hữu các bảng:** `Notification`, `NotificationTemplate`.
* **Miền phụ thuộc:** `Queue` (Xử lý bất đồng bộ).

### 12. CMS & Reports Domain (Nội dung & Báo cáo)
* **Mục đích:** Kho lưu trữ bài viết, báo cáo phân tích chuyên sâu (PDF) và sách cẩm nang đầu tư.
* **Trách nhiệm:** Quản lý quy trình xuất bản (Draft -> Review -> Publish), bảo vệ file PDF VIP.
* **Sở hữu các bảng:** `Category`, `Tag`, `Blog`, `BlogTag`, `ReportFile`, `UserBookmark`.
* **Miền phụ thuộc:** `RBAC` (Quyền duyệt bài), `Subscription` (Khóa bài VIP).

### 13. Audit Domain (Kiểm toán & Nhật ký)
* **Mục đích:** Ghi nhận toàn bộ thao tác thay đổi dữ liệu nhạy cảm (Đổi quyền, Khóa user, Phê duyệt thanh toán).
* **Trách nhiệm:** Cung cấp nhật ký kiểm toán không thể chỉnh sửa (Immutable Log) phục vụ điều tra bảo mật.
* **Sở hữu các bảng:** `AuditLog`.
* **Miền phụ thuộc:** Mọi miền trong hệ thống.

### 14. Realtime Gateway Domain (Cổng Thời gian thực)
* **Mục đích:** Điều phối các gói tin WebSocket (Bảng giá nháy, Tín hiệu VIP).
* **Trách nhiệm:** Đồng bộ hóa trạng thái trực tuyến giữa các node thông qua Redis Pub/Sub.
* **Sở hữu các bảng:** Không lưu trữ trên PostgreSQL (Hoạt động trên Redis Cache).

### 15. Queue & Workers Domain (Hàng đợi Tác vụ)
* **Mục đích:** Quản lý các công việc chạy nền nặng (Gửi hàng vạn email, Nén PDF, Chốt NAV).
* **Trách nhiệm:** Bảo đảm tính kiên cường (Resiliency) và tự động thử lại (Retry) khi gặp lỗi.
* **Sở hữu các bảng:** Quản lý qua BullMQ Redis (Bảng `SystemJobLog` trên PostgreSQL để lưu trữ vĩnh viễn).

### 16. Analytics & BI Domain (Báo cáo Quản trị)
* **Mục đích:** Thu thập số liệu hiệu suất hoạt động kinh doanh (KPI) và dữ liệu tương tác của user.
* **Trách nhiệm:** Trực quan hóa doanh thu, traffic bài viết và hiệu suất hoa hồng của Sale.
* **Sở hữu các bảng:** `SystemKpi`, `UserActivityLog`.
* **Miền phụ thuộc:** `User`, `Billing`, `CMS`.

---

## 3. MA TRẬN PHỤ THUỘC MIỀN (DOMAIN DEPENDENCY MATRIX)

```
+-------------------+---------------+-------------------+-------------------+-------------------+
| Tên Miền (Domain) | Nguồn Dữ Liệu | Phụ Thuộc RBAC    | Phụ Thuộc Gói Sub | Sử Dụng Redis/MQ  |
+-------------------+---------------+-------------------+-------------------+-------------------+
| Auth & User       | PostgreSQL    | 🟢 Bắt buộc       | ⚪ Không          | 🟢 Redis Sessions |
| Billing & Payment | PostgreSQL    | 🟢 Bắt buộc (Sale)| 🟢 Bắt buộc       | 🟢 Idempotency Lock|
| Market Data       | ETL / FireAnt | ⚪ Không          | ⚪ Không          | 🟢 Redis Quotes   |
| Signals & Portfolio PostgreSQL    | 🟢 Bắt buộc (EdPro)🟢 Gated (Gold+)   | 🟢 Redis PubSub   |
| CMS & Reports     | PostgreSQL/S3 | 🟢 Bắt buộc (Ed)  | 🟢 Gated (Gold+)  | ⚪ Cache HTML     |
| Notification      | PostgreSQL/MQ | ⚪ Không          | ⚪ Không          | 🟢 BullMQ Workers |
| Audit Log         | PostgreSQL    | 🟢 Super Admin    | ⚪ Không          | 🟢 BullMQ Batching|
+-------------------+---------------+-------------------+-------------------+-------------------+
```

---

## 4. MA TRẬN ƯU TIÊN VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY MATRIX)

| STT | Miền Nghiệp Vụ | Đánh Giá Tình Trạng Hiện Tại (Evidence) | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | **Auth & RBAC** | Bảng `User` chưa có `roleId` và chưa có bảng phân quyền. | `HIGH` | `P0` |
| 2 | **Subscription** | File `schema.prisma` thiếu 100% các bảng quản lý gói và hóa đơn. | `HIGH` | `P0` |
| 3 | **Market & Signals**| Chưa có cấu trúc lưu trữ dữ liệu chứng khoán và tín hiệu. | `HIGH` | `P1` |
| 4 | **Audit Log** | Thiếu vắng hoàn toàn bảng ghi nhật ký thao tác quản trị. | `HIGH` | `P1` |

Miền nghiệp vụ cơ sở dữ liệu đã được quy hoạch rõ ràng và toàn diện, sẵn sàng cho việc thiết kế chi tiết các thực thể (Entity Map) tại bước tiếp theo.
