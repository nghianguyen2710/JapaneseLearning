// Âm Hán Việt và thông tin kanji. Âm Hán Việt ưu tiên tách từ bộ thẻ, KANJIDIC2 chỉ dự phòng (decisions.md D17)

import type { DeckRow } from "./deck.ts";
import { kanjiChars } from "./deck.ts";

export type KanjidicChar = {
  literal: string;
  misc: { strokeCounts: number[] };
  readingMeaning: {
    groups: { readings: { type: string; value: string }[]; meanings: { lang: string; value: string }[] }[];
  } | null;
};

export type KanjidicInfo = {
  hanViet: string[];
  on: string[];
  kun: string[];
  glossEn: string[];
  strokes?: number;
};

const upper = (s: string) => s.normalize("NFC").toUpperCase();

export function indexKanjidic(chars: KanjidicChar[]): Map<string, KanjidicInfo> {
  const out = new Map<string, KanjidicInfo>();
  for (const c of chars) {
    const groups = c.readingMeaning?.groups ?? [];
    const readings = groups.flatMap((g) => g.readings);
    const of = (type: string) => readings.filter((r) => r.type === type).map((r) => r.value);
    out.set(c.literal, {
      hanViet: [...new Set(of("vietnam").map(upper))],
      on: of("ja_on"),
      kun: of("ja_kun"),
      glossEn: groups.flatMap((g) => g.meanings.filter((m) => m.lang === "en").map((m) => m.value)),
      strokes: c.misc.strokeCounts[0],
    });
  }
  return out;
}

/** Tách các phương án viết khác nhau: "暑い, 熱い" / "SƠN/SAN" */
const alternatives = (s: string) =>
  s
    .replace(/[（(][^）)]*[）)]/g, "")
    .split(/[,，/／]/)
    .map((x) => x.trim())
    .filter(Boolean);

export type HanVietVotes = Map<string, Map<string, number>>;

/**
 * Ghép âm Hán Việt của cả từ với từng kanji: chỉ khi số âm tiết bằng số kanji.
 * Trả về số phiếu của mỗi âm cho mỗi kanji, theo thứ tự xuất hiện lần đầu.
 */
export function voteHanViet(rows: DeckRow[]): { votes: HanVietVotes; misaligned: DeckRow[] } {
  const votes: HanVietVotes = new Map();
  const misaligned: DeckRow[] = [];
  for (const r of rows) {
    if (!r.kanji || !r.hanViet) continue;
    const kanjiAlts = alternatives(r.kanji);
    const hvAlts = alternatives(r.hanViet);
    const pairs: [string, string][] =
      kanjiAlts.length === hvAlts.length
        ? kanjiAlts.map((k, i) => [k, hvAlts[i]])
        : kanjiAlts.length === 1
          ? hvAlts.map((h) => [kanjiAlts[0], h])
          : [];
    let aligned = false;
    for (const [k, h] of pairs) {
      const chars = kanjiChars(k);
      const syllables = h.split(/\s+/).filter(Boolean);
      if (chars.length === 0 || chars.length !== syllables.length) continue;
      aligned = true;
      chars.forEach((c, i) => {
        const m = votes.get(c) ?? new Map<string, number>();
        m.set(syllables[i], (m.get(syllables[i]) ?? 0) + 1);
        votes.set(c, m);
      });
    }
    if (!aligned) misaligned.push(r);
  }
  return { votes, misaligned };
}

/** Âm theo số phiếu giảm dần; bằng phiếu thì giữ thứ tự xuất hiện */
export function rankedReadings(votes: Map<string, number> | undefined): string[] {
  if (!votes) return [];
  return [...votes.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
}
