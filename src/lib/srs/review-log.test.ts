import { describe, expect, it } from "vitest";
import { memoryBackend } from "@/lib/storage/memory-backend";
import { createUserStorage } from "@/lib/storage/user-storage";
import type { CardId, Grade, ReviewLogEntry } from "@/lib/user-data/schema";
import {
  loadCardStates,
  mergeReviewLogs,
  newReviewId,
  recordReview,
  replayReviews,
} from "./review-log";
import { schedule } from "./sm2";

const r = (id: string, cardId: CardId, reviewedAt: string, grade: Grade): ReviewLogEntry => ({
  id,
  cardId,
  reviewedAt,
  grade,
  durationMs: 1000,
});

const LOG: ReviewLogEntry[] = [
  r("a", "w0001:jv", "2026-11-01T20:00:00+07:00", "good"),
  r("b", "w0002:jv", "2026-11-01T20:01:00+07:00", "again"),
  r("c", "w0002:jv", "2026-11-01T20:05:00+07:00", "good"),
  r("d", "w0001:jv", "2026-11-02T20:00:00+07:00", "good"),
  r("e", "w0001:jv", "2026-11-08T20:00:00+07:00", "hard"),
];

describe("replayReviews", () => {
  it("cho kết quả giống hệt khi chấm lần lượt từng thẻ", () => {
    let w1 = schedule(null, "w0001:jv", "good", LOG[0].reviewedAt);
    w1 = schedule(w1, "w0001:jv", "good", LOG[3].reviewedAt);
    w1 = schedule(w1, "w0001:jv", "hard", LOG[4].reviewedAt);
    expect(replayReviews(LOG)["w0001:jv"]).toEqual(w1);
  });

  it("không phụ thuộc thứ tự log (log gộp từ hai máy)", () => {
    expect(replayReviews([...LOG].reverse())).toEqual(replayReviews(LOG));
  });

  it("log rỗng → không có thẻ nào", () => {
    expect(replayReviews([])).toEqual({});
  });
});

describe("mergeReviewLogs", () => {
  it("hợp theo id, bỏ trùng, sắp theo thời điểm", () => {
    const mac = [LOG[0], LOG[3]];
    const iphone = [LOG[3], LOG[1], LOG[4]];
    expect(mergeReviewLogs(mac, iphone).map((x) => x.id)).toEqual(["a", "b", "d", "e"]);
  });

  it("so thời điểm đúng dù khác múi giờ", () => {
    const utc = r("z", "w0003:jv", "2026-11-01T12:30:00Z", "good"); // = 19:30 giờ Việt Nam
    expect(mergeReviewLogs(LOG, [utc]).map((x) => x.id)[0]).toBe("z");
  });
});

describe("newReviewId", () => {
  it("26 ký tự, id sau lớn hơn id trước", () => {
    const a = newReviewId(1_790_000_000_000);
    const b = newReviewId(1_790_000_000_001);
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(a < b).toBe(true);
  });
});

describe("recordReview", () => {
  it("ghi log kèm +07:00 và cập nhật bộ nhớ đệm", () => {
    const backend = memoryBackend();
    const storage = createUserStorage(backend);
    const res = recordReview(storage, {
      cardId: "w0001:jv",
      grade: "good",
      durationMs: 3200.4,
      at: new Date("2026-11-01T13:00:00Z"),
    });
    expect(res.ok).toBe(true);
    const log = storage.load("reviews");
    expect(log.ok && log.value).toMatchObject([
      { cardId: "w0001:jv", reviewedAt: "2026-11-01T20:00:00+07:00", durationMs: 3200 },
    ]);
    const cache = storage.load("card-state");
    expect(cache.ok && cache.value["w0001:jv"]?.dueDate).toBe("2026-11-02");
  });

  it("chấm nhiều lần: đệm luôn bằng kết quả tính lại từ log (không áp trùng)", () => {
    const storage = createUserStorage(memoryBackend());
    const days = ["2026-11-01", "2026-11-02", "2026-11-08"];
    for (const d of days) {
      recordReview(storage, {
        cardId: "w0001:jv",
        grade: "good",
        durationMs: 1,
        at: new Date(`${d}T20:00:00+07:00`),
      });
    }
    const log = storage.load("reviews");
    const cache = storage.load("card-state");
    expect(cache.ok && cache.value).toEqual(log.ok && replayReviews(log.value));
    expect(cache.ok && cache.value["w0001:jv"]?.intervalDays).toBe(15);
  });

  it("ghi log lỗi → trả lỗi, không cập nhật đệm", () => {
    const backend = memoryBackend();
    const storage = createUserStorage({
      ...backend,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    const res = recordReview(storage, { cardId: "w0001:jv", grade: "good", durationMs: 1 });
    expect(res.ok === false && res.error.kind).toBe("quota");
    expect(backend.items).toEqual({});
  });

  it("log hỏng → trả lỗi, không ghi đè log", () => {
    const backend = memoryBackend({ "jp-app:reviews": "{hỏng" });
    const res = recordReview(createUserStorage(backend), {
      cardId: "w0001:jv",
      grade: "good",
      durationMs: 1,
    });
    expect(res.ok).toBe(false);
    expect(backend.items["jp-app:reviews"]).toBe("{hỏng");
  });
});

describe("loadCardStates (Checkpoint 2: xoá trạng thái thẻ rồi tính lại từ log)", () => {
  function seeded() {
    const backend = memoryBackend();
    const storage = createUserStorage(backend);
    storage.save("reviews", LOG);
    storage.save("card-state", replayReviews(LOG));
    return { backend, storage };
  }

  it("xoá đệm → tính lại ra kết quả giống hệt", () => {
    const { storage } = seeded();
    const before = storage.load("card-state");
    storage.remove("card-state");
    expect(loadCardStates(storage)).toEqual(before);
  });

  it("đệm hỏng → tính lại từ log và ghi đè đệm", () => {
    const { backend, storage } = seeded();
    backend.items["jp-app:card-state"] = "rác";
    const res = loadCardStates(storage);
    expect(res).toEqual({ ok: true, value: replayReviews(LOG) });
    expect(storage.load("card-state").ok).toBe(true);
  });

  it("đệm lệch log (thiếu lần ôn cuối) → tính lại", () => {
    const { storage } = seeded();
    storage.save("card-state", replayReviews(LOG.slice(0, 4)));
    expect(loadCardStates(storage)).toEqual({ ok: true, value: replayReviews(LOG) });
  });

  it("chưa ôn lần nào → rỗng", () => {
    expect(loadCardStates(createUserStorage(memoryBackend()))).toEqual({ ok: true, value: {} });
  });
});
