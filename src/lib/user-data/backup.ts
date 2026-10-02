// Export/import file sao lưu (T2.7). Định dạng: docs/schema.md mục 4.2.
// Import luôn kiểm tra hợp lệ trước; ghi lỗi giữa chừng thì khôi phục dữ liệu cũ.

import { toVnIso } from "@/lib/date/vn-time";
import { mergeReviewLogs } from "@/lib/srs/review-log";
import type { Result, StorageKey, UserData, UserStorage } from "@/lib/storage/user-storage";
import { USER_SCHEMA_VERSION, type ErrorReport, type ExportFile } from "./schema";
import {
  isArrayOf,
  isCardFlags,
  isErrorReport,
  isObject,
  isReviewLogEntry,
  isSettings,
} from "./validate";

export type BackupData = ExportFile["data"];
export type ImportMode = "merge" | "replace";

/** jp-app-backup-2026-11-02-2115.json (giờ Việt Nam) */
export function backupFileName(at: Date): string {
  const iso = toVnIso(at); // 2026-11-02T21:15:03+07:00
  return `jp-app-backup-${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}.json`;
}

export function buildExport(storage: UserStorage, at: Date = new Date()): Result<ExportFile> {
  const reviews = storage.load("reviews");
  if (!reviews.ok) return reviews;
  const cardFlags = storage.load("card-flags");
  if (!cardFlags.ok) return cardFlags;
  const reports = storage.load("reports");
  if (!reports.ok) return reports;
  const settings = storage.load("settings");
  if (!settings.ok) return settings;
  return {
    ok: true,
    value: {
      schemaVersion: USER_SCHEMA_VERSION,
      app: "jp-app",
      exportedAt: toVnIso(at),
      data: {
        reviews: reviews.value,
        cardFlags: cardFlags.value,
        reports: reports.value,
        settings: settings.value,
      },
    },
  };
}

export type ParseResult = { ok: true; file: ExportFile } | { ok: false; message: string };

/** Đọc và kiểm tra nội dung file. Không ghi gì vào storage. */
export function parseExport(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: "File không phải JSON hợp lệ." };
  }
  if (!isObject(raw) || raw.app !== "jp-app") {
    return { ok: false, message: "Đây không phải file sao lưu của app này." };
  }
  if (!Number.isInteger(raw.schemaVersion)) {
    return { ok: false, message: "File thiếu schemaVersion." };
  }
  if ((raw.schemaVersion as number) > USER_SCHEMA_VERSION) {
    return {
      ok: false,
      message: `File được tạo bởi bản app mới hơn (v${raw.schemaVersion}). Hãy cập nhật app trước.`,
    };
  }
  // Hiện chỉ có v1. Khi có v2: migrate raw.data tại đây trước khi kiểm tra.
  const data = raw.data;
  if (!isObject(data)) return { ok: false, message: "File thiếu phần dữ liệu." };

  const problems: string[] = [];
  if (!isArrayOf(data.reviews, isReviewLogEntry)) problems.push("lịch sử ôn");
  if (!isCardFlags(data.cardFlags)) problems.push("thẻ đã ẩn");
  if (!isArrayOf(data.reports, isErrorReport)) problems.push("Báo sai");
  if (!isSettings(data.settings)) problems.push("cài đặt");
  if (problems.length > 0) {
    return { ok: false, message: `Dữ liệu trong file bị hỏng: ${problems.join(", ")}.` };
  }
  if (typeof raw.exportedAt !== "string") {
    return { ok: false, message: "File thiếu thời điểm export." };
  }
  return { ok: true, file: raw as ExportFile };
}

function mergeReports(a: ErrorReport[], b: ErrorReport[]): ErrorReport[] {
  const byId = new Map<string, ErrorReport>();
  for (const r of [...a, ...b]) {
    const prev = byId.get(r.id);
    byId.set(r.id, prev ? { ...prev, resolved: prev.resolved || r.resolved } : r);
  }
  return [...byId.values()].sort((x, y) => (x.createdAt < y.createdAt ? -1 : 1));
}

/**
 * merge: hợp lịch sử ôn và Báo sai theo id (không mất lần ôn nào của cả hai máy),
 *        thẻ ẩn lấy hợp của hai bên, cài đặt lấy theo file.
 * replace: lấy nguyên dữ liệu trong file.
 */
export function combine(local: BackupData, incoming: BackupData, mode: ImportMode): BackupData {
  if (mode === "replace") return incoming;
  return {
    reviews: mergeReviewLogs(local.reviews, incoming.reviews),
    cardFlags: { ...local.cardFlags, ...incoming.cardFlags },
    reports: mergeReports(local.reports, incoming.reports),
    settings: incoming.settings,
  };
}

export type ImportSummary = {
  mode: ImportMode;
  reviewsInFile: number;
  reviewsAfter: number;
  /** Số lần ôn trên máy này sẽ mất (chỉ khác 0 khi ghi đè) */
  reviewsLost: number;
};

/** Ghi dữ liệu import. Lỗi giữa chừng thì khôi phục các key đã ghi về giá trị cũ. */
export function applyImport(
  storage: UserStorage,
  file: ExportFile,
  mode: ImportMode,
): Result<ImportSummary> {
  const keys = ["settings", "card-flags", "reports", "reviews"] as const;
  const previous: Partial<{ [K in StorageKey]: UserData[K] }> = {};
  for (const key of keys) {
    const r = storage.load(key);
    if (r.ok) (previous as Record<string, unknown>)[key] = r.value;
    else if (mode === "merge") return r; // Không gộp được với dữ liệu hỏng; dùng "replace"
  }

  const local: BackupData = {
    reviews: previous.reviews ?? [],
    cardFlags: previous["card-flags"] ?? {},
    reports: previous.reports ?? [],
    settings: file.data.settings,
  };
  const next = combine(local, file.data, mode);
  const values: { [K in (typeof keys)[number]]: UserData[K] } = {
    settings: next.settings,
    "card-flags": next.cardFlags,
    reports: next.reports,
    reviews: next.reviews,
  };

  const written: StorageKey[] = [];
  for (const key of keys) {
    const saved = storage.save(key, values[key] as never);
    if (!saved.ok) {
      for (const k of written) {
        const old = previous[k];
        if (old === undefined) storage.remove(k);
        else storage.save(k, old as never);
      }
      return saved;
    }
    written.push(key);
  }
  // Bộ nhớ đệm trạng thái thẻ sẽ được tính lại từ log mới ở lần mở tiếp theo
  storage.remove("card-state");

  const nextIds = new Set(next.reviews.map((r) => r.id));
  return {
    ok: true,
    value: {
      mode,
      reviewsInFile: file.data.reviews.length,
      reviewsAfter: next.reviews.length,
      reviewsLost: local.reviews.filter((r) => !nextIds.has(r.id)).length,
    },
  };
}

/** Dự kiến kết quả trước khi người dùng xác nhận (không ghi gì) */
export function previewImport(
  storage: UserStorage,
  file: ExportFile,
  mode: ImportMode,
): Result<ImportSummary> {
  const reviews = storage.load("reviews");
  const localReviews = reviews.ok ? reviews.value : [];
  if (!reviews.ok && mode === "merge") return reviews;
  const after =
    mode === "replace" ? file.data.reviews : mergeReviewLogs(localReviews, file.data.reviews);
  const afterIds = new Set(after.map((r) => r.id));
  return {
    ok: true,
    value: {
      mode,
      reviewsInFile: file.data.reviews.length,
      reviewsAfter: after.length,
      reviewsLost: localReviews.filter((r) => !afterIds.has(r.id)).length,
    },
  };
}
