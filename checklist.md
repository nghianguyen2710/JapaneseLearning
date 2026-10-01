# Lộ trình & Checklist — Học N5 (hướng C) + Japanese Study App

> **Quyết định đã chốt**
> - Lộ trình học **hướng C**: học hết Minna 1–50 trước tháng 7/2027, **thi N5 kỳ 7/2027**, thi **N4 kỳ 12/2027**
> - App là **PWA Next.js**, dùng trên iPhone, Mac và Ubuntu, vibe code bằng Claude Code theo từng milestone
> - Flashcard **tự làm trong app**: thuật toán **SM-2**, có lưu **review log**
> - Nội dung **có sẵn**: được tạo bằng script chuẩn bị, bạn chỉ kiểm tra theo nhịp học
> - Lưu trữ: localStorage kèm export/import trước, sau đó cân nhắc chuyển sang API Laravel
> - Timebox làm app: **3 cuối tuần** (thêm 1 cuối tuần dự phòng chỉ để sửa bug)
>
> **Quy tắc bất biến**
> - Giờ code **không tính** là giờ học. Học tiếng Nhật giữ khoảng 9 giờ/tuần
> - Chậm từ **3 bài Minna** trở lên so với mục tiêu thì **dừng code** cho đến khi bắt kịp
> - Ngày thi JLPT trong file là **dự kiến**, cần kiểm tra lại trên trang JLPT Việt Nam

---

## PHẦN A — LỘ TRÌNH TỔNG

### A1. Timeline tổng quan

| Thời gian | Học tiếng Nhật | App | Nội dung (chuẩn bị & kiểm tra) |
|---|---|---|---|
| 1/10 – 31/10/2026 | Kana và phát âm (dùng tool có sẵn) | Cuối tuần 1–3: làm MVP · Cuối tuần 4: chỉ sửa bug | Chạy script sinh dữ liệu thô cho bài 1–50 · Kiểm tra xong **bài 1–5** |
| 1/11 – 14/11 | Minna bài 1–2 | **2 tuần kiểm chứng**, chỉ sửa bug | Luôn có sẵn ít nhất 1 bài đã kiểm tra trước bài đang học |
| 15/11 | | **Quyết định:** dừng ở MVP / làm sync / bỏ app | |
| 15/11 – 14/2/2027 | Minna bài 3–25 (khoảng 1,7 bài/tuần) | Bảo trì | Sinh giải thích ngữ pháp theo lô 5 bài, kiểm tra theo nhịp học |
| **14/2/2027** | **Checkpoint:** làm đề N5 mẫu | Xem thống kê SRS | Bài 26–30 đã kiểm tra xong |
| 15/2 – 13/6 | Minna bài 26–50 (khoảng 1,5 bài/tuần) | Bảo trì | Kiểm tra theo nhịp học |
| 14/6 – 3/7 | Luyện đề N5 (khoảng 3 đề) | | |
| **~4/7/2027** | **Thi N5** (dự kiến) | | |
| 8 – 11/2027 | Luyện đề N4 | | |
| **~5/12/2027** | **Thi N4** (dự kiến) | | |

### A2. Checklist theo giai đoạn học

**Giai đoạn Kana (tháng 10)**
- [ ] Đọc và viết được toàn bộ hiragana, katakana, không cần nhìn bảng
- [ ] Phân biệt được trường âm, âm ngắt っ, âm ghép (きゃ, しゅ…)
- [ ] Bỏ hẳn romaji kể từ cuối tháng 10
- [ ] Đã cài bộ gõ tiếng Nhật trên cả 3 thiết bị (Mozc trên Ubuntu)

**Giai đoạn Minna 1–25 (1/11 – 14/2)**
- [ ] Đúng tiến độ: khoảng 1,7 bài/tuần, dashboard không báo chậm quá 2 bài
- [ ] Ôn SRS mỗi ngày, không để tồn thẻ quá 1 ngày
- [ ] Mỗi bài: tự đặt 3–5 câu bằng mẫu ngữ pháp mới
- [ ] Shadowing 10–15 phút/ngày với hội thoại của bài
- [ ] Viết nhật ký 3 câu/ngày
- [ ] Kanji N5 học kèm âm Hán Việt

