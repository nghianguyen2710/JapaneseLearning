// Thao tác ghi dữ liệu người dùng ngoài review log: Báo sai, tạm ẩn thẻ (T2.6).
// Luôn đọc bản mới nhất từ storage trước khi ghi, để hai tab cùng mở không ghi đè lẫn nhau.

import { toVnIso } from "@/lib/date/vn-time";
import { newReviewId } from "@/lib/srs/review-log";
import type { Result, UserStorage } from "@/lib/storage/user-storage";
import type { CardId, ErrorReport } from "./schema";

export const MAX_REPORT_NOTE = 500;

export function addReport(
  storage: UserStorage,
  input: { itemId: string; note: string; at?: Date },
): Result<ErrorReport> {
  const at = input.at ?? new Date();
  const reports = storage.load("reports");
  if (!reports.ok) return reports;
  const report: ErrorReport = {
    id: newReviewId(at.getTime()),
    itemId: input.itemId,
    note: input.note.trim().slice(0, MAX_REPORT_NOTE),
    createdAt: toVnIso(at),
    resolved: false,
  };
  const saved = storage.save("reports", [...reports.value, report]);
  return saved.ok ? { ok: true, value: report } : saved;
}

export function setReportResolved(
  storage: UserStorage,
  reportId: string,
  resolved: boolean,
): Result<void> {
  const reports = storage.load("reports");
  if (!reports.ok) return reports;
  return storage.save(
    "reports",
    reports.value.map((r) => (r.id === reportId ? { ...r, resolved } : r)),
  );
}

export function setSuspended(
  storage: UserStorage,
  cardId: CardId,
  suspended: boolean,
): Result<void> {
  const flags = storage.load("card-flags");
  if (!flags.ok) return flags;
  const next = { ...flags.value };
  if (suspended) next[cardId] = { suspended: true };
  else delete next[cardId];
  return storage.save("card-flags", next);
}
