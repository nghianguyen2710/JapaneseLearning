// 👤 Người dùng đọc file này để duyệt hành vi SRS (không cần đọc sm2.ts). Giải thích: docs/srs.md

import { describe, expect, it } from "vitest";
import type { CardState, Grade } from "@/lib/user-data/schema";
import { schedule } from "./sm2";

const CARD = "w0004:jv";

/** Chấm lần lượt các điểm, mỗi lần vào một ngày (giờ Việt Nam, 20:00) */
function run(steps: [date: string, grade: Grade][]): CardState {
  let state: CardState | null = null;
  for (const [date, grade] of steps) state = schedule(state, CARD, grade, `${date}T20:00:00+07:00`);
  return state!;
}

describe("Thẻ mới, lần ôn đầu tiên (ôn ngày 1/11)", () => {
  it("Quên → đến hạn lại ngay hôm nay, hệ số dễ giảm còn 2.18", () => {
    expect(run([["2026-11-01", "again"]])).toMatchObject({
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.18,
      dueDate: "2026-11-01",
    });
  });

  it("Khó → ngày mai ôn lại, hệ số dễ giảm còn 2.36", () => {
    expect(run([["2026-11-01", "hard"]])).toMatchObject({
      repetitions: 1,
      intervalDays: 1,
      easeFactor: 2.36,
      dueDate: "2026-11-02",
    });
  });

  it("Được → ngày mai ôn lại, hệ số dễ giữ 2.5", () => {
    expect(run([["2026-11-01", "good"]])).toMatchObject({
      intervalDays: 1,
      easeFactor: 2.5,
      dueDate: "2026-11-02",
    });
  });

  it("Dễ → ngày mai ôn lại, hệ số dễ tăng lên 2.6", () => {
    expect(run([["2026-11-01", "easy"]])).toMatchObject({
      intervalDays: 1,
      easeFactor: 2.6,
      dueDate: "2026-11-02",
    });
  });
});

describe("Chuỗi nhớ liên tiếp: khoảng cách tăng theo công thức", () => {
  it("Được liên tục: 1 → 6 → 15 → 38 ngày", () => {
    const steps: [string, Grade][] = [["2026-11-01", "good"]];
    expect(run(steps).dueDate).toBe("2026-11-02"); // +1
    steps.push(["2026-11-02", "good"]);
    expect(run(steps).dueDate).toBe("2026-11-08"); // +6
    steps.push(["2026-11-08", "good"]);
    expect(run(steps)).toMatchObject({ intervalDays: 15, dueDate: "2026-11-23" });
    steps.push(["2026-11-23", "good"]);
    expect(run(steps)).toMatchObject({ intervalDays: 38, dueDate: "2026-12-31" });
  });

  it("Dễ liên tục: 1 → 6 → 17 ngày, hệ số dễ 2.6 → 2.7 → 2.8", () => {
    expect(
      run([
        ["2026-11-01", "easy"],
        ["2026-11-02", "easy"],
        ["2026-11-08", "easy"],
      ]),
    ).toMatchObject({ intervalDays: 17, easeFactor: 2.8 });
  });

  it("Khó liên tục: 1 → 6 → 12 ngày, hệ số dễ 2.36 → 2.22 → 2.08", () => {
    expect(
      run([
        ["2026-11-01", "hard"],
        ["2026-11-02", "hard"],
        ["2026-11-08", "hard"],
      ]),
    ).toMatchObject({ intervalDays: 12, easeFactor: 2.08 });
  });
});

describe("Nhớ vài lần rồi quên", () => {
  const remembered: [string, Grade][] = [
    ["2026-11-01", "good"],
    ["2026-11-02", "good"],
    ["2026-11-08", "good"], // khoảng cách đang là 15 ngày
  ];

  it("Quên → về lại từ đầu, đến hạn ngay hôm đó, hệ số dễ giảm", () => {
    expect(run([...remembered, ["2026-11-23", "again"]])).toMatchObject({
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.18,
      dueDate: "2026-11-23",
    });
  });

  it("Quên rồi ôn lại trong ngày và nhớ → ngày mai, sau đó 6 ngày (bắt đầu lại 1 → 6)", () => {
    const relearn = run([...remembered, ["2026-11-23", "again"], ["2026-11-23", "good"]]);
    expect(relearn).toMatchObject({ intervalDays: 1, dueDate: "2026-11-24" });
    expect(
      run([...remembered, ["2026-11-23", "again"], ["2026-11-23", "good"], ["2026-11-24", "good"]]),
    ).toMatchObject({ intervalDays: 6, easeFactor: 2.18 });
  });

  it("Hệ số dễ không bao giờ xuống dưới 1.3, dù quên mãi", () => {
    const steps: [string, Grade][] = Array.from({ length: 10 }, () => ["2026-11-01", "again"]);
    expect(run(steps).easeFactor).toBe(1.3);
  });
});

describe("Thẻ quá hạn nhiều ngày (bỏ ôn cả tuần)", () => {
  // Đến hạn 8/11 nhưng 22/11 mới ôn (trễ 14 ngày)
  const late: [string, Grade][] = [
    ["2026-11-01", "good"],
    ["2026-11-02", "good"],
  ];

  it("Vẫn nhớ → khoảng cách tính như ôn đúng hạn (6 × 2.5 = 15), đếm từ ngày ôn thật", () => {
    expect(run([...late, ["2026-11-22", "good"]])).toMatchObject({
      intervalDays: 15,
      dueDate: "2026-12-07",
    });
  });

  it("Đã quên → về lại từ đầu như bình thường", () => {
    expect(run([...late, ["2026-11-22", "again"]])).toMatchObject({
      repetitions: 0,
      dueDate: "2026-11-22",
    });
  });
});

describe("Ngày tính theo giờ Việt Nam", () => {
  it("Ôn lúc 23:59 ngày 2/11 → đến hạn 3/11", () => {
    expect(schedule(null, CARD, "good", "2026-11-02T23:59:00+07:00").dueDate).toBe("2026-11-03");
  });

  it("Ôn lúc 00:01 ngày 3/11 → đến hạn 4/11", () => {
    expect(schedule(null, CARD, "good", "2026-11-03T00:01:00+07:00").dueDate).toBe("2026-11-04");
  });

  it("Thời điểm ghi theo UTC vẫn quy về giờ Việt Nam (17:30 UTC 2/11 = 00:30 ngày 3/11)", () => {
    expect(schedule(null, CARD, "good", "2026-11-02T17:30:00Z").dueDate).toBe("2026-11-04");
  });
});

describe("Hàm thuần", () => {
  it("Không sửa trạng thái cũ, cùng đầu vào luôn ra cùng kết quả", () => {
    const prev = run([["2026-11-01", "good"]]);
    const copy = { ...prev };
    const a = schedule(prev, CARD, "good", "2026-11-02T20:00:00+07:00");
    const b = schedule(prev, CARD, "good", "2026-11-02T20:00:00+07:00");
    expect(prev).toEqual(copy);
    expect(a).toEqual(b);
  });
});
