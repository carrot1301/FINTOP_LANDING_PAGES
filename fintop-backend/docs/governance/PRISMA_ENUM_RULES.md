# 📋 QUY CHUẨN QUẢN TRỊ ENUM & TRẠNG THÁI (PRISMA ENUM RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Thiết lập chiến lược quản lý tập trung các kiểu liệt kê (Enums), chuẩn hóa các mốc trạng thái vòng đời và phòng ngừa rủi ro bùng nổ enum (Enum Explosion) trên `schema.prisma`.

---

## 1. CHIẾN LƯỢC QUẢN TRỊ ENUM TẬP TRUNG (CENTRALIZED ENUMS)

```mermaid
graph TD
    subgraph Nghiêm Cấm Bùng Nổ Enum (Enum Explosion)
        E1[enum UserStatus] & E2[enum BlogStatus] & E3[enum SignalStatus]
    end

    subgraph Quy Chuẩn Enum Dùng Chung (Reusable Enums)
        Std1[enum RECORD_STATUS { ACTIVE, INACTIVE, LOCKED }]
        Std2[enum INVOICE_STATUS { PENDING, PAID, CANCELLED, REFUNDED }]
        Std3[enum SIGNAL_STATUS { PUBLISHED, REACHED_TARGET, CUT_LOSS, CLOSED }]
    end
```

### 1.1. Chính sách Tái sử dụng (Reusability Policy)
* Tránh định nghĩa các enum trùng lặp về mặt ngữ nghĩa (Ví dụ `UserStatus` có `Active`, `Inactive` và `CategoryStatus` cũng có `Active`, `Inactive`). Gom chung thành một enum duy nhất: `RECORD_STATUS`.

---

## 2. DANH MỤC ENUM CHUẨN HÓA BẮT BUỘC (STANDARDIZED ENUMS MATRIX)

```prisma
// 1. Trạng thái bản ghi dùng chung
enum RECORD_STATUS {
  ACTIVE
  INACTIVE
  LOCKED
}

// 2. Trạng thái thanh toán hóa đơn VietQR
enum INVOICE_STATUS {
  PENDING
  PAID
  CANCELLED
  REFUNDED
}

// 3. Trạng thái gói dịch vụ
enum SUBSCRIPTION_STATUS {
  PENDING
  ACTIVE
  EXPIRED
  CANCELLED
}

// 4. Trạng thái khuyến nghị V.I.P
enum SIGNAL_STATUS {
  PUBLISHED
  REACHED_TARGET
  CUT_LOSS
  CLOSED
}

// 5. Trạng thái kiểm duyệt bài viết CMS
enum BLOG_STATUS {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  UNPUBLISHED
}
```

---

## 3. PHÂN TÍCH ANTI-PATTERNS & RỦI RO ENUM

```
+-------------------------------------------------------------------------------------------------------+
|                                          ENUM GOVERNANCE COMPARISON                                   |
+-------------------+-----------------------------------+-----------------------------------------------+
| Ví Dụ Anti-Pattern| Phân Tích Rủi Ro (Risk Reasoning) | Định Dạng Chuẩn Enterprise (Correct Format)   |
+-------------------+-----------------------------------+-----------------------------------------------+
| Dùng String ngầm  | Bất kỳ kỹ sư nào cũng có thể chèn | Bắt buộc sử dụng `status INVOICE_STATUS @defa |
| `status String`   | sai chuỗi ("paid", "PAID", "ok"). | ult(PENDING)` để kiểm tra type-safe 100%.     |
+-------------------+-----------------------------------+-----------------------------------------------+
| `enum UserTier {  | Khó duy trì khi công ty muốn thêm | Bắt buộc sử dụng cột `tierLevel Int @default( |
| Standard, Gold }` | Tier mới (Silver, Diamond).       | 1)` kết hợp bảng `SubscriptionPlan` linh hoạt.|
+-------------------+-----------------------------------+-----------------------------------------------+
```

---

## 4. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Rủi Ro Enum | Phân Tích Tác Động Rủi Ro | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Bùng Nổ Enum | Tạo quá nhiều enum gây khó khăn khi viết Migration và bảo trì Type NestJS. | `HIGH` | `P0` |
| 2 | Hardcode Tier | Sử dụng Enum cho Tier thay vì bảng Plan khiến hệ thống mất linh hoạt khi đổi giá. | `HIGH` | `P0` |

Hệ thống Enum đã được chuẩn hóa rành mạch, chuẩn bị cho bước thiết lập các quy tắc an toàn truy vấn (Query Safety Governance).
