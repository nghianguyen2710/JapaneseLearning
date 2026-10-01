// Danh sách mẫu ngữ pháp (content/raw/grammar/minna-grammar.tsv) và giải thích sinh qua chat (explanations.json)

import type { GrammarExplanation, GrammarId } from "../../src/lib/content/schema.ts";
import { ContentError } from "./deck.ts";

export type GrammarRow = {
  id: GrammarId;
  lesson: number;
  order: number;
  pattern: string;
  meaningVi: string;
};

const HEADER = "id\tlesson\torder\tpattern\tmeaning_vi";
const ID = /^g(\d{2})-(\d{2})$/;

export function parseGrammar(text: string): GrammarRow[] {
  const lines = text.split(/\r?\n/);
  const dataLines = lines
    .map((l, i) => ({ l: l.normalize("NFC"), line: i + 1 }))
    .filter(({ l }) => l.trim() !== "" && !l.startsWith("#"));
  if (dataLines[0]?.l !== HEADER) {
    throw new ContentError(`minna-grammar.tsv: dòng tiêu đề phải là "${HEADER.replaceAll("\t", "<TAB>")}".`);
  }
  const rows: GrammarRow[] = [];
  const seen = new Set<string>();
  for (const { l, line } of dataLines.slice(1)) {
    const cols = l.split("\t");
    if (cols.length !== 5) throw new ContentError(`minna-grammar.tsv dòng ${line}: cần 5 cột, có ${cols.length}.`);
    const [id, lesson, order, pattern, meaningVi] = cols.map((c) => c.trim());
    const m = ID.exec(id);
    if (!m) throw new ContentError(`minna-grammar.tsv dòng ${line}: ID "${id}" không đúng dạng g01-01.`);
    if (Number(m[1]) !== Number(lesson)) {
      throw new ContentError(`minna-grammar.tsv dòng ${line}: ID ${id} không thuộc bài ${lesson}.`);
    }
    if (seen.has(id)) throw new ContentError(`minna-grammar.tsv dòng ${line}: ID ${id} bị trùng.`);
    if (!pattern || !meaningVi) throw new ContentError(`minna-grammar.tsv dòng ${line}: thiếu mẫu hoặc nghĩa.`);
    seen.add(id);
    rows.push({ id: id as GrammarId, lesson: Number(lesson), order: Number(order), pattern, meaningVi });
  }
  return rows;
}

export type Explanations = Record<GrammarId, GrammarExplanation>;

export function validateExplanations(data: unknown, ids: Set<string>): Explanations {
  if (!data || typeof data !== "object") throw new ContentError("explanations.json phải là object theo ID.");
  const out = data as Record<string, GrammarExplanation>;
  for (const [id, e] of Object.entries(out)) {
    if (id === "schemaVersion") continue;
    if (!ids.has(id)) throw new ContentError(`explanations.json: ID ${id} không có trong minna-grammar.tsv.`);
    const ok =
      typeof e.structure === "string" &&
      typeof e.meaningVi === "string" &&
      typeof e.conjugation === "string" &&
      Array.isArray(e.examples) &&
      e.examples.every((x) => typeof x.ja === "string" && typeof x.vi === "string") &&
      Array.isArray(e.commonMistakes);
    if (!ok) throw new ContentError(`explanations.json: ${id} thiếu trường hoặc sai kiểu (xem docs/schema.md 2.4).`);
  }
  return Object.fromEntries(Object.entries(out).filter(([k]) => k !== "schemaVersion")) as Explanations;
}
