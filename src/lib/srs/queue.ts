// Hàng đợi ôn hôm nay (T2.4), hàm thuần. Quy tắc: docs/srs.md mục 4

import { vnDateOfIso, type VnDate } from "@/lib/date/vn-time";
import type { Vocab } from "@/lib/content/schema";
import type {
  CardFlags,
  CardId,
  CardState,
  ReviewLogEntry,
  Settings,
} from "@/lib/user-data/schema";

export const cardIdOf = (vocabId: Vocab["id"]): CardId => `${vocabId}:jv`;

export type QueueInput = {
  /** Từ vựng của mọi bài đã tải (thứ tự không quan trọng) */
  vocab: Vocab[];
  states: Record<CardId, CardState>;
  flags: CardFlags;
  log: ReviewLogEntry[];
  settings: Settings;
  today: VnDate;
};

export type Queue = {
  /** Thẻ đến hạn trước (quá hạn lâu nhất lên đầu), rồi đến thẻ mới (theo bài, theo thứ tự trong bài) */
  cards: CardId[];
  dueCount: number;
  newCount: number;
  /** Số thẻ mới đã mở hôm nay (trước phiên này) */
  newIntroducedToday: number;
};

export function buildQueue({ vocab, states, flags, log, settings, today }: QueueInput): Queue {
  const unlocked = vocab
    .filter((v) => v.lesson <= settings.currentLesson && !flags[cardIdOf(v.id)]?.suspended)
    .sort((a, b) => a.lesson - b.lesson || a.order - b.order);

  // Thẻ mới đã mở hôm nay = thẻ có lần ôn đầu tiên rơi vào hôm nay
  const firstReviewDay = new Map<CardId, VnDate>();
  for (const r of log) {
    const day = vnDateOfIso(r.reviewedAt);
    const prev = firstReviewDay.get(r.cardId);
    if (!prev || day < prev) firstReviewDay.set(r.cardId, day);
  }
  let newIntroducedToday = 0;
  for (const day of firstReviewDay.values()) if (day === today) newIntroducedToday++;

  const due: CardState[] = [];
  const fresh: CardId[] = [];
  for (const v of unlocked) {
    const id = cardIdOf(v.id);
    const state = states[id];
    if (state) {
      if (state.dueDate <= today) due.push(state);
    } else {
      fresh.push(id);
    }
  }
  due.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  const newBudget = Math.max(0, settings.newCardsPerDay - newIntroducedToday);
  const newCards = fresh.slice(0, newBudget);

  return {
    cards: [...due.map((s) => s.cardId), ...newCards],
    dueCount: due.length,
    newCount: newCards.length,
    newIntroducedToday,
  };
}
