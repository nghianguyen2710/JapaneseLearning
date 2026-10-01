// Sổ ID từ vựng (content/ids/vocab.json): gán một lần, chỉ thêm, không xoá (docs/schema.md mục 1)

import type { VocabId } from "../../src/lib/content/schema.ts";
import { ContentError, type DeckRow } from "./deck.ts";

export type VocabRegistry = {
  schemaVersion: 1;
  next: number;
  entries: Record<string, VocabId>;
};

export const emptyRegistry = (): VocabRegistry => ({ schemaVersion: 1, next: 1, entries: {} });

export const registryKey = (r: Pick<DeckRow, "lesson" | "kana" | "kanji">) =>
  `${String(r.lesson).padStart(2, "0")}|${r.kana}|${r.kanji}`;

const formatId = (n: number): VocabId => `w${String(n).padStart(4, "0")}`;

export function validateRegistry(reg: unknown): VocabRegistry {
  const r = reg as VocabRegistry;
  if (!r || r.schemaVersion !== 1 || typeof r.next !== "number" || typeof r.entries !== "object") {
    throw new ContentError("content/ids/vocab.json sai định dạng (cần schemaVersion, next, entries).");
  }
  const seen = new Map<string, string>();
  for (const [key, id] of Object.entries(r.entries)) {
    const prev = seen.get(id);
    if (prev) throw new ContentError(`Sổ ID: ${id} bị dùng cho cả "${prev}" và "${key}".`);
    seen.set(id, key);
  }
  return r;
}

/**
 * Gán ID cho các dòng bộ thẻ. Dòng đã có trong sổ thì giữ ID cũ, dòng mới nhận số tiếp theo.
 * Khoá trong sổ không còn trong bộ thẻ thì dừng: không bao giờ âm thầm làm mất tiến độ ôn.
 */
export function assignVocabIds(
  rows: DeckRow[],
  registry: VocabRegistry,
): { ids: VocabId[]; registry: VocabRegistry; added: string[] } {
  const keys = rows.map(registryKey);
  const present = new Set(keys);
  const orphaned = Object.keys(registry.entries).filter((k) => !present.has(k));
  if (orphaned.length > 0) {
    throw new ContentError(
      [
        `${orphaned.length} từ trong sổ ID không còn trong bộ thẻ (có thể bộ thẻ vừa được sửa hoặc export lại):`,
        ...orphaned.slice(0, 20).map((k) => `  - ${k} (${registry.entries[k]})`),
        "Nếu đó là cùng một từ đã đổi cách viết: sửa khoá tương ứng trong content/ids/vocab.json, giữ nguyên ID.",
        "Nếu từ thực sự bị bỏ: hỏi lại trước khi xoá, vì sẽ mất tiến độ ôn của từ đó.",
      ].join("\n"),
    );
  }

  const entries = { ...registry.entries };
  let next = registry.next;
  const added: string[] = [];
  const ids = keys.map((key) => {
    const existing = entries[key];
    if (existing) return existing;
    const id = formatId(next++);
    entries[key] = id;
    added.push(key);
    return id;
  });
  return { ids, registry: { schemaVersion: 1, next, entries }, added };
}
