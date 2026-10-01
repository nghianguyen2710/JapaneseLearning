// npm run content:verify -- --lessons 1-5
// Đánh dấu verified: true cho mọi từ, kanji, mẫu ngữ pháp của các bài đã kiểm tra, rồi build lại.
// Thêm --undo để bỏ đánh dấu.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LessonFile } from "../../src/lib/content/schema.ts";
import { ContentError } from "./deck.ts";
import { main, PATHS, runBuild, writeJson } from "./build-cli.ts";
import { emptyOverrides, type OverrideEntry, type OverrideFile } from "./overrides.ts";

export function parseLessons(arg: string | undefined): number[] {
  const m = arg ? /^(\d+)(?:-(\d+))?$/.exec(arg) : null;
  if (!m) throw new ContentError('Cần --lessons, ví dụ "--lessons 3" hoặc "--lessons 1-5".');
  const from = Number(m[1]);
  const to = Number(m[2] ?? m[1]);
  if (from < 1 || to > 50 || from > to) throw new ContentError(`Khoảng bài ${arg} không hợp lệ (1–50).`);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function setVerified(file: OverrideFile, ids: string[], verified: boolean): OverrideFile {
  const out: OverrideFile = { ...file };
  for (const id of ids) {
    const entry: OverrideEntry = { ...((out[id] as OverrideEntry | undefined) ?? {}), verified };
    out[id] = entry;
  }
  return out;
}

if (import.meta.main) {
  main(() => {
    const args = process.argv.slice(2);
    const lessons = parseLessons(args[args.indexOf("--lessons") + 1]);
    const verified = !args.includes("--undo");
    runBuild(); // đảm bảo content/lessons khớp với nguồn hiện tại

    const files = lessons.map(
      (n) => JSON.parse(readFileSync(join(PATHS.lessons, `${String(n).padStart(2, "0")}.json`), "utf8")) as LessonFile,
    );
    const ids = {
      vocab: files.flatMap((f) => f.vocab.map((v) => v.id)),
      kanji: files.flatMap((f) => f.kanji.map((k) => k.id)),
      grammar: files.flatMap((f) => f.grammar.map((g) => g.id)),
    };
    for (const [kind, list] of Object.entries(ids)) {
      const path = PATHS.overrides(kind);
      const current = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as OverrideFile) : emptyOverrides();
      writeJson(path, setVerified(current, list, verified));
    }
    runBuild();
    const total = ids.vocab.length + ids.kanji.length + ids.grammar.length;
    console.info(`✓ ${verified ? "Đã đánh dấu" : "Đã bỏ đánh dấu"} verified cho ${total} mục của bài ${lessons.join(", ")}.`);
  });
}
