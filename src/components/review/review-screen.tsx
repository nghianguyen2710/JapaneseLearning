"use client";

// Màn hình ôn thẻ từ vựng (T2.5). Mỗi lần chấm được ghi ngay vào review log,
// nên thoát giữa chừng không mất kết quả các thẻ đã chấm.

import { useCallback, useEffect, useRef, useState } from "react";
import { toVnDate } from "@/lib/date/vn-time";
import { LESSON_COUNT, loadVocabUpTo } from "@/lib/content/load";
import type { Vocab } from "@/lib/content/schema";
import { buildQueue } from "@/lib/srs/queue";
import { loadCardStates, recordReview } from "@/lib/srs/review-log";
import { getUserStorage } from "@/lib/storage/local-backend";
import { addReport, setSuspended } from "@/lib/user-data/actions";
import { describeStorageError, type Result, type UserStorage } from "@/lib/storage/user-storage";
import type { CardId, Grade, Settings } from "@/lib/user-data/schema";
import { CardTools } from "./card-tools";
import { Flashcard } from "./flashcard";
import { useJapaneseSpeech } from "./use-speech";

const GRADE_BUTTONS: { grade: Grade; label: string; key: string; className: string }[] = [
  { grade: "again", label: "Quên", key: "1", className: "text-danger" },
  { grade: "hard", label: "Khó", key: "2", className: "text-warning" },
  { grade: "good", label: "Được", key: "3", className: "text-accent" },
  { grade: "easy", label: "Dễ", key: "4", className: "text-success" },
];
const KEY_TO_GRADE = Object.fromEntries(GRADE_BUTTONS.map((b) => [b.key, b.grade]));

type Session = {
  vocabById: Map<string, Vocab>;
  queue: CardId[];
  newIds: Set<CardId>;
  dueCount: number;
  settings: Settings;
};
type View =
  { status: "loading" } | { status: "error"; message: string } | ({ status: "ready" } & Session);

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(describeStorageError(r.error));
  return r.value;
}

async function loadSession(storage: UserStorage): Promise<Session> {
  const settings = unwrap(storage.load("settings"));
  const flags = unwrap(storage.load("card-flags"));
  const log = unwrap(storage.load("reviews"));
  const states = unwrap(loadCardStates(storage));
  const vocab = await loadVocabUpTo(settings.currentLesson);

  const queue = buildQueue({ vocab, states, flags, log, settings, today: toVnDate(new Date()) });
  return {
    vocabById: new Map(vocab.map((v) => [`${v.id}:jv`, v])),
    queue: queue.cards,
    newIds: new Set(queue.cards.slice(queue.dueCount)),
    dueCount: queue.dueCount,
    settings,
  };
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;
}

