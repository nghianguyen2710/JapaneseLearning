"use client";

// Sao lưu: export file JSON, import có xem trước và xác nhận (T2.7).

import { useState } from "react";
import { getUserStorage } from "@/lib/storage/local-backend";
import { describeStorageError } from "@/lib/storage/user-storage";
import {
  applyImport,
  backupFileName,
  buildExport,
  parseExport,
  previewImport,
  type ImportMode,
  type ImportSummary,
} from "@/lib/user-data/backup";
import type { ExportFile } from "@/lib/user-data/schema";

type Pending = { file: ExportFile; fileName: string };
type Message = { tone: "ok" | "error"; text: string };

function download(fileName: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari cần URL còn sống một lúc sau khi click
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function BackupSection({ onImported }: { onImported: () => void }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  function exportNow() {
    const now = new Date();
    const res = buildExport(getUserStorage(), now);
    if (!res.ok) {
      setMessage({ tone: "error", text: describeStorageError(res.error) });
      return;
    }
    try {
      download(backupFileName(now), JSON.stringify(res.value, null, 2));
      setMessage({
        tone: "ok",
        text: `Đã tạo file sao lưu (${res.value.data.reviews.length} lần ôn). Hãy cất file ở nơi an toàn.`,
      });
    } catch {
      setMessage({ tone: "error", text: "Trình duyệt không cho tải file xuống." });
    }
  }

  async function pickFile(input: HTMLInputElement) {
    const selected = input.files?.[0];
    input.value = ""; // cho phép chọn lại cùng file
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const parsed = parseExport(await selected.text());
      if (!parsed.ok) {
        setPending(null);
        setMessage({ tone: "error", text: parsed.message });
        return;
      }
      setMode("merge");
      setPending({ file: parsed.file, fileName: selected.name });
    } catch {
      setMessage({ tone: "error", text: "Không đọc được file." });
    } finally {
      setBusy(false);
    }
  }

  function confirmImport() {
    if (!pending) return;
    const res = applyImport(getUserStorage(), pending.file, mode);
    if (!res.ok) {
      setMessage({
        tone: "error",
        text: `Không nhập được, dữ liệu cũ vẫn giữ nguyên. ${describeStorageError(res.error)}`,
      });
      return;
    }
    setPending(null);
    setMessage({
      tone: "ok",
      text: `Đã nhập xong. Lịch sử ôn hiện có ${res.value.reviewsAfter} lần.`,
    });
    onImported();
  }

  const preview: { ok: true; value: ImportSummary } | { ok: false; text: string } | null = pending
    ? (() => {
        const r = previewImport(getUserStorage(), pending.file, mode);
        return r.ok ? r : { ok: false, text: describeStorageError(r.error) };
      })()
    : null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">Sao lưu</h2>
      <p className="text-sm text-muted">
        Dữ liệu chỉ nằm trong trình duyệt này. Export để chuyển sang máy khác hoặc để dự phòng.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={exportNow}
          className="min-h-12 rounded-xl bg-accent font-medium text-on-accent hover:bg-accent-strong"
        >
          Tải file sao lưu
        </button>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface font-medium hover:bg-surface-muted">
          {busy ? "Đang đọc file…" : "Nhập từ file…"}
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void pickFile(e.currentTarget)}
          />
        </label>
      </div>

      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`rounded-xl border bg-surface p-3 text-sm ${
            message.tone === "error" ? "border-danger text-danger" : "border-success"
          }`}
        >
          {message.text}
        </p>
      )}

      {pending && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning bg-surface p-4 text-sm">
          <p>
            <span className="font-medium break-all">{pending.fileName}</span>
            <br />
            <span className="text-muted">
              Export lúc {pending.file.exportedAt.slice(0, 16).replace("T", " ")} ·{" "}
              {pending.file.data.reviews.length} lần ôn · {pending.file.data.reports.length} Báo sai
              · bài {pending.file.data.settings.currentLesson}
            </span>
          </p>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-medium">Cách nhập</legend>
            <label className="flex min-h-11 items-start gap-2">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
                className="mt-1"
              />
              <span>
                <b>Gộp</b> (khuyên dùng): giữ lịch sử ôn của cả máy này và file
              </span>
            </label>
            <label className="flex min-h-11 items-start gap-2">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                className="mt-1"
              />
              <span>
                <b>Ghi đè hoàn toàn</b>: xoá dữ liệu trên máy này, thay bằng file
              </span>
            </label>
          </fieldset>

          {preview &&
            (preview.ok ? (
              <p
                className={preview.value.reviewsLost > 0 ? "font-medium text-danger" : "text-muted"}
              >
                Sau khi nhập: {preview.value.reviewsAfter} lần ôn
                {preview.value.reviewsLost > 0 &&
                  ` · MẤT ${preview.value.reviewsLost} lần ôn chỉ có trên máy này`}
              </p>
            ) : (
              <p className="text-danger">
                {preview.text} Chỉ có thể dùng &quot;Ghi đè hoàn toàn&quot;.
              </p>
            ))}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="min-h-11 rounded-lg px-3 text-muted hover:bg-surface-muted"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={preview !== null && !preview.ok}
              className="min-h-11 rounded-lg bg-accent px-4 font-medium text-on-accent hover:bg-accent-strong disabled:opacity-50"
            >
              Xác nhận nhập
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
