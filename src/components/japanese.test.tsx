import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Furigana } from "./japanese";

describe("Furigana", () => {
  it("hiện ruby khi có kanji", () => {
    expect(renderToStaticMarkup(<Furigana text="学生" reading="がくせい" />)).toBe(
      '<ruby lang="ja">学生<rp>(</rp><rt>がくせい</rt><rp>)</rp></ruby>',
    );
  });

  it("chỉ hiện kana khi không có kanji", () => {
    expect(renderToStaticMarkup(<Furigana reading="あなた" />)).toBe(
      '<span lang="ja">あなた</span>',
    );
  });

  it("không lặp cách đọc khi text trùng reading", () => {
    expect(renderToStaticMarkup(<Furigana text="はい" reading="はい" />)).toBe(
      '<span lang="ja">はい</span>',
    );
  });

  it("ẩn furigana khi showReading=false", () => {
    expect(renderToStaticMarkup(<Furigana text="私" reading="わたし" showReading={false} />)).toBe(
      '<span lang="ja">私</span>',
    );
  });
});
