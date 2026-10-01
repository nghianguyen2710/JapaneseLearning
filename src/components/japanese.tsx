import type { ReactNode } from "react";

/** Bọc chữ Nhật với lang="ja" để trình duyệt chọn glyph kiểu Nhật. */
export function Jp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span lang="ja" className={className}>
      {children}
    </span>
  );
}

type FuriganaProps = {
  /** Chữ viết (thường có kanji). Trống thì chỉ hiện cách đọc. */
  text?: string;
  reading: string;
  showReading?: boolean;
  className?: string;
};

/** Từ kèm furigana cho cả từ. Không có kanji hoặc text trùng cách đọc thì không cần <ruby>. */
export function Furigana({ text, reading, showReading = true, className }: FuriganaProps) {
  if (!text || text === reading) {
    return <Jp className={className}>{reading}</Jp>;
  }
  if (!showReading) {
    return <Jp className={className}>{text}</Jp>;
  }
  return (
    <ruby lang="ja" className={className}>
      {text}
      <rp>(</rp>
      <rt>{reading}</rt>
      <rp>)</rp>
    </ruby>
  );
}