**Checkpoint 14/2/2027**
- [ ] Xong Minna 25 đúng hạn
- [ ] Đề N5 mẫu đạt từ 70% trở lên, phần nghe không bị hụt
- [ ] SRS không tồn thẻ quá 1 ngày
- [ ] Đăng ký thi (hướng C: N5). Nếu vượt xa tiêu chí, cân nhắc chuyển sang thi N4 theo hướng B

**Giai đoạn Minna 26–50 (15/2 – 13/6)**
- [ ] Đúng tiến độ khoảng 1,5 bài/tuần
- [ ] Thời gian dư dồn vào nói: mỗi tuần ghi âm 1 phút nói theo chủ đề
- [ ] Nắm chắc 普通形, 受身, 使役, 敬語 nhập môn, tự đặt câu được với từng mẫu

**Luyện đề N5 (14/6 – 3/7)**
- [ ] Làm khoảng 3 đề, đúng giờ như thi thật
- [ ] Phân tích lỗi sai theo 3 phần: 文字・語彙 / 文法・読解 / 聴解
- [ ] Đã đăng ký N4 kỳ 12/2027 ngay khi mở đơn

### A3. Nhịp chuẩn bị nội dung (chạy song song với việc học)

Nguyên tắc: **luôn có sẵn ít nhất 1 bài đã kiểm tra trước bài đang học**. Kiểm tra nội dung cũng là xem trước bài, nên được tính vào giờ học, tối đa 10 phút mỗi bài.

- [ ] **Đầu mỗi tuần:** kiểm tra JSON của bài sắp học (từ vựng, cách đọc, nghĩa, âm Hán Việt, ví dụ)
- [ ] **Mỗi 5 bài:** sinh giải thích ngữ pháp cho lô 5 bài tiếp theo bằng AI, kiểm tra trước khi học bài đầu của lô
- [ ] **Cuối tuần:** xử lý các mục bị bấm "Báo sai" trong tuần, chạy lại script, commit
- [ ] Phần do AI sinh (ngữ pháp, nghĩa dịch) được kiểm tra **kỹ hơn** phần lấy từ nguồn có sẵn

---

## PHẦN B — CHECKLIST LÀM APP

### B0. Definition of Done chung (áp dụng cho MỌI task)

- [ ] Có xử lý lỗi, không có trạng thái trắng màn hình khi dữ liệu hỏng hoặc thiếu
- [ ] Có loading state và empty state ở mọi màn hình có dữ liệu
- [ ] Responsive từ mobile (375px) đến desktop
- [ ] Màu, spacing, font lấy từ design token, không hard-code
- [ ] Không còn `console.log`, code chết, TODO bị bỏ quên
- [ ] `npm run build` chạy pass, test của task pass
- [ ] Một commit riêng, message mô tả đúng việc đã làm
- [ ] Không thêm thư viện ngoài danh sách đã duyệt trong `CLAUDE.md`
- [ ] Ghi điều cần lưu ý (nếu có) vào `docs/notes.md`

---

### Giai đoạn 0 — Chuẩn bị (tối 1–2/10 và sáng 3/10)

**Repo và môi trường**
- [ ] Repo **private**, dùng tài khoản cá nhân, tách khỏi LOA Portal
- [ ] Allowlist lệnh: `npm run dev/build/test`, `node scripts/*`, `git add/commit`
- [ ] Không bật chế độ bỏ qua toàn bộ quyền trên user chính của máy

**Tài liệu**
- [ ] `docs/spec.md`: mục tiêu, tính năng MVP, **ngoài phạm vi**, định nghĩa Done
- [ ] `CLAUDE.md`: stack, quy tắc (không tự thêm thư viện, mọi đọc/ghi dữ liệu qua storage adapter, không sửa file JSON nội dung bằng tay mà phải sửa qua script, không refactor ngoài phạm vi), lệnh chạy, tham chiếu tới file này
- [ ] `docs/decisions.md`: ghi các quyết định trong khung "Quyết định đã chốt" kèm lý do
- [ ] `docs/tasks.md`: Claude Code sinh từ spec, **bạn duyệt** trước khi bắt đầu

