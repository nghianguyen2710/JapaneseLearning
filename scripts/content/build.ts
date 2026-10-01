// Ghép bộ thẻ + JMdict + KANJIDIC2 + ngữ pháp + override thành nội dung từng bài. Hàm thuần, không đọc/ghi file.

import {
  CONTENT_SCHEMA_VERSION,
  type Grammar,
  type Kanji,
  type LessonFile,
  type LessonIndex,
  type Vocab,
  type VocabId,
} from "../../src/lib/content/schema.ts";
import { ContentError, kanjiChars, parseDeck, type DeckRow } from "./deck.ts";
import { parseGrammar, validateExplanations } from "./grammar.ts";
import { assignVocabIds, type VocabRegistry } from "./ids.ts";
import { lookup, type JmdictIndex } from "./jmdict.ts";
import { rankedReadings, voteHanViet, type KanjidicInfo } from "./kanji.ts";
import { lookupCandidates } from "./normalize.ts";
import { applyOverride, entriesOf, validateOverrides, type OverrideFile } from "./overrides.ts";

export type BuildInput = {
  deckText: string;
  grammarText: string;
  explanations: unknown;
  jmdict: JmdictIndex;
  kanjidic: Map<string, KanjidicInfo>;
  registry: VocabRegistry;
  overrides: { vocab: OverrideFile; kanji: OverrideFile; grammar: OverrideFile };
};

export type BuildOutput = {
  lessons: LessonFile[];
  index: LessonIndex;
  registry: VocabRegistry;
  report: string;
};

const LESSONS = Array.from({ length: 50 }, (_, i) => i + 1);

