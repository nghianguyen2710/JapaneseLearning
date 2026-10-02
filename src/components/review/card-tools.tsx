"use client";

import { useState } from "react";
import { MAX_REPORT_NOTE } from "@/lib/user-data/actions";

type CardToolsProps = {
  onReport: (note: string) => boolean;
  onSuspend: () => void;
};

/** "Báo sai" (kèm ghi chú) và "Tạm ẩn" cho thẻ đang hiện. Đổi thẻ thì component được tạo lại (key). */
export function CardTools({ onReport, onSuspend }: CardToolsProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <div className="flex justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-11 rounded-lg px-3 text-muted hover:bg-surface-muted hover:text-foreground"
        >
          ⚑ Báo sai
        </button>
        <button
          type="button"
          onClick={onSuspend}
          className="min-h-11 rounded-lg px-3 text-muted hover:bg-surface-muted hover:text-foreground"
        >
          Tạm ẩn thẻ
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (onReport(note)) {
          setOpen(false);
          setNote("");
        }
      }}
    >
      <label htmlFor="report-note" className="text-sm font-medium">
        Thẻ này sai ở đâu?
      </label>
      <textarea
        id="report-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={MAX_REPORT_NOTE}
        rows={2}
        autoFocus
        placeholder="Ví dụ: nghĩa thừa dấu phẩy, sai âm Hán Việt…"
        className="rounded-lg border border-border bg-background p-2 text-base"
      />
      <div className="flex justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 rounded-lg px-3 text-muted hover:bg-surface-muted"
        >
          Huỷ
        </button>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-accent px-4 font-medium text-on-accent hover:bg-accent-strong"
        >
          Lưu
        </button>
      </div>
    </form>
  );
}
