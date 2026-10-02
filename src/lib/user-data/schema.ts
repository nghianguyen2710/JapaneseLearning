// Dữ liệu người dùng trong localStorage (qua storage adapter). Mô tả chi tiết: docs/schema.md mục 4

import type { GrammarId, VocabId } from "@/lib/content/schema";

export const USER_SCHEMA_VERSION = 1;

/** jv = Nhật → Việt */
export type CardDirection = "jv";
export type CardId = `${VocabId | GrammarId}:${CardDirection}`;

export type Grade = "again" | "hard" | "good" | "easy";

/** Nguồn sự thật duy nhất của tiến độ ôn; chỉ ghi thêm. */
export type ReviewLogEntry = {
  id: string;
  cardId: CardId;
  /** ISO 8601 kèm +07:00 */
  reviewedAt: string;
  grade: Grade;
  durationMs: number;
};

/** Trạng thái SM-2, tính lại được hoàn toàn từ review log */
export type CardState = {
  cardId: CardId;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  /** Ngày ôn tiếp theo, YYYY-MM-DD theo giờ Việt Nam */
  dueDate: string;
  lastReviewedAt: string;
};

export type CardFlags = Record<CardId, { suspended: boolean }>;

export type ErrorReport = {
  id: string;
  itemId: VocabId | GrammarId | string;
  note: string;
  createdAt: string;
  resolved: boolean;
};

export type Settings = {
  currentLesson: number;
  newCardsPerDay: number;
};

export type ExportFile = {
  schemaVersion: typeof USER_SCHEMA_VERSION;
  app: "jp-app";
  exportedAt: string;
  data: {
    reviews: ReviewLogEntry[];
    cardFlags: CardFlags;
    reports: ErrorReport[];
    settings: Settings;
  };
};
