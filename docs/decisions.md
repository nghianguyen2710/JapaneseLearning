# Quyết định

Mỗi quyết định ghi kèm ngày và lý do. Muốn đổi quyết định đã chốt thì thêm mục mới ghi rõ là thay thế mục nào, không sửa mục cũ.

## Đã chốt

### D1. Lộ trình học hướng C — 1/10/2026
Học hết Minna 1–50 trước tháng 7/2027, thi **N5 kỳ 7/2027**, thi **N4 kỳ 12/2027**. Ngày thi là dự kiến, cần kiểm tra lại trên trang JLPT Việt Nam.
**Lý do:** khoảng 9 giờ học/tuần đủ cho khoảng 1,5–1,7 bài/tuần. Checkpoint 14/2/2027 là lúc cân nhắc chuyển sang thi N4 (hướng B) nếu học vượt xa mục tiêu.

### D2. App là PWA Next.js — 1/10/2026
Dùng được trên iPhone, Mac, Ubuntu. Vibe code bằng Claude Code theo từng milestone.
**Lý do:** chỉ cần một codebase cho cả 3 thiết bị, không phải lên App Store. Người dùng đã quen web.

### D3. Flashcard tự làm, SM-2 kèm review log — 1/10/2026
**Lý do:** cần ôn được cả từ vựng lẫn ngữ pháp theo đúng nhịp bài Minna, có dashboard tiến độ riêng. Lưu review log để tính lại được trạng thái thẻ, và sau này gộp được dữ liệu giữa các máy.

### D4. Nội dung tạo sẵn bằng script — 1/10/2026
Người dùng chỉ kiểm tra theo nhịp học, không nhập liệu.
**Lý do:** nhập tay 2249 từ là không khả thi trong timebox. Kiểm tra nội dung cũng là xem trước bài.

### D5. Lưu bằng localStorage kèm export/import — 1/10/2026
Sau giai đoạn kiểm chứng mới cân nhắc chuyển sang API Laravel (quyết định ngày 15/11).
**Lý do:** MVP không cần backend. Storage adapter giúp chuyển sang API sau này mà không phải sửa UI.

### D6. Timebox làm app 3 cuối tuần, cộng 1 cuối tuần dự phòng — 1/10/2026
Các cuối tuần 3–4/10, 10–11/10, 17–18/10. Cuối tuần 24–25/10 chỉ để sửa bug.
**Lý do:** app chỉ là công cụ phục vụ việc học, không được ăn vào thời gian học.

### D7. Quy tắc bất biến — 1/10/2026
- Giờ code không tính là giờ học. Học tiếng Nhật giữ khoảng 9 giờ/tuần.
- Chậm từ **3 bài Minna** trở lên so với mục tiêu thì **dừng code** cho đến khi bắt kịp.

### D8. Repo private trên tài khoản cá nhân — 1/10/2026
Repo `github.com/nghianguyen2710/JapaneseLearning`, tách khỏi LOA Portal.
**Lý do:** bộ thẻ Minna chỉ được dùng cho cá nhân. Không trộn dự án cá nhân với tài khoản công ty.

### D9. ~~Âm Hán Việt của kanji: KANJIDIC2 là nguồn chính, Unihan để đối chiếu~~ — 1/10/2026 (đã thay bằng D17)
**Lý do:** đo trên 890 kanji của bộ thẻ, KANJIDIC2 có đủ 890, Unihan `kVietnamese` chỉ có 670 và có chỗ lẫn âm Nôm. Âm Hán Việt của cả từ (cột 6 của bộ thẻ) vẫn được giữ nguyên làm giá trị hiển thị chính.

### D10. Dùng JMdict bản JSON (jmdict-simplified) thay cho XML gốc — 1/10/2026
**Lý do:** bản XML gốc rất nặng và phải tự parse. Bản JSON có cùng dữ liệu, cùng giấy phép, và được ghim theo phiên bản trong `scripts/fetch-sources.sh`.

### D11. Nguồn nặng không đưa vào git — 1/10/2026
`content/raw/jmdict|unihan|tatoeba` nằm trong `.gitignore`, tải lại bằng `scripts/fetch-sources.sh`. Bộ thẻ Minna và danh sách ngữ pháp thì nằm trong git.
**Lý do:** các nguồn nặng có tổng khoảng 260MB và tải lại được. Bộ thẻ Minna phải export tay nên cần đi theo repo, để máy khác dùng được mà không phải cài Anki.

### D12. Thời gian code dưới 6h mỗi cuối tuần, thu nhỏ MVP — 1/10/2026
Tổng thời gian khoảng 18h trong 3 cuối tuần, cộng cuối tuần dự phòng chỉ để sửa bug. MVP chỉ còn: nội dung, ôn thẻ từ vựng, xem ngữ pháp, dashboard, PWA offline, deploy.
Chuyển ra **sau MVP**: nhật ký 3 câu/ngày (3.1), log shadowing (3.2), thẻ ôn ngữ pháp trong SRS (một phần của 2.3), chiều thẻ Việt → Nhật, bộ lọc câu ví dụ Tatoeba.
**Lý do:** ước lượng MVP ban đầu là 28–38h, gấp đôi thời gian có. Nhật ký và shadowing tạm ghi bằng giấy hoặc app ghi chú. Ôn thẻ và dashboard là phần không có công cụ nào thay thế được.

