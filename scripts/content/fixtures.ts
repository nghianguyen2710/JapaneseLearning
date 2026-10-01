// Dữ liệu nguồn nhỏ làm mẫu cho test

import type { BuildInput } from "./build.ts";
import { emptyRegistry } from "./ids.ts";
import { indexJmdict, type JmdictWord } from "./jmdict.ts";
import { indexKanjidic } from "./kanji.ts";
import { emptyOverrides } from "./overrides.ts";

const HEADER = "#separator:tab\n#html:true\n#deck column:1\n#tags column:10\n";
const row = (code: string, kana: string, kanji: string, hv: string, vi: string) => {
  const lesson = code.slice(0, 2);
  return `Từ vựng Minna\tBài ${lesson} - ${code.slice(3)}\tBài ${lesson}\t${kana}\t${kanji}\t${hv}\t${vi}\t\t\t`;
};

export const DECK_ROWS = [
  row("01-01", "わたし", "私", "TƯ", "tôi"),
  row("01-02", "せんせい", "先生", "TIÊN SINH", "thầy/ cô"),
  row("01-03", "あなた", "", "", "anh/ chị"),
  row("02-01", "たべます", "食べます", "THỰC", "ăn"),
  row("02-02", "のみます", "飲みます", "ẨM", "uống"),
  row("02-03", "べんきょうします", "勉強します", "MIỄN CƯỜNG", "học"),
  row("02-04", "せんせい", "先生", "TIÊN SINH", "giáo viên"),
];

export const deckText = (rows = DECK_ROWS) => HEADER + rows.join("\n") + "\n";

export const GRAMMAR_TSV = [
  "# chú thích",
  "id\tlesson\torder\tpattern\tmeaning_vi",
  "g01-01\t1\t1\tN1 は N2 です\tN1 là N2",
  "g02-01\t2\t1\tN を V\tlàm V (cái gì)",
].join("\n");

const word = (id: string, kanji: string[], kana: string[], pos: string[], gloss: string, uk = false): JmdictWord => ({
  id,
  kanji: kanji.map((text) => ({ text, common: true })),
  kana: kana.map((text) => ({ text, common: true, appliesToKanji: ["*"] })),
  sense: [{ partOfSpeech: pos, misc: uk ? ["uk"] : [], gloss: [{ lang: "eng", text: gloss }] }],
});

export const JMDICT = indexJmdict([
  word("1", ["私"], ["わたし"], ["pn"], "I"),
  word("2", ["先生"], ["せんせい"], ["n"], "teacher"),
  word("3", ["貴方"], ["あなた"], ["pn"], "you", true),
  word("4", ["食べる"], ["たべる"], ["v1", "vt"], "to eat"),
  word("5", ["飲む"], ["のむ"], ["v5m", "vt"], "to drink"),
  word("6", ["勉強"], ["べんきょう"], ["n", "vs"], "study"),
  word("7", ["話"], ["はな"], ["n"], "WRONG"),
]);

const kd = (literal: string, vietnam: string[], strokes: number) => ({
  literal,
  misc: { strokeCounts: [strokes] },
  readingMeaning: {
    groups: [{ readings: vietnam.map((value) => ({ type: "vietnam", value })), meanings: [{ lang: "en", value: literal }] }],
  },
});

export const KANJIDIC = indexKanjidic([
  kd("私", ["Tư"], 7),
  kd("先", ["Tiên"], 6),
  kd("生", ["Sinh"], 5),
  kd("食", ["Thực", "Tự"], 9),
  kd("飲", ["Ẩm"], 12),
  kd("勉", ["Miễn"], 10),
  kd("強", ["Cường"], 11),
]);

export const baseInput = (over: Partial<BuildInput> = {}): BuildInput => ({
  deckText: deckText(),
  grammarText: GRAMMAR_TSV,
  explanations: { schemaVersion: 1 },
  jmdict: JMDICT,
  kanjidic: KANJIDIC,
  registry: emptyRegistry(),
  overrides: { vocab: emptyOverrides(), kanji: emptyOverrides(), grammar: emptyOverrides() },
  ...over,
});
