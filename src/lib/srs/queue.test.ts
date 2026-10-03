import { describe, expect, it } from "vitest";
import type { Vocab } from "@/lib/content/schema";
import type { CardState, ReviewLogEntry } from "@/lib/user-data/schema";
import { buildQueue, type QueueInput } from "./queue";

const word = (id: string, lesson: number, order: number): Vocab => ({
  id: id as Vocab["id"],
  lesson,
  order,
  kana: "あ",
  meaningVi: "a",
  kanjiChars: [],
  seeAlso: [],
  source: "deck",
  overridden: [],
  verified: false,
});

const state = (cardId: string, dueDate: string): CardState => ({
  cardId: cardId as CardState["cardId"],
  repetitions: 1,
  intervalDays: 1,
  easeFactor: 2.5,
  dueDate,
  lastReviewedAt: "2026-11-01T20:00:00+07:00",
});

const review = (cardId: string, reviewedAt: string): ReviewLogEntry => ({
  id: `${cardId}@${reviewedAt}`,
  cardId: cardId as ReviewLogEntry["cardId"],
  reviewedAt,
  grade: "good",
  durationMs: 1,
});

// Bài 1: w0001–w0005, bài 2: w0006–w0008, bài 3: w0009
const VOCAB = [
  ...[1, 2, 3, 4, 5].map((n) => word(`w000${n}`, 1, n)),
  ...[6, 7, 8].map((n) => word(`w000${n}`, 2, n - 5)),
  word("w0009", 3, 1),
];

const base = (over: Partial<QueueInput> = {}): QueueInput => ({
  vocab: VOCAB,
  states: {},
  flags: {},
  log: [],
  settings: { currentLesson: 1, newCardsPerDay: 3 },
  today: "2026-11-05",
  ...over,
});

describe("buildQueue", () => {
  it("ngày đầu: chỉ có thẻ mới của bài hiện tại, tối đa số thẻ mới mỗi ngày, theo thứ tự trong bài", () => {
    expect(buildQueue(base())).toMatchObject({
      cards: ["w0001:jv", "w0002:jv", "w0003:jv"],
      dueCount: 0,
      newCount: 3,
    });
  });

  it("không mở thẻ của bài chưa học", () => {
    const q = buildQueue(base({ settings: { currentLesson: 2, newCardsPerDay: 100 } }));
    expect(q.cards).toHaveLength(8);
    expect(q.cards).not.toContain("w0009:jv");
  });

  it("thẻ đến hạn và quá hạn đứng trước thẻ mới, quá hạn lâu nhất lên đầu", () => {
    const q = buildQueue(
      base({
        states: {
          "w0001:jv": state("w0001:jv", "2026-11-05"), // hôm nay
          "w0002:jv": state("w0002:jv", "2026-10-29"), // quá hạn 1 tuần
          "w0003:jv": state("w0003:jv", "2026-11-06"), // ngày mai, chưa đến hạn
        },
      }),
    );
    expect(q.cards).toEqual(["w0002:jv", "w0001:jv", "w0004:jv", "w0005:jv"]);
    expect(q).toMatchObject({ dueCount: 2, overdueCount: 1, newCount: 2 });
  });

  it("thẻ đến hạn không bị giới hạn số lượng, chỉ thẻ mới bị giới hạn", () => {
    const states = Object.fromEntries(
      [1, 2, 3, 4, 5].map((n) => [`w000${n}:jv`, state(`w000${n}:jv`, "2026-11-01")]),
    );
    const q = buildQueue(base({ states, settings: { currentLesson: 2, newCardsPerDay: 1 } }));
    expect(q).toMatchObject({ dueCount: 5, newCount: 1 });
  });

  it("đã mở đủ thẻ mới hôm nay thì mở lại trang không có thêm thẻ mới", () => {
    const log = ["w0001:jv", "w0002:jv", "w0003:jv"].map((id) =>
      review(id, "2026-11-05T08:00:00+07:00"),
    );
    const states = Object.fromEntries(log.map((r) => [r.cardId, state(r.cardId, "2026-11-06")]));
    expect(buildQueue(base({ log, states }))).toMatchObject({
      cards: [],
      newCount: 0,
      newIntroducedToday: 3,
    });
  });

  it("thẻ mới mở từ hôm qua không tính vào hạn mức hôm nay", () => {
    const log = [review("w0001:jv", "2026-11-04T23:59:00+07:00")];
    const states = { "w0001:jv": state("w0001:jv", "2026-11-06") };
    expect(buildQueue(base({ log, states }))).toMatchObject({
      newIntroducedToday: 0,
      newCount: 3,
    });
  });

  it("thẻ bị suspend không vào hàng đợi, kể cả khi đến hạn", () => {
    const q = buildQueue(
      base({
        states: { "w0001:jv": state("w0001:jv", "2026-11-01") },
        flags: { "w0001:jv": { suspended: true }, "w0002:jv": { suspended: true } },
      }),
    );
    expect(q.cards).toEqual(["w0003:jv", "w0004:jv", "w0005:jv"]);
  });

  it("thẻ mới mỗi ngày = 0 → chỉ ôn thẻ đến hạn", () => {
    const q = buildQueue(base({ settings: { currentLesson: 1, newCardsPerDay: 0 } }));
    expect(q.cards).toEqual([]);
  });
});
