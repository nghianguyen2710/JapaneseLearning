// Số liệu cho dashboard (T3.2), hàm thuần. Quy tắc: docs/roadmap.md mục 4

import { MILESTONES, type Milestone, type Phase } from "@/config/roadmap";
import type { LessonIndex } from "@/lib/content/schema";
import { addDays, daysBetween, vnDateOfIso, type VnDate } from "@/lib/date/vn-time";
import { computePace, currentPhase, type Pace } from "@/lib/roadmap/pace";
import type { Queue } from "@/lib/srs/queue";
import type { ErrorReport, ReviewLogEntry, Settings } from "@/lib/user-data/schema";

export const RETENTION_DAYS = 7;

export type DashboardInput = {
  settings: Settings;
  today: VnDate;
  queue: Queue;
  log: ReviewLogEntry[];
  reports: ErrorReport[];
  lessonIndex: LessonIndex;
  milestones?: Milestone[];
};

export type Dashboard = {
  currentLesson: number;
  phase: Phase | null;
  pace: Pace;
  due: number;
  overdue: number;
  newAvailable: number;
  /** null nếu 7 ngày qua chưa chấm lượt nào */
  retention: { reviews: number; remembered: number; percent: number } | null;
  /** Bài đang học đã kiểm tra xong chưa */
  currentVerified: boolean;
  /** Số bài liền sau bài đang học đã kiểm tra xong (dừng ở bài đầu tiên chưa kiểm tra) */
  verifiedAhead: number;
  openReports: number;
  /** Các mốc từ hôm nay trở đi, gần nhất trước */
  upcoming: (Milestone & { daysLeft: number })[];
  /** Chưa chấm lượt nào bao giờ */
  firstDay: boolean;
};

/** Tỷ lệ nhớ: số lượt không chấm "Quên" trên tổng số lượt chấm trong 7 ngày gần nhất (tính cả hôm nay) */
export function retention7d(log: ReviewLogEntry[], today: VnDate): Dashboard["retention"] {
  const from = addDays(today, -(RETENTION_DAYS - 1));
  let reviews = 0;
  let remembered = 0;
  for (const r of log) {
    const day = vnDateOfIso(r.reviewedAt);
    if (day < from || day > today) continue;
    reviews++;
    if (r.grade !== "again") remembered++;
  }
  if (reviews === 0) return null;
  return { reviews, remembered, percent: Math.round((remembered / reviews) * 100) };
}

export function buildDashboard({
  settings,
  today,
  queue,
  log,
  reports,
  lessonIndex,
  milestones = MILESTONES,
}: DashboardInput): Dashboard {
  const verified = new Map(lessonIndex.lessons.map((l) => [l.lesson, l.fullyVerified]));
  let verifiedAhead = 0;
  while (verified.get(settings.currentLesson + verifiedAhead + 1)) verifiedAhead++;

  return {
    currentLesson: settings.currentLesson,
    phase: currentPhase(today),
    pace: computePace(settings.currentLesson, today),
    due: queue.dueCount,
    overdue: queue.overdueCount,
    newAvailable: queue.newCount,
    retention: retention7d(log, today),
    currentVerified: verified.get(settings.currentLesson) ?? false,
    verifiedAhead,
    openReports: reports.filter((r) => !r.resolved).length,
    upcoming: milestones
      .map((m) => ({ ...m, daysLeft: daysBetween(today, m.date) }))
      .filter((m) => m.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft),
    firstDay: log.length === 0,
  };
}
