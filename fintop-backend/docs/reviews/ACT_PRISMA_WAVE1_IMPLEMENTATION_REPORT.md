# 🚀 BÁO CÁO TRIỂN KHAI PRISMA SCHEMA WAVE 1 (ACT-PRISMA-WAVE1-IMPLEMENTATION-REPORT)

**Ngày triển khai:** 18/05/2026
**Phạm vi:** Core Identity, RBAC, Organization, AuditLog.

---

## 1. TỔNG HỢP CÁC MODELS ĐƯỢC TẠO/CẬP NHẬT (MODIFIED MODELS)

Toàn bộ các models của Wave 1 đã được định nghĩa thành công trong `schema.prisma`:
1.  **Identity:** `User`, `UserSession`.
2.  **Organization:** `Department`, `Team`.
3.  **RBAC:** `Role`, `Permission`, `RolePermission`, `UserRole`.
4.  **Audit:** `AuditLog`.

---

## 2. DANH MỤC ENUMS (ENUMS ADDED)

Các Core Enums đã được định nghĩa nhằm tiêu chuẩn hóa toàn bộ dự án:
*   `RECORD_STATUS`: `ACTIVE`, `INACTIVE`, `LOCKED` (Thay thế cho các biến boolean isDeleted/isActive phân mảnh).
*   `ROLE_CODE`: `SUPER_ADMIN`, `CEO`, `ASSISTANT_CEO`, `EDITOR_ADMIN`, `EDITOR_PRO`, `EDITOR`, `SALE_ADMIN`, `SALE`, `EXPERT`, `CLIENT`, `CLIENT_VIP`.
*   `PERMISSION_ACTION`: `CREATE`, `READ`, `UPDATE`, `DELETE`, `PUBLISH`, `APPROVE`, `EXPORT`.
*   `RISK_TASTE`: `CONSERVATIVE`, `MODERATE`, `AGGRESSIVE`.

---

## 3. THIẾT LẬP QUAN HỆ (RELATIONS ADDED)

| Bảng Nguồn (Source) | Bảng Đích (Target) | Loại Quan Hệ | Tên Quan Hệ (Relation Name) | Ghi Chú |
| :--- | :--- | :--- | :--- | :--- |
| `Department` | `Team` | 1-N | Mặc định | |
| `Department` | `User` | 1-N | Mặc định | |
| `Team` | `User` | 1-N (Members) | `TeamMembers` | |
| `User` (Leader) | `Team` | 1-N (Leader) | `TeamLeader` | Tách biệt với TeamMembers |
| `User` (Broker) | `User` (Client) | 1-N | `BrokerClients` | Tự tham chiếu (Self-referencing) |
| `User` | `UserSession` | 1-N | Mặc định | |
| `User` / `Role` | `UserRole` | N-N | Mặc định | Bảng Junction có `assignedAt` |
| `Role` / `Permission` | `RolePermission` | N-N | Mặc định | Bảng Junction có `assignedAt` |
| `User` | `AuditLog` | 1-N | Mặc định | |

---

## 4. CHIẾN LƯỢC ĐÁNH CHỈ MỤC (INDEXES ADDED)

Các chỉ mục Composite Indexes được thiết lập chặt chẽ tuân thủ nguyên tắc Left-Most Prefix nhằm tối ưu hóa các câu lệnh lọc phổ biến:

*   **`users`**:
    *   `@@index([brokerId, deletedAt, status])`: Tối ưu hóa truy vấn Row-Level Security (RLS) cho Sale/Broker.
    *   `@@index([departmentId, teamId, status])`: Tối ưu hóa truy vấn RLS cho quản lý bộ phận.
    *   `@@index([email, status])` và `@@index([phone, status])`: Truy vấn nhanh khi đăng nhập hoặc tìm kiếm.
*   **`user_sessions`**:
    *   `@@index([refreshToken])`: So khớp token middleware tốc độ cao.
    *   `@@index([userId, isRevoked])`: Quét token cần thu hồi của một người dùng.
*   **`audit_logs`**:
    *   `@@index([userId, createdAt])`: Lọc lịch sử theo tác nhân.
    *   `@@index([tableName, recordId])`: Tra cứu lịch sử sửa đổi của một bản ghi cụ thể.
    *   `@@index([action, createdAt])`: Lọc theo thao tác (Ví dụ: Tất cả các lần phê duyệt).
*   **`teams`**:
    *   `@@index([departmentId, status])`
    *   `@@index([leaderId, status])`
*   **`permissions`**:
    *   `@@index([module, action])`: Truy vấn nhanh cấu hình Permission.

---

## 5. LOGIC CASCADE & AN TOÀN RÀNG BUỘC (CASCADE LOGIC)

| Quan hệ | onDelete | onUpdate | Phân tích Rủi ro & Kiến trúc |
| :--- | :--- | :--- | :--- |
| `Department` -> `Team` | `Restrict` | `Cascade` | Ngăn chặn việc lỡ tay xóa một Phòng Ban khi bên trong vẫn còn các Team hoạt động. |
| `User` (Leader) -> `Team` | `SetNull` | `Cascade` | Khi Leader nghỉ việc/bị xóa mềm, team chỉ đơn giản là khuyết leader (`leaderId = null`), không làm sập cấu trúc team. |
| `User` (Broker) -> `User` | `SetNull` | `Cascade` | Khi Broker nghỉ việc, khách hàng của họ được trả về trạng thái tự do (`brokerId = null`). |
| `Department`/`Team` -> `User`| `SetNull` | `Cascade` | Xóa phòng ban/nhóm (nếu rỗng leader/team) thì user bị loại khỏi nhóm đó nhưng không bị xóa tài khoản. |
| `User` -> `UserSession` | `Cascade` | `Cascade` | Khi thực sự xóa vĩnh viễn user, toàn bộ session sẽ bị hủy. |
| `User`/`Role` -> `UserRole` | `Cascade` | `Cascade` | Xóa role thì tự động rút role đó khỏi tất cả user. |
| `Role`/`Perm` -> `RolePermission`| `Cascade` | `Cascade` | Xóa permission thì tự động gỡ khỏi mọi role. |
| `User` -> `AuditLog` | `Restrict` | `Cascade` | **Critical:** Cấm xóa vật lý User nếu họ đã có lịch sử thực hiện thao tác nhạy cảm trong hệ thống, nhằm bảo đảm tính chất bất biến của kiểm toán. |