**Nguồn nội dung**
- [ ] `docs/sources.md`: liệt kê từng nguồn, cách lấy, giấy phép, yêu cầu ghi nguồn
  - [ ] Bộ thẻ Minna của cộng đồng (export CSV): thứ tự bài và nghĩa tiếng Việt, **chỉ dùng cá nhân**
  - [ ] JMdict: cách đọc và nghĩa bổ sung, giấy phép CC BY-SA
  - [ ] Unihan: âm Hán Việt của kanji
  - [ ] Tatoeba: câu ví dụ
  - [ ] Danh sách mẫu ngữ pháp theo từng bài Minna (tự lập hoặc lấy từ bộ thẻ)
- [ ] Đã tải file nguồn về `content/raw/`. Thư mục này **không public**, cân nhắc đưa vào `.gitignore` nếu file nặng

**Ràng buộc**
- [ ] Ghi rõ timebox: cuối tuần 3–4/10, 10–11/10, 17–18/10. Cuối tuần 24–25/10 chỉ để sửa bug
- [ ] Ghi điều kiện dừng (chậm 3 bài thì dừng code)

**✅ Checkpoint 0:** nếu người khác code theo spec này, họ có phải hỏi lại câu nào không? Còn câu hỏi thì sửa spec.

---

### Milestone 1 — Nền móng & Nội dung (cuối tuần 3–4/10)

#### Module 1.1 — Khởi tạo project
- [ ] Next.js và Tailwind chạy được ở local
- [ ] Cấu trúc thư mục khớp với `CLAUDE.md` (tách riêng `content/`, `scripts/`, `src/`)
- [ ] Đã có design token (primitives → semantic), có màu cho light và dark
- [ ] Font tiếng Nhật (ví dụ Noto Sans JP) kèm font dự phòng, glyph kanji đúng kiểu Nhật trên Ubuntu
- [ ] Thẻ `<ruby>` hiển thị furigana đúng trên Safari, Chrome, Firefox
- [ ] Lint và format chạy được

#### Module 1.2 — Schema nội dung
- [ ] Schema được mô tả trong `docs/schema.md`: bài, từ vựng, kanji, mẫu ngữ pháp, câu ví dụ
- [ ] **Mỗi từ, kanji, mẫu ngữ pháp, câu ví dụ có ID cố định**, không bao giờ đổi, kể cả khi sửa nội dung
- [ ] Mỗi bản ghi có trường **nguồn gốc** (`source`: deck / jmdict / unihan / tatoeba / ai) và trạng thái `verified` (true/false)
- [ ] File nội dung có `schemaVersion`
- [ ] Một chữ Hán có nhiều âm Hán Việt thì lưu đủ, đánh dấu âm chính

#### Module 1.3 — Script chuẩn bị nội dung
- [ ] Một lệnh duy nhất (ví dụ `npm run content:build`) sinh ra `content/lessons/01.json` … `50.json`
- [ ] Ghép đúng: từ vựng theo bài lấy từ bộ thẻ, bổ sung cách đọc từ JMdict, âm Hán Việt từ Unihan
- [ ] Câu ví dụ từ Tatoeba: chỉ lấy câu ngắn và **chỉ chứa từ đã học đến bài đó**. Không có câu phù hợp thì để trống, không được bịa
- [ ] **Chạy lại script không làm mất** trạng thái `verified` và các chỉnh sửa tay đã có (chỉnh sửa tay lưu ở file override riêng)
- [ ] ID giữ nguyên qua các lần chạy lại
- [ ] Script xuất báo cáo: số từ mỗi bài, từ thiếu nghĩa, từ thiếu cách đọc, kanji thiếu âm Hán Việt, ID trùng
- [ ] Script dừng và báo lỗi rõ ràng khi dữ liệu nguồn sai định dạng
- [ ] Có test cho phần ghép dữ liệu, với một bộ dữ liệu nguồn nhỏ làm mẫu

