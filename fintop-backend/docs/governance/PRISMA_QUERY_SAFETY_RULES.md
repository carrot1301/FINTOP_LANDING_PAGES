# 🛡️ QUY CHUẨN AN TOÀN TRUY VẤN PRISMA (PRISMA QUERY SAFETY RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Thiết lập các ranh giới và giới hạn an toàn khi viết truy vấn Prisma ORM trong NestJS nhằm loại bỏ rủi ro nghẽn cổ chai, tràn bộ nhớ và bảo đảm hiệu năng tối ưu cho FinTop DATA.

---

## 1. QUY CHUẨN GIỚI HẠN JOIN & LỒNG NHAU (DEEP INCLUDE LIMITATIONS)

```mermaid
graph TD
    subgraph Lỗi Deep Include Nghiêm Trọng > 3 Cấp (CẤM)
        Blog[Blog] --> Cat[Category]
        Blog --> Author[Author] --> Role[Role] --> Perm[Permission]
    end

    subgraph Truy Vấn Chuẩn (JOIN Tối Đa 2 Cấp + Select)
        Blog2[Blog] --> Author2[Author: select id, name]
        Blog2 --> Cat2[Category: select slug]
    end

    Blog -.->|Tạo SQL JOIN khổng lồ| Crash[Chậm DB & Tràn RAM Node.js]
```

### 1.1. Chính sách Giới hạn
* **Nghiêm cấm lồng `include` quá 3 cấp:** Việc JOIN quá sâu tạo ra bảng kết quả khổng lồ (Cartesian product) trên PostgreSQL, làm cạn kiệt băng thông mạng và nghẽn CPU.
* **Bắt buộc sử dụng `select` thay cho `include` toàn bộ:** Khi cần lấy thông tin bảng quan hệ, chỉ chọn đúng các trường cần thiết.

---

## 2. QUY CHUẨN PHÂN TRANG BẮT BUỘC (MANDATORY PAGINATION)

### 2.1. Cấm tuyệt đối `findMany()` không có giới hạn
Mọi API trả về danh sách (`Stock`, `Blog`, `User`, `Invoice`...) bắt buộc phải áp dụng phân trang (Cursor-based hoặc Offset-based) với tham số `take` tối đa 100:
```ts
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: Math.min(limit, 100), // Giới hạn cứng tối đa 100
  where: { status: 'ACTIVE' },
});
```

---

## 3. QUY CHUẨN RANH GIỚI KIẾN TRÚC (ARCHITECTURAL BOUNDARIES)
* **Nghiêm cấm Controller gọi trực tiếp Prisma:** Mọi thao tác truy vấn DB bắt buộc đi qua một lớp trung gian `Repository` hoặc `Service`.
* **Quy tắc Cache-First cho luồng Đọc Nặng:** Các API tra cứu dữ liệu chứng khoán và biểu đồ bắt buộc kiểm tra dữ liệu trên Redis trước khi chạm đến PostgreSQL.

---

## 4. MA TRẬN RỦI RO TRUY VẤN VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Rủi Ro Truy Vấn | Phân Tích Tác Động Rủi Ro | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Không Phân Trang | Nếu cào 50,000 user trong 1 query, server Node.js sẽ bị Out of Memory (OOM) ngay lập tức. | `HIGH` | `P0` |
| 2 | Lạm Dụng Include | JOIN toàn bộ các cột không cần thiết làm chậm tốc độ phản hồi API từ < 20ms lên > 500ms. | `HIGH` | `P0` |

Quy chuẩn an toàn truy vấn đã được ban hành đầy đủ, sẵn sàng cho bước thẩm định và rà soát tổng thể (Schema Governance Review).