export function buildContent(input: BuildInput): BuildOutput {
  const rows = parseDeck(input.deckText);
  const { ids, registry, added } = assignVocabIds(rows, input.registry);

  // Từ vựng
  const byWord = new Map<string, VocabId[]>();
  rows.forEach((r, i) => {
    const k = `${r.kana}|${r.kanji}`;
    byWord.set(k, [...(byWord.get(k) ?? []), ids[i]]);
  });
  const unmatched: DeckRow[] = [];
  let vocab: Vocab[] = rows.map((r, i) => {
    const jmdict = lookup(input.jmdict, lookupCandidates(r.kana, r.kanji));
    if (!jmdict) unmatched.push(r);
    const v: Vocab = {
      id: ids[i],
      lesson: r.lesson,
      order: r.order,
      kana: r.kana,
      ...(r.kanji ? { kanji: r.kanji } : {}),
      ...(r.hanViet ? { hanViet: r.hanViet } : {}),
      meaningVi: r.meaningVi,
      kanjiChars: kanjiChars(r.kanji),
      ...(jmdict ? { jmdict } : {}),
      seeAlso: (byWord.get(`${r.kana}|${r.kanji}`) ?? []).filter((id) => id !== ids[i]),
      source: "deck",
      overridden: [],
      verified: false,
    };
    return v;
  });

  // Kanji: thuộc bài xuất hiện lần đầu
  const { votes, misaligned } = voteHanViet(rows);
  const firstLesson = new Map<string, number>();
  for (const r of rows) for (const c of kanjiChars(r.kanji)) if (!firstLesson.has(c)) firstLesson.set(c, r.lesson);
  const notInKanjidic: string[] = [];
  const disagree: string[] = [];
  let kanji: Kanji[] = [...firstLesson].map(([c, lesson]) => {
    const info = input.kanjidic.get(c);
    if (!info) notInKanjidic.push(c);
    const fromDeck = rankedReadings(votes.get(c));
    const fromKanjidic = info?.hanViet ?? [];
    if (fromDeck.length && fromKanjidic.length && !fromKanjidic.includes(fromDeck[0])) {
      disagree.push(`${c} bộ thẻ: ${fromDeck.join("/")} · KANJIDIC2: ${fromKanjidic.join("/")}`);
    }
    return {
      id: c,
      firstLesson: lesson,
      hanViet: fromDeck.length ? fromDeck : fromKanjidic,
      hanVietSource: fromDeck.length ? "deck" : "kanjidic",
      on: info?.on ?? [],
      kun: info?.kun ?? [],
      glossEn: info?.glossEn ?? [],
      ...(info?.strokes ? { strokes: info.strokes } : {}),
      source: "kanjidic",
      overridden: [],
      verified: false,
    } satisfies Kanji;
  });

  // Ngữ pháp
  const grammarRows = parseGrammar(input.grammarText);
  const explanations = validateExplanations(input.explanations, new Set(grammarRows.map((g) => g.id)));
  let grammar: Grammar[] = grammarRows.map((g) => ({
    ...g,
    ...(explanations[g.id] ? { explanation: explanations[g.id] } : {}),
    source: "ai",
    overridden: [],
    verified: false,
  }));

  // Override
  const ov = {
    vocab: validateOverrides("vocab", input.overrides.vocab, new Set(vocab.map((v) => v.id))),
    kanji: validateOverrides("kanji", input.overrides.kanji, new Set(kanji.map((k) => k.id))),
    grammar: validateOverrides("grammar", input.overrides.grammar, new Set(grammar.map((g) => g.id))),
  };
  const map = (f: OverrideFile) => new Map(entriesOf(f));
  const [ovV, ovK, ovG] = [map(ov.vocab), map(ov.kanji), map(ov.grammar)];
  vocab = vocab.map((v) => applyOverride(v, ovV.get(v.id)));
  kanji = kanji.map((k) => applyOverride(k, ovK.get(k.id)));
  grammar = grammar.map((g) => applyOverride(g, ovG.get(g.id)));

  const allIds = [...vocab.map((v) => v.id), ...kanji.map((k) => k.id), ...grammar.map((g) => g.id)];
  if (new Set(allIds).size !== allIds.length) throw new ContentError("Có ID trùng giữa các bản ghi nội dung.");

  const lessons: LessonFile[] = LESSONS.map((lesson) => ({
    schemaVersion: CONTENT_SCHEMA_VERSION,
    lesson,
    vocab: vocab.filter((v) => v.lesson === lesson),
    kanji: kanji.filter((k) => k.firstLesson === lesson),
    grammar: grammar.filter((g) => g.lesson === lesson),
  }));

  const index: LessonIndex = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    lessons: lessons.map((l) => {
      const items = [...l.vocab, ...l.kanji, ...l.grammar];
      return {
        lesson: l.lesson,
        vocabCount: l.vocab.length,
        kanjiCount: l.kanji.length,
        grammarCount: l.grammar.length,
        verifiedCount: items.filter((x) => x.verified).length,
        fullyVerified: items.length > 0 && items.every((x) => x.verified),
      };
    }),
  };

  const report = renderReport({
    rows,
    lessons,
    added,
    unmatched,
    misaligned,
    notInKanjidic,
    disagree,
    repeated: [...byWord.values()].filter((v) => v.length > 1).length,
    explanationCount: Object.keys(explanations).length,
  });

  return { lessons, index, registry, report };
}

