# PWA và offline

> T3.4, ngày 3/10/2026. Service worker tự viết, không dùng thư viện (D20).
> Code: [`public/sw.js`](../public/sw.js), [`src/components/pwa/register-sw.tsx`](../src/components/pwa/register-sw.tsx), [`src/app/manifest.ts`](../src/app/manifest.ts).

## 1. Cache

| Loại request | Cách lấy | Cache |
|---|---|---|
| Trang (`/`, `/review`, `/data`) | Mạng trước, mất mạng thì dùng bản đã lưu | `pages-v1`, lưu sẵn cả 3 trang ngay lần cài đầu |
| `/_next/static/…` (JS, CSS, font, nội dung 50 bài) | Cache trước. Tên file có hash nên không bao giờ cũ | `static-v1`, giữ tối đa 500 file mới nhất |
| Request khác cùng origin (manifest, icon, dữ liệu chuyển trang) | Mạng trước, mất mạng thì dùng cache | `runtime-v1` |

- **Nội dung bài:** sau khi service worker chạy, app tải ngầm cả 50 bài (khoảng 270KB nén), nên offline mở được mọi bài, kể cả trang Dữ liệu.
- **Dữ liệu ôn** vẫn nằm trong localStorage, không liên quan đến cache. Xoá cache không mất dữ liệu ôn.
- Service worker **chỉ chạy ở bản build** (`npm run build && npm start`), không chạy ở `npm run dev`.

## 2. Cập nhật bản mới

- Trang luôn lấy từ mạng trước, nên **deploy xong, mở lại app khi có mạng là thấy bản mới**. Không cần nút "Cập nhật".
- App mở từ màn hình chính iPhone có thể chạy nhiều ngày không tải lại. Mỗi lần quay lại app, nó kiểm tra xem `sw.js` có bản mới không. Muốn chắc chắn dùng bản mới thì vuốt tắt app rồi mở lại.
- Sửa `sw.js` theo cách không dùng chung được cache cũ thì tăng `VERSION`. Service worker mới sẽ xoá các cache cũ.

## 3. Đã kiểm tra

- Chrome headless, bản build production: mở `/` khi có mạng, rồi tắt hẳn server (`SIGKILL`, fetch báo lỗi mạng). Sau đó `/`, `/review` (hiện thẻ bài 1) và `/data` vẫn mở được, đủ dữ liệu.
- **Chưa thử trên iPhone** (cần deploy HTTPS, T3.5). Khi thử thì kiểm tra:
  - "Thêm vào màn hình chính" hiện icon chữ あ, mở lên không có thanh địa chỉ
  - Tai thỏ và thanh home không che nội dung, cả khi xoay ngang
  - Bật chế độ máy bay rồi mở app, ôn được thẻ

## 4. Giới hạn

- **Safari có thể xoá dữ liệu trang web** (gồm cả localStorage) nếu không mở trong khoảng 7 ngày. App đã thêm vào màn hình chính thì ít bị hơn, nhưng vẫn nên export backup thường xuyên.
- Bỏ app quá 500 file tĩnh (khoảng hơn 10 lần deploy mà không mở app) thì các file cũ nhất bị xoá khỏi cache. Lần mở tiếp theo khi có mạng sẽ tải lại.
