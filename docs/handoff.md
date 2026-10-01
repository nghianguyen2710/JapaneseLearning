# Handoff — Context từ phiên chat ngày 1/10/2026

> File này ghi lại những gì đã kết luận trong phiên chat đầu tiên với Claude Code (trên Mac), để tiếp tục được trên máy khác.
> Khi làm xong Giai đoạn 0, các nội dung bên dưới sẽ được chuyển vào `docs/decisions.md` và `CLAUDE.md`. Sau đó có thể xoá file này.
>
> **Tài liệu gốc:** [`checklist.md`](../checklist.md) (lộ trình học và checklist làm app)

---

## 1. Trạng thái hiện tại (1/10/2026)

- Project mới chỉ có `checklist.md` và file này, **chưa có code**
- **Chưa phải git repo**, chưa tạo repo private trên GitHub
- Chưa làm mục nào của Giai đoạn 0

## 2. Ước lượng thời gian làm MVP (Phần B)

Thời gian chủ yếu bị giới hạn bởi các bước người dùng phải tự làm (duyệt spec, đọc test, kiểm tra nội dung, test thiết bị), không phải bởi tốc độ viết code.

| Phần | Claude làm | Người dùng cần làm | Tổng (có người dùng tham gia) | Rủi ro |
|---|---|---|---|---|
| Giai đoạn 0: docs, spec, tasks | ~1h | Duyệt spec, tải file nguồn về `content/raw/` | 3–4h | Thấp |
| M1: nền móng và nội dung | ~6–8h | Review schema và ID kỹ (Checkpoint 1), kiểm tra bài 1–5 | 10–14h | **Cao** |
| M2: SRS, ôn thẻ, ngữ pháp, dashboard | ~4–6h | Đọc test SM-2, dùng thử | 7–9h | Trung bình |
| M3: nhật ký, PWA, deploy | ~4–5h | Thiết lập deploy, test chéo 3 thiết bị | 8–11h | Trung bình |
| **Tổng MVP** | | | **~28–38h** | |

**Kết luận:** làm kịp trong 3 cuối tuần nếu mỗi cuối tuần có khoảng **10–12h**. Nếu chỉ có khoảng 6h mỗi cuối tuần thì sẽ trễ, và chỗ trễ gần như chắc chắn là M1.

## 3. Các rủi ro đã nhận diện

1. **Module 1.3: lọc câu Tatoeba "chỉ chứa từ đã học" cần bộ tách từ.**
   Lý do: tiếng Nhật không có dấu cách giữa các từ, và động từ chia đuôi (食べました → 食べる). So khớp chuỗi sẽ cho kết quả sai nhiều.
   → Phải thêm thư viện (ví dụ kuromoji.js), **cần người dùng duyệt**. Thư viện này chỉ chạy trong script build (Node), không đưa vào app.
2. **Định dạng dữ liệu nguồn chưa rõ:**
   - Chưa thấy file bộ thẻ Minna
   - JMdict là file XML rất nặng
   - Âm Hán Việt trong Unihan (trường `kVietnamese`) có chỗ thiếu hoặc lẫn âm Nôm

   → Mỗi chỗ có thể tốn thêm 1–2h.
3. **Module 1.4 cần Claude API key.** Không có key thì phải sinh ngữ pháp thủ công qua chat, chậm hơn.
4. **PWA offline trên iOS** có nhiều điểm khác biệt (cache, cập nhật bản mới, safe area). Service worker gần như chắc chắn cần thêm thư viện (ví dụ Serwist), **cần duyệt**.
5. **Bảo vệ truy cập khi deploy:** tính năng chặn bằng mật khẩu của Vercel tốn phí. Có các lựa chọn khác như Cloudflare Access hoặc basic auth qua middleware. **Cần người dùng quyết định.**

## 4. Đề xuất (chưa chốt)

- **Bản đầu của Module 1.3 để trống câu ví dụ**, đúng với quy tắc "không bịa". Làm bộ lọc Tatoeba ở cuối tuần dự phòng (24–25/10), để Checkpoint 1 không bị kẹt vì một tính năng phụ.
- **Giai đoạn 0 làm luôn từ tối 1/10**, đúng lịch. Người dùng tải file nguồn trước, vì Claude không tự lấy được bộ thẻ cộng đồng (vấn đề giấy phép và nguồn).

## 5. Câu hỏi đang chờ người dùng trả lời

- [ ] Mỗi cuối tuần thực sự có bao nhiêu giờ? (Ước lượng ở mục 2 đang giả định khoảng 10h.)
- [ ] Đã có file CSV của bộ thẻ Minna chưa?
- [ ] Có Claude API key cho script sinh ngữ pháp không?
- [ ] Có làm `git init` và tạo repo private trên GitHub ngay bây giờ không?
- [ ] Câu hỏi phản biện: nếu M1 trễ sang cuối tuần thứ 2, sẽ cắt tính năng, lấn vào cuối tuần dự phòng, hay lấn vào giờ học? Quy tắc "chậm 3 bài thì dừng code" có bảo vệ được giai đoạn Kana không, khi lúc đó chưa có bài Minna nào để đo?

## 6. Bước tiếp theo

1. Trả lời các câu hỏi ở mục 5
2. `git init`, tạo repo private, push lên (để đồng bộ giữa các máy)
3. Bắt đầu Giai đoạn 0 theo `checklist.md`: `docs/spec.md`, `CLAUDE.md`, `docs/decisions.md`, `docs/sources.md`, `docs/tasks.md`

## 7. Lưu ý khi chuyển máy

- **Quy tắc làm việc chung của người dùng** nằm ở `~/.claude/CLAUDE.md` trên Mac, **không đi theo repo**. Muốn có trên máy khác thì phải chép sang, hoặc để trong một repo dotfiles.
- Lịch sử chat gốc nằm ở `~/.claude/projects/-Users-admin-Desktop-Projects-JapaneseLearning/` trên Mac, chỉ dùng khi cần tra lại chi tiết.
- **Mở phiên mới ở máy khác:** yêu cầu Claude đọc `docs/handoff.md` và `checklist.md` trước khi làm.
