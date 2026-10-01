# Spec — Japanese Study App (MVP)

> **Trạng thái:** bản nháp ngày 1/10/2026, **chờ người dùng duyệt** (Checkpoint 0).
> Chi tiết từng mục nằm ở [`checklist.md`](../checklist.md) Phần B. File này là phần tóm tắt có ràng buộc, khi hai file lệch nhau thì **spec thắng**.

## 1. Mục tiêu

App phục vụ **một người dùng** học Minna no Nihongo 1–50 để thi N5 tháng 7/2027. App giải quyết ba việc:
1. **Ôn đúng nhịp bài:** SRS (SM-2) cho từ vựng và ngữ pháp, chỉ mở thẻ của bài đã học hoặc đang học.
2. **Biết mình nhanh hay chậm:** dashboard so tiến độ với lộ trình, báo đỏ khi chậm từ 3 bài trở lên.
3. **Đọc lại ngữ pháp của bài:** xem giải thích theo bài, offline.

Ràng buộc: app chạy được offline trên iPhone (PWA), Mac và Ubuntu. Không có backend. Làm xong trong 3 cuối tuần, mỗi cuối tuần **dưới 6h** (`decisions.md` D12).

## 2. Người dùng và thiết bị

- Một người, nói tiếng Việt, mới bắt đầu học tiếng Nhật
- Thiết bị: iPhone (Safari, cài PWA lên màn hình chính), Mac (Safari/Chrome), Ubuntu (Chrome/Firefox)
- Chuyển dữ liệu giữa các máy bằng export/import file JSON (thủ công)

## 3. Tính năng MVP

| # | Tính năng | Cuối tuần | Checklist |
|---|---|---|---|
| F1 | Nội dung 50 bài, sinh bằng script từ bộ thẻ, KANJIDIC2, JMdict. Giải thích ngữ pháp sinh qua chat theo lô (D14) | 1 (3–4/10) | 1.1–1.4 |
| F2 | Storage adapter (localStorage), review log, export/import | 2 (10–11/10) | 1.5 |
| F3 | SRS SM-2 viết dạng hàm thuần | 2 | 2.1 |
| F4 | Màn hình ôn thẻ từ vựng (Nhật → Việt): lật thẻ, chấm 4 mức, "Báo sai", suspend, phím tắt | 2 | 2.2 |
| F5 | Xem ngữ pháp: danh sách theo bài, chi tiết, nhãn "Chưa kiểm tra" (chỉ đọc, chưa có thẻ ôn) | 3 (17–18/10) | 2.3 |
| F6 | Dashboard: giai đoạn, nhanh/chậm bao nhiêu bài, cảnh báo đỏ, số thẻ đến hạn/tồn | 3 | 2.4 |
| F7 | PWA offline, cài được trên iPhone | 3 | 3.3 |
| F8 | Deploy có bảo vệ truy cập, trang "Nguồn dữ liệu" | 3 | 3.4 |

Nếu trễ thì cắt theo thứ tự trong `decisions.md` D13: F5 trước, sau đó đến các chỉ số phụ của F6.

### Quy ước dùng chung
- **Ngày** tính theo giờ Việt Nam (`Asia/Ho_Chi_Minh`). Một ngày mới bắt đầu lúc 00:00 giờ Việt Nam.
- **Chấm điểm:** 4 mức Quên / Khó / Được / Dễ. Cách ánh xạ sang thang 0–5 của SM-2 được ghi trong `docs/srs.md` (viết ở cuối tuần 2).
- **Thẻ mới mỗi ngày:** mặc định 10, chỉnh được trong config.
- **Bài hiện tại** do người dùng tự đặt (bài đang học), không tự suy ra. Thẻ mới chỉ mở cho các bài ≤ bài hiện tại.
- **Lộ trình** (các mốc trong checklist A1) nằm trong một file config duy nhất.
- **Nội dung:** mỗi bản ghi có ID cố định, cùng `source` (`deck` / `jmdict` / `kanjidic` / `unihan` / `tatoeba` / `ai`) và `verified`.
- **Không bịa:** thiếu dữ liệu thì để trống và hiện empty state, không tự điền.

## 4. Ngoài phạm vi (MVP)

- Đồng bộ tự động giữa các máy, backend, tài khoản (sẽ quyết định ngày 15/11)
- Nhiều người dùng
- **Nhật ký 3 câu/ngày, log shadowing** (D12, tạm ghi ngoài app)
- **Thẻ ôn ngữ pháp trong SRS** (D12, chỉ xem ngữ pháp)
- Luyện kana trong app (dùng tool có sẵn)
- Luyện nghe, audio thu sẵn. Phát âm chỉ dùng TTS của trình duyệt
- Luyện đề JLPT
- Thuật toán SRS khác SM-2 (FSRS…)
- Thẻ kanji riêng (kanji chỉ hiện trong thẻ từ vựng, kèm âm Hán Việt)
- Chiều thẻ Việt → Nhật
- Câu ví dụ Tatoeba (D15)
- Script gọi API Claude (D14)
- Thông báo đẩy (push notification)
- Gamification ngoài streak shadowing

## 5. Definition of Done

Áp dụng cho mọi task, theo checklist B0:
- Có xử lý lỗi, loading state, empty state. Không bao giờ trắng màn hình khi dữ liệu hỏng hoặc thiếu
- Responsive từ 375px đến desktop. Màu, spacing, font lấy từ design token
- Không còn `console.log`, code chết, TODO bị bỏ quên
- `npm run build` pass, test của task pass
- Một commit riêng cho mỗi task, message mô tả đúng việc đã làm
- Không thêm thư viện ngoài danh sách đã duyệt trong `CLAUDE.md`
- Điều cần lưu ý thì ghi vào `docs/notes.md`

Mỗi milestone chỉ xong khi checkpoint tương ứng trong checklist đã được tick.

## 6. Lịch

| Thời gian | Việc |
|---|---|
| 1–3/10 | Giai đoạn 0: docs, nguồn, tasks |
| 3–4/10 | Khởi tạo, schema, script build nội dung → **Checkpoint 1** (schema và ID) |
| 10–11/10 | Storage, review log, SM-2, màn hình ôn thẻ |
| 17–18/10 | Xem ngữ pháp, dashboard, PWA, deploy |
| 24–25/10 | Chỉ sửa bug → **Checkpoint 3** |
| 1–14/11 | Dùng thật 2 tuần, không thêm tính năng |
| 15/11 | Quyết định: dừng ở MVP / làm sync / bỏ app |

## 7. Câu hỏi còn mở

- Cách bảo vệ truy cập khi deploy (`decisions.md` P3): cần chốt trước 17/10
- Điều kiện dừng code trong tháng Kana (`decisions.md`, mục "Câu hỏi còn mở")