#### Module 1.4 — Sinh giải thích ngữ pháp bằng AI
- [ ] Script riêng (ví dụ `npm run content:grammar -- --lessons 1-5`) sinh giải thích **theo lô**
- [ ] Mỗi mẫu ngữ pháp gồm: cấu trúc, ý nghĩa bằng tiếng Việt, cách chia, 2–3 ví dụ, lỗi hay gặp
- [ ] Ví dụ chỉ dùng từ vựng đã học đến bài đó
- [ ] Tất cả mặc định `source: ai`, `verified: false`
- [ ] **Không ghi đè** mẫu ngữ pháp đã `verified: true`
- [ ] Prompt được lưu trong repo (`scripts/prompts/`) để lần sau sinh lại ra kết quả nhất quán

#### Module 1.5 — Storage adapter, review log & backup
- [ ] UI chỉ gọi interface của adapter, không gọi `localStorage` trực tiếp ở bất kỳ đâu
- [ ] Key có namespace rõ ràng (ví dụ `jp-app:reviews`, `jp-app:journal`)
- [ ] Mọi thao tác đọc/ghi bọc `try/catch`. Storage rỗng hoặc hỏng thì app vẫn chạy, có thông báo
- [ ] **Review log**: lưu từng lần ôn gồm ID thẻ, thời điểm, điểm chấm, thời gian trả lời
- [ ] Trạng thái thẻ (ngày ôn tiếp, khoảng cách, hệ số dễ) **tính lại được hoàn toàn từ review log**
- [ ] Dữ liệu người dùng có `schemaVersion` và chỗ để viết migration
- [ ] **Export**: tải file JSON, tên file có ngày, nội dung có `schemaVersion` và thời điểm export
- [ ] **Import**: kiểm tra hợp lệ trước khi ghi, **hỏi xác nhận trước khi ghi đè**, file sai thì báo lỗi và không động vào dữ liệu cũ
- [ ] Test: export rồi import trên máy khác cho ra dữ liệu giống hệt
- [ ] Ngày tính theo **giờ Việt Nam** (Asia/Ho_Chi_Minh), không theo UTC

**✅ Checkpoint 1 (quan trọng nhất):** review kỹ **schema nội dung, review log và cơ chế ID**. Đây là nhóm quyết định khó đảo ngược nhất.
- [ ] Sửa nghĩa một từ rồi chạy lại script: tiến độ ôn của từ đó **vẫn giữ nguyên**
- [ ] Xoá trạng thái thẻ, tính lại từ review log: kết quả giống hệt
- [ ] Báo cáo của script cho bài 1–5 không còn lỗi
- [ ] Đã thử export/import thủ công giữa Mac và iPhone

---

### Milestone 2 — Tính năng học (cuối tuần 10–11/10)

#### Module 2.1 — Thuật toán SRS (SM-2)
- [ ] Cài đặt SM-2 là **hàm thuần**: nhận trạng thái thẻ cùng điểm chấm, trả về trạng thái mới, không đọc/ghi storage
- [ ] Mức chấm điểm rõ ràng trên UI (ví dụ: Quên / Khó / Được / Dễ), ánh xạ sang thang điểm của SM-2 được ghi trong `docs/`
- [ ] Hệ số dễ có giới hạn dưới (tối thiểu 1.3), không giảm vô hạn
- [ ] Chấm "Quên" thì thẻ quay về khoảng cách ngắn, đưa vào hàng ôn lại trong ngày
- [ ] Test các trường hợp:
  - [ ] Thẻ mới, lần ôn đầu tiên với từng mức điểm
  - [ ] Chuỗi nhớ liên tiếp: khoảng cách tăng đúng công thức
  - [ ] Nhớ vài lần rồi quên: reset đúng
  - [ ] Thẻ **quá hạn nhiều ngày** (bỏ ôn cả tuần)
  - [ ] Ôn lúc 23:59 và 00:01 rơi đúng ngày theo giờ Việt Nam
- [ ] Bạn **đọc test**, không cần đọc code, và đồng ý với kết quả mong đợi của từng test

