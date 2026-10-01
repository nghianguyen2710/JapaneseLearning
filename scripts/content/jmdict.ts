// Tra JMdict (bản JSON jmdict-simplified) theo các ứng viên từ normalize.ts

import type { JmdictMatch } from "../../src/lib/content/schema.ts";
import type { LookupCandidate } from "./normalize.ts";

export type JmdictWord = {
  id: string;
  kanji: { text: string; common: boolean }[];
  kana: { text: string; common: boolean; appliesToKanji: string[] }[];
  sense: { partOfSpeech: string[]; misc: string[]; gloss: { lang: string; text: string }[] }[];
};

export type JmdictIndex = {
  byKanji: Map<string, JmdictWord[]>;
  byKana: Map<string, JmdictWord[]>;
};

const MAX_GLOSSES = 4;

export function indexJmdict(words: JmdictWord[]): JmdictIndex {
  const byKanji = new Map<string, JmdictWord[]>();
  const byKana = new Map<string, JmdictWord[]>();
  const push = (m: Map<string, JmdictWord[]>, k: string, w: JmdictWord) => {
    const list = m.get(k);
    if (list) list.push(w);
    else m.set(k, [w]);
  };
  for (const w of words) {
    for (const k of w.kanji) push(byKanji, k.text, w);
    for (const k of w.kana) push(byKana, k.text, w);
  }
  return { byKanji, byKana };
}

const isVerb = (pos: string) => /^v(1|5|k|s-i|z)/.test(pos);
const posOf = (w: JmdictWord) => [...new Set(w.sense.flatMap((s) => s.partOfSpeech))];
const isCommon = (w: JmdictWord) => w.kanji.some((k) => k.common) || w.kana.some((k) => k.common);
const usuallyKana = (w: JmdictWord) => w.kanji.length === 0 || w.sense.some((s) => s.misc.includes("uk"));

function fitsPos(w: JmdictWord, c: LookupCandidate): boolean {
  const pos = posOf(w);
  if (c.expectPos === "verb") return pos.some(isVerb);
  if (c.expectPos === "suru-noun") return pos.includes("vs");
  return true;
}

/** Ưu tiên mục common, rồi giữ thứ tự của JMdict (ổn định giữa các lần build) */
function best(list: JmdictWord[]): JmdictWord | undefined {
  return list.find(isCommon) ?? list[0];
}

function find(index: JmdictIndex, c: LookupCandidate): JmdictWord | undefined {
  if (c.kanji) {
    const list = (index.byKanji.get(c.kanji) ?? []).filter(
      (w) => w.kana.some((k) => k.text === c.kana) && fitsPos(w, c),
    );
    return best(list);
  }
  const list = (index.byKana.get(c.kana) ?? []).filter((w) => fitsPos(w, c));
  // Từ chỉ viết bằng kana trong bộ thẻ: ưu tiên mục thường viết bằng kana
  return best(list.filter(usuallyKana)) ?? best(list);
}

export function lookup(index: JmdictIndex, candidates: LookupCandidate[]): JmdictMatch | undefined {
  for (const c of candidates) {
    const w = find(index, c);
    if (!w) continue;
    const glossEn = w.sense
      .flatMap((s) => s.gloss.filter((g) => g.lang === "eng").map((g) => g.text))
      .slice(0, MAX_GLOSSES);
    const dictForm = (c.kanji || c.kana) + (c.expectPos === "suru-noun" ? "する" : "");
    return { id: w.id, dictForm, pos: posOf(w), glossEn };
  }
  return undefined;
}
