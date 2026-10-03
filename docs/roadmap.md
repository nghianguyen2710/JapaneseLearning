# Lộ trình — tính nhanh/chậm

> **Trạng thái:** bản nháp ngày 3/10/2026, **chờ người dùng duyệt** (T3.1).
> Config: [`src/config/roadmap.ts`](../src/config/roadmap.ts). Code: [`src/lib/roadmap/pace.ts`](../src/lib/roadmap/pace.ts). Test (👤 đọc file này để duyệt): [`src/lib/roadmap/pace.test.ts`](../src/lib/roadmap/pace.test.ts).

## 1. Mục tiêu theo ngày

Lấy từ checklist Phần A1, chia thành 3 đoạn học đều:

| Đoạn | Bài | Số ngày | Nhịp |
|---|---|---|---|
| 1/11 – 14/11/2026 | 1–2 | 14 | 1 bài/tuần |
| 15/11/2026 – 14/2/2027 | 3–25 | 92 | ~1,75 bài/tuần |
| 15/2 – 13/6/2027 | 26–50 | 119 | ~1,5 bài/tuần |

Trong mỗi đoạn, mục tiêu **rải đều theo ngày**, rồi **làm tròn xuống**. Ví dụ ngày 7/11 là ngày thứ 7/14 của đoạn đầu, nên mục tiêu là đã xong 1 bài.

## 2. Nhanh/chậm

- **Số bài đã xong = "Bài đang học" − 1.** Đang học bài 6 nghĩa là đã xong 5 bài. Học xong một bài thì đổi "Bài đang học" sang bài tiếp theo.
- **Chênh lệch = đã xong − mục tiêu.** Dương là nhanh, âm là chậm.
- **Báo đỏ khi chậm từ 3 bài trở lên** (D7: dừng code đến khi bắt kịp).
- **Tháng Kana (trước 1/11):** chưa tính, dashboard chỉ hiện "Bắt đầu Minna từ 1/11".
- **Sau 13/6/2027:** mục tiêu giữ ở 50 bài.

## 3. Các lựa chọn cần người dùng biết

1. **Làm tròn xuống** nên hơi dễ dãi: phải hết ngày thì mới tính là "lẽ ra đã xong bài đó". Ví dụ ngày đầu đoạn 3–25 (15/11) mục tiêu vẫn là 2 bài.
2. **Rải theo ngày, không theo tuần.** Nếu thường học dồn vào cuối tuần, giữa tuần có thể thấy "chậm 1" rồi cuối tuần về 0. Ngưỡng báo đỏ là 3 bài nên dao động này không gây báo đỏ.
3. **Giai đoạn "Luyện đề N4"** được tính từ 5/7/2027 (ngay sau ngày thi N5), dù A1 ghi là tháng 8–11, để không có khoảng trống giữa các giai đoạn.
