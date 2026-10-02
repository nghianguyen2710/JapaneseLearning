import { describe, expect, it } from "vitest";
import { memoryBackend } from "@/lib/storage/memory-backend";
import { createUserStorage } from "@/lib/storage/user-storage";
import { addReport, MAX_REPORT_NOTE, setReportResolved, setSuspended } from "./actions";

const AT = new Date("2026-11-02T14:00:00Z");

describe("addReport", () => {
  it("lưu mục Báo sai kèm thời điểm +07:00, chưa xử lý", () => {
    const storage = createUserStorage(memoryBackend());
    const res = addReport(storage, { itemId: "w0003", note: "  thừa dấu phẩy  ", at: AT });
    expect(res.ok && res.value).toMatchObject({
      itemId: "w0003",
      note: "thừa dấu phẩy",
      createdAt: "2026-11-02T21:00:00+07:00",
      resolved: false,
    });
    const all = storage.load("reports");
    expect(all.ok && all.value).toHaveLength(1);
  });

  it("cắt ghi chú quá dài", () => {
    const storage = createUserStorage(memoryBackend());
    const res = addReport(storage, { itemId: "w0003", note: "a".repeat(2000) });
    expect(res.ok && res.value.note).toHaveLength(MAX_REPORT_NOTE);
  });

  it("dữ liệu hỏng thì không ghi đè", () => {
    const backend = memoryBackend({ "jp-app:reports": "rác" });
    expect(addReport(createUserStorage(backend), { itemId: "w0003", note: "x" }).ok).toBe(false);
    expect(backend.items["jp-app:reports"]).toBe("rác");
  });
});

describe("setReportResolved", () => {
  it("đánh dấu đã xử lý và bỏ đánh dấu", () => {
    const storage = createUserStorage(memoryBackend());
    const r = addReport(storage, { itemId: "w0003", note: "x" });
    if (!r.ok) throw new Error();
    setReportResolved(storage, r.value.id, true);
    let all = storage.load("reports");
    expect(all.ok && all.value[0].resolved).toBe(true);
    setReportResolved(storage, r.value.id, false);
    all = storage.load("reports");
    expect(all.ok && all.value[0].resolved).toBe(false);
  });
});

describe("setSuspended", () => {
  it("ẩn rồi hiện lại thẻ", () => {
    const storage = createUserStorage(memoryBackend());
    setSuspended(storage, "w0001:jv", true);
    expect(storage.load("card-flags")).toEqual({
      ok: true,
      value: { "w0001:jv": { suspended: true } },
    });
    setSuspended(storage, "w0001:jv", false);
    expect(storage.load("card-flags")).toEqual({ ok: true, value: {} });
  });
});
