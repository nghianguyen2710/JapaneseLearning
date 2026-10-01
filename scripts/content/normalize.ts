// Sinh các dạng tra cứu (kana, kanji) từ cách viết hiển thị của bộ thẻ, để tra JMdict.
// Không dùng cho hiển thị: app luôn hiện đúng như bộ thẻ.

/** verb: mục JMdict phải là động từ (v1, v5…, vk, vs-i); suru-noun: mục phải có từ loại vs */
export type ExpectPos = "verb" | "suru-noun";
export type LookupCandidate = { kana: string; kanji: string; dictForm: boolean; expectPos?: ExpectPos };
type DictCandidate = { kana: string; kanji: string; expectPos: ExpectPos };

const PLACEHOLDERS = /[～〜―－\-~…。、？?！!，,\s　]/g;

/** [x] / 「x」 là phần tuỳ chọn: sinh cả bản bỏ đi và bản giữ lại */
function expandOptional(s: string): string[] {
  const m = /[[「]([^\]」]*)[\]」]/.exec(s);
  if (!m) return [s];
  const before = s.slice(0, m.index);
  const after = s.slice(m.index + m[0].length);
  return [...expandOptional(before + after), ...expandOptional(before + m[1] + after)];
}

/** Bỏ phần ngoặc tròn (cách nói khác); nếu cả chuỗi nằm trong ngoặc thì lấy phần trong */
function stripParens(s: string): string {
  const whole = /^[（(]([^）)]*)[）)]$/.exec(s.trim());
  if (whole) return whole[1];
  return s.replace(/[（(][^）)]*[）)]/g, "");
}

function forms(s: string): string[] {
  const out = new Set<string>();
  for (const alt of s.split(/[/／,，]/)) {
    for (const e of expandOptional(stripParens(alt))) {
      const clean = e.replace(PLACEHOLDERS, "");
      if (clean) out.add(clean);
    }
  }
  return [...out];
}

const GODAN: Record<string, string> = {
  い: "う", き: "く", ぎ: "ぐ", し: "す", ち: "つ", に: "ぬ", び: "ぶ", み: "む", り: "る",
};

/** Dạng ます → các ứng viên dạng từ điển. JMdict sẽ quyết định ứng viên nào có thật. */
export function masuToDict(kana: string, kanji: string): DictCandidate[] {
  if (!kana.endsWith("ます")) return [];
  const ks = kana.slice(0, -2);
  const js = kanji.endsWith("ます") ? kanji.slice(0, -2) : "";
  const out: DictCandidate[] = [];
  const add = (k: string, j: string, expectPos: ExpectPos = "verb") => {
    // Bộ thẻ có kanji mà không suy ra được kanji của ứng viên thì bỏ, tránh khớp nhầm chỉ bằng kana
    if (js && !j) return;
    out.push({ kana: k, kanji: j, expectPos });
  };

  if (ks === "し") add("する", js ? "為る" : "");
  if (ks === "き") add("くる", js ? "来る" : "");
  add(ks + "る", js ? js + "る" : ""); // nhóm 2
  const last = ks.at(-1) ?? "";
  if (GODAN[last]) {
    const jLast = js.at(-1);
    const jStem = js && jLast === last ? js.slice(0, -1) + GODAN[last] : "";
    add(ks.slice(0, -1) + GODAN[last], jStem);
    if (last === "い") add(ks.slice(0, -1) + "る", js && jLast === "い" ? js.slice(0, -1) + "る" : ""); // くださいます → くださる
  }
  // N + します (thử sau cùng): べんきょうします → 勉強
  if (ks.endsWith("し") && ks.length > 1) {
    add(ks.slice(0, -1), js.endsWith("し") ? js.slice(0, -1) : "", "suru-noun");
  }
  return out;
}

export function lookupCandidates(kana: string, kanji: string): LookupCandidate[] {
  const kanaForms = forms(kana);
  const kanjiForms = kanji ? forms(kanji) : [""];
  const out: LookupCandidate[] = [];
  const seen = new Set<string>();
  const push = (c: LookupCandidate) => {
    const key = `${c.kana}|${c.kanji}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  };
  for (const k of kanaForms) {
    for (const j of kanjiForms) push({ kana: k, kanji: j, dictForm: false });
  }
  for (const k of kanaForms) {
    for (const j of kanjiForms) {
      for (const d of masuToDict(k, j)) push({ ...d, dictForm: true });
    }
  }
  return out;
}
