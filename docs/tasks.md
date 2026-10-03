# Tasks

> **Trạng thái:** cập nhật ngày 1/10/2026 theo phạm vi MVP thu nhỏ (`decisions.md` D12), **chờ người dùng duyệt** rồi mới bắt đầu cuối tuần 1.
> Mỗi task = một commit. 👤 = việc người dùng phải tự làm hoặc tự duyệt. Đánh dấu `[x]` khi task đạt Definition of Done.
> Ngân sách: dưới 6h mỗi cuối tuần. Trễ thì cắt theo D13, không lấn vào giờ học.

## Giai đoạn 0 — Chuẩn bị (1–3/10)

- [x] T0.1 Chuyển bộ thẻ Minna vào `content/raw/minna/`, phân tích định dạng
- [x] T0.2 `scripts/fetch-sources.sh`: tải JMdict, KANJIDIC2, Unihan, Tatoeba (đã chạy thử, tái tạo đúng dữ liệu)
- [x] T0.3 `.gitignore` cho các nguồn nặng
- [x] T0.4 Bản nháp danh sách ngữ pháp `content/raw/grammar/minna-grammar.tsv` (`source: ai`)
- [x] T0.5 `docs/sources.md`, `docs/decisions.md`, `docs/spec.md`, `CLAUDE.md`, `docs/tasks.md`
- [x] T0.6 Trả lời câu hỏi về giờ, API key, phương án khi M1 trễ, P1/P2/P4 (D12–D16)
- [x] T0.7 Đặt git email cá nhân cho repo
- [x] T0.8 ~~Chuyển repo GitHub sang Private~~: người dùng chọn để public (D19)
- [ ] T0.9 👤 Bổ sung tên, tác giả, link gốc của bộ thẻ Minna vào `sources.md`
- [ ] T0.10 👤 Chốt điều kiện dừng code trong tháng Kana
- [x] T0.11 Allowlist lệnh trong `.claude/settings.json`: `npm run dev/build/test`, `node scripts/*`, `git add/commit`
- [x] T0.12 Xoá `docs/handoff.md` (thay bằng `docs/progress.md`)

**✅ Checkpoint 0:** nếu người khác code theo spec này, họ có phải hỏi lại câu nào không?

## Cuối tuần 1 (3–4/10) — Nền móng & Nội dung

- [x] T1.1 Khởi tạo Next.js, TypeScript, Tailwind, ESLint, Prettier, Vitest. Cấu trúc thư mục khớp `CLAUDE.md`
- [x] T1.2 Design token (light/dark), font Noto Sans JP kèm font dự phòng, component `<Furigana>` dùng `<ruby>`
- [x] T1.3 `docs/schema.md` cùng type TypeScript: bài, từ vựng, kanji, mẫu ngữ pháp. Có `schemaVersion`, `source`, `verified`, chiến lược ID cố định
- [x] T1.4 👤 **Duyệt schema và cơ chế ID** (quyết định khó đảo ngược nhất)
- [x] T1.5 Parser bộ thẻ: đọc TSV, chuẩn hoá ký hiệu, báo lỗi rõ khi sai định dạng. Có test với dữ liệu mẫu nhỏ
- [x] T1.6 Ghép âm Hán Việt và âm On/Kun từ KANJIDIC2 cho từng kanji
- [x] T1.7 Ghép JMdict: chuyển ます → 辞書形, lấy cách đọc và nghĩa tiếng Anh bổ sung. Không khớp thì để trống
- [x] T1.8 Cơ chế override và `verified` giữ nguyên qua các lần build lại. `npm run content:build` sinh `01.json`…`50.json` kèm báo cáo
- [ ] T1.9 Prompt `scripts/prompts/grammar.md`. Claude sinh giải thích ngữ pháp bài 1–5 qua chat, script ghép vào nội dung (D14)

**✅ Checkpoint 1:** 👤 sửa nghĩa một từ rồi build lại, ID giữ nguyên · báo cáo bài 1–5 không còn lỗi

## Cuối tuần 2 (10–11/10) — Ôn thẻ

- [x] T2.1 Storage adapter (namespace `jp-app:*`, try/catch, `schemaVersion`), tiện ích ngày theo giờ Việt Nam
- [x] T2.2 Review log và hàm tính lại trạng thái thẻ từ log. Có test
- [ ] T2.3 SM-2 viết dạng hàm thuần, `docs/srs.md`. Test đủ các trường hợp trong checklist 2.1. 👤 Đọc test _(code xong 2/10, chờ 👤 duyệt test)_
- [x] T2.4 Hàng đợi hôm nay (thẻ đến hạn + tối đa 10 thẻ mới, chỉ mở cho bài ≤ bài hiện tại)
- [ ] T2.5 Màn hình ôn thẻ: lật thẻ, chấm 4 mức, phím tắt, vùng chạm, empty state, ghi kết quả ngay sau mỗi thẻ. Phát âm bằng TTS _(code xong 2/10, chờ 👤 thử trên trình duyệt thật)_
- [ ] T2.6 "Báo sai" và suspend thẻ _(code xong 2/10, chờ 👤 thử thật; kèm trang /data để xem Báo sai và hiện lại thẻ đã ẩn)_
- [ ] T2.7 Export/import JSON: kiểm tra hợp lệ, hỏi xác nhận trước khi ghi đè _(code xong 2/10, chờ 👤 thử export/import giữa Mac và iPhone = Checkpoint 2)_

**✅ Checkpoint 2:** 👤 xoá trạng thái thẻ rồi tính lại từ log, ra kết quả giống hệt · export/import giữa Mac và iPhone

## Cuối tuần 3 (17–18/10) — Dashboard, PWA, Deploy

- [x] T3.1 File config lộ trình và hàm tính nhanh/chậm bao nhiêu bài. Có test _(chờ duyệt test, docs/roadmap.md)_
- [x] T3.2 Dashboard: bài hiện tại, giai đoạn, cảnh báo đỏ khi chậm từ 3 bài, số thẻ đến hạn và thẻ tồn _(chờ duyệt test, docs/roadmap.md mục 4)_
- [ ] T3.3 Xem ngữ pháp: danh sách theo bài, chi tiết, nhãn "Chưa kiểm tra" _(cắt đầu tiên nếu trễ, D13)_
- [ ] T3.4 PWA: manifest, icon, safe area, offline bằng `serwist`, cache JSON nội dung, cập nhật bản mới
- [ ] T3.5 Deploy có bảo vệ truy cập _(cần chốt P3)_, trang "Nguồn dữ liệu"
- [ ] T3.6 👤 Kiểm thử chéo 3 thiết bị theo bảng ở checklist 3.5

## Cuối tuần 4 (24–25/10) — Chỉ sửa bug

**✅ Checkpoint 3:** bảng kiểm thử đã tick đủ · bài 1–5 `verified: true` · đã có backup đầu tiên

## Sau MVP (chỉ khi quyết định ngày 15/11 là làm tiếp)

- Nhật ký 3 câu/ngày (checklist 3.1)
- Log shadowing và streak (3.2)
- Thẻ ôn ngữ pháp trong SRS (2.3)
- Chiều thẻ Việt → Nhật
- Câu ví dụ Tatoeba lọc bằng `kuromoji`, có fallback tiếng Anh (D15)
- Tỷ lệ nhớ 7 ngày, đếm ngược trên dashboard (nếu đã bị cắt theo D13)
- Đồng bộ qua API Laravel
