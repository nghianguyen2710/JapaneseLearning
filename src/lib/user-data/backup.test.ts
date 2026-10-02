import { describe, expect, it } from "vitest";
import { memoryBackend } from "@/lib/storage/memory-backend";
import { createUserStorage, type KeyValueBackend } from "@/lib/storage/user-storage";
import { loadCardStates, replayReviews } from "@/lib/srs/review-log";
import type { ReviewLogEntry } from "./schema";
import { applyImport, backupFileName, buildExport, parseExport, previewImport } from "./backup";

const rv = (id: string, at: string): ReviewLogEntry => ({
  id,
  cardId: "w0001:jv",
  reviewedAt: at,
  grade: "good",
  durationMs: 1000,
});

function seededStorage() {
  const backend = memoryBackend();
  const storage = createUserStorage(backend);
  storage.save("reviews", [
    rv("a", "2026-11-01T20:00:00+07:00"),
    rv("b", "2026-11-02T20:00:00+07:00"),
  ]);
  storage.save("card-flags", { "w0002:jv": { suspended: true } });
  storage.save("reports", [
    {
      id: "p1",
      itemId: "w0003",
      note: "sai",
      createdAt: "2026-11-01T20:00:00+07:00",
      resolved: false,
    },
  ]);
  storage.save("settings", { currentLesson: 3, newCardsPerDay: 12 });
  return { backend, storage };
}

const AT = new Date("2026-11-02T14:15:00Z");

describe("backupFileName", () => {
  it("có ngày và giờ theo giờ Việt Nam", () => {
    expect(backupFileName(AT)).toBe("jp-app-backup-2026-11-02-2115.json");
  });
});

describe("export → import", () => {
  it("export trên máy A rồi import (ghi đè) vào máy B trống → dữ liệu giống hệt", () => {
    const { storage: a } = seededStorage();
    const exported = buildExport(a, AT);
    if (!exported.ok) throw new Error();
    expect(exported.value).toMatchObject({
      schemaVersion: 1,
      app: "jp-app",
      exportedAt: "2026-11-02T21:15:00+07:00",
    });

    const text = JSON.stringify(exported.value);
    const parsed = parseExport(text);
    if (!parsed.ok) throw new Error(parsed.message);

    const b = createUserStorage(memoryBackend());
    expect(applyImport(b, parsed.file, "replace").ok).toBe(true);
    const again = buildExport(b, AT);
    expect(again.ok && again.value).toEqual(exported.value);
  });

  it("file export không chứa trạng thái thẻ (tính lại được từ log)", () => {
    const { storage } = seededStorage();
    const exported = buildExport(storage, AT);
    expect(exported.ok && Object.keys(exported.value.data).sort()).toEqual([
      "cardFlags",
      "reports",
      "reviews",
      "settings",
    ]);
  });

  it("sau khi import, trạng thái thẻ được tính lại từ log mới", () => {
    const { storage: a } = seededStorage();
    const exported = buildExport(a, AT);
    if (!exported.ok) throw new Error();
    const b = createUserStorage(memoryBackend());
    b.save("card-state", {}); // đệm cũ
    applyImport(b, exported.value, "replace");
    const reviews = b.load("reviews");
    expect(loadCardStates(b)).toEqual({
      ok: true,
      value: replayReviews(reviews.ok ? reviews.value : []),
    });
  });
});

