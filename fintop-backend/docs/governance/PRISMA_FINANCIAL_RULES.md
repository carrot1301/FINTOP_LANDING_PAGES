# 💵 QUY CHUẨN QUẢN TRỊ DỮ LIỆU TÀI CHÍNH (PRISMA FINANCIAL RULES)

**Ngày ban hành:** 18/05/2026  
**Mục tiêu:** Thiết lập quy tắc tuyệt đối về việc lưu trữ và tính toán dữ liệu dòng tiền (Hóa đơn, Giá cổ phiếu, % hoa hồng, NAV) trên Prisma Schema nhằm loại bỏ 100% nguy cơ sai số do làm tròn (Precision loss) trong hệ thống FinTop DATA.

---

## 1. QUY TẮC CỐT LÕI VỀ KIỂU DỮ LIỆU (CORE DATA TYPE GOVERNANCE)

```mermaid
graph TD
    subgraph Dữ Liệu Tiền & Giá BẮT BUỘC DÙNG DECIMAL
        Price[Giá Cổ Phiếu / Mốc Chốt Lời / Cắt Lỗ] --> D1[Decimal @db.Decimal_18_4]
        Inv[Số Tiền Hóa Đơn / Giao Dịch VietQR] --> D2[Decimal @db.Decimal_18_2]
        NAV[Giá Trị Ròng Danh Mục Đầu Tư] --> D3[Decimal @db.Decimal_20_4]
    end

    subgraph Nghiêm Cấm Sử Dụng (ANTI-PATTERN)
        Float[Float / Double] -.->|Sai số làm tròn nhị phân| Crash[Thất thoát tài chính & Lệch số liệu]
    end
```

### 1.1. Nghiêm cấm kiểu `Float` (Forbidden `Float` Type)
* **Lỗi kinh điển trong Fintech:** `0.1 + 0.2 = 0.30000000000000004`. Kiểu `Float` sử dụng dấu phẩy động nhị phân (Binary floating point IEEE 754), không thể biểu diễn chính xác các số thập phân hệ 10.
* **Quy tắc bắt buộc:** Mọi thuộc tính tài chính trên Prisma bắt buộc sử dụng kiểu `Decimal` và khai báo độ chính xác tường minh qua decorator `@db.Decimal(precision, scale)`.

---

## 2. MA TRẬN ĐỘ CHÍNH XÁC BẮT BUỘC (PRECISION STANDARDS MATRIX)

```
+------------------------+-------------------+---------------------------+--------------------------------+
| Nhóm Dữ Liệu (Group)   | Cú Pháp Prisma    | Ý Nghĩa (Precision/Scale) | Ứng Dụng Thực Tế (Target)      |
+------------------------+-------------------+---------------------------+--------------------------------+
| Tiền Tệ VND (`amount`) | Decimal @db.Decimal(18, 2) 18 chữ số tổng, 2 số lẻ| Lưu số tiền hóa đơn, giao dịch.|
| Giá Cổ Phiếu (`price`) | Decimal @db.Decimal(18, 4) 18 chữ số tổng, 4 số lẻ| Lưu giá cổ phiếu, mốc tín hiệu.|
| Tỷ Lệ % (`percentage`) | Decimal @db.Decimal(8, 4)  8 chữ số tổng, 4 số lẻ | Tỷ lệ tăng trưởng, % hoa hồng. |
| NAV Danh Mục (`nav`)   | Decimal @db.Decimal(20, 4) 20 chữ số tổng, 4 số lẻ| Quản lý tổng tài sản VIP.      |
+------------------------+-------------------+---------------------------+--------------------------------+
```

---

## 3. PHÂN TÍCH ANTI-PATTERNS & RỦI RO TÀI CHÍNH

```
+-------------------------------------------------------------------------------------------------------+
|                                        FINANCIAL DATA GOVERNANCE                                       |
+-------------------+-----------------------------------+-----------------------------------------------+
| Ví Dụ Anti-Pattern| Phân Tích Rủi Ro (Risk Reasoning) | Định Dạng Chuẩn Enterprise (Correct Format)   |
+-------------------+-----------------------------------+-----------------------------------------------+
| `amount Float`    | Gây lệch 1-2 đồng khi cộng dồn    | Bắt buộc sử dụng `amount Decimal @db.Decimal( |
|                   | hàng vạn giao dịch, không thể đối | 18, 2)` và sử dụng `Prisma.Decimal` (big.js). |
|                   | soát chính xác với VietQR.        |                                               |
+-------------------+-----------------------------------+-----------------------------------------------+
| `buyPrice Int`    | Không thể biểu diễn được các mã CP| Bắt buộc sử dụng `Decimal @db.Decimal(18, 4)`.|
|                   | giá trị lẻ như 10.55 hay 22.15.   |                                               |
+-------------------+-----------------------------------+-----------------------------------------------+
```

---

## 4. MA TRẬN RỦI RO VÀ MỨC ĐỘ TỰ TIN (EVIDENCE & PRIORITY)

| STT | Rủi Ro Dữ Liệu Tiền | Phân Tích Tác Động Rủi Ro | Mức Độ Tự Tin | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Thất Thoát Làm Tròn | Sử dụng Float sẽ dẫn đến sai lệch kiểm toán tài chính và đối soát ngân hàng. | `HIGH` | `P0` |
| 2 | Lệch Giá Khớp Lệnh | Nếu giá cổ phiếu làm tròn quá thô, tín hiệu V.I.P sẽ chốt sai giá gây lỗ cho KH. | `HIGH` | `P0` |

Quy chuẩn dữ liệu tài chính đã được thiết lập vô cùng chặt chẽ, sẵn sàng cho bước chuẩn hóa hệ thống Enum và cờ trạng thái (Enum Governance).
