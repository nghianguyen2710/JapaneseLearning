// Review log là nguồn sự thật duy nhất; card-state chỉ là bộ nhớ đệm (docs/schema.md mục 4).

import { toVnIso } from "@/lib/date/vn-time";
import type { UserStorage, Result } from "@/lib/storage/user-storage";
import type { CardId, CardState, Grade, ReviewLogEntry } from "@/lib/user-data/schema";
import { schedule } from "./sm2";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** ULID: 10 ký tự thời gian + 16 ký tự ngẫu nhiên, sắp xếp được theo thời gian */
export function newReviewId(now: number = Date.now()): string {
  let time = "";
  let t = now;
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32] + time;
    t = Math.floor(t / 32);
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return time + Array.from(bytes, (b) => CROCKFORD[b % 32]).join("");
}

function compareReviews(a: ReviewLogEntry, b: ReviewLogEntry): number {
  return (
    Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

/** Hợp hai log theo id rồi sắp theo thời điểm ôn. Dùng cho import và đồng bộ sau này. */
export function mergeReviewLogs(a: ReviewLogEntry[], b: ReviewLogEntry[]): ReviewLogEntry[] {
  const byId = new Map<string, ReviewLogEntry>();
  for (const r of [...a, ...b]) if (!byId.has(r.id)) byId.set(r.id, r);
  return [...byId.values()].sort(compareReviews);
}

/** Tính lại toàn bộ trạng thái thẻ từ log. Thứ tự đầu vào không quan trọng. */
export function replayReviews(log: ReviewLogEntry[]): Record<CardId, CardState> {
  const states: Record<CardId, CardState> = {};
  for (const r of [...log].sort(compareReviews)) {
    states[r.cardId] = schedule(states[r.cardId] ?? null, r.cardId, r.grade, r.reviewedAt);
  }
  return states;
}

export type RecordedReview = { entry: ReviewLogEntry; state: CardState };

/**
 * Ghi một lần chấm: thêm vào log trước (nguồn sự thật), rồi mới cập nhật bộ nhớ đệm.
 * Ghi log lỗi thì trả lỗi, không cập nhật gì. Ghi đệm lỗi thì bỏ qua, lần sau tính lại từ log.
 */
export function recordReview(
  storage: UserStorage,
  input: { cardId: CardId; grade: Grade; durationMs: number; at?: Date },
): Result<RecordedReview> {
  const at = input.at ?? new Date();
  const log = storage.load("reviews");
  if (!log.ok) return log;
  // Đọc đệm TRƯỚC khi ghi log, để đệm khớp với log cũ và không áp lần chấm này hai lần
  const cache = loadCardStates(storage);

  const entry: ReviewLogEntry = {
    id: newReviewId(at.getTime()),
    cardId: input.cardId,
    reviewedAt: toVnIso(at),
    grade: input.grade,
    durationMs: Math.max(0, Math.round(input.durationMs)),
  };
  const saved = storage.save("reviews", [...log.value, entry]);
  if (!saved.ok) return saved;

  const prev = cache.ok ? (cache.value[entry.cardId] ?? null) : null;
  const state = schedule(prev, entry.cardId, entry.grade, entry.reviewedAt);
  if (cache.ok) storage.save("card-state", { ...cache.value, [entry.cardId]: state });
  return { ok: true, value: { entry, state } };
}

/**
 * Trạng thái thẻ: dùng bộ nhớ đệm nếu còn khớp với log, không thì tính lại từ log và ghi đệm mới.
 * "Khớp" = mọi thẻ trong log đều có trong đệm với lastReviewedAt bằng lần ôn cuối trong log.
 */
export function loadCardStates(storage: UserStorage): Result<Record<CardId, CardState>> {
  const log = storage.load("reviews");
  if (!log.ok) return log;

  const lastAt = new Map<CardId, string>();
  for (const r of [...log.value].sort(compareReviews)) lastAt.set(r.cardId, r.reviewedAt);

  const cache = storage.load("card-state");
  if (
    cache.ok &&
    Object.keys(cache.value).length === lastAt.size &&
    [...lastAt].every(([id, at]) => cache.value[id]?.lastReviewedAt === at)
  ) {
    return cache;
  }

  const states = replayReviews(log.value);
  storage.save("card-state", states);
  return { ok: true, value: states };
}
