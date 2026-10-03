import { describe, expect, it } from "vitest";
import type { LessonIndex } from "@/lib/content/schema";
import type { Queue } from "@/lib/srs/queue";
import type { ErrorReport, Grade, ReviewLogEntry } from "@/lib/user-data/schema";
import { buildDashboard, retention7d, type DashboardInput } from "./summary";

const review = (reviewedAt: string, grade: Grade): ReviewLogEntry => ({
  id: `${reviewedAt}#${grade}`,
  cardId: "w0001:jv",
  reviewedAt,
  grade,
  durationMs: 1,
});

const report = (id: string, resolved: boolean): ErrorReport => ({
  id,
  itemId: "w0001",
  note: "",
  createdAt: "2026-11-01T20:00:00+07:00",
  resolved,
});

const index = (verifiedLessons: number[]): LessonIndex => ({
  schemaVersion: 1,
  lessons: Array.from({ length: 50 }, (_, i) => ({
    lesson: i + 1,
    vocabCount: 1,
    kanjiCount: 0,
    grammarCount: 0,
    verifiedCount: 0,
    fullyVerified: verifiedLessons.includes(i + 1),
  })),
});

const QUEUE: Queue = {
  cards: [],
  dueCount: 12,
  overdueCount: 4,
  newCount: 10,
  newIntroducedToday: 0,
};

const base = (over: Partial<DashboardInput> = {}): DashboardInput => ({
  settings: { currentLesson: 3, newCardsPerDay: 10 },
  today: "2026-11-20",
  queue: QUEUE,
  log: [],
  reports: [],
  lessonIndex: index([]),
  ...over,
});

describe("retention7d", () => {
  it("chưa chấm lượt nào trong 7 ngày → null", () => {
    expect(retention7d([], "2026-11-20")).toBeNull();
  });

  it("chỉ tính 7 ngày gần nhất kể cả hôm nay, theo giờ Việt Nam", () => {
    const log = [
      review("2026-11-13T23:59:00+07:00", "again"), // 8 ngày trước: không tính
      review("2026-11-13T17:30:00Z", "good"), // = 14/11 00:30 giờ VN: tính
      review("2026-11-17T20:00:00+07:00", "again"),
      review("2026-11-20T21:00:00+07:00", "hard"),
    ];
    expect(retention7d(log, "2026-11-20")).toEqual({ reviews: 3, remembered: 2, percent: 67 });
  });
});

describe("buildDashboard", () => {
  it("ngày đầu tiên: chưa có lượt ôn, chưa có tỷ lệ nhớ", () => {
    expect(buildDashboard(base())).toMatchObject({ firstDay: true, retention: null });
  });

  it("chuyển nguyên số thẻ đến hạn, tồn, mới từ hàng đợi", () => {
    expect(buildDashboard(base())).toMatchObject({ due: 12, overdue: 4, newAvailable: 10 });
  });

  it("có giai đoạn và nhanh/chậm theo lộ trình", () => {
    const d = buildDashboard(
      base({ today: "2027-02-15", settings: { currentLesson: 23, newCardsPerDay: 10 } }),
    );
    expect(d.phase?.id).toBe("minna-26-50");
    expect(d.pace).toMatchObject({ kind: "tracking", diff: -3, alert: true });
  });

  it("đếm bài đã kiểm tra liền sau bài đang học, dừng ở bài đầu tiên chưa kiểm tra", () => {
    const d = buildDashboard(base({ lessonIndex: index([1, 2, 3, 4, 5, 7]) }));
    expect(d).toMatchObject({ currentVerified: true, verifiedAhead: 2 });
  });

  it("không có bài nào phía trước đã kiểm tra → 0", () => {
    expect(buildDashboard(base({ lessonIndex: index([3, 5]) }))).toMatchObject({
      currentVerified: true,
      verifiedAhead: 0,
    });
  });

  it("đang học bài 50: không có bài phía trước", () => {
    const d = buildDashboard(
      base({ settings: { currentLesson: 50, newCardsPerDay: 10 }, lessonIndex: index([50]) }),
    );
    expect(d).toMatchObject({ currentVerified: true, verifiedAhead: 0 });
  });

  it("chỉ đếm Báo sai chưa xử lý", () => {
    const reports = [report("a", false), report("b", true), report("c", false)];
    expect(buildDashboard(base({ reports })).openReports).toBe(2);
  });

  it("đếm ngược: chỉ các mốc từ hôm nay trở đi, gần nhất trước; mốc hôm nay còn 0 ngày", () => {
    const milestones = [
      { date: "2027-07-04", label: "Thi N5" },
      { date: "2026-11-15", label: "Đã qua" },
      { date: "2027-02-14", label: "Checkpoint" },
      { date: "2026-11-20", label: "Hôm nay" },
    ];
    expect(buildDashboard(base({ milestones })).upcoming).toEqual([
      { date: "2026-11-20", label: "Hôm nay", daysLeft: 0 },
      { date: "2027-02-14", label: "Checkpoint", daysLeft: 86 },
      { date: "2027-07-04", label: "Thi N5", daysLeft: 226 },
    ]);
  });
});
