"use client";

// Dashboard tiến độ ở trang chủ (T3.2). Số liệu tính bằng buildDashboard (hàm thuần, có test).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import lessonIndexJson from "../../../content/lessons/index.json";
import { loadVocabUpTo } from "@/lib/content/load";
import { CONTENT_SCHEMA_VERSION, type LessonIndex } from "@/lib/content/schema";
import { buildDashboard, RETENTION_DAYS, type Dashboard } from "@/lib/dashboard/summary";
import { toVnDate, type VnDate } from "@/lib/date/vn-time";
import { buildQueue } from "@/lib/srs/queue";
import { loadCardStates } from "@/lib/srs/review-log";
import { getUserStorage } from "@/lib/storage/local-backend";
import { describeStorageError, type Result } from "@/lib/storage/user-storage";

type View =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Dashboard };

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(describeStorageError(r.error));
  return r.value;
}

async function loadDashboard(): Promise<Dashboard> {
  const lessonIndex = lessonIndexJson as LessonIndex;
  if (lessonIndex.schemaVersion !== CONTENT_SCHEMA_VERSION || !Array.isArray(lessonIndex.lessons)) {
    throw new Error("Mục lục nội dung sai phiên bản, cần build lại");
  }
  const storage = getUserStorage();
  const settings = unwrap(storage.load("settings"));
  const flags = unwrap(storage.load("card-flags"));
  const log = unwrap(storage.load("reviews"));
  const reports = unwrap(storage.load("reports"));
  const states = unwrap(loadCardStates(storage));
  const vocab = await loadVocabUpTo(settings.currentLesson);
  const today = toVnDate(new Date());
  const queue = buildQueue({ vocab, states, flags, log, settings, today });
  return buildDashboard({ settings, today, queue, log, reports, lessonIndex });
}

function formatDate(date: VnDate): string {
  const [y, m, d] = date.split("-");
  return `${Number(d)}/${Number(m)}/${y}`;
}

const box = "rounded-2xl border border-border bg-surface p-5";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

function PaceLine({ data }: { data: Dashboard }) {
  const { pace } = data;
  if (pace.kind === "not-started") {
    return <p className="text-sm text-muted">Bắt đầu Minna bài 1 từ {formatDate(pace.startsOn)}</p>;
  }
  const [text, tone] =
    pace.diff === 0
      ? ["Đúng tiến độ", "text-success"]
      : pace.diff > 0
        ? [`Nhanh ${pace.diff} bài`, "text-success"]
        : [`Chậm ${-pace.diff} bài`, pace.alert ? "text-danger" : "text-warning"];
  return (
    <p className="text-sm">
      <span className={`font-semibold ${tone}`}>{text}</span>
      <span className="text-muted">
        {" "}
        · mục tiêu đã xong {pace.expectedDone} bài, bạn đã xong {pace.actualDone}
      </span>
    </p>
  );
}

export function DashboardScreen() {
  const [view, setView] = useState<View>({ status: "loading" });

  const reload = useCallback(() => {
    let cancelled = false;
    loadDashboard().then(
      (data) => {
        if (!cancelled) setView({ status: "ready", data });
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

  if (view.status === "loading") {
    return (
      <div role="status" className="flex flex-1 items-center justify-center text-muted">
        Đang tải tiến độ…
      </div>
    );
  }

  if (view.status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-danger bg-surface p-5">
        <p className="font-medium text-danger">Không tải được tiến độ</p>
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
        <Link
          href="/data"
          className="mt-4 ml-2 inline-flex min-h-11 items-center rounded-xl px-4 text-sm text-accent hover:bg-surface-muted"
        >
          Mở trang Dữ liệu (khôi phục từ backup)
        </Link>
      </div>
    );
  }

  const d = view.data;
  const todayCount = d.due + d.newAvailable;

  return (
    <div className="flex flex-col gap-4">
      {d.pace.kind === "tracking" && d.pace.alert && (
        <p role="alert" className="rounded-2xl border border-danger bg-surface p-4 text-danger">
          <span className="font-semibold">Chậm {-d.pace.diff} bài so với lộ trình.</span> Dừng code,
          dồn thời gian học cho đến khi bắt kịp.
        </p>
      )}

      <section className={box}>
        <p className="text-sm text-muted">
          {d.phase ? `Giai đoạn ${d.phase.label}` : "Ngoài lộ trình"}
        </p>
        <p className="mt-1 text-xl font-semibold">Đang học bài {d.currentLesson}</p>
        <div className="mt-2">
          <PaceLine data={d} />
        </div>
      </section>

      <Link
        href="/review"
        className="flex min-h-14 items-center justify-center rounded-xl bg-accent font-medium text-on-accent hover:bg-accent-strong"
      >
        {todayCount > 0 ? `Ôn từ vựng hôm nay (${todayCount} thẻ)` : "Hôm nay đã ôn xong"}
      </Link>

      {d.firstDay ? (
        <section className={`${box} text-sm`}>
          <p className="font-medium">Chưa ôn lần nào</p>
          <p className="mt-1 text-muted">
            Mỗi ngày mở {d.newAvailable} thẻ mới. Số liệu ôn tập sẽ hiện ở đây sau lượt chấm đầu
            tiên.
          </p>
        </section>
      ) : (
        <section aria-label="Ôn tập" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Đến hạn hôm nay" value={String(d.due)} />
          <Stat
            label="Thẻ tồn"
            value={String(d.overdue)}
            tone={d.overdue > 0 ? "text-warning" : undefined}
          />
          <Stat label="Thẻ mới" value={String(d.newAvailable)} />
          <Stat
            label={`Nhớ (${RETENTION_DAYS} ngày)`}
            value={d.retention ? `${d.retention.percent}%` : "–"}
          />
        </section>
      )}

      <section aria-label="Nội dung" className={`${box} flex flex-col gap-2 text-sm`}>
        {!d.currentVerified && (
          <p className="text-warning">Bài {d.currentLesson} chưa được kiểm tra theo sách.</p>
        )}
        <p className={d.verifiedAhead === 0 && d.currentLesson < 50 ? "text-warning" : undefined}>
          Bài đã kiểm tra sẵn phía trước: <span className="font-semibold">{d.verifiedAhead}</span>
          {d.verifiedAhead === 0 && d.currentLesson < 50 && " · cần kiểm tra trước khi học tiếp"}
        </p>
        <p>
          Báo sai chưa xử lý: <span className="font-semibold">{d.openReports}</span>
          {d.openReports > 0 && (
            <Link href="/data" className="ml-2 text-accent hover:underline">
              Xem
            </Link>
          )}
        </p>
      </section>

      {d.upcoming.length > 0 && (
        <section aria-label="Đếm ngược" className={box}>
          <ul className="flex flex-col gap-2 text-sm">
            {d.upcoming.map((m) => (
              <li key={m.date} className="flex items-baseline justify-between gap-3">
                <span>
                  {m.label} <span className="text-muted">· {formatDate(m.date)}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {m.daysLeft === 0 ? "Hôm nay" : `${m.daysLeft} ngày`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/data"
        className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface text-sm hover:bg-surface-muted"
      >
        Dữ liệu: Báo sai, thẻ đã ẩn, sao lưu
      </Link>
    </div>
  );
}
