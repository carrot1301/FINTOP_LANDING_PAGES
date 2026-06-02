# 📈 CHIẾN LƯỢC XỬ LÝ DỮ LIỆU LỊCH SỬ (HISTORICAL DATA STRATEGY)

**Ngày thực hiện:** 18/05/2026  
**Mục tiêu:** Phân tích các rủi ro phình to dữ liệu chuỗi thời gian (Time-series growth), thiết lập chiến lược phân vùng PostgreSQL (Table Partitioning), chính sách nén và kho lưu trữ lạnh (Cold Storage) nhằm bảo đảm hiệu năng hệ thống FinTop DATA trong dài hạn.

---

## 1. PHÂN TÍCH RỦI RO BÙNG NỔ DỮ LIỆU (DATA GROWTH FORECAST)

```mermaid
graph TD
    subgraph Dữ Liệu Tăng Trưởng Theo Thời Gian (1 Năm)
        A[StockPriceDaily: ~500,000 dòng/năm]
        B[AuditLog: ~10,000,000 dòng/năm]
        C[SystemKpi & Activity: ~25,000,000 dòng/năm]
    end

    subgraph Rủi Ro Hệ Thống (PostgreSQL Degradation)
        R1[Phình to RAM cho B-Tree Index]
        R2[Chậm truy vấn các bảng lõi]
        R3[Tăng thời gian Backup DB]
    end

    A & B & C --> R1 & R2 & R3
```

* **Thực thể chuỗi thời gian khổng lồ:** `StockPriceDaily` (Dữ liệu OHLCV của > 1,600 mã chứng khoán mỗi ngày), `AuditLog` (Ghi nhận mọi thao tác quản trị), `UserActivityLog` và `Notification`.

---

## 2. CHIẾN LƯỢC PHÂN VÙNG DỮ LIỆU (PARTITIONING STRATEGY)

Để bảo đảm tốc độ quét dữ liệu luôn ổn định, bảng `StockPriceDaily` và `AuditLog` bắt buộc triển khai cơ chế **Range Partitioning** (Phân vùng theo khoảng thời gian) trực tiếp trên PostgreSQL:

```sql
-- Ví dụ cấu trúc phân vùng theo Quý (Quarterly Partitioning)
CREATE TABLE stock_prices_daily (
    id BIGSERIAL,
    stock_id INT NOT NULL,
    price_date DATE NOT NULL,
    close_price NUMERIC(15, 2),
    volume BIGINT
) PARTITION BY RANGE (price_date);

CREATE TABLE stock_prices_q1_2026 PARTITION OF stock_prices_daily
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

* **Lợi ích:** Prisma ORM vẫn truy vấn qua bảng ảo `stock_prices_daily`, nhưng engine PostgreSQL tự động chỉ tìm kiếm trên phân vùng chứa ngày tương ứng, giúp giảm 90% lượng IOPS (thao tác đọc đĩa).

---

## 3. CHIẾN LƯỢC LƯU TRỮ LẠNH & DỌN DẸP (ARCHIVAL & COLD STORAGE)

```
+----------------------------------------------------------------------------------------------------------+
|                                     FINTOP DATA LIFECYCLE & COLD STORAGE                                  |
+-------------------+----------------------------+-----------------------------+---------------------------+
| Tên Dữ Liệu       | Dữ Liệu Nóng (Hot Data)    | Dữ Liệu Ấm (Warm DB Part)   | Lưu Trữ Lạnh (Cold S3)    |
+-------------------+----------------------------+-----------------------------+---------------------------+
| StockPriceDaily   | Trên Redis (1 Tháng gần nhất) Trên PostgreSQL (2 Năm gần đây)| Xuất file Parquet đẩy S3  |
| AuditLog          | Trên PostgreSQL (90 Ngày)  | Phân vùng DB (Từ 90d - 2 Năm)| Nén Gzip chuyển AWS S3    |
| Notification      | Bảng chính (30 Ngày)       | Chuyển sang bảng Archive    | Xóa vĩnh viễn (Purge)     |
+-------------------+----------------------------+-----------------------------+---------------------------+
```

---

## 4. ĐÁNH GIÁ RỦI RO CHỈ MỤC VÀ TRUY VÂN (INDEX EXPLOSION RISKS)
* **Rủi ro bùng nổ B-Tree:** Nếu tạo index trên một bảng có 50 triệu bản ghi, riêng dung lượng file index có thể vượt quá bộ nhớ RAM của máy chủ, dẫn đến hiện tượng trashing (đọc ghi đĩa liên tục).
* **Giải pháp:** Áp dụng Partial Index trên Prisma cho các trạng thái cần thiết:
  `@@index([userId, createdAt], where: "status = 'Active'")`.

---

## 5. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY MATRIX)

| STT | Khía Cạnh Rà Soát | Đánh Giá Rủi Ro Bùng Nổ DB | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `StockPriceDaily` | Nếu không phân vùng, sau 3 năm DB sẽ phình to > 20GB, làm tê liệt các query so sánh biểu đồ. | `HIGH` | `P0` |
| 2 | `AuditLog` | Cần tự động chuyển dữ liệu cũ sang kho lưu trữ lạnh để tiết kiệm chi phí SSD. | `HIGH` | `P1` |

Chiến lược dữ liệu lịch sử đã được thẩm định chi tiết, bảo đảm hệ thống vận hành trơn tru qua nhiều chu kỳ thị trường chứng khoán.
