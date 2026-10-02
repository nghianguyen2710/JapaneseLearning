# Tiến trình

> Cập nhật: **2/10/2026**. Nhánh: `feat/m1-content`.
> Mở phiên mới (ở bất kỳ máy nào): yêu cầu Claude đọc `CLAUDE.md`, file này và `docs/tasks.md` trước khi làm.
> File này thay cho `docs/handoff.md` (đã xoá, nội dung còn trong git history).

## Đang ở đâu

- **Giai đoạn 0:** xong, trừ một số việc người dùng tự làm (xem "Việc còn treo")
- **Cuối tuần 1 (nền móng & nội dung):** xong T1.1–T1.8, **còn T1.9** (giải thích ngữ pháp bài 1–5)
- **Cuối tuần 2 (làm sớm từ 2/10):** xong T2.1, T2.2, T2.4. T2.3 (SM-2) **chờ người dùng duyệt test**. T2.5–T2.7 code xong, **chờ người dùng thử trên trình duyệt thật** (Checkpoint 2)
- **Web đã dùng được:** ôn thẻ ở `/review`. Báo sai, hiện lại thẻ đã ẩn, sao lưu ở `/data`

## Đã xong

| Task | Nội dung | Commit |
|---|---|---|
| T0.1–T0.7, T0.11 | Nguồn dữ liệu, script tải nguồn, docs (spec, decisions, sources, tasks, CLAUDE.md), allowlist lệnh | `3d36bda`, `27c5001` |
| T1.1–T1.2 | Next.js 16, Tailwind 4, Vitest, Prettier. Design token sáng/tối, Noto Sans JP, component `Furigana` | `f3e61fc` |
| T1.3–T1.4 | Schema và cơ chế ID (`docs/schema.md`), **người dùng đã duyệt** (D18) | `689cade`, `8aa63a4` |
| T1.5–T1.8 | `npm run content:build` / `content:verify`: sinh `content/lessons/01…50.json`, sổ ID, báo cáo | `e2a91cd` |
| T2.1 | Storage adapter `src/lib/storage/` (trả `Result`, không throw), ngày giờ Việt Nam `src/lib/date/vn-time.ts` | `20978c7` |
| T2.3 | SM-2 `src/lib/srs/sm2.ts`, `docs/srs.md` (**chờ duyệt**) | `ca9d31a` |
| T2.2 | Review log, `replayReviews`, `mergeReviewLogs`, `recordReview`, `loadCardStates` | `fefc83a` |
| T2.4 | Hàng đợi hôm nay `src/lib/srs/queue.ts`, loader nội dung theo bài `src/lib/content/load.ts` | `eaadb3c` |
| T2.5 | Màn hình ôn thẻ `/review` (**chờ thử thật**) | `8f82e42` |
| T2.6 | Báo sai, tạm ẩn thẻ (có hoàn tác), trang `/data` | `c9191e3` |
| T2.7 | Export/import (gộp hoặc ghi đè, xem trước, khôi phục khi lỗi) | `b5c90da` |

## Số liệu nội dung (từ `content/report.md`)

- 2249 từ (50 bài), 890 kanji, 221 mẫu ngữ pháp (bản nháp do AI soạn, chưa có giải thích)
- Khớp JMdict: 2027/2249 (90%), kể cả động từ dạng ます chuyển về dạng từ điển
- Âm Hán Việt kanji: tách từ bộ thẻ cho 881/890. 9 kanji còn lại lấy từ KANJIDIC2, cần kiểm tra
- Verified: 0. Bài 1–5 cần kiểm tra trước khi học (`npm run content:verify -- --lessons 1-5`)

## Quyết định quan trọng trong phiên này

Chi tiết và lý do nằm trong `docs/decisions.md`.

- **D12:** dưới 6h mỗi cuối tuần, nên **MVP thu nhỏ** còn: ôn thẻ từ vựng, dashboard, xem ngữ pháp, PWA, deploy. Nhật ký, shadowing, thẻ ôn ngữ pháp được chuyển ra sau MVP
- **D13:** trễ thì cắt tính năng, không lấn vào giờ học
- **D14:** không có API key, nên giải thích ngữ pháp được sinh qua chat
- **D17:** âm Hán Việt lấy từ bộ thẻ, vì **KANJIDIC2 sai nhiều kanji giản thể** (桜 → Tí, 伝 → Vân)
- **D18:** đã duyệt schema. **Từ lặp lại ở nhiều bài thì mỗi bài một thẻ**
- **D19:** repo để public, người dùng chấp nhận việc bộ thẻ Minna công khai

## Bước tiếp theo

1. 👤 **Duyệt SM-2:** đọc `docs/srs.md` và `src/lib/srs/sm2.test.ts`, đặc biệt là cách ánh xạ "Quên = 2" và việc thẻ quá hạn không được thưởng thêm.
2. 👤 **Thử `/review`** (`npm run dev`, mở http://localhost:3000/review; iPhone dùng `npm run dev -- -H 0.0.0.0` rồi mở IP của Mac):
   - Lật thẻ (Space / nút), chấm 1–4, thẻ "Quên" quay lại cuối hàng
   - Tải lại trang giữa chừng: số thẻ còn lại giảm đúng, thẻ mới không mở thêm quá 10
   - Đổi "Bài đang học" → hàng đợi thay đổi
   - Nút phát âm (Ubuntu có thể chưa có giọng tiếng Nhật)
   - Màn hình 375px: nút đủ lớn, không tràn ngang
   - Báo sai, tạm ẩn thẻ rồi hoàn tác. Ở `/data`: đánh dấu đã xử lý, hiện lại thẻ
   - **Checkpoint 2:** export trên Mac → AirDrop sang iPhone → import (Gộp) → số lần ôn khớp
3. Cuối tuần 3: T3.1–T3.2 (config lộ trình, dashboard), T3.4 (PWA), T3.5 (deploy, **cần chốt P3**)
4. T1.9 (giải thích ngữ pháp bài 1–5): làm sau, trước T3.3.
5. Rủi ro dung lượng localStorage: xem `docs/notes.md`.

## Việc còn treo (người dùng)

- [ ] Ghi tên, tác giả, link của bộ thẻ Anki vào `docs/sources.md`
- [ ] Chốt điều kiện dừng code trong tháng Kana (`decisions.md`, mục "Câu hỏi còn mở")
- [ ] Chọn cách bảo vệ truy cập khi deploy (P3), trước 17/10
- [ ] Kiểm tra lại bài 1–5 (từ vựng, âm Hán Việt, ngữ pháp) theo sách

## Ghi chú kỹ thuật cho phiên sau

- Máy mới: `npm install`, rồi `./scripts/fetch-sources.sh` (khoảng 260MB, không nằm trong git), rồi `npm run content:build`
- Script nội dung viết bằng TypeScript, chạy thẳng bằng Node 24 (`node scripts/content/build-cli.ts`). Import phải có đuôi `.ts`
- Next.js 16 khác các bản trước: đọc `node_modules/next/dist/docs/` trước khi viết code (theo `AGENTS.md`)
- Prettier không định dạng file `.md` (để không làm xáo trộn docs)
