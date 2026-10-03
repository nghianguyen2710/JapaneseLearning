// Lộ trình học (checklist.md Phần A1). Mọi mốc ngày nằm ở file này, không hard-code chỗ khác (spec.md mục 3).
// Ngày là YYYY-MM-DD theo giờ Việt Nam, hai đầu đều tính.

import type { VnDate } from "@/lib/date/vn-time";

export type PhaseId = "kana" | "minna-1-25" | "minna-26-50" | "n5-practice" | "n4-practice";

export type Phase = { id: PhaseId; label: string; start: VnDate; end: VnDate };

/** Một đoạn học đều: học xong bài `fromLesson`…`toLesson` trong khoảng `start`…`end` */
export type PaceSegment = { start: VnDate; end: VnDate; fromLesson: number; toLesson: number };

export type Milestone = { date: VnDate; label: string };

export const PHASES: Phase[] = [
  { id: "kana", label: "Kana", start: "2026-10-01", end: "2026-10-31" },
  { id: "minna-1-25", label: "Minna 1–25", start: "2026-11-01", end: "2027-02-14" },
  { id: "minna-26-50", label: "Minna 26–50", start: "2027-02-15", end: "2027-06-13" },
  { id: "n5-practice", label: "Luyện đề N5", start: "2027-06-14", end: "2027-07-04" },
  // A1 ghi "8–11/2027 luyện đề N4"; nối liền từ sau ngày thi N5 để không có khoảng trống
  { id: "n4-practice", label: "Luyện đề N4", start: "2027-07-05", end: "2027-12-05" },
];

/** Các đoạn liền nhau, bài tăng dần. Trước đoạn đầu chưa tính nhanh/chậm, sau đoạn cuối mục tiêu là xong bài 50. */
export const PACE_SEGMENTS: PaceSegment[] = [
  { start: "2026-11-01", end: "2026-11-14", fromLesson: 1, toLesson: 2 },
  { start: "2026-11-15", end: "2027-02-14", fromLesson: 3, toLesson: 25 },
  { start: "2027-02-15", end: "2027-06-13", fromLesson: 26, toLesson: 50 },
];

/** Chậm từ chừng này bài trở lên thì báo đỏ và dừng code (D7) */
export const BEHIND_ALERT_LESSONS = 3;

export const MILESTONES: Milestone[] = [
  { date: "2026-11-15", label: "Quyết định: dừng ở MVP / làm sync / bỏ app" },
  { date: "2027-02-14", label: "Checkpoint: đề N5 mẫu" },
  { date: "2027-07-04", label: "Thi N5 (dự kiến)" },
  { date: "2027-12-05", label: "Thi N4 (dự kiến)" },
];
