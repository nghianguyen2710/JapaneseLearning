import { describe, expect, it } from "vitest";
import { addDays, daysBetween, toVnDate, toVnIso, vnDateOfIso } from "./vn-time";

describe("toVnDate", () => {
  it("23:59 giờ Việt Nam vẫn là ngày hôm đó", () => {
    expect(toVnDate(new Date("2026-11-02T23:59:00+07:00"))).toBe("2026-11-02");
  });

  it("00:01 giờ Việt Nam đã sang ngày mới", () => {
    expect(toVnDate(new Date("2026-11-03T00:01:00+07:00"))).toBe("2026-11-03");
  });

  it("17:00 UTC là 00:00 hôm sau ở Việt Nam", () => {
    expect(toVnDate(new Date("2026-11-02T17:00:00Z"))).toBe("2026-11-03");
  });

  it("qua giao thừa", () => {
    expect(toVnDate(new Date("2026-12-31T17:30:00Z"))).toBe("2027-01-01");
  });
});

describe("toVnIso", () => {
  it("luôn ghi +07:00, bỏ phần mili giây", () => {
    expect(toVnIso(new Date("2026-11-02T14:15:03.456Z"))).toBe("2026-11-02T21:15:03+07:00");
  });
});

describe("vnDateOfIso", () => {
  it("đọc được chuỗi múi giờ khác", () => {
    expect(vnDateOfIso("2026-11-02T18:00:00Z")).toBe("2026-11-03");
  });

  it("báo lỗi khi chuỗi hỏng", () => {
    expect(() => vnDateOfIso("hôm qua")).toThrow();
  });
});

describe("addDays / daysBetween", () => {
  it("cộng qua cuối tháng và năm nhuận", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("trừ ngày", () => {
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("đếm số ngày giữa hai ngày", () => {
    expect(daysBetween("2026-10-01", "2027-02-14")).toBe(136);
    expect(daysBetween("2026-11-10", "2026-11-03")).toBe(-7);
  });

  it("báo lỗi với ngày không tồn tại", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow();
  });
});
