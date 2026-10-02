// SM-2 dạng hàm thuần (CLAUDE.md quy tắc 9). Giải thích và lý do chọn tham số: docs/srs.md

import { addDays, vnDateOfIso } from "@/lib/date/vn-time";
import type { CardId, CardState, Grade } from "@/lib/user-data/schema";

/** Ánh xạ 4 nút sang thang 0–5 của SM-2 (docs/srs.md mục 1) */
export const GRADE_QUALITY: Record<Grade, number> = { again: 2, hard: 3, good: 4, easy: 5 };

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;

function nextEase(ease: number, quality: number): number {
  const q = 5 - quality;
  const raw = ease + (0.1 - q * (0.08 + q * 0.02));
  return Math.max(MIN_EASE, Math.round(raw * 100) / 100);
}

/**
 * Trạng thái mới của thẻ sau một lần chấm.
 * `prev` = null nghĩa là thẻ mới, chưa ôn lần nào.
 */
export function schedule(
  prev: CardState | null,
  cardId: CardId,
  grade: Grade,
  reviewedAt: string,
): CardState {
  const quality = GRADE_QUALITY[grade];
  const ease = nextEase(prev?.easeFactor ?? INITIAL_EASE, quality);
  const reps = prev?.repetitions ?? 0;

  let repetitions: number;
  let intervalDays: number;
  if (grade === "again") {
    // Quên: về lại từ đầu, đến hạn ngay hôm nay để ôn lại trong ngày
    repetitions = 0;
    intervalDays = 0;
  } else {
    repetitions = reps + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round((prev?.intervalDays ?? 1) * ease));
  }

  return {
    cardId,
    repetitions,
    intervalDays,
    easeFactor: ease,
    dueDate: addDays(vnDateOfIso(reviewedAt), intervalDays),
    lastReviewedAt: reviewedAt,
  };
}
