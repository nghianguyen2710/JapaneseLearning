// Đọc file export Anki của bộ thẻ Minna (content/raw/minna/minna-vocab.txt). Định dạng: docs/sources.md mục 1

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

export type DeckRow = {
  line: number;
  cardCode: string;
  lesson: number;
  order: number;
  kana: string;
  kanji: string;
  hanViet: string;
  meaningVi: string;
};

const REQUIRED_HEADERS = ["#separator:tab", "#deck column:1"];
const COLUMN_COUNT = 10;
const CARD_CODE = /^Bài (\d{2}) - (\d{2})$/;

export function parseDeck(text: string): DeckRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const headers = lines.filter((l) => l.startsWith("#"));
  for (const h of REQUIRED_HEADERS) {
    if (!headers.includes(h)) {
      throw new ContentError(`Bộ thẻ thiếu header "${h}". Hãy export lại bằng "Notes in Plain Text".`);
    }
  }

  const rows: DeckRow[] = [];
  lines.forEach((raw, i) => {
    const line = i + 1;
    if (raw.startsWith("#") || raw.trim() === "") return;
    const cols = raw.split("\t");
    if (cols.length !== COLUMN_COUNT) {
      throw new ContentError(`Dòng ${line}: có ${cols.length} cột, cần ${COLUMN_COUNT}.`);
    }
    const [, cardCode, lessonLabel, kana, kanji, hanViet, meaningVi] = cols.map((c) =>
      c.normalize("NFC").trim(),
    );
    const m = CARD_CODE.exec(cardCode);
    if (!m) throw new ContentError(`Dòng ${line}: mã thẻ "${cardCode}" không đúng dạng "Bài 01 - 01".`);
    const lesson = Number(m[1]);
    if (lesson < 1 || lesson > 50) throw new ContentError(`Dòng ${line}: bài ${lesson} ngoài khoảng 1–50.`);
    if (lessonLabel !== `Bài ${m[1]}`) {
      throw new ContentError(`Dòng ${line}: cột bài "${lessonLabel}" không khớp mã thẻ "${cardCode}".`);
    }
    if (!kana) throw new ContentError(`Dòng ${line}: thiếu kana.`);
    rows.push({ line, cardCode, lesson, order: Number(m[2]), kana, kanji, hanViet: hanViet.toUpperCase(), meaningVi });
  });

  if (rows.length === 0) throw new ContentError("Bộ thẻ không có dòng dữ liệu nào.");
  const seen = new Map<string, number>();
  for (const r of rows) {
    const prev = seen.get(r.cardCode);
    if (prev) throw new ContentError(`Mã thẻ "${r.cardCode}" trùng ở dòng ${prev} và ${r.line}.`);
    seen.set(r.cardCode, r.line);
  }
  return rows;
}

const CJK = /[㐀-䶿一-鿿]/;

/** Các kanji (không tính 々) trong một chuỗi, theo thứ tự, không lặp */
export function kanjiChars(text: string): string[] {
  return [...new Set([...text].filter((c) => CJK.test(c)))];
}
