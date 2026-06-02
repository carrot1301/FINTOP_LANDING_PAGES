# 🏢 CHIẾN LƯỢC ĐA KHÁCH HÀNG & CÔ LẬP MÔI GIỚI (MULTI-TENANCY & BROKER ISOLATION STRATEGY)

**Ngày thực hiện:** 18/05/2026  
**Mục tiêu:** Thẩm định mô hình kiến trúc đa khách hàng (Multi-tenancy), thiết lập ranh giới sở hữu dữ liệu cho môi giới (Broker Row-Level Isolation) và phân tích sự đánh đổi giữa các phương án thiết kế cho hệ thống FinTop DATA.

---

## 1. PHÂN TÍCH MÔ HÌNH KIẾN TRÚC ĐA KHÁCH HÀNG

```mermaid
graph TD
    subgraph Shared Market Data [DỮ LIỆU CHUNG TOÀN HỆ THỐNG]
        Stock[Bảng Giá Cổ Phiếu]
        CMS[Bài Viết & Báo Cáo VIP]
        Plan[Bảng Giá Gói Subscription]
    end

    subgraph Broker A Isolation [MÔI GIỚI A - ROW LEVEL SECURITY]
        BrokerA[Sale / Broker A] --> ClientA1[Khách hàng 1]
        BrokerA --> ClientA2[Khách hàng 2]
    end

    subgraph Broker B Isolation [MÔI GIỚI B - ROW LEVEL SECURITY]
        BrokerB[Sale / Broker B] --> ClientB1[Khách hàng 3]
    end

    Shared Market Data --> BrokerA & BrokerB
    ClientA1 -.->|Không thể truy cập| ClientB1
```

### 1.1. Bản chất Hệ thống (System Nature)
Hệ thống FinTop DATA hoạt động theo mô hình **Logical Multi-Tenancy (Row-Level Isolation)** kết hợp **Shared Data**:
* **Dữ liệu chia sẻ chung (Shared Data):** Bảng giá chứng khoán (`Stock`), Khuyến nghị V.I.P (`VipSignal`), Danh mục mẫu (`RecommendedPortfolio`) và Bài viết CMS (`Blog`). Toàn bộ người dùng đều truy cập chung một kho dữ liệu này (được phân quyền theo Tier).
* **Dữ liệu cô lập theo Môi giới (Broker-Isolated Data):** Danh sách khách hàng (`User`), Yêu cầu thanh toán (`Invoice`), Ghi chú chăm sóc khách hàng. Mỗi nhân viên Sale/Broker đóng vai trò như một "Tenant" quản lý tệp khách hàng độc lập.

---

## 2. CHIẾN LƯỢC CÔ LẬP HÀNG (ROW-LEVEL ISOLATION STRATEGY)

### 2.1. Ranh giới Sở hữu Tenant (Tenant Boundaries)
Để bảo đảm tuyệt đối không xảy ra tình trạng Sale A nhòm ngó hay cướp khách hàng của Sale B, thuộc tính `brokerId` (Khóa ngoại tham chiếu đến bảng `User` với Role Sale) được chọn làm **Khóa phân chia Tenant (Tenant Key)**.

### 2.2. Ma trận Phân loại Thực thể (Entity Sensitivity Matrix)
```
+--------------------------+-----------------------+-------------------------------------------------+
| Tên Thực Thể (Entity)    | Phân Loại Tenancy     | Cơ Chế Cô Lập & Bảo Vệ (Isolation Mechanism)    |
+--------------------------+-----------------------+-------------------------------------------------+
| User (Client)            | 🔴 Tenant-Sensitive   | Row-Level Security: WHERE brokerId = req.user.id|
| BrokerAssignment         | 🔴 Tenant-Sensitive   | FK ràng buộc chặt chẽ với ID của Sale.          |
| Invoice / Transaction    | 🔴 Tenant-Sensitive   | Sale chỉ xem hóa đơn của KH thuộc quyền mình.   |
| Watchlist / PriceAlert   | 🔴 User-Isolated      | WHERE userId = req.user.id                      |
| Stock / DailyPrice       | 🟢 Shared Public Data | Bỏ qua kiểm tra brokerId.                       |
| VipSignal / Portfolio    | 🟡 Shared Gated Data  | Kiểm tra Tier Level (Standard/Gold/Diamond).    |
+--------------------------+-----------------------+-------------------------------------------------+
```

---

## 3. PHÂN TÍCH ĐÁNH ĐỔI KIẾN TRÚC (TRADEOFF ANALYSIS)

```
+---------------------------------------------------------------------------------------------------------+
|                                        MULTI-TENANCY ARCHITECTURE TRADEOFFS                             |
+--------------------------------+---------------------------------+--------------------------------------+
| Phương Án Kiến Trúc            | Ưu Điểm                         | Nhược Điểm                           |
+--------------------------------+---------------------------------+--------------------------------------+
| 1. Separate Database per Broker| Cô lập dữ liệu tuyệt đối 100%.  | Quá tốn kém; khó đồng bộ bảng giá CP.|
+--------------------------------+---------------------------------+--------------------------------------+
| 2. Separate Schema per Broker  | Bảo mật cao ở mức PostgreSQL.   | Prisma không hỗ trợ tốt Multi-schema.|
+--------------------------------+---------------------------------+--------------------------------------+
| 3. Logical RLS (ĐỀ XUẤT)       | Tối ưu chi phí; dễ dùng Prisma. | Đòi hỏi Guard & Index cực kỳ chặt chẽ|
+--------------------------------+---------------------------------+--------------------------------------+
```

---

## 4. TÁC ĐỘNG MỞ RỘNG VÀ VẬN HÀNH (OPERATIONAL & SCALING IMPACT)
* **Tác động Index:** Bắt buộc phải thêm composite index `@@index([brokerId, status])` trên bảng `User` và `Invoice` để bảo đảm tốc độ truy vấn danh sách KH của Sale dưới < 10ms.
* **Tác động Di chuyển (Migration):** Dễ dàng thực thi qua Prisma mà không cần thay đổi cấu trúc kết nối DB.

---

## 5. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY MATRIX)

| STT | Khía Cạnh Rà Soát | Bằng Chứng Kiến Trúc (Evidence) | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Rò Rỉ Dữ Liệu Sale | Nếu Controller thiếu câu lệnh `WHERE brokerId = userId`, Sale có thể cào toàn bộ KH của công ty. | `HIGH` | `P0` |
| 2 | Chuyển Đổi Sale | Khi Sale nghỉ việc, cần luồng API gán `brokerId` sang Sale Admin để tránh mồ côi KH. | `HIGH` | `P0` |

Chiến lược Multi-tenancy đã được thẩm định rõ ràng, bảo đảm đáp ứng 100% yêu cầu bảo mật Row-Level Security của hệ thống.