#### Module 2.2 — Màn hình ôn từ vựng
- [ ] Hàng đợi hôm nay = thẻ đến hạn + thẻ mới (giới hạn số thẻ mới mỗi ngày trong config, mặc định 10–15)
- [ ] Chỉ mở thẻ mới của **bài đã học hoặc đang học**, không mở trước bài chưa học
- [ ] Mặt trước: từ (kanji và furigana tuỳ chọn). Mặt sau: cách đọc, nghĩa tiếng Việt, âm Hán Việt, ví dụ, nút phát âm
- [ ] Chiều thẻ: Nhật → Việt bắt buộc, Việt → Nhật tuỳ chọn và bật/tắt theo bài
- [ ] Phím tắt trên desktop (lật thẻ, chấm điểm), vùng chạm đủ lớn trên iPhone
- [ ] Hiển thị số thẻ còn lại, empty state "Hôm nay đã ôn xong"
- [ ] Nút **"Báo sai"** trên mỗi thẻ, kèm ghi chú ngắn, lưu vào danh sách cần sửa
- [ ] Tạm ẩn (suspend) được thẻ không muốn ôn
- [ ] Thoát giữa chừng không mất kết quả các thẻ đã chấm

#### Module 2.3 — Ngữ pháp
- [ ] Xem danh sách mẫu ngữ pháp theo từng bài, mở chi tiết: cấu trúc, ý nghĩa, cách chia, ví dụ, lỗi hay gặp
- [ ] Mẫu `verified: false` có nhãn "Chưa kiểm tra" nhìn thấy rõ
- [ ] Thẻ ôn ngữ pháp trong SRS: mặt trước là câu có chỗ trống hoặc tình huống, mặt sau là mẫu đúng và giải thích
- [ ] Dùng chung thuật toán và review log với thẻ từ vựng
- [ ] Có nút "Báo sai"

#### Module 2.4 — Dashboard tiến độ
- [ ] Hiển thị bài đang học và giai đoạn hiện tại (Kana / 1–25 / 26–50 / Luyện đề N5 / Luyện đề N4)
- [ ] Toàn bộ mốc lộ trình ở Phần A1 nằm trong **một file config**, không hard-code rải rác
- [ ] Tính và hiển thị: **nhanh hay chậm bao nhiêu bài** so với mục tiêu
- [ ] **Cảnh báo đỏ khi chậm từ 3 bài trở lên** (điều kiện dừng code)
- [ ] Đếm ngược tới checkpoint 14/2/2027 và ngày thi
- [ ] SRS: số thẻ đến hạn hôm nay, số thẻ tồn, tỷ lệ nhớ 7 ngày gần nhất
- [ ] Nội dung: số bài đã kiểm tra trước bài đang học (cảnh báo khi bằng 0), số mục "Báo sai" chưa xử lý
- [ ] Empty state cho ngày đầu tiên
- [ ] Test phần tính nhanh/chậm: đúng hạn, chậm, vượt, giao giữa hai giai đoạn

---

### Milestone 3 — Output, PWA & Deploy (cuối tuần 17–18/10)

#### Module 3.1 — Nhật ký 3 câu/ngày
- [ ] Viết được 3 câu cho hôm nay, sửa được trong ngày
- [ ] Hiện danh sách mẫu ngữ pháp của bài đang học bên cạnh ô viết, gắn được câu với mẫu đã dùng
- [ ] **Gõ IME tiếng Nhật không lỗi**: nhấn Enter để chọn chữ khi đang soạn (composition) **không** được submit
- [ ] Xem lại lịch sử theo ngày, có empty state
- [ ] Rời trang khi chưa lưu thì không mất dữ liệu, hoặc có cảnh báo

#### Module 3.2 — Log shadowing
- [ ] Đánh dấu đã shadowing hôm nay, kèm số phút và ghi chú
- [ ] Streak tính đúng theo giờ Việt Nam, bỏ lỡ một ngày thì reset đúng
- [ ] Test streak: chuỗi liên tục, ngắt quãng, 23:59 và 00:01

#### Module 3.3 — PWA
- [ ] Manifest có: tên, short name, icon (gồm apple-touch-icon), `display: standalone`, màu theme
- [ ] Cài được lên màn hình chính của iPhone qua Safari, mở ra full-screen
- [ ] Xử lý safe area, không bị tai thỏ hoặc thanh home che nội dung
- [ ] **Offline bắt buộc**: tắt mạng vẫn ôn thẻ, đọc ngữ pháp, viết nhật ký được (service worker, **duyệt thư viện trước khi thêm**)
- [ ] Toàn bộ JSON nội dung được cache để dùng offline
- [ ] Cập nhật bản mới, kể cả nội dung mới, thì app nhận được, không bị kẹt cache cũ

