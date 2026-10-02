"use client";

// Trang Dữ liệu: các mục Báo sai và thẻ đã tạm ẩn (T2.6).

import { useCallback, useEffect, useState } from "react";
import { Jp } from "@/components/japanese";
import { loadVocabUpTo, LESSON_COUNT } from "@/lib/content/load";
import type { Vocab } from "@/lib/content/schema";
import { getUserStorage } from "@/lib/storage/local-backend";
import { describeStorageError, type Result } from "@/lib/storage/user-storage";
import { setReportResolved, setSuspended } from "@/lib/user-data/actions";
import type { CardFlags, CardId, ErrorReport } from "@/lib/user-data/schema";

type Loaded = { vocabById: Map<string, Vocab>; reports: ErrorReport[]; flags: CardFlags };
type View =
  { status: "loading" } | { status: "error"; message: string } | ({ status: "ready" } & Loaded);

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(describeStorageError(r.error));
  return r.value;
}

async function loadData(): Promise<Loaded> {
  const storage = getUserStorage();
  const reports = unwrap(storage.load("reports"));
  const flags = unwrap(storage.load("card-flags"));
  const vocab = await loadVocabUpTo(LESSON_COUNT);
  return { vocabById: new Map(vocab.map((v) => [v.id, v])), reports, flags };
}

function WordLabel({ vocab, fallbackId }: { vocab?: Vocab; fallbackId: string }) {
  if (!vocab) return <span className="text-muted">{fallbackId}</span>;
  return (
    <span>
      <Jp className="font-medium">{vocab.kanji ?? vocab.kana}</Jp>
      {vocab.kanji && <Jp className="ml-1 text-muted">({vocab.kana})</Jp>}
      <span className="ml-2 text-muted">· Bài {vocab.lesson}</span>
    </span>
  );
}

export function DataScreen() {
  const [view, setView] = useState<View>({ status: "loading" });
  const [showResolved, setShowResolved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    let cancelled = false;
    loadData().then(
      (data) => {
        if (!cancelled) setView({ status: "ready", ...data });
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

  function run(result: Result<void>) {
    if (!result.ok) {
      setActionError(describeStorageError(result.error));
      return;
    }
    setActionError(null);
    reload();
  }

  if (view.status === "loading") {
    return (
      <p role="status" className="py-10 text-center text-muted">
        Đang tải…
      </p>
    );
  }
  if (view.status === "error") {
    return (
      <p role="alert" className="rounded-2xl border border-danger bg-surface p-5 text-sm">
        <span className="font-medium text-danger">Không đọc được dữ liệu.</span> {view.message}
      </p>
    );
  }

  const reports = [...view.reports]
    .filter((r) => showResolved || !r.resolved)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const openCount = view.reports.filter((r) => !r.resolved).length;
  const suspended = (Object.keys(view.flags) as CardId[]).filter((id) => view.flags[id]?.suspended);

  return (
    <div className="flex flex-col gap-6">
      {actionError && (
        <p
          role="alert"
          className="rounded-xl border border-danger bg-surface p-3 text-sm text-danger"
        >
          {actionError}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Báo sai ({openCount} chưa xử lý)</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Hiện cả mục đã xử lý
          </label>
        </div>
        {reports.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Không có mục nào.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <WordLabel vocab={view.vocabById.get(r.itemId)} fallbackId={r.itemId} />
                  <p className="break-words">
                    {r.note || <span className="text-muted">(không có ghi chú)</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {r.itemId} · {r.createdAt.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => run(setReportResolved(getUserStorage(), r.id, !r.resolved))}
                  className="min-h-11 shrink-0 rounded-lg border border-border px-3 hover:bg-surface-muted"
                >
                  {r.resolved ? "Mở lại" : "Đã xử lý"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Thẻ đã tạm ẩn ({suspended.length})</h2>
        {suspended.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Không có thẻ nào bị ẩn.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {suspended.map((cardId) => (
              <li
                key={cardId}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm"
              >
                <WordLabel vocab={view.vocabById.get(cardId.split(":")[0])} fallbackId={cardId} />
                <button
                  type="button"
                  onClick={() => run(setSuspended(getUserStorage(), cardId, false))}
                  className="min-h-11 shrink-0 rounded-lg border border-border px-3 hover:bg-surface-muted"
                >
                  Hiện lại
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
