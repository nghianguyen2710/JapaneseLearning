// Kiểm tra hình dạng dữ liệu người dùng đọc từ storage hoặc file import (không tin dữ liệu ngoài).

import type { CardFlags, CardState, ErrorReport, Grade, ReviewLogEntry, Settings } from "./schema";

const GRADES: readonly Grade[] = ["again", "hard", "good", "easy"];
const CARD_ID_RE = /^[wg][\w-]+:jv$/;

type Obj = Record<string, unknown>;

export function isObject(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const isStr = (v: unknown): v is string => typeof v === "string";
const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));
const isNonNegInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

export function isReviewLogEntry(v: unknown): v is ReviewLogEntry {
  return (
    isObject(v) &&
    isStr(v.id) &&
    v.id.length > 0 &&
    isStr(v.cardId) &&
    CARD_ID_RE.test(v.cardId) &&
    isIso(v.reviewedAt) &&
    GRADES.includes(v.grade as Grade) &&
    typeof v.durationMs === "number" &&
    v.durationMs >= 0
  );
}

export function isCardState(v: unknown): v is CardState {
  return (
    isObject(v) &&
    isStr(v.cardId) &&
    isNonNegInt(v.repetitions) &&
    typeof v.intervalDays === "number" &&
    typeof v.easeFactor === "number" &&
    isStr(v.dueDate) &&
    isIso(v.lastReviewedAt)
  );
}

export function isErrorReport(v: unknown): v is ErrorReport {
  return (
    isObject(v) &&
    isStr(v.id) &&
    isStr(v.itemId) &&
    isStr(v.note) &&
    isIso(v.createdAt) &&
    typeof v.resolved === "boolean"
  );
}

export function isSettings(v: unknown): v is Settings {
  return (
    isObject(v) &&
    Number.isInteger(v.currentLesson) &&
    (v.currentLesson as number) >= 1 &&
    (v.currentLesson as number) <= 50 &&
    isNonNegInt(v.newCardsPerDay)
  );
}

export function isCardFlags(v: unknown): v is CardFlags {
  return (
    isObject(v) &&
    Object.entries(v).every(
      ([id, f]) => CARD_ID_RE.test(id) && isObject(f) && typeof f.suspended === "boolean",
    )
  );
}

export function isRecordOf<T>(v: unknown, check: (x: unknown) => x is T): v is Record<string, T> {
  return isObject(v) && Object.values(v).every(check);
}

export function isArrayOf<T>(v: unknown, check: (x: unknown) => x is T): v is T[] {
  return Array.isArray(v) && v.every(check);
}
