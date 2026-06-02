# 🛡️ BÁO CÁO CỦNG CỐ KIẾN TRÚC SCHEMA WAVE 1 (ACT-PRISMA-WAVE1-HARDENING-REPORT)

**Ngày thực hiện:** 18/05/2026
**Mục tiêu:** Củng cố (Hardening) và chuẩn hóa nền tảng cơ sở dữ liệu Wave 1 trước khi chốt chặn kiến trúc.

---

## 1. CÁC THAY ĐỔI CỤ THỂ VỀ ENUM (EXACT ENUM CHANGES)

Để ngăn chặn hoàn toàn rủi ro sai sót dữ liệu do dùng Magic Numbers hoặc String không kiểm soát, 3 tập Enum mới đã được định nghĩa và áp dụng:

1.  **`SUBSCRIPTION_TIER`** (Thay thế `tierLevel Int`)
    *   *Values:* `STANDARD`, `SILVER`, `GOLD`, `DIAMOND`.
    *   *Lý do:* Nâng cao tính nhất quán của code frontend/backend, loại bỏ hoàn toàn sự mơ hồ khi dùng số nguyên (1, 2, 3, 4).

2.  **`AUDIT_SOURCE`** (Cho cơ chế AuditLog đa nguồn)
    *   *Values:* `USER`, `SYSTEM`, `CRON`, `QUEUE`, `WEBHOOK`.
    *   *Lý do:* Mở rộng tính năng AuditLog để hỗ trợ không chỉ các thao tác do người dùng kích hoạt, mà còn theo dõi các Job tự động, Cron hoặc Webhook.

3.  **`PERMISSION_MODULE`** (Thay thế `module String`)
    *   *Values:* `AUTH`, `USER`, `ROLE`, `DEPARTMENT`, `TEAM`, `VIP_SIGNALS`, `PORTFOLIO`, `BLOG`, `CATEGORY`, `INVOICE`, `SUBSCRIPTION`, `WATCHLIST`, `REPORT`, `SYSTEM`.
    *   *Lý do:* Tránh lỗi chính tả (typo) khi quản trị viên nhập tên module, đồng thời cung cấp một khung sườn phân quyền tĩnh an toàn tuyệt đối.

---

## 2. CÁC THAY ĐỔI VỀ QUAN HỆ VÀ SCHEMA (EXACT SCHEMA & RELATION CHANGES)

### 2.1. Nâng cấp bảng `User`
*   Thay đổi `tierLevel Int @default(1)` thành `tierLevel SUBSCRIPTION_TIER @default(STANDARD)`.
*   Bổ sung 2 Inverse Relations phục vụ cho Audit RBAC:
    *   `assignedRolePermissions RolePermission[] @relation("RolePermissionAssignedBy")`
    *   `assignedUserRoles UserRole[] @relation("UserRoleAssignedBy")`

### 2.2. Nâng cấp bảng `Permission`
*   Thay đổi kiểu dữ liệu `module` từ `String` sang Enum `PERMISSION_MODULE`.

### 2.3. Củng cố bảng `AuditLog`
*   Đổi `userId Int` thành `userId Int?` (Cho phép Null đối với các action từ `SYSTEM` hoặc `CRON`).
*   Thêm trường `source AUDIT_SOURCE` để định danh phân loại sự kiện rõ ràng.
*   Chuyển quan hệ với `User` thành nullable relation: `user User? @relation(..., onDelete: Restrict)`. 

### 2.4. Củng cố Bảng Trung Gian RBAC (`UserRole`, `RolePermission`)
*   Thêm quan hệ trực tiếp `assignedBy` trỏ tới bảng `User` trên cả 2 bảng.
*   Cấu hình `onDelete: SetNull`. Nếu tài khoản của Quản trị viên (người đã cấp quyền) bị xóa, hệ thống sẽ bảo lưu quyền hạn của người được cấp (chỉ set null ID của người đã cấp).

---

## 3. LÝ LUẬN KIẾN TRÚC (ARCHITECTURAL REASONING)

### 3.1. Truy vết RBAC (RBAC Traceability)
Việc bổ sung quan hệ `assignedBy` từ các bảng trung gian RBAC trở lại bảng `User` giúp hệ thống Fintech giải quyết bài toán cốt lõi: *"Ai đã cấp quyền VIP cho người này vào lúc nào?"*. Việc này bị thiếu hụt ở bản Wave 1 gốc, nhưng hiện đã được cấu trúc chặt chẽ.

### 3.2. Tính Toàn vẹn Nhật ký (Audit Integrity)
Bảng `AuditLog` ở phiên bản gốc chỉ hướng tới việc con người thao tác (Human Actions). Phiên bản Hardened đã lấp lỗ hổng này bằng cách biến `userId` thành nullable và bổ sung `AUDIT_SOURCE`. Giờ đây, các tiến trình như `CRON` (khi tự động giáng cấp gói thành viên lúc 00:01) có thể ghi log hợp lệ mà không cần "mượn" một tài khoản ảo nào trong hệ thống.
