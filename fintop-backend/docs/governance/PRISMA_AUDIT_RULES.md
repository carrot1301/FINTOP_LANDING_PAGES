# 🛡️ QUY CHUẨN KIỂM TOÁN & XÓA MỀM PRISMA (PRISMA AUDIT RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Định nghĩa bắt buộc các trường kiểm toán (Audit fields), chính sách xóa mềm (Soft delete) và nguyên tắc bất biến (Immutability) trên các thực thể trong `schema.prisma`.

---

## 1. QUY CHUẨN TRƯỜNG KIỂM TOÁN BẮT BUỘC (MANDATORY AUDIT FIELDS)

```mermaid
graph TD
    subgraph Bảng Bất Biến 100% Immutable (Chỉ Ghi)
        Audit[AuditLog / Transaction] --> F1[createdAt DateTime @default_now]
        Audit -.->|Không có| F2[updatedAt / deletedAt]
    end

    subgraph Bảng Nghiệp Vụ & Người Dùng (Khả Biến)
        User[User / VipSignal / Blog] --> F3[createdAt DateTime @default_now]
        User --> F4[updatedAt DateTime @updatedAt]
        User --> F5[deletedAt DateTime? @index]
    end
```

### 1.1. Ma trận Bắt buộc
* **Mọi thực thể nghiệp vụ (User, Role, Blog, Signal...):** Bắt buộc phải có `createdAt DateTime @default(now())` và `updatedAt DateTime @updatedAt`.
* **Thực thể chứa dữ liệu nhạy cảm (User, Role, Blog, Signal...):** Bắt buộc phải có `deletedAt DateTime?`.
* **Thực thể Bất biến (`AuditLog`, `Transaction`):** Chỉ chứa `createdAt`. Không được phép định nghĩa `updatedAt` hay `deletedAt`.

---

## 2. CHÍNH SÁCH XÓA MỀM (SOFT DELETE STRATEGY)

### 2.1. Quy tắc Thực thi trên Prisma
Khi một thực thể hỗ trợ xóa mềm, mọi truy vấn tìm kiếm danh sách trên Prisma bắt buộc phải lọc bỏ các bản ghi đã xóa:
```ts
const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null, status: 'ACTIVE' }
});
```

### 2.2. Quy tắc Đánh Chỉ Mục (Soft-Delete Indexing)
Để bảo đảm các truy vấn `WHERE deletedAt IS NULL` không bị suy giảm tốc độ khi dữ liệu phình to, trường `deletedAt` bắt buộc phải được đưa vào Composite Index cùng với khóa tìm kiếm chính: `@@index([deletedAt, status])`.

---

## 3. PHÂN TÍCH ANTI-PATTERNS KIỂM TOÁN

```
+-------------------------------------------------------------------------------------------------------+
|                                        AUDIT & DELETION GOVERNANCE                                     |
+-------------------+-----------------------------------+-----------------------------------------------+
| Ví Dụ Anti-Pattern| Phân Tích Rủi Ro (Risk Reasoning) | Định Dạng Chuẩn Enterprise (Correct Format)   |
+-------------------+-----------------------------------+-----------------------------------------------+
| Xóa vật lý User   | Xóa mất User sẽ làm mồ côi toàn   | Bắt buộc sử dụng `deletedAt DateTime?` và cập |
| (`delete()`)      | bộ hóa đơn và nhật ký kiểm toán.  | nhật cờ trạng thái sang `INACTIVE`.           |
+-------------------+-----------------------------------+-----------------------------------------------+
| `AuditLog` có cột | Vi phạm nguyên tắc nhật ký bất    | Loại bỏ hoàn toàn cột `updatedAt` trên các    |
| `updatedAt`       | biến (Immutable Audit Trail).     | bảng thuộc tính chất log/giao dịch.           |
+-------------------+-----------------------------------+-----------------------------------------------+
```

---

## 4. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Khía Cạnh Kiểm Toán | Đánh Giá Rủi Ro Bất Nhất | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Mất Dấu Vết Sửa Đổi | Thiếu `updatedAt` trên bảng `UserSubscription` sẽ không biết ai vừa gia hạn gói. | `HIGH` | `P0` |
| 2 | Chậm Truy Vấn Xóa Mềm| Nếu không đánh index cho `deletedAt`, DB sẽ phải Full Table Scan khi tìm danh sách. | `HIGH` | `P0` |

Quy chuẩn kiểm toán và xóa mềm đã được định nghĩa chặt chẽ, tạo nền tảng vững chắc cho việc bảo mật dữ liệu của ứng dụng.
