// Ngày giờ theo giờ Việt Nam (Asia/Ho_Chi_Minh). CLAUDE.md quy tắc 7
// Việt Nam cố định UTC+7, không có giờ mùa hè, nên cộng thẳng offset thay vì dùng Intl.

const OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Ngày YYYY-MM-DD theo giờ Việt Nam */
export type VnDate = string;

/** Ngày theo giờ Việt Nam của một thời điểm */
export function toVnDate(at: Date): VnDate {
  return new Date(at.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** ISO 8601 kèm +07:00, ví dụ 2026-11-02T21:15:03+07:00 (dùng cho reviewedAt, exportedAt) */
export function toVnIso(at: Date): string {
  return new Date(at.getTime() + OFFSET_MS).toISOString().slice(0, 19) + "+07:00";
}

/** Ngày theo giờ Việt Nam của một chuỗi ISO bất kỳ múi giờ */
export function vnDateOfIso(iso: string): VnDate {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) throw new Error(`Thời điểm không hợp lệ: ${iso}`);
  return toVnDate(at);
}

function parseVnDate(date: VnDate): number {
  if (!DATE_RE.test(date)) throw new Error(`Ngày không hợp lệ: ${date}`);
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== date) {
    throw new Error(`Ngày không hợp lệ: ${date}`);
  }
  return ms;
}

export function addDays(date: VnDate, days: number): VnDate {
  return new Date(parseVnDate(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Số ngày từ `from` đến `to` (âm nếu `to` trước `from`) */
export function daysBetween(from: VnDate, to: VnDate): number {
  return Math.round((parseVnDate(to) - parseVnDate(from)) / DAY_MS);
}
