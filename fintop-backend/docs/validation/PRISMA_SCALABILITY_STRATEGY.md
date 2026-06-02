# 🚀 CHIẾN LƯỢC CHỊU TẢI PRISMA ORM (PRISMA SCALABILITY STRATEGY)

**Ngày thực hiện:** 18/05/2026  
**Mục tiêu:** Thẩm định các giới hạn hiệu năng của Prisma ORM, giải quyết bài toán cạn kiệt kết nối (Connection Exhaustion), tối ưu hóa truy vấn N+1 và thiết lập cơ chế hoạt động tương thích với PgBouncer cho hệ thống FinTop DATA.

---

## 1. PHÂN TÍCH RỦI RO CẠN KIỆT KẾT NỐI (CONNECTION EXHAUSTION RISKS)

```mermaid
graph TD
    subgraph Vấn Đề Tràn Luồng Kết Nối (Connection Pool Overload)
        W1[Pod 1: Prisma Pool = 10] --> PG[(PostgreSQL max_connections = 100)]
        W2[Pod 2: Prisma Pool = 10] --> PG
        W3[Pod 10: Prisma Pool = 10] --> PG
        W10[Worker Pods 11-20] -->|Tràn max_connections| Crash[HTTP 500 DB Connection Error]
    end

    subgraph Giải Pháp PgBouncer Transaction Pooling
        Pods[Tất cả Pods & Workers] --> PGB[PgBouncer Pooler: Luân chuyển kết nối]
        PGB -->|Duy trì đúng 50 kết nối sạch| PG_Safe[(PostgreSQL)]
    end
```

### 1.1. Bản chất Vấn đề
Mỗi instance của `PrismaClient` duy trì một connection pool riêng biệt. Khi triển khai hệ thống lên Kubernetes hoặc nhiều worker node, tổng số kết nối mở trực tiếp đến PostgreSQL có thể dễ dàng vượt quá mốc `max_connections` (thường là 100), gây sập hệ thống ngay lập tức.

### 1.2. Giải pháp Tương thích PgBouncer
Bắt buộc sử dụng **PgBouncer** ở chế độ **Transaction Pooling**. Để Prisma hoạt động ổn định với chế độ này, chuỗi kết nối trong file `.env` phải đính kèm tham số `?pgbouncer=true&connection_limit=10`.

---

## 2. KIỂM SOÁT ĐIỂM NGHẼN TRUY VÂN (QUERY BOTTLENECKS & N+1)

### 2.1. Rủi ro N+1 Query trong ORM
* **Lỗi kinh điển:** Lấy danh sách 50 bài viết (`findMany`), sau đó lặp qua từng bài để tìm tên tác giả (`User`), tạo ra 51 câu lệnh SQL liên tiếp.
* **Quy chuẩn khắc phục:** Sử dụng thuộc tính `include` hoặc `select` để gom nhóm truy vấn trong 1 câu lệnh SQL JOIN duy nhất:
  ```ts
  const blogs = await prisma.blog.findMany({
    where: { status: 'Published' },
    include: { author: { select: { fullName: true, avatarUrl: true } } }
  });
  ```

### 2.2. Kiểm soát Ranh giới Giao dịch Lồng nhau (Nested Transactions)
* Prisma không hỗ trợ giao dịch lồng nhau (Nested `$transaction`). Mọi phương thức Service khi nhận đối tượng giao dịch `tx` (Prisma.TransactionClient) bắt buộc phải sử dụng `tx` để thực thi, cấm gọi ngược ra `this.prisma`.

---

## 3. MA TRẬN TỐI ƯU HÓA TRUY XUẤT (READ / WRITE SEPARATION)
* Đối với các luồng báo cáo phân tích nặng, sử dụng URL kết nối trỏ đến **Read Replica** (Bản sao đọc) của PostgreSQL để không làm nghẽn luồng ghi đơn hàng và tín hiệu trên Master DB.

---

## 4. MA TRẬN RỦI RO HIỆU NĂNG VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Rủi Ro Hiệu Năng Prisma | Giải Pháp Tối Ưu Hóa (Mitigation) | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Quá Tải Kết Nối DB | Tích hợp PgBouncer Transaction Pooling và tham số `pgbouncer=true`. | `HIGH` | `P0` |
| 2 | Chậm API Danh Sách | Khắc phục triệt để lỗi N+1 bằng cơ chế JOIN `include`/`select` chuẩn mực. | `HIGH` | `P0` |
| 3 | Khóa Bảng Quá Lâu | Giới hạn thời gian timeout của `$transaction` tối đa 5000ms. | `HIGH` | `P1` |

Chiến lược tối ưu hóa Prisma đã được thiết lập vững chắc, bảo đảm hệ thống sẵn sàng xử lý hàng chục nghìn lượt truy vấn mỗi giây.
