# Nguồn dữ liệu

Tất cả file nguồn nằm trong `content/raw/`. Không sửa tay các file này. Mọi chỉnh sửa nội dung đi qua script và file override (xem `CLAUDE.md`).

| Nguồn | Thư mục | Trong git? | Cách lấy |
|---|---|---|---|
| Bộ thẻ Minna | `minna/` | Có | Export tay từ Anki |
| Danh sách ngữ pháp | `grammar/` | Có | Claude soạn nháp, người dùng đối chiếu sách |
| JMdict, KANJIDIC2 | `jmdict/` | Không | `./scripts/fetch-sources.sh` |
| Unihan | `unihan/` | Không | `./scripts/fetch-sources.sh` |
| Tatoeba | `tatoeba/` | Không | `./scripts/fetch-sources.sh` |

Máy mới: clone repo rồi chạy `./scripts/fetch-sources.sh` (cần `curl`, `tar`, `unzip`, `bunzip2`, `node`). Tải về khoảng 260MB.

---

## 1. Bộ thẻ Minna — `minna/minna-vocab.txt`

- **Lấy từ:** bộ thẻ Anki cộng đồng "Từ vựng Minna", export dạng *Notes in Plain Text* ngày 1/10/2026
- **Tên bộ thẻ / tác giả / link gốc:** _(cần bổ sung)_
- **Giấy phép:** không rõ, **chỉ dùng cá nhân**, không phát hành lại
- **Định dạng:** UTF-8, tab, có header `#separator:tab`, `#html:true`, `#deck column:1`, `#tags column:10`

| Cột | Nội dung | Ví dụ |
|---|---|---|
| 1 | Tên deck | `Từ vựng Minna` |
| 2 | Mã thẻ (bài - số thứ tự) | `Bài 01 - 04` |
| 3 | Bài | `Bài 01` |
| 4 | Kana | `あのひと` |
| 5 | Kanji (có thể trống) | `あの人` |
| 6 | Âm Hán Việt của cả từ (có thể trống) | `NHÂN` |
| 7 | Nghĩa tiếng Việt | `người kia, người đó` |
| 8–10 | Luôn trống | |

**Thống kê (1/10/2026):** 2249 từ, đủ 50 bài (17–66 từ mỗi bài), không trùng mã thẻ, không có HTML.

**Lưu ý cho script build:**
- Động từ ở **dạng ます** (`たべます`), trong khi JMdict dùng dạng từ điển (`たべる`). Muốn tra JMdict phải chuyển ます → 辞書形. So khớp thô (chưa chuyển) chỉ khớp 1516/2249 từ.
- Kana và kanji có ký hiệu phụ cần chuẩn hoá trước khi so khớp: `～`, `―`, `－`, `[ ]`, `「 」`, `（ ）`, khoảng trắng toàn góc `　`.
- Một số thẻ là cụm từ hoặc câu (`いっぴきもいません。`, `以上です。`), không phải từ đơn.
- Thiếu nghĩa (2 thẻ):
  - `Bài 06 - 03` 吸います: nghĩa có vẻ nằm ở thẻ kế tiếp `Bài 06 - 04 [たばこを～]`, nên xem lại cặp này
  - `Bài 06 - 27` `(ミルク)`
- Có kanji nhưng thiếu âm Hán Việt (17 thẻ): `Bài 11 - 05…14` (số đếm １つ…10), `Bài 37 - 56`, `Bài 45 - 20`, `Bài 50 - 42…45`. Có thể ghép từ âm Hán Việt của từng kanji (KANJIDIC2).
- Mã thẻ `Bài XX - YY` phụ thuộc thứ tự trong deck. Có dùng làm ID cố định hay không sẽ quyết định ở Module 1.2 / Checkpoint 1.

## 2. Danh sách ngữ pháp — `grammar/minna-grammar.tsv`

- **Lấy từ:** Claude soạn ngày 1/10/2026 theo hiểu biết chung về mục lục Minna no Nihongo I/II. **Không lấy từ nguồn nào có sẵn.**
- **Trạng thái:** `source: ai`, `verified: false` cho tất cả. **Phải đối chiếu với sách** trước khi học từng bài.
- **Định dạng:** TSV, các dòng `#` là chú thích, cột `lesson`, `order`, `pattern`, `meaning_vi`
- Khoảng 4–7 mẫu mỗi bài, tổng cộng khoảng 240 mẫu

## 3. JMdict — `jmdict/jmdict-eng-3.6.2.json`

- **Lấy từ:** [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) phiên bản `3.6.2+20260928191014`, bản JSON của JMdict (EDRDG)
- **Dùng cho:** cách đọc, từ loại, nghĩa tiếng Anh bổ sung. **JMdict không có nghĩa tiếng Việt.**
- **Giấy phép:** [EDRDG Licence](https://www.edrdg.org/edrdg/licence.html), CC BY-SA 4.0. **Bắt buộc ghi nguồn** trong app, kèm link tới EDRDG.

## 4. KANJIDIC2 — `jmdict/kanjidic2-en-3.6.2.json`

- **Lấy từ:** jmdict-simplified, cùng phiên bản với JMdict
- **Dùng cho:** **âm Hán Việt của từng kanji** (reading type `vietnam`), âm On/Kun, nghĩa, số nét
- **Độ phủ:** **890/890** kanji xuất hiện trong bộ thẻ có âm Hán Việt. Vì vậy dùng làm **nguồn chính** cho âm Hán Việt (xem `decisions.md`).
- **Giấy phép:** EDRDG Licence, CC BY-SA 4.0. **Bắt buộc ghi nguồn.**

## 5. Unihan — `unihan/Unihan_Readings.txt`

- **Lấy từ:** <https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip>. Chỉ giữ file `Unihan_Readings.txt`.
- **Dùng cho:** đối chiếu âm Hán Việt (trường `kVietnamese`)
- **Độ phủ:** chỉ 670/890 kanji trong bộ thẻ, có chỗ lẫn âm Nôm, nên chỉ dùng để **đối chiếu**
- **Giấy phép:** [Unicode License v3](https://www.unicode.org/license.txt), rất thoáng, nên ghi nguồn

## 6. Tatoeba — `tatoeba/`

- **Lấy từ:** <https://downloads.tatoeba.org/exports/>, gồm các file theo ngôn ngữ và `links.tar.bz2`
- **Các file:**
  - `jpn_sentences.tsv`, `vie_sentences.tsv`, `eng_sentences.tsv`, với các cột `id`, `lang`, `text`
  - `jpn_links.tsv`: **file do script tạo ra**, lọc từ `links.csv` (khoảng 440MB), chỉ giữ các cặp câu Nhật → câu Việt/Anh, với các cột `jpn_id`, `trans_id`, `trans_lang`
- **Số lượng (1/10/2026):** 248.917 câu tiếng Nhật, 8.477 liên kết Nhật–Việt, 280.520 liên kết Nhật–Anh. Vì vậy **đa số câu ví dụ sẽ chỉ có bản dịch tiếng Anh**.
- **Giấy phép:** chủ yếu [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/), một số câu CC0. **Bắt buộc ghi nguồn**, nên kèm link tới từng câu (`https://tatoeba.org/sentences/show/<id>`).
- Theo kế hoạch, bộ lọc câu ví dụ được làm vào cuối tuần dự phòng (xem `decisions.md`).
