import { describe, expect, it } from "vitest";
import type { ReviewLogEntry } from "@/lib/user-data/schema";
import { memoryBackend } from "./memory-backend";
import { createUserStorage, DEFAULT_SETTINGS } from "./user-storage";

const review: ReviewLogEntry = {
  id: "r1",
  cardId: "w0004:jv",
  reviewedAt: "2026-11-02T21:15:03+07:00",
  grade: "good",
  durationMs: 4200,
};

describe("createUserStorage", () => {
  it("storage rỗng thì trả về giá trị mặc định", () => {
    const s = createUserStorage(memoryBackend());
    expect(s.load("reviews")).toEqual({ ok: true, value: [] });
    expect(s.load("settings")).toEqual({ ok: true, value: DEFAULT_SETTINGS });
  });

  it("ghi rồi đọc lại, key có namespace và schemaVersion", () => {
    const backend = memoryBackend();
    const s = createUserStorage(backend);
    expect(s.save("reviews", [review]).ok).toBe(true);
    expect(JSON.parse(backend.items["jp-app:reviews"])).toEqual({
      schemaVersion: 1,
      data: [review],
    });
    expect(s.load("reviews")).toEqual({ ok: true, value: [review] });
  });

  it("JSON hỏng thì báo corrupt và không ghi đè", () => {
    const backend = memoryBackend({ "jp-app:reviews": "{hỏng" });
    const r = createUserStorage(backend).load("reviews");
    expect(r.ok === false && r.error.kind).toBe("corrupt");
    expect(backend.items["jp-app:reviews"]).toBe("{hỏng");
  });

  it("sai cấu trúc thì báo corrupt", () => {
    const backend = memoryBackend({
      "jp-app:reviews": JSON.stringify({ schemaVersion: 1, data: [{ id: "r1", grade: "xịn" }] }),
    });
    const r = createUserStorage(backend).load("reviews");
    expect(r.ok === false && r.error.kind).toBe("corrupt");
  });

  it("thiếu schemaVersion thì báo corrupt", () => {
    const backend = memoryBackend({ "jp-app:settings": JSON.stringify(DEFAULT_SETTINGS) });
    const r = createUserStorage(backend).load("settings");
    expect(r.ok === false && r.error.kind).toBe("corrupt");
  });

  it("version mới hơn app thì báo newer-version", () => {
    const backend = memoryBackend({
      "jp-app:reviews": JSON.stringify({ schemaVersion: 2, data: [] }),
    });
    const r = createUserStorage(backend).load("reviews");
    expect(r).toEqual({ ok: false, error: { kind: "newer-version", key: "reviews", version: 2 } });
  });

  it("không có localStorage thì báo unavailable, không throw", () => {
    const s = createUserStorage(null);
    expect(s.load("reviews").ok).toBe(false);
    expect(s.save("reviews", []).ok).toBe(false);
  });

  it("backend throw khi đọc thì báo unavailable", () => {
    const s = createUserStorage({
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {},
      removeItem: () => {},
    });
    const r = s.load("reviews");
    expect(r.ok === false && r.error.kind).toBe("unavailable");
  });

  it("đầy bộ nhớ thì báo quota", () => {
    const s = createUserStorage({
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
      removeItem: () => {},
    });
    const r = s.save("reviews", [review]);
    expect(r.ok === false && r.error.kind).toBe("quota");
  });

  it("settings ngoài khoảng bài 1–50 là corrupt", () => {
    const backend = memoryBackend({
      "jp-app:settings": JSON.stringify({
        schemaVersion: 1,
        data: { currentLesson: 51, newCardsPerDay: 10 },
      }),
    });
    expect(createUserStorage(backend).load("settings").ok).toBe(false);
  });
});
