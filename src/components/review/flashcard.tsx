import type { Vocab } from "@/lib/content/schema";
import { Furigana, Jp } from "@/components/japanese";

type FlashcardProps = {
  vocab: Vocab;
  isNew: boolean;
  revealed: boolean;
  /** Bài của các lần xuất hiện khác (seeAlso), chỉ những bài đã tải */
  alsoInLessons: number[];
  canSpeak: boolean;
  onSpeak: () => void;
};

/** Mặt trước: chữ viết. Mặt sau: cách đọc, nghĩa, âm Hán Việt, nghĩa tiếng Anh, phát âm. */
export function Flashcard({
  vocab,
  isNew,
  revealed,
  alsoInLessons,
  canSpeak,
  onSpeak,
}: FlashcardProps) {
  return (
    <article className="flex min-h-72 flex-col rounded-2xl border border-border bg-surface p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface-muted px-2 py-0.5">Bài {vocab.lesson}</span>
        {isNew && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-accent">Thẻ mới</span>
        )}
        {!vocab.verified && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-warning">
            Chưa kiểm tra
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        {revealed ? (
          <Furigana
            text={vocab.kanji}
            reading={vocab.kana}
            className="text-4xl leading-loose break-all sm:text-5xl"
          />
        ) : (
          <Jp className="text-4xl leading-loose break-all sm:text-5xl">
            {vocab.kanji ?? vocab.kana}
          </Jp>
        )}

        {revealed && (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-xl font-medium">
              {vocab.meaningVi || <span className="text-muted">(chưa có nghĩa)</span>}
            </p>
            {vocab.hanViet && (
              <p className="text-sm tracking-wide text-muted">Hán Việt: {vocab.hanViet}</p>
            )}
            {vocab.jmdict && vocab.jmdict.glossEn.length > 0 && (
              <p lang="en" className="text-sm text-muted">
                {vocab.jmdict.glossEn.slice(0, 3).join("; ")}
              </p>
            )}
            {alsoInLessons.length > 0 && (
              <p className="text-xs text-muted">Cũng có ở bài {alsoInLessons.join(", ")}</p>
            )}
            <button
              type="button"
              onClick={onSpeak}
              disabled={!canSpeak}
              title={canSpeak ? "Phát âm" : "Máy chưa có giọng đọc tiếng Nhật"}
              className="mt-1 min-h-11 rounded-full border border-border px-4 text-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              🔊 {canSpeak ? "Phát âm" : "Chưa có giọng tiếng Nhật"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
