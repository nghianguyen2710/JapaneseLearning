# Ghi chú

> Những điểm cần lưu ý hoặc nên sửa sau, nằm ngoài phạm vi task đang làm (CLAUDE.md quy tắc 6).

## 2/10/2026

### Dung lượng localStorage có thể chạm giới hạn vào khoảng cuối 2027 (T2.2)
- Mỗi lần ôn trong review log chiếm khoảng 120 byte JSON. `card-state` chiếm thêm khoảng 150 byte cho mỗi thẻ đã ôn.
- localStorage giới hạn khoảng **5MB mỗi origin** (Safari trên iPhone cũng vậy).
- Ước lượng: 2249 thẻ × khoảng 10–15 lần ôn đến cuối 2027, tức **khoảng 25–35 nghìn lần ôn, 3–4,5MB**. Tức là sát giới hạn.
- Khi đầy, adapter trả lỗi `quota` và **không mất dữ liệu cũ**. Nhưng từ lúc đó sẽ không ghi thêm được lần ôn nào.
- Phương án khi cần (quyết định ngày 15/11 hoặc khi dashboard báo vượt khoảng 3MB):
  - Rút gọn log (khoá ngắn, bỏ `+07:00`, lưu ngày theo epoch)
  - Bỏ lưu `card-state`, vì chỉ là bộ nhớ đệm và tính lại được trong vài mili giây
  - Chuyển sang IndexedDB
  - Chuyển sang sync qua Laravel

### Storage adapter là đồng bộ (sync), không phải async (T2.1)
- localStorage là API đồng bộ, nên adapter cũng đồng bộ cho đơn giản.
- Nếu sau này làm sync với Laravel, theo hướng offline-first thì app **vẫn ghi local trước**, rồi một lớp sync riêng mới đẩy log lên. Vì vậy UI không phải đổi sang `await`. Nếu lại chuyển sang IndexedDB (API async) thì interface phải đổi.

### Thứ tự làm task (T2.2, T2.3)
SM-2 (T2.3) được làm trước review log (T2.2), vì hàm tính lại trạng thái từ log cần có `schedule` trước. Mỗi task vẫn một commit.
