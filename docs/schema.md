# Schema nội dung & dữ liệu người dùng

> **Trạng thái:** người dùng đã duyệt ngày 1/10/2026 (T1.4, `decisions.md` D18).
> Type TypeScript tương ứng: [`src/lib/content/schema.ts`](../src/lib/content/schema.ts) và [`src/lib/user-data/schema.ts`](../src/lib/user-data/schema.ts).
> Đây là nhóm quyết định khó đảo ngược nhất. Đổi ID sau khi đã có review log nghĩa là mất tiến độ ôn.

## Tóm tắt 5 quyết định

1. **ID từ vựng là mã ngắn, gán một lần rồi giữ mãi** (`w0001`). ID được lưu trong file sổ ID trong git, không suy ra từ nội dung. → [mục 1](#1-cơ-chế-id)
2. **Một từ xuất hiện ở nhiều bài (83 từ, ví dụ 先生) có một thẻ riêng cho mỗi bài**, vì mỗi bài giữ nghĩa riêng của nó. → [mục 2.2](#22-từ-lặp-lại-ở-nhiều-bài)
3. **Chỉnh sửa tay và trạng thái `verified` nằm trong `content/overrides/`**, theo ID. Build lại không làm mất. → [mục 3](#3-override--verified)
4. **Review log là nguồn sự thật duy nhất.** Trạng thái thẻ (ngày ôn tiếp, khoảng cách, hệ số dễ) chỉ là bộ nhớ đệm, tính lại được từ log. → [mục 4](#4-dữ-liệu-người-dùng)
5. **Ngữ pháp có cột ID viết sẵn trong file TSV** (`g01-01`), không bao giờ đánh số lại. → [mục 1](#1-cơ-chế-id)

---

## 1. Cơ chế ID

| Loại | Dạng ID | Ví dụ | Gán thế nào | Giữ nguyên khi |
|---|---|---|---|---|
| Từ vựng | `w` + 4 chữ số | `w0004` | Lần build đầu tiên gán theo thứ tự trong bộ thẻ. Từ mới thì lấy số tiếp theo | sửa nghĩa, sửa cách đọc, sắp xếp lại bộ thẻ, export lại bộ thẻ |
| Kanji | Chính chữ đó | `私` | Tự nhiên | luôn luôn |
| Mẫu ngữ pháp | `g` + bài + số | `g01-03` | Viết sẵn trong cột `id` của `minna-grammar.tsv` | sửa nội dung, chèn mẫu mới (mẫu mới lấy số tiếp theo, kể cả khi chèn ở giữa) |
| Thẻ ôn | ID mục + `:` + chiều | `w0004:jv` | Tự suy ra | luôn luôn |
| Câu ví dụ _(sau MVP)_ | `t` + ID Tatoeba | `t12345` | Tự nhiên | luôn luôn |

**Sổ ID từ vựng** (`content/ids/vocab.json`, có trong git, chỉ được thêm, không được xoá):

```json
{
  "schemaVersion": 1,
  "next": 2250,
  "entries": {
    "01|あのひと|あの人": "w0004",
    "01|せんせい|先生": "w0011"
  }
}
```

- Khoá là `bài|kana|kanji`, lấy từ dữ liệu **gốc** của bộ thẻ (trước khi áp override). Đã kiểm tra: không có khoá nào bị trùng.
- Mỗi lần build, từ khớp khoá thì dùng lại ID cũ, từ không khớp thì nhận ID mới, và báo cáo liệt kê ra.
- **Khoá cũ không còn xuất hiện** trong bộ thẻ (vì bộ thẻ được export lại và có sửa) thì build **dừng lại và báo lỗi**, không tự xoá. Người dùng chỉ cho script biết ID cũ ứng với từ mới nào. Nhờ vậy tiến độ ôn không bao giờ âm thầm bị mất.
- **Vì sao không dùng mã thẻ `Bài 01 - 04` của bộ thẻ:** mã đó đổi khi bộ thẻ chèn hoặc xoá một từ.
- **Vì sao không dùng hash nội dung:** sửa một lỗi chính tả là ID đổi theo, và mất tiến độ ôn.

## 2. Nội dung build ra — `content/lessons/NN.json`

Mỗi bài một file, `schemaVersion: 1`. Output **tất định**: không ghi thời điểm build, và cùng đầu vào thì ra cùng file, để git diff chỉ hiện thay đổi thật.

### 2.1 Từ vựng

```jsonc
{
  "id": "w0004",
  "lesson": 1,
  "order": 4,                       // thứ tự trong bài
  "kana": "あのひと",
  "kanji": "あの人",                // có thể không có
  "hanViet": "NHÂN",                // của cả từ, lấy từ bộ thẻ, có thể không có
  "meaningVi": "người kia, người đó",
  "kanjiChars": ["人"],
  "jmdict": {                       // không khớp được thì không có trường này
    "id": "1000220",
    "dictForm": "あのひと",         // động từ: dạng từ điển (たべる)
    "pos": ["pn"],
    "glossEn": ["that person", "he", "she"]
  },
  "seeAlso": [],                    // ID của các lần xuất hiện khác của cùng từ (mục 2.2)
  "source": "deck",
  "overridden": [],                 // các trường đã bị override sửa tay, ví dụ ["meaningVi"]
  "verified": false
}
```

Nguồn của từng trường được thể hiện qua cấu trúc: các trường ở cấp ngoài cùng lấy từ bộ thẻ (`source: "deck"`), trừ những trường có tên trong `overridden` (do người dùng sửa tay). Object `jmdict` lấy từ JMdict.

### 2.2 Từ lặp lại ở nhiều bài

Có 83 cặp kana+kanji xuất hiện ở hơn một bài (ví dụ 先生, ちがいます, どうも).
- Mỗi lần xuất hiện là **một bản ghi riêng, có ID riêng và thẻ ôn riêng**, vì nghĩa trong bài sau có thể khác hoặc rộng hơn.
- `seeAlso` liệt kê ID của các lần xuất hiện khác. Thẻ hiện nhãn "cũng có ở bài X".

### 2.3 Kanji

Mỗi bài liệt kê các kanji **xuất hiện lần đầu** trong bài đó.

```jsonc
{
  "id": "人",
  "firstLesson": 1,
  "hanViet": ["NHÂN"],              // âm chính đứng đầu
  "hanVietSource": "deck",          // "deck" | "kanjidic" (D17)
  "on": ["ジン", "ニン"],
  "kun": ["ひと", "-り", "-と"],
  "glossEn": ["person"],
  "strokes": 2,
  "source": "kanjidic",
  "overridden": [],
  "verified": false
}
```

Âm chính là âm xuất hiện nhiều nhất khi ghép cột âm Hán Việt của bộ thẻ với từng kanji (D17). Âm Hán Việt luôn viết HOA, theo đúng cách bộ thẻ đang viết.

### 2.4 Mẫu ngữ pháp

```jsonc
{
  "id": "g01-01",
  "lesson": 1,
  "order": 1,
  "pattern": "N1 は N2 です",
  "meaningVi": "N1 là N2",
  "explanation": {                  // không có cho tới khi sinh qua chat (D14)
    "structure": "…",
    "meaningVi": "…",
    "conjugation": "…",
    "examples": [{ "ja": "…", "vi": "…" }],
    "commonMistakes": ["…"]
  },
  "source": "ai",
  "overridden": [],
  "verified": false
}
```

## 3. Override & verified

`content/overrides/vocab.json`, `kanji.json`, `grammar.json` (có trong git):

```json
{
  "schemaVersion": 1,
  "w0004": { "meaningVi": "người kia, người ấy", "verified": true, "note": "sửa theo sách" },
  "人": { "hanViet": ["NHÂN"], "verified": true }
}
```

- Override chỉ chứa **những trường bị thay**, cùng `verified` và `note`.
- Build áp override sau cùng. Trường bị override ghi vào `overridden`.
- **ID trong override không còn tồn tại** thì build báo lỗi.
- Đánh dấu một bài đã kiểm tra = thêm `verified: true` cho các ID của bài đó. Script sẽ có lệnh làm việc này, không phải sửa tay từng dòng.

## 4. Dữ liệu người dùng (localStorage, qua storage adapter)

Mọi key đều có tiền tố `jp-app:`. Mỗi giá trị là một object có `schemaVersion`.

| Key | Nội dung | Có phải nguồn sự thật? |
|---|---|---|
| `jp-app:reviews` | Review log, chỉ ghi thêm | **Có** |
| `jp-app:card-state` | Trạng thái SM-2 của từng thẻ | Không, tính lại được từ log |
| `jp-app:card-flags` | Thẻ bị suspend | Có |
| `jp-app:reports` | Các mục "Báo sai" | Có |
| `jp-app:settings` | Bài hiện tại, số thẻ mới mỗi ngày | Có |

### 4.1 Review log

```jsonc
{
  "id": "01J…",                       // ID duy nhất của lần ôn (để gộp log giữa các máy sau này)
  "cardId": "w0004:jv",
  "reviewedAt": "2026-11-02T21:15:03+07:00", // luôn kèm múi giờ +07:00
  "grade": "good",                    // "again" | "hard" | "good" | "easy"
  "durationMs": 4200
}
```

- Ngày ôn = phần ngày của `reviewedAt` theo giờ Việt Nam.
- Không lưu trạng thái tính toán vào log. Muốn có trạng thái thì cho log chạy lại qua hàm SM-2.
- Hai máy gộp log bằng cách hợp theo `id` rồi sắp xếp theo `reviewedAt`. Không có xung đột.

### 4.2 File export

```jsonc
{
  "schemaVersion": 1,
  "exportedAt": "2026-11-02T21:20:00+07:00",
  "app": "jp-app",
  "data": { "reviews": [], "cardFlags": {}, "reports": [], "settings": {} }
}
```

`card-state` không được export, vì tính lại được. Nhờ vậy file nhỏ hơn và không thể lệch với log.

## 5. Migration

- Nội dung và dữ liệu người dùng có `schemaVersion` riêng.
- Đổi cấu trúc dữ liệu người dùng thì tăng version và viết hàm `migrate(vN → vN+1)` trong storage adapter. App đọc version cũ thì migrate trước khi dùng. Không đọc được thì báo lỗi, không ghi đè.
