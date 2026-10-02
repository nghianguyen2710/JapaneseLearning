# SRS — Thuật toán SM-2

> **Trạng thái:** bản nháp ngày 2/10/2026, **chờ người dùng duyệt** (T2.3).
> Code: [`src/lib/srs/sm2.ts`](../src/lib/srs/sm2.ts). Test (👤 đọc file này để duyệt): [`src/lib/srs/sm2.test.ts`](../src/lib/srs/sm2.test.ts).

## 1. Bốn nút chấm điểm

| Nút | Phím tắt | Điểm SM-2 (0–5) | Hệ số dễ thay đổi | Ý nghĩa |
|---|---|---|---|---|
| **Quên** | `1` | 2 | −0.32 | Không nhớ ra, hoặc nhớ sai |
| **Khó** | `2` | 3 | −0.14 | Nhớ ra nhưng phải nghĩ lâu |
| **Được** | `3` | 4 | 0 | Nhớ ra bình thường |
| **Dễ** | `4` | 5 | +0.10 | Nhớ ngay, không phải nghĩ |

**Vì sao "Quên" là 2, không phải 0:** với điểm 0, hệ số dễ giảm 0.8 mỗi lần quên, nên chỉ cần quên 2 lần là thẻ chạm sàn 1.3. Sau đó thẻ sẽ lặp lại quá dày suốt nhiều tháng. Chọn 2 thì "Quên" vẫn bị phạt, nhưng phải quên khoảng 4 lần mới chạm sàn.

## 2. Công thức

- **Hệ số dễ (EF):** bắt đầu từ 2.5. Mỗi lần chấm: `EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))`, làm tròn 2 chữ số. **Tối thiểu 1.3.**
- **Khoảng cách:**
  - **Quên:** về lại từ đầu, khoảng cách = 0, nên đến hạn ngay hôm nay và thẻ quay lại cuối hàng đợi trong ngày
  - Lần nhớ thứ 1: 1 ngày
  - Lần nhớ thứ 2: 6 ngày
  - Từ lần thứ 3: `khoảng cách cũ × EF mới`, làm tròn
- **Ngày đến hạn** = ngày ôn (theo giờ Việt Nam) + khoảng cách.

## 3. Các lựa chọn cần người dùng biết

1. **Thẻ quá hạn không được "thưởng".** Đến hạn ngày 8/11 mà 22/11 mới ôn, nếu vẫn nhớ thì khoảng cách mới vẫn là `6 × 2.5 = 15` ngày, đếm từ 22/11. Đây là SM-2 gốc: đơn giản và dễ đoán. Anki thì có cộng thêm phần ngày trễ.
2. **"Khó" vẫn tính là nhớ**, khoảng cách vẫn tăng nhưng chậm hơn, vì hệ số dễ giảm.
3. **Ôn lại trong ngày sau khi quên** cũng là một lần ôn thật, có ghi vào review log. Nhớ ở lần này thì đến hạn ngày mai.
4. **Trạng thái thẻ không được lưu như nguồn sự thật.** Trạng thái luôn tính lại được bằng cách cho review log chạy lại qua hàm `schedule` (`docs/schema.md` mục 4).