export function ReviewScreen() {
  const [view, setView] = useState<View>({ status: "loading" });
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; undo?: () => void } | null>(null);
  const shownAt = useRef(0);
  const { canSpeak, speak } = useJapaneseSpeech();

  const reload = useCallback(() => {
    let cancelled = false;
    loadSession(getUserStorage()).then(
      (session) => {
        if (cancelled) return;
        setView({ status: "ready", ...session });
        setRevealed(false);
      },
      (e: unknown) => {
        if (!cancelled)
          setView({ status: "error", message: e instanceof Error ? e.message : String(e) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => reload(), [reload]);

  const current = view.status === "ready" ? view.queue[0] : undefined;

  // Bắt đầu tính giờ trả lời mỗi khi một thẻ hiện ra (kể cả khi cùng thẻ quay lại sau "Quên")
  useEffect(() => {
    shownAt.current = performance.now();
  }, [current, doneCount]);

  const grade = useCallback(
    (g: Grade) => {
      if (view.status !== "ready" || !revealed || !current) return;
      const res = recordReview(getUserStorage(), {
        cardId: current,
        grade: g,
        durationMs: performance.now() - shownAt.current,
      });
      setSaveError(res.ok ? null : describeStorageError(res.error));
      const rest = view.queue.slice(1);
      setView({ ...view, queue: g === "again" ? [...rest, current] : rest });
      setRevealed(false);
      setNotice(null);
      setDoneCount((n) => n + 1);
    },
    [view, revealed, current],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.isComposing || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      const g = KEY_TO_GRADE[e.key];
      if (revealed && g) {
        e.preventDefault();
        grade(g);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, grade]);

  function report(note: string): boolean {
    if (!current) return false;
    const vocabId = current.split(":")[0];
    const res = addReport(getUserStorage(), { itemId: vocabId, note });
    if (!res.ok) {
      setSaveError(describeStorageError(res.error));
      return false;
    }
    setNotice({ text: "Đã ghi Báo sai. Xem lại ở trang Dữ liệu." });
    return true;
  }

  function suspend() {
    if (view.status !== "ready" || !current) return;
    const res = setSuspended(getUserStorage(), current, true);
    if (!res.ok) {
      setSaveError(describeStorageError(res.error));
      return;
    }
    const before = view;
    setView({ ...view, queue: view.queue.filter((id) => id !== current) });
    setRevealed(false);
    setNotice({
      text: "Đã tạm ẩn thẻ.",
      undo: () => {
        const undone = setSuspended(getUserStorage(), current, false);
        if (!undone.ok) {
          setSaveError(describeStorageError(undone.error));
          return;
        }
        setView(before);
        setNotice(null);
      },
    });
  }

  function changeLesson(lesson: number) {
    if (view.status !== "ready") return;
    const saved = getUserStorage().save("settings", { ...view.settings, currentLesson: lesson });
    if (!saved.ok) {
      setSaveError(describeStorageError(saved.error));
      return;
    }
    setView({ status: "loading" });
    reload();
  }

  if (view.status === "loading") {
    return (
      <div role="status" className="flex flex-1 items-center justify-center text-muted">
        Đang tải thẻ…
      </div>
    );
  }

  if (view.status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-danger bg-surface p-5">
        <p className="font-medium text-danger">Không mở được phần ôn thẻ</p>
        <p className="mt-2 text-sm">{view.message}</p>
        <button
          type="button"
          onClick={() => {
            setView({ status: "loading" });
            reload();
          }}
          className="mt-4 min-h-11 rounded-xl border border-border px-4 text-sm hover:bg-surface-muted"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const vocab = current ? view.vocabById.get(current) : undefined;
  const remaining = view.queue.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Bài đang học</span>
          <select
            value={view.settings.currentLesson}
            onChange={(e) => changeLesson(Number(e.target.value))}
            className="min-h-11 rounded-lg border border-border bg-surface px-2"
          >
            {Array.from({ length: LESSON_COUNT }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted" aria-live="polite">
          Còn <span className="font-semibold text-foreground">{remaining}</span> thẻ
          {doneCount > 0 && ` · đã chấm ${doneCount}`}
        </p>
      </header>

      {saveError && (
        <p
          role="alert"
          className="rounded-xl border border-danger bg-surface p-3 text-sm text-danger"
        >
          Kết quả chưa được lưu: {saveError}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-sm"
        >
          {notice.text}
          {notice.undo && (
            <button
              type="button"
              onClick={notice.undo}
              className="min-h-11 shrink-0 rounded-lg px-3 font-medium text-accent hover:bg-surface-muted"
            >
              Hoàn tác
            </button>
          )}
        </p>
      )}

      {!current ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-2xl">🎉</p>
          <p className="text-lg font-medium">Hôm nay đã ôn xong</p>
          <p className="text-sm text-muted">
            {doneCount > 0
              ? `Bạn đã chấm ${doneCount} lượt. Hẹn gặp lại ngày mai.`
              : "Không có thẻ nào đến hạn và đã mở đủ thẻ mới hôm nay."}
          </p>
        </div>
      ) : !vocab ? (
        // Thẻ có trong log nhưng không còn trong nội dung (không nên xảy ra vì ID không bao giờ đổi)
        <div role="alert" className="rounded-2xl border border-warning bg-surface p-5 text-sm">
          Không tìm thấy nội dung của thẻ {current}.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setView({ ...view, queue: view.queue.slice(1) })}
          >
            Bỏ qua
          </button>
        </div>
      ) : (
        <>
          <Flashcard
            vocab={vocab}
            isNew={view.newIds.has(current)}
            revealed={revealed}
            alsoInLessons={vocab.seeAlso
              .map((id) => view.vocabById.get(`${id}:jv`)?.lesson)
              .filter((l): l is number => l !== undefined)}
            canSpeak={canSpeak}
            onSpeak={() => speak(vocab.kana)}
          />

          {revealed ? (
            <div className="grid grid-cols-4 gap-2">
              {GRADE_BUTTONS.map((b) => (
                <button
                  key={b.grade}
                  type="button"
                  onClick={() => grade(b.grade)}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-xl border border-border bg-surface font-medium hover:bg-surface-muted ${b.className}`}
                >
                  {b.label}
                  <kbd className="hidden text-xs font-normal text-muted sm:inline">{b.key}</kbd>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="min-h-14 rounded-xl bg-accent font-medium text-on-accent hover:bg-accent-strong"
            >
              Hiện đáp án
              <span className="ml-2 hidden text-xs font-normal opacity-80 sm:inline">Space</span>
            </button>
          )}

          <CardTools key={`${current}#${doneCount}`} onReport={report} onSuspend={suspend} />
        </>
      )}
    </div>
  );
}