describe("Gộp (merge)", () => {
  it("hợp lịch sử ôn của hai máy theo id, không mất lần nào", () => {
    const { storage: mac } = seededStorage();
    const iphone = createUserStorage(memoryBackend());
    iphone.save("reviews", [
      rv("b", "2026-11-02T20:00:00+07:00"), // trùng với Mac
      rv("c", "2026-11-03T07:00:00+07:00"), // chỉ có trên iPhone
    ]);
    const file = buildExport(iphone, AT);
    if (!file.ok) throw new Error();

    const preview = previewImport(mac, file.value, "merge");
    expect(preview.ok && preview.value).toMatchObject({ reviewsAfter: 3, reviewsLost: 0 });

    applyImport(mac, file.value, "merge");
    const after = mac.load("reviews");
    expect(after.ok && after.value.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("thẻ ẩn lấy hợp hai bên, Báo sai đã xử lý ở một bên thì là đã xử lý, cài đặt theo file", () => {
    const { storage: mac } = seededStorage();
    const other = createUserStorage(memoryBackend());
    other.save("card-flags", { "w0009:jv": { suspended: true } });
    other.save("reports", [
      {
        id: "p1",
        itemId: "w0003",
        note: "sai",
        createdAt: "2026-11-01T20:00:00+07:00",
        resolved: true,
      },
    ]);
    other.save("settings", { currentLesson: 4, newCardsPerDay: 10 });
    const file = buildExport(other, AT);
    if (!file.ok) throw new Error();

    applyImport(mac, file.value, "merge");
    const exported = buildExport(mac, AT);
    expect(exported.ok && exported.value.data).toMatchObject({
      cardFlags: { "w0002:jv": { suspended: true }, "w0009:jv": { suspended: true } },
      reports: [{ id: "p1", resolved: true }],
      settings: { currentLesson: 4 },
    });
  });

  it("ghi đè thì báo trước số lần ôn trên máy này sẽ mất", () => {
    const { storage: mac } = seededStorage();
    const file = buildExport(createUserStorage(memoryBackend()), AT);
    if (!file.ok) throw new Error();
    const preview = previewImport(mac, file.value, "replace");
    expect(preview.ok && preview.value).toMatchObject({ reviewsAfter: 0, reviewsLost: 2 });
  });
});

describe("parseExport: file sai thì báo lỗi rõ ràng", () => {
  const valid = () => {
    const { storage } = seededStorage();
    const r = buildExport(storage, AT);
    if (!r.ok) throw new Error();
    return r.value;
  };

  it("không phải JSON", () => {
    expect(parseExport("xin chào")).toEqual({ ok: false, message: "File không phải JSON hợp lệ." });
  });

  it("file của app khác", () => {
    const r = parseExport(JSON.stringify({ ...valid(), app: "anki" }));
    expect(r.ok).toBe(false);
  });

  it("bản app mới hơn", () => {
    const r = parseExport(JSON.stringify({ ...valid(), schemaVersion: 2 }));
    expect(r.ok === false && r.message).toContain("mới hơn");
  });

  it("lịch sử ôn bị hỏng → nêu tên phần hỏng", () => {
    const f = valid();
    const r = parseExport(
      JSON.stringify({ ...f, data: { ...f.data, reviews: [{ id: "x", grade: "tuyệt" }] } }),
    );
    expect(r.ok === false && r.message).toContain("lịch sử ôn");
  });
});

describe("An toàn khi ghi", () => {
  it("file sai không động vào dữ liệu cũ (parse lỗi thì không gọi applyImport)", () => {
    const { backend } = seededStorage();
    const before = { ...backend.items };
    expect(parseExport("{").ok).toBe(false);
    expect(backend.items).toEqual(before);
  });

  it("ghi lỗi giữa chừng → khôi phục dữ liệu cũ", () => {
    const { backend } = seededStorage();
    const before = { ...backend.items };
    let writes = 0;
    const flaky: KeyValueBackend = {
      getItem: backend.getItem,
      removeItem: backend.removeItem,
      setItem: (k, v) => {
        writes++;
        if (writes === 3) throw new DOMException("full", "QuotaExceededError");
        backend.setItem(k, v);
      },
    };
    const storage = createUserStorage(flaky);
    const file = buildExport(createUserStorage(memoryBackend()), AT);
    if (!file.ok) throw new Error();
    const res = applyImport(storage, file.value, "replace");
    expect(res.ok === false && res.error.kind).toBe("quota");
    expect(backend.items).toEqual(before);
  });

  it("dữ liệu trên máy bị hỏng: không gộp được, nhưng ghi đè được (để khôi phục từ backup)", () => {
    const { backend } = seededStorage();
    backend.items["jp-app:reviews"] = "hỏng";
    const storage = createUserStorage(backend);
    const file = buildExport(createUserStorage(memoryBackend()), AT);
    if (!file.ok) throw new Error();
    expect(applyImport(storage, file.value, "merge").ok).toBe(false);
    expect(backend.items["jp-app:reviews"]).toBe("hỏng");
    expect(applyImport(storage, file.value, "replace").ok).toBe(true);
    expect(storage.load("reviews")).toEqual({ ok: true, value: [] });
  });
});
