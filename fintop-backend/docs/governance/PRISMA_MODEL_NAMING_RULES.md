# 🏷️ QUY CHUẨN ĐẶT TÊN PRISMA SCHEMA (PRISMA MODEL NAMING RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Thiết lập bộ quy tắc đặt tên thống nhất và nghiêm ngặt cho toàn bộ các thành phần trong `schema.prisma` nhằm loại bỏ sự mập mờ, ngăn chặn lỗi do viết sai định dạng và duy trì tính toàn vẹn mã nguồn của FinTop DATA.

---

## 1. QUY TẮC ĐẶT TÊN CỐT LÕI (CORE NAMING CONVENTIONS)

```
+------------------------+-------------------+---------------------------------------+
| Thành Phần (Element)   | Định Dạng (Format)| Ví Dụ Chuẩn (Valid Example)           |
+------------------------+-------------------+---------------------------------------+
| Model / Table          | PascalCase        | model User, model VipSignal           |
| Trường / Cột (Field)   | camelCase         | email, tierLevel, buyPriceMin         |
| Kiểu Liệt Kê (Enum)    | UPPER_SNAKE_CASE  | enum ROLE_CODE { SUPER_ADMIN, SALE }  |
| Khóa Ngoại (Foreign Key) Tên Bảng + Id     | brokerId, planId, stockId             |
| Quan Hệ (Relation Name)| Mô tả hành động   | @relation("UserSub_Plan", fields:...) |
| Bảng Trung Gian (Pivot)| Tên Bảng 1 + Bảng 2 UserRole, RolePermission, WatchlistItem|
+------------------------+-------------------+---------------------------------------+
```

---

## 2. PHÂN TÍCH VÍ DỤ VÀ ANTI-PATTERNS (EXAMPLES & ANTI-PATTERNS)

```mermaid
graph TD
    subgraph Anti-Pattern Kém Chất Lượng (CẤM SỬ DỤNG)
        M1[model users_table] --> F1[col_email] & F2[RoleId]
        E1[enum status { active, inactive }]
    end

    subgraph Định Dạng Chuẩn Enterprise (BẮT BUỘC)
        M2[model User] --> F3[email] & F4[roleId]
        E2[enum USER_STATUS { ACTIVE, INACTIVE }]
    end

    M1 & E1 -.->|Lỗi Mapping Type| Bug[Gây lỗi cú pháp Prisma & NestJS]
```

### 2.1. Phân tích Anti-Pattern
* **Lỗi 1 (Sử dụng số nhiều hoặc snake_case cho Model):** `model user_profiles` hoặc `model Users`.
  * *Hệ quả:* Khi sinh ra Type trong Prisma Client, kỹ sư sẽ phải gọi `prisma.users.findUnique()` hay `prisma.user_profiles.create()`, gây mất tính đồng bộ với tên class trong NestJS (`UserService`, `UserDto`).
* **Lỗi 2 (Khóa ngoại không có chữ Id):** `broker Int` hoặc `plan Int`.
  * *Hệ quả:* Gây nhầm lẫn nghiêm trọng giữa đối tượng quan hệ (Relation Object) và giá trị số nguyên (Integer FK). Bắt buộc phải đặt là `brokerId Int` và đối tượng quan hệ là `broker User? @relation(...)`.

---

## 3. QUY HOẠCH TÊN BẢNG ĐẶC THÙ (SPECIAL TABLE NAMING)

```
+------------------------+------------------------------------+---------------------------------------+
| Nhóm Bảng (Group)      | Quy Chuẩn Đặt Tên (Standard)       | Ví Dụ (Example)                       |
+------------------------+------------------------------------+---------------------------------------+
| Bảng Kiểm Toán (Audit) | Tên Thực Thể + Log / AuditLog      | AuditLog, SystemJobLog                |
| Bảng Lịch Sử (History) | Tên Thực Thể + History / Daily     | StockPriceDaily, PortfolioNavHistory  |
| Bảng Trung Gian (Junction)Tên Ghép 2 Bảng (Không có bảng phụ) RolePermission, UserRole, BlogTag       |
+------------------------+------------------------------------+---------------------------------------+
```

---

## 4. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY MATRIX)

| STT | Rủi Ro Quy Chuẩn | Đánh Giá Tác Động (Impact Reasoning) | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Mất Nhất Quán Tên | Viết hoa thường lẫn lộn sẽ gây lỗi khi biên dịch TypeScript và Prisma Generator. | `HIGH` | `P0` |
| 2 | Nhầm Lẫn Tên Khóa | Đặt tên quan hệ mập mờ gây lỗi khi 2 model có nhiều hơn 1 đường link liên kết. | `HIGH` | `P0` |

Quy chuẩn đặt tên đã được ban hành tường minh, tạo tiền đề cho bước quản trị các mối quan hệ phức tạp (Relationship Governance).
