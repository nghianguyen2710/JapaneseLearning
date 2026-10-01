// Schema nội dung build ra (content/lessons/NN.json). Mô tả chi tiết: docs/schema.md

export const CONTENT_SCHEMA_VERSION = 1;

/** w + 4 chữ số, gán một lần trong content/ids/vocab.json */
export type VocabId = `w${string}`;
/** Chính ký tự kanji */
export type KanjiId = string;
/** g + bài + số, viết sẵn trong minna-grammar.tsv */
export type GrammarId = `g${string}`;

export type Source = "deck" | "jmdict" | "kanjidic" | "unihan" | "tatoeba" | "ai";

export type JmdictMatch = {
  id: string;
  dictForm: string;
  pos: string[];
  glossEn: string[];
};

export type Vocab = {
  id: VocabId;
  lesson: number;
  order: number;
  kana: string;
  kanji?: string;
  hanViet?: string;
  meaningVi: string;
  kanjiChars: KanjiId[];
  jmdict?: JmdictMatch;
  /** Các lần xuất hiện khác của cùng kana+kanji; mỗi lần vẫn có thẻ ôn riêng */
  seeAlso: VocabId[];
  source: "deck";
  overridden: string[];
  verified: boolean;
};

export type Kanji = {
  id: KanjiId;
  firstLesson: number;
  /** Âm chính đứng đầu, viết HOA */
  hanViet: string[];
  hanVietSource: "deck" | "kanjidic";
  on: string[];
  kun: string[];
  glossEn: string[];
  strokes?: number;
  source: "kanjidic";
  overridden: string[];
  verified: boolean;
};

export type GrammarExplanation = {
  structure: string;
  meaningVi: string;
  conjugation: string;
  examples: { ja: string; vi: string }[];
  commonMistakes: string[];
};

export type Grammar = {
  id: GrammarId;
  lesson: number;
  order: number;
  pattern: string;
  meaningVi: string;
  explanation?: GrammarExplanation;
  source: "ai";
  overridden: string[];
  verified: boolean;
};

export type LessonFile = {
  schemaVersion: typeof CONTENT_SCHEMA_VERSION;
  lesson: number;
  vocab: Vocab[];
  kanji: Kanji[];
  grammar: Grammar[];
};