### D13. M1 trễ thì cắt tính năng — 1/10/2026
Nếu M1 tràn sang cuối tuần thứ 2, cắt tiếp theo thứ tự: trang xem ngữ pháp → các chỉ số phụ trên dashboard (tỷ lệ nhớ 7 ngày, đếm ngược). **Không** lấn vào giờ học, **không** lấn vào cuối tuần dự phòng.
**Lý do:** giữ quy tắc D7 và giữ chỗ sửa bug trước khi bắt đầu Minna bài 1 (1/11).

### D14. Không dùng API key, giải thích ngữ pháp sinh qua phiên Claude Code — 1/10/2026
Claude viết giải thích theo lô 5 bài ra file trong `content/raw/grammar/`, theo prompt lưu ở `scripts/prompts/`. Script build chỉ đọc file đó rồi ghép vào nội dung. Tất cả có `source: ai`, `verified: false`. Không cần `@anthropic-ai/sdk`.
**Lý do:** người dùng không có API key. Mỗi lô 5 bài chỉ sinh một lần, cứ khoảng 3 tuần một lần, nên làm qua chat là đủ.

### D15. Câu ví dụ: bản đầu để trống, khi có thì dùng bản dịch tiếng Anh làm fallback — 1/10/2026
(Thay cho đề xuất P1, P2.) Bản đầu không có câu ví dụ Tatoeba. Khi làm bộ lọc (sau MVP, dùng `kuromoji`): ưu tiên câu có bản dịch tiếng Việt, không có thì hiện bản dịch tiếng Anh, **không** dùng AI dịch.
**Lý do:** Tatoeba chỉ có 8.477 liên kết Nhật–Việt, so với 280.520 liên kết Nhật–Anh. Dùng bản dịch có sẵn là đúng với quy tắc "không bịa", và không tốn thêm công kiểm tra.

### D16. Duyệt thư viện `kuromoji` và `serwist` — 1/10/2026
`kuromoji` chỉ dùng trong script build, không đưa vào app. `serwist` dùng cho service worker của PWA offline.

### D17. Âm Hán Việt của kanji lấy từ bộ thẻ, KANJIDIC2 chỉ là phương án dự phòng — 1/10/2026
(Thay cho D9.) Âm Hán Việt của từng kanji được tách từ cột âm Hán Việt của bộ thẻ: từ nào có số âm tiết bằng số kanji thì ghép lần lượt từng âm với từng kanji, rồi lấy âm xuất hiện nhiều nhất làm **âm chính**. Có 1527 từ ghép được như vậy, phủ 881/890 kanji. Kanji không có âm trong bộ thẻ thì mới lấy từ KANJIDIC2, đánh dấu `verified: false`. Báo cáo build liệt kê những kanji mà âm từ bộ thẻ khác với âm của KANJIDIC2.
**Lý do:** kiểm tra kỹ hơn cho thấy KANJIDIC2 sai ở nhiều kanji dạng giản thể của Nhật, vì nó gán âm của một chữ Hán khác có cùng mặt chữ. Ví dụ: 桜 → "Tí" (đúng là Anh), 伝 → "Vân" (đúng là Truyền), 県 → "Huyền" (đúng là Huyện), 画 → "Hoạch" (thiếu Họa). Có 42 kanji mà âm từ bộ thẻ không có trong KANJIDIC2. Ngoài ra, dữ liệu KANJIDIC2 không ở dạng chuẩn NFC, nên phải chuẩn hoá Unicode trước khi so sánh.

### D18. Duyệt schema và cơ chế ID — 1/10/2026
Người dùng đã duyệt `docs/schema.md` (Checkpoint T1.4):
- ID từ vựng `w0001…` gán một lần, lưu trong sổ ID `content/ids/vocab.json`, khoá là `bài|kana|kanji`.
- **Từ lặp lại ở nhiều bài: mỗi bài một thẻ riêng** (người dùng chọn thay cho đề xuất "một thẻ duy nhất"). Lý do: mỗi bài giữ nghĩa riêng, và ôn trùng cũng là ôn lại.
- Review log là nguồn sự thật duy nhất. File export không chứa trạng thái thẻ.
- Sửa tay và `verified` nằm trong `content/overrides/`, theo ID.

## Đề xuất — chờ người dùng chốt

### P3. Bảo vệ truy cập khi deploy
Tính năng chặn bằng mật khẩu của Vercel tốn phí. Các lựa chọn: Cloudflare Access (miễn phí, đăng nhập bằng email), hoặc basic auth qua middleware của Next.js. Cần quyết định trước cuối tuần 17–18/10.

## Câu hỏi còn mở

- [ ] Quy tắc "chậm 3 bài thì dừng code" không đo được trong giai đoạn Kana (chưa có bài Minna nào). Cần một điều kiện dừng riêng cho tháng 10. Gợi ý: đến 18/10 chưa đọc được hết hiragana mà không cần nhìn bảng thì bỏ cuối tuần code 17–18/10.
