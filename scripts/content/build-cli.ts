// npm run content:build — đọc content/raw, ghi content/lessons/*.json, content/ids/vocab.json, content/report.md

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContent } from "./build.ts";
import { ContentError } from "./deck.ts";
import { emptyRegistry, validateRegistry } from "./ids.ts";
import { indexJmdict } from "./jmdict.ts";
import { indexKanjidic } from "./kanji.ts";
import { emptyOverrides, type OverrideFile } from "./overrides.ts";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const C = (...p: string[]) => join(ROOT, "content", ...p);

export const PATHS = {
  deck: C("raw", "minna", "minna-vocab.txt"),
  grammar: C("raw", "grammar", "minna-grammar.tsv"),
  explanations: C("raw", "grammar", "explanations.json"),
  jmdict: C("raw", "jmdict", "jmdict-eng-3.6.2.json"),
  kanjidic: C("raw", "jmdict", "kanjidic2-en-3.6.2.json"),
  registry: C("ids", "vocab.json"),
  overrides: (kind: string) => C("overrides", `${kind}.json`),
  lessons: C("lessons"),
  report: C("report.md"),
};

function readJson<T>(path: string, fallback?: () => T): T {
  if (!existsSync(path)) {
    if (fallback) return fallback();
    throw new ContentError(`Thiếu file ${path}. Máy mới thì chạy ./scripts/fetch-sources.sh trước.`);
  }
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (e) {
    throw new ContentError(`${path} không phải JSON hợp lệ: ${(e as Error).message}`);
  }
}

function readText(path: string): string {
  if (!existsSync(path)) throw new ContentError(`Thiếu file ${path}.`);
  return readFileSync(path, "utf8");
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

export function runBuild() {
  const jm = readJson<{ words: Parameters<typeof indexJmdict>[0] }>(PATHS.jmdict);
  const kd = readJson<{ characters: Parameters<typeof indexKanjidic>[0] }>(PATHS.kanjidic);
  const overrides = {
    vocab: readJson<OverrideFile>(PATHS.overrides("vocab"), emptyOverrides),
    kanji: readJson<OverrideFile>(PATHS.overrides("kanji"), emptyOverrides),
    grammar: readJson<OverrideFile>(PATHS.overrides("grammar"), emptyOverrides),
  };

  const out = buildContent({
    deckText: readText(PATHS.deck),
    grammarText: readText(PATHS.grammar),
    explanations: readJson(PATHS.explanations, () => ({ schemaVersion: 1 })),
    jmdict: indexJmdict(jm.words),
    kanjidic: indexKanjidic(kd.characters),
    registry: validateRegistry(readJson(PATHS.registry, emptyRegistry)),
    overrides,
  });

  for (const l of out.lessons) writeJson(join(PATHS.lessons, `${String(l.lesson).padStart(2, "0")}.json`), l);
  writeJson(join(PATHS.lessons, "index.json"), out.index);
  writeJson(PATHS.registry, out.registry);
  for (const [kind, f] of Object.entries(overrides)) {
    if (!existsSync(PATHS.overrides(kind))) writeJson(PATHS.overrides(kind), f);
  }
  writeFileSync(PATHS.report, out.report);
  return out;
}

export function main(fn: () => void) {
  try {
    fn();
  } catch (e) {
    if (e instanceof ContentError) {
      console.error(`✗ ${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}

if (import.meta.main) {
  main(() => {
    const out = runBuild();
    const vocab = out.lessons.reduce((n, l) => n + l.vocab.length, 0);
    console.info(`✓ Đã build ${out.lessons.length} bài, ${vocab} từ. Báo cáo: content/report.md`);
  });
}