function renderReport(d: {
  rows: DeckRow[];
  lessons: LessonFile[];
  added: string[];
  unmatched: DeckRow[];
  misaligned: DeckRow[];
  notInKanjidic: string[];
  disagree: string[];
  repeated: number;
  explanationCount: number;
}): string {
  const vocab = d.lessons.flatMap((l) => l.vocab);
  const kanji = d.lessons.flatMap((l) => l.kanji);
  const grammar = d.lessons.flatMap((l) => l.grammar);
  const noMeaning = vocab.filter((v) => !v.meaningVi);
  const noHanViet = kanji.filter((k) => k.hanViet.length === 0);
  const hvFallback = kanji.filter((k) => k.hanVietSource === "kanjidic" && k.hanViet.length > 0);
  const card = (r: DeckRow) => `${r.cardCode} ${r.kana}${r.kanji ? ` 【${r.kanji}】` : ""}`;
  const unmatchedBy = new Map<number, DeckRow[]>();
  for (const r of d.unmatched) unmatchedBy.set(r.lesson, [...(unmatchedBy.get(r.lesson) ?? []), r]);

  const out: string[] = [
    "# Báo cáo build nội dung",
    "",
    "> Sinh bởi `npm run content:build`. Không sửa tay.",
    "",
    "## Tổng quan",
    "",
    `- Từ vựng: **${vocab.length}** (${d.repeated} từ lặp lại ở nhiều bài, mỗi bài một thẻ)`,
    `- Kanji: **${kanji.length}**`,
    `- Mẫu ngữ pháp: **${grammar.length}**, đã có giải thích: **${d.explanationCount}**`,
    `- Khớp JMdict: **${vocab.length - d.unmatched.length}/${vocab.length}**`,
    `- Đã kiểm tra (verified): từ ${vocab.filter((v) => v.verified).length} · kanji ${kanji.filter((k) => k.verified).length} · ngữ pháp ${grammar.filter((g) => g.verified).length}`,
    `- ID mới gán lần này: **${d.added.length}**`,
    "",
    "## Theo bài",
    "",
    "| Bài | Từ | Kanji mới | Ngữ pháp | Không khớp JMdict | Thiếu nghĩa | Verified |",
    "|---|---|---|---|---|---|---|",
    ...d.lessons.map((l) => {
      const items = [...l.vocab, ...l.kanji, ...l.grammar];
      return `| ${l.lesson} | ${l.vocab.length} | ${l.kanji.length} | ${l.grammar.length} | ${unmatchedBy.get(l.lesson)?.length ?? 0} | ${l.vocab.filter((v) => !v.meaningVi).length} | ${items.filter((x) => x.verified).length}/${items.length} |`;
    }),
    "",
    `## Từ thiếu nghĩa (${noMeaning.length})`,
    "",
    ...(noMeaning.length ? noMeaning.map((v) => `- ${v.id} bài ${v.lesson}: ${v.kana} ${v.kanji ?? ""}`) : ["Không có."]),
    "",
    `## Kanji thiếu âm Hán Việt (${noHanViet.length})`,
    "",
    noHanViet.length ? noHanViet.map((k) => k.id).join(" ") : "Không có.",
    "",
    `## Kanji lấy âm Hán Việt từ KANJIDIC2 — cần kiểm tra (${hvFallback.length})`,
    "",
    ...(hvFallback.length ? hvFallback.map((k) => `- ${k.id} (bài ${k.firstLesson}): ${k.hanViet.join(", ")}`) : ["Không có."]),
    "",
    `## Kanji không có trong KANJIDIC2 (${d.notInKanjidic.length})`,
    "",
    d.notInKanjidic.length ? d.notInKanjidic.join(" ") : "Không có.",
    "",
    `## Âm chính từ bộ thẻ khác KANJIDIC2 (${d.disagree.length})`,
    "",
    "Âm của bộ thẻ được dùng (D17). Danh sách để tham khảo khi kiểm tra.",
    "",
    ...d.disagree.map((x) => `- ${x}`),
    "",
    `## Từ không ghép được âm Hán Việt theo từng kanji (${d.misaligned.length})`,
    "",
    ...d.misaligned.map((r) => `- ${card(r)}: ${r.hanViet}`),
    "",
    `## Từ không khớp JMdict (${d.unmatched.length})`,
    "",
    "Thường là cụm từ, câu chào, tên riêng hoặc thể て/ない. Không sao: các từ này chỉ thiếu nghĩa tiếng Anh bổ sung.",
    "",
    ...[...unmatchedBy].map(([lesson, rs]) => `- **Bài ${lesson}:** ${rs.map((r) => r.kanji || r.kana).join(" · ")}`),
    "",
  ];
  if (d.added.length && d.added.length <= 50) {
    out.push("## ID mới gán lần này", "", ...d.added.map((k) => `- ${k}`), "");
  }
  return out.join("\n");
}

