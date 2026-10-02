// Tải nội dung bài (content/lessons/NN.json) phía client. Mỗi bài là một chunk riêng, chỉ tải khi cần.
// Danh sách import phải viết tường minh để bundler tách chunk (không dùng template string).

import { CONTENT_SCHEMA_VERSION, type LessonFile, type Vocab } from "./schema";

export const LESSON_COUNT = 50;

const LOADERS: Record<number, () => Promise<{ default: unknown }>> = {
  1: () => import("../../../content/lessons/01.json"),
  2: () => import("../../../content/lessons/02.json"),
  3: () => import("../../../content/lessons/03.json"),
  4: () => import("../../../content/lessons/04.json"),
  5: () => import("../../../content/lessons/05.json"),
  6: () => import("../../../content/lessons/06.json"),
  7: () => import("../../../content/lessons/07.json"),
  8: () => import("../../../content/lessons/08.json"),
  9: () => import("../../../content/lessons/09.json"),
  10: () => import("../../../content/lessons/10.json"),
  11: () => import("../../../content/lessons/11.json"),
  12: () => import("../../../content/lessons/12.json"),
  13: () => import("../../../content/lessons/13.json"),
  14: () => import("../../../content/lessons/14.json"),
  15: () => import("../../../content/lessons/15.json"),
  16: () => import("../../../content/lessons/16.json"),
  17: () => import("../../../content/lessons/17.json"),
  18: () => import("../../../content/lessons/18.json"),
  19: () => import("../../../content/lessons/19.json"),
  20: () => import("../../../content/lessons/20.json"),
  21: () => import("../../../content/lessons/21.json"),
  22: () => import("../../../content/lessons/22.json"),
  23: () => import("../../../content/lessons/23.json"),
  24: () => import("../../../content/lessons/24.json"),
  25: () => import("../../../content/lessons/25.json"),
  26: () => import("../../../content/lessons/26.json"),
  27: () => import("../../../content/lessons/27.json"),
  28: () => import("../../../content/lessons/28.json"),
  29: () => import("../../../content/lessons/29.json"),
  30: () => import("../../../content/lessons/30.json"),
  31: () => import("../../../content/lessons/31.json"),
  32: () => import("../../../content/lessons/32.json"),
  33: () => import("../../../content/lessons/33.json"),
  34: () => import("../../../content/lessons/34.json"),
  35: () => import("../../../content/lessons/35.json"),
  36: () => import("../../../content/lessons/36.json"),
  37: () => import("../../../content/lessons/37.json"),
  38: () => import("../../../content/lessons/38.json"),
  39: () => import("../../../content/lessons/39.json"),
  40: () => import("../../../content/lessons/40.json"),
  41: () => import("../../../content/lessons/41.json"),
  42: () => import("../../../content/lessons/42.json"),
  43: () => import("../../../content/lessons/43.json"),
  44: () => import("../../../content/lessons/44.json"),
  45: () => import("../../../content/lessons/45.json"),
  46: () => import("../../../content/lessons/46.json"),
  47: () => import("../../../content/lessons/47.json"),
  48: () => import("../../../content/lessons/48.json"),
  49: () => import("../../../content/lessons/49.json"),
  50: () => import("../../../content/lessons/50.json"),
};

export class ContentError extends Error {}

export async function loadLesson(lesson: number): Promise<LessonFile> {
  const loader = LOADERS[lesson];
  if (!loader) throw new ContentError(`Không có bài ${lesson}`);
  let mod: { default: unknown };
  try {
    mod = await loader();
  } catch {
    throw new ContentError(`Không tải được nội dung bài ${lesson} (mất mạng?)`);
  }
  const file = mod.default as Partial<LessonFile> | null;
  if (file?.schemaVersion !== CONTENT_SCHEMA_VERSION || file.lesson !== lesson) {
    throw new ContentError(`Nội dung bài ${lesson} sai phiên bản, cần build lại`);
  }
  if (!Array.isArray(file.vocab)) throw new ContentError(`Nội dung bài ${lesson} bị hỏng`);
  return file as LessonFile;
}

/** Từ vựng của bài 1 → `upTo` */
export async function loadVocabUpTo(upTo: number): Promise<Vocab[]> {
  const n = Math.min(Math.max(1, upTo), LESSON_COUNT);
  const files = await Promise.all(Array.from({ length: n }, (_, i) => loadLesson(i + 1)));
  return files.flatMap((f) => f.vocab);
}
