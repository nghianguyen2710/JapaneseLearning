// Nhanh/chậm so với lộ trình (T3.1), hàm thuần. Quy tắc: docs/roadmap.md

import {
  BEHIND_ALERT_LESSONS,
  PACE_SEGMENTS,
  PHASES,
  type PaceSegment,
  type Phase,
} from "@/config/roadmap";
import { daysBetween, type VnDate } from "@/lib/date/vn-time";

export type Pace =
  /** Trước đoạn đầu (giai đoạn Kana): chưa có bài Minna nào để so */
  | { kind: "not-started"; startsOn: VnDate }
  | {
      kind: "tracking";
      /** Số bài lẽ ra đã học xong tính đến hết ngày `today` */
      expectedDone: number;
      /** Số bài đã học xong = bài đang học − 1 */
      actualDone: number;
      /** Dương là nhanh, âm là chậm, tính theo bài */
      diff: number;
      /** Chậm từ BEHIND_ALERT_LESSONS bài trở lên */
      alert: boolean;
    };

/** Số bài lẽ ra đã xong tính đến hết ngày `today`, rải đều theo ngày trong từng đoạn, làm tròn xuống */
export function expectedLessonsDone(
  today: VnDate,
  segments: PaceSegment[] = PACE_SEGMENTS,
): number {
  let done = 0;
  for (const s of segments) {
    if (daysBetween(s.start, today) < 0) break;
    const lessons = s.toLesson - s.fromLesson + 1;
    const totalDays = daysBetween(s.start, s.end) + 1;
    const elapsed = Math.min(daysBetween(s.start, today) + 1, totalDays);
    done = s.fromLesson - 1 + Math.floor((lessons * elapsed) / totalDays);
  }
  return done;
}

export function computePace(
  currentLesson: number,
  today: VnDate,
  segments: PaceSegment[] = PACE_SEGMENTS,
  alertAt: number = BEHIND_ALERT_LESSONS,
): Pace {
  if (segments.length === 0 || daysBetween(segments[0].start, today) < 0) {
    return { kind: "not-started", startsOn: segments[0]?.start ?? today };
  }
  const expectedDone = expectedLessonsDone(today, segments);
  const actualDone = currentLesson - 1;
  const diff = actualDone - expectedDone;
  return { kind: "tracking", expectedDone, actualDone, diff, alert: diff <= -alertAt };
}

/** Giai đoạn chứa ngày `today`, hoặc null nếu ngoài lộ trình */
export function currentPhase(today: VnDate, phases: Phase[] = PHASES): Phase | null {
  return (
    phases.find((p) => daysBetween(p.start, today) >= 0 && daysBetween(today, p.end) >= 0) ?? null
  );
}
