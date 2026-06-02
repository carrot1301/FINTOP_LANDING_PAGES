# 🏛️ PHÂN TÍCH KHOẢNG CÁCH KIẾN TRÚC (ARCHITECTURE GAP ANALYSIS)

**Ngày thực hiện:** 18/05/2026  
**Mục tiêu:** Đối chiếu kiến trúc mã nguồn hiện tại với mô hình chuẩn Fintech Enterprise (Clean Architecture, Event-Driven, Multi-tier Security) để chỉ ra các lỗ hổng kỹ thuật và ranh giới hệ thống cần hoàn thiện.

---

## 1. SO SÁNH KIẾN TRÚC THỰC TẾ & MỤC TIÊU

```mermaid
graph TD
    subgraph Hiện tại (Spaghetti Monolith Boilerplate)
        AppMod[AppModule] --> AppCtrl[AppController] & AppSvc[AppService]
    end

    subgraph Mục tiêu (Enterprise Modular Architecture)
        API[API Gateway / Controllers] --> Guard[5-Layer Security Guard]
        Guard --> Core[Core Feature Modules: Auth, Market, Signals, Billing...]
        Core --> Bus[Event Bus / BullMQ / Redis PubSub]
        Bus --> DB[PostgreSQL Master-Replica + Redis Cluster + S3]
    end
```

### 1.1. Thực trạng Kiến trúc (Current State)
* Monolithic ở mức tối giản, không có bất kỳ sự cô lập module (Module Isolation) nào.
* Không có cơ chế xử lý lỗi tập trung, ghi log kiểm toán hay theo dõi hiệu năng ứng dụng.

### 1.2. Mô hình Mục tiêu (Target State)
* Kiến trúc Modular Monolith trên nền NestJS, tách biệt 3 tầng rõ rệt: Giao tiếp (Controllers/Gateways), Nghiệp vụ (Services) và Dữ liệu (Prisma Repositories).
* Giao tiếp bất đồng bộ qua hệ thống Hàng đợi (Queue) và Kênh phát sóng (Pub/Sub).

---

## 2. CÁC KHOẢNG CÁCH CHÍNH (KEY ARCHITECTURAL GAPS)

### 2.1. Lỗ hổng Ranh giới & Cô lập (Missing Boundaries)
* **Thiếu vắng DTOs & Validation:** Các controller hiện tại không có lớp định nghĩa hợp đồng dữ liệu (Data Transfer Object) và cơ chế xác thực tự động (ValidationPipe).
* **Thiếu vắng Clean Architecture:** Chưa phân định rõ ràng giữa Use-case nghiệp vụ và ORM queries.

### 2.2. Lỗ hổng Hạ tầng & Khả năng chịu lỗi (Missing Infra & Resiliency)
* **Zero Idempotency (Thiếu cơ chế chống trùng lặp):** Chưa thiết lập Idempotency Lock trên Redis cho các API nhạy cảm (Đơn hàng, Nạp tiền).
* **Thiếu cơ chế Fallback (Dự phòng):** Chưa có thiết kế tự động chuyển nguồn dữ liệu khi đối tác thứ ba (FireAnt, Cafef) bị gián đoạn.
* **Thiếu cơ chế Tự động thử lại (Retry with Backoff):** Các tác vụ gửi thông báo, gọi webhook ngân hàng chưa được quản lý qua hàng đợi chịu lỗi.

### 2.3. Lỗ hổng Mẫu thiết kế & Tính nhất quán (Missing Patterns & Consistency)
* **Thiếu vắng Event-Driven Pattern:** Chưa triển khai lớp `EventEmitter2` hoặc `BullMQ` để tách rời (decouple) các module khi phát sinh nghiệp vụ chéo (Ví dụ: Thanh toán thành công -> Tự động bắn event gia hạn gói thay vì gọi trực tiếp service).
* **Thiếu vắng Caching Strategy (Chiến lược bộ nhớ đệm):** Chưa thiết lập cơ chế Interceptor Caching và tự động làm mới (Cache Invalidation) cho các dữ liệu nặng (Bộ lọc chứng khoán, Danh mục V.I.P).

---

## 3. PHÂN TÍCH RỦI RO KIẾN TRÚC KHẨN CẤP
* **Nghẽn cổ chai DB (Database Bottleneck):** Thiếu vắng lớp Redis Cache sẽ khiến hệ thống không thể trụ vững trước 50,000 CCU (Kết nối đồng thời) xem bảng giá trực tuyến.
* **Sụp đổ dây chuyền (Cascading Failure):** Nếu không tách biệt luồng thông báo và email sang Queue, việc tắc nghẽn SMTP Server sẽ lập tức làm sập toàn bộ các luồng đăng ký và thanh toán của khách hàng.

---

## 🎯 KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG
Để xóa bỏ hoàn toàn khoảng cách kiến trúc trên, đội ngũ kỹ thuật cần khẩn trương thiết lập khung thư mục chuẩn NestJS (`src/common`, `src/modules`, `src/infra`) kèm theo bộ tiện ích cốt lõi (Filters, Guards, Interceptors) ngay trước khi tiến hành viết các tính năng nghiệp vụ.
