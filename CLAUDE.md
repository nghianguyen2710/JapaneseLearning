# CLAUDE.md

@AGENTS.md

App học tiếng Nhật cá nhân (Minna 1–50, thi N5 tháng 7/2027). Là PWA Next.js, không có backend, lưu dữ liệu ở localStorage.

**Đọc trước khi làm:** [`docs/progress.md`](docs/progress.md) (đang ở đâu), [`docs/spec.md`](docs/spec.md) (phạm vi), [`docs/tasks.md`](docs/tasks.md) (đang làm task nào), [`docs/decisions.md`](docs/decisions.md) (đã chốt gì). Lộ trình và checklist đầy đủ nằm ở [`checklist.md`](checklist.md).

## Stack

- Next.js (App Router), React, TypeScript strict
- Tailwind CSS, có design token (primitives → semantic, light/dark)
- Node 24 (nvm)
- Lưu dữ liệu: localStorage, qua storage adapter
- Script nội dung: Node, chạy lúc build, không đưa vào bundle của app

## Thư mục

```
content/raw/       nguồn gốc (xem docs/sources.md) — KHÔNG sửa tay
content/overrides/ chỉnh sửa tay và trạng thái verified — chỉ sửa qua script hoặc theo hướng dẫn
content/lessons/   JSON đã build (01.json … 50.json, index.json) — do script sinh, KHÔNG sửa tay
content/ids/       sổ ID từ vựng — chỉ thêm; chỉ sửa tay khoá khi build báo từ bị đổi cách viết (docs/schema.md mục 1)
scripts/           script tải nguồn, build nội dung (scripts/prompts/ chứa prompt sinh ngữ pháp qua chat, D14)
src/               mã nguồn app
docs/              spec, decisions, sources, tasks, schema, notes
```

## Lệnh

| Lệnh | Việc |
|---|---|
| `./scripts/fetch-sources.sh` | Tải lại nguồn nặng vào `content/raw/` (máy mới) |
| `npm run dev` / `build` / `lint` | Chạy dev server / build production / ESLint |
| `npm test` / `npm run format` | Vitest / Prettier (không định dạng file `.md`) |
| `npm run content:build` | Sinh `content/lessons/*.json`, `content/ids/vocab.json`, báo cáo `content/report.md` |
| `npm run content:verify -- --lessons 1-5` | Đánh dấu `verified: true` cho cả bài đã kiểm tra (thêm `--undo` để bỏ), rồi build lại |

## Quy tắc

1. **Không tự thêm thư viện.** Chỉ dùng thư viện trong danh sách bên dưới. Cần thư viện mới thì dừng lại hỏi, được duyệt rồi mới thêm vào danh sách.
2. **Mọi đọc/ghi dữ liệu người dùng đi qua storage adapter.** Không gọi `localStorage` trực tiếp ở bất kỳ chỗ nào khác.
3. **Không sửa tay file JSON nội dung** (`content/lessons/`) và file nguồn (`content/raw/`, trừ `grammar/` khi người dùng đối chiếu sách). Sửa qua override rồi chạy lại script.
4. **ID nội dung không bao giờ đổi**, kể cả khi sửa nội dung.
5. **Không bịa nội dung.** Thiếu thì để trống. Nội dung do AI sinh luôn có `source: ai`, `verified: false`. Không ghi đè bản ghi đã `verified: true`.
6. **Không refactor ngoài phạm vi task.** Thấy chỗ nên sửa thì ghi vào `docs/notes.md`.
7. **Ngày tính theo giờ Việt Nam** (`Asia/Ho_Chi_Minh`), không theo UTC.
8. **Mỗi task một commit**, làm theo Definition of Done trong `docs/spec.md` mục 5. Chưa được người dùng cho phép thì không push.
9. Logic SRS và logic tính tiến độ viết dạng **hàm thuần**, có test. Người dùng duyệt test, không duyệt code.

## Thư viện đã duyệt

> Chờ người dùng xác nhận lần đầu, cùng lúc với duyệt `docs/spec.md`.

- `next`, `react`, `react-dom`, `typescript`, `@types/*`
- `tailwindcss` và các plugin PostCSS đi kèm khi khởi tạo Next.js
- `eslint`, `eslint-config-next`, `prettier`
- `vitest` (test)
- `serwist` (service worker PWA, D16)
- `kuromoji` (chỉ dùng trong script build, không đưa vào app, D16)