#### Module 3.4 — Deploy & bảo vệ truy cập
- [ ] Đã chọn nơi deploy và ghi vào `decisions.md`
- [ ] Bản deploy **không truy cập công khai được**, có lớp bảo vệ đăng nhập
- [ ] Không commit secret, biến môi trường nằm trong `.env` và đã có trong `.gitignore`
- [ ] Có trang "Nguồn dữ liệu" ghi nguồn theo yêu cầu giấy phép (JMdict, Tatoeba…)
- [ ] Quy trình deploy rõ ràng: push lên nhánh chính thì tự deploy

#### Module 3.5 — Kiểm thử chéo thiết bị

| Hạng mục | iPhone (PWA) | Mac (Safari/Chrome) | Ubuntu (Chrome/Firefox) |
|---|---|---|---|
| Font & glyph kanji | [ ] | [ ] | [ ] |
| Furigana `<ruby>` | [ ] | [ ] | [ ] |
| Phát âm (TTS) | [ ] | [ ] | [ ] |
| Gõ IME tiếng Nhật | [ ] | [ ] | [ ] |
| Ôn thẻ (chạm / phím tắt) | [ ] | [ ] | [ ] |
| Layout & responsive | [ ] | [ ] | [ ] |
| Export / Import | [ ] | [ ] | [ ] |
| Offline | [ ] | [ ] | [ ] |

**✅ Checkpoint 3 (kết thúc MVP, chậm nhất 25/10):**
- [ ] Mọi mục trong bảng trên đã tick
- [ ] Bài 1–5 đã `verified: true` toàn bộ
- [ ] Đã export backup lần đầu và cất ở nơi an toàn
- [ ] Hoàn thành trong timebox. Nếu vượt, ghi lý do vào `notes.md`

---

### Giai đoạn kiểm chứng — 2 tuần dùng thật (1/11 – 14/11)

- [ ] Mở app và ôn SRS ít nhất 12/14 ngày
- [ ] Tiến độ Minna đúng mục tiêu (bài 1–2)
- [ ] Thời gian ôn SRS mỗi ngày: ___ phút (quá 30 phút thì giảm số thẻ mới mỗi ngày)
- [ ] Tỷ lệ nhớ: ___ % (dưới 80% thì xem lại số thẻ mới mỗi ngày hoặc chất lượng thẻ)
- [ ] Số mục "Báo sai": ___ (nhiều thì xem lại nguồn hoặc prompt)
- [ ] Số lần phải export/import giữa các máy: ___ (thấy phiền thì đó là tín hiệu nên làm sync)
- [ ] Không thêm tính năng mới, chỉ sửa bug

**Quyết định ngày 15/11** (ghi vào `decisions.md`):
- [ ] Dừng ở MVP, **hoặc**
- [ ] Làm sync bằng API Laravel (phần bên dưới), **hoặc**
- [ ] Bỏ app, quay về dùng công cụ có sẵn

---

### Sau MVP (tuỳ chọn) — Đồng bộ qua API Laravel

- [ ] Nơi host là **của cá nhân**, không dùng VPS hoặc Forge của công ty
- [ ] API có xác thực, chỉ một tài khoản được truy cập
- [ ] Endpoint khớp với interface của storage adapter, UI không phải sửa
- [ ] Đồng bộ bằng cách **gộp review log** của các máy (theo ID lần ôn), không ghi đè trạng thái thẻ
- [ ] Nhật ký và shadowing: đã có chiến lược khi hai máy cùng sửa một ngày, ghi vào `decisions.md`
- [ ] Migrate dữ liệu từ file export lên server, đối chiếu đủ và đúng
- [ ] Mất mạng vẫn ghi được ở local, có mạng lại thì tự đồng bộ
- [ ] Có backup database định kỳ
- [ ] Có test API cho các luồng chính