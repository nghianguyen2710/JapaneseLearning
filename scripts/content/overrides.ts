// Chỉnh sửa tay và trạng thái verified (content/overrides/*.json), áp sau cùng (docs/schema.md mục 3)

import { ContentError } from "./deck.ts";

export type OverrideEntry = Record<string, unknown> & { verified?: boolean; note?: string };
export type OverrideFile = { schemaVersion: 1 } & Record<string, OverrideEntry | 1>;

export const OVERRIDABLE = {
  vocab: ["kana", "kanji", "hanViet", "meaningVi"],
  kanji: ["hanViet"],
  grammar: ["pattern", "meaningVi", "explanation"],
} as const;

export type OverrideKind = keyof typeof OVERRIDABLE;

export const emptyOverrides = (): OverrideFile => ({ schemaVersion: 1 });

export function entriesOf(file: OverrideFile): [string, OverrideEntry][] {
  return Object.entries(file).filter(([k]) => k !== "schemaVersion") as [string, OverrideEntry][];
}

export function validateOverrides(kind: OverrideKind, file: unknown, knownIds: Set<string>): OverrideFile {
  const f = file as OverrideFile;
  if (!f || f.schemaVersion !== 1) throw new ContentError(`overrides/${kind}.json thiếu schemaVersion: 1.`);
  const allowed = new Set<string>([...OVERRIDABLE[kind], "verified", "note"]);
  for (const [id, entry] of entriesOf(f)) {
    if (!knownIds.has(id)) throw new ContentError(`overrides/${kind}.json: ID ${id} không còn tồn tại.`);
    for (const field of Object.keys(entry)) {
      if (!allowed.has(field)) {
        throw new ContentError(`overrides/${kind}.json: ${id} có trường "${field}" không được phép override.`);
      }
    }
  }
  return f;
}

type Overridable = { overridden: string[]; verified: boolean };

/** Áp override lên một bản ghi, trả về bản ghi mới */
export function applyOverride<T extends Overridable>(record: T, entry: OverrideEntry | undefined): T {
  if (!entry) return record;
  const out: T = { ...record };
  const overridden: string[] = [];
  for (const [field, value] of Object.entries(entry)) {
    if (field === "verified" || field === "note") continue;
    (out as Record<string, unknown>)[field] = value;
    overridden.push(field);
  }
  out.overridden = overridden.sort();
  if (typeof entry.verified === "boolean") out.verified = entry.verified;
  return out;
}
