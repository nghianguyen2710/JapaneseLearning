import { describe, expect, it } from "vitest";
import { PACE_SEGMENTS, PHASES } from "@/config/roadmap";
import { addDays, daysBetween } from "@/lib/date/vn-time";
import { computePace, currentPhase, expectedLessonsDone } from "./pace";

describe("config lộ trình", () => {
  it("các đoạn nối liền nhau, bài liền nhau, kết thúc ở bài 50", () => {
    for (let i = 1; i < PACE_SEGMENTS.length; i++) {
      expect(addDays(PACE_SEGMENTS[i - 1].end, 1)).toBe(PACE_SEGMENTS[i].start);
      expect(PACE_SEGMENTS[i - 1].toLesson + 1).toBe(PACE_SEGMENTS[i].fromLesson);
    }
    expect(PACE_SEGMENTS[0].fromLesson).toBe(1);
    expect(PACE_SEGMENTS.at(-1)?.toLesson).toBe(50);
  });

  it("các giai đoạn nối liền nhau, không chồng lên nhau", () => {
    for (let i = 1; i < PHASES.length; i++) {
      expect(addDays(PHASES[i - 1].end, 1)).toBe(PHASES[i].start);
    }
    for (const p of PHASES) expect(daysBetween(p.start, p.end)).toBeGreaterThanOrEqual(0);
  });
});

describe("expectedLessonsDone (theo lộ trình thật)", () => {
  it.each([
    ["2026-10-31", 0], // còn Kana
    ["2026-11-01", 0], // ngày đầu Minna: chưa phải xong bài nào
    ["2026-11-07", 1], // giữa đoạn 1–2 (7/14 ngày)
    ["2026-11-14", 2], // hết đoạn 1–2
    ["2026-11-15", 2], // ngày đầu đoạn 3–25: chưa tròn bài 3
    ["2027-02-14", 25], // checkpoint: xong bài 25
    ["2027-02-15", 25], // giao hai giai đoạn
    ["2027-06-13", 50], // hết Minna
    ["2027-09-01", 50], // sau lộ trình vẫn là 50
  ])("%s → %i bài", (date, expected) => {
    expect(expectedLessonsDone(date)).toBe(expected);
  });

  it("không bao giờ giảm theo ngày", () => {
    let prev = 0;
    for (let d = "2026-10-25"; d <= "2027-06-20"; d = addDays(d, 1)) {
      const now = expectedLessonsDone(d);
      expect(now).toBeGreaterThanOrEqual(prev);
      prev = now;
    }
  });
});

describe("computePace", () => {
  // Đoạn giả: bài 1–10 trong 10 ngày → mỗi ngày 1 bài
  const SEG = [{ start: "2027-01-01", end: "2027-01-10", fromLesson: 1, toLesson: 10 }];

  it("trước khi bắt đầu Minna (tháng Kana): chưa tính", () => {
    expect(computePace(1, "2026-10-20")).toEqual({ kind: "not-started", startsOn: "2026-11-01" });
  });

  it("đúng hạn: hết ngày 5 đã xong 5 bài, đang học bài 6", () => {
    expect(computePace(6, "2027-01-05", SEG)).toEqual({
      kind: "tracking",
      expectedDone: 5,
      actualDone: 5,
      diff: 0,
      alert: false,
    });
  });

  it("chậm 2 bài: chưa báo đỏ", () => {
    const pace = computePace(4, "2027-01-05", SEG);
    expect(pace).toMatchObject({ diff: -2, alert: false });
  });

  it("chậm đúng 3 bài: báo đỏ", () => {
    expect(computePace(3, "2027-01-05", SEG)).toMatchObject({ diff: -3, alert: true });
  });

  it("vượt 2 bài", () => {
    expect(computePace(8, "2027-01-05", SEG)).toMatchObject({ diff: 2, alert: false });
  });

  it("giao giữa hai giai đoạn (15/2/2027): đang học bài 26 là đúng hạn, bài 23 là chậm 3", () => {
    expect(computePace(26, "2027-02-15")).toMatchObject({ expectedDone: 25, diff: 0 });
    expect(computePace(23, "2027-02-15")).toMatchObject({ diff: -3, alert: true });
  });

  it("ngày đầu Minna (1/11/2026), đang học bài 1: đúng hạn", () => {
    expect(computePace(1, "2026-11-01")).toMatchObject({ kind: "tracking", diff: 0 });
  });

  it("sau lộ trình, đang học bài 50 (chưa xong): chậm 1", () => {
    expect(computePace(50, "2027-07-01")).toMatchObject({ expectedDone: 50, diff: -1 });
  });
});

describe("currentPhase", () => {
  it.each([
    ["2026-10-01", "kana"],
    ["2026-10-31", "kana"],
    ["2026-11-01", "minna-1-25"],
    ["2027-02-14", "minna-1-25"],
    ["2027-02-15", "minna-26-50"],
    ["2027-06-14", "n5-practice"],
    ["2027-07-04", "n5-practice"],
    ["2027-07-05", "n4-practice"],
  ])("%s → %s", (date, id) => {
    expect(currentPhase(date)?.id).toBe(id);
  });

  it("ngoài lộ trình → null", () => {
    expect(currentPhase("2026-09-30")).toBeNull();
    expect(currentPhase("2027-12-06")).toBeNull();
  });
});
