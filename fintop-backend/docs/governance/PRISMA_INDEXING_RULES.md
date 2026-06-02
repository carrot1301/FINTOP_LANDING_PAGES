# ⚡ QUY CHUẨN ĐÁNH CHỈ MỤC PRISMA (PRISMA INDEXING RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Quy định bắt buộc các chiến lược thiết lập chỉ mục (Indexes), quy tắc sử dụng Composite Indexes và các biện pháp phòng ngừa rủi ro phình to chỉ mục (Index Bloat) trên hệ thống FinTop DATA.

---

## 1. QUY CHUẨN ĐÁNH CHỈ MỤC CỐT LÕI (CORE INDEXING STANDARDS)

```mermaid
graph TD
    subgraph Bảng Tra Cứu Thường Xuyên (Read Heavy)
        Stock[Stock] --> I1[@@index symbol]
        User[User] --> I2[@@index email, status]
    end

    subgraph Bảng Phân Quyền & RLS (Security Heavy)
        UserRLS[User RLS] --> I3[@@index brokerId, deletedAt]
        Session[UserSession] --> I4[@@index token]
    end

    subgraph Bảng Lịch Sử & Phân Vùng (Time-series)
        Daily[StockPriceDaily] --> I5[@@index stockId, priceDate]
    end
```

---

## 2. QUY TẮC THIẾT LẬP COMPOSITE INDEXES

### 2.1. Thứ tự Cột trong Composite Index (Left-Most Prefix Rule)
Khi định nghĩa một Composite Index trong Prisma `@@index([colA, colB])`, engine B-Tree của PostgreSQL sẽ ưu tiên sắp xếp theo `colA` trước. Do đó, cột có độ chọn lọc cao nhất (Most Selective Column) bắt buộc phải đứng đầu tiên.
* **Chuẩn:** `@@index([brokerId, deletedAt, status])`. Khi lọc theo `brokerId`, DB loại bỏ 95% bản ghi không thuộc Sale viên ngay từ nốt đầu của cây B-Tree.
* **Lỗi (Anti-Pattern):** `@@index([status, brokerId])`.

---

## 3. PHÒNG NGỪA RỦI RO BÙNG NỔ CHỈ MỤC (INDEX BLOAT PREVENTION)
* **Tuyệt đối cấm đánh index tràn lan trên mọi cột (Over-indexing):** Mỗi index định nghĩa trong `schema.prisma` sẽ làm chậm tốc độ `INSERT`/`UPDATE` của DB thêm ~3-5% và tiêu tốn dung lượng RAM.
* **Cấm đánh B-Tree Index trên cột dạng văn bản dài:** Các cột như `content` trong `Blog` hay `notes` trong `VipSignal` tuyệt đối không dùng `@@index`. Nếu cần tìm kiếm văn bản, bắt buộc sử dụng Full-Text Search index (Gin index).

---

## 4. MA TRẬN CHỈ MỤC BẮT BUỘC (MANDATORY INDEXING MATRIX)

```
+------------------------+-------------------------------------+---------------------------------------+
| Tên Bảng               | Cú Pháp Index Bắt Buộc trong Prisma | Ý Nghĩa Tối Ưu Hóa (Query Target)     |
+------------------------+-------------------------------------+---------------------------------------+
| User                   | @@index([brokerId, deletedAt])      | Row-Level Security tốc độ < 5ms.      |
| User                   | @@index([email, status])            | Tối ưu hóa truy vấn xác thực Login.   |
| UserSession            | @@index([token])                    | Kiểm tra phiên làm việc trên Guard.   |
| UserSubscription       | @@index([userId, status, endDate])  | Cronjob quét các gói dịch vụ hết hạn. |
| Invoice                | @@index([invoiceCode])              | Tra cứu thần tốc khi nhận Webhook NH. |
| Stock                  | @@index([symbol])                   | Thanh tìm kiếm autocomplete mã CP.    |
| VipSignal              | @@index([stockId, status])          | Bộ lọc tra cứu tín hiệu V.I.P.        |
+------------------------+-------------------------------------+---------------------------------------+
```

---

## 5. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Rủi Ro Chỉ Mục | Phân Tích Tác Động Rủi Ro | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Thiếu Index Khóa Ngoại | Mọi cột FK (`brokerId`, `planId`) nếu thiếu index sẽ gây chậm toàn bộ hệ thống khi JOIN. | `HIGH` | `P0` |
| 2 | Sai Thứ Tự Composite Index | Lọc sai thứ tự (đặt `status` lên trước) làm mất tác dụng của B-Tree index. | `HIGH` | `P0` |

Quy chuẩn đánh chỉ mục đã được thiết lập vô cùng tối ưu, chuẩn bị cho bước quy chuẩn hóa xử lý tiền tệ (Financial Rules).
