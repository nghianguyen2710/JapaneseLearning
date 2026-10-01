import { describe, expect, it } from "vitest";
import { buildContent } from "./build.ts";
import { ContentError, parseDeck } from "./deck.ts";
import { DECK_ROWS, baseInput, deckText } from "./fixtures.ts";
import { lookupCandidates, masuToDict } from "./normalize.ts";
import { parseLessons } from "./verify-cli.ts";

const vocabOf = (out: ReturnType<typeof buildContent>) => out.lessons.flatMap((l) => l.vocab);

describe("parseDeck", () => {
  it("đọc đúng các cột", () => {
    const [first] = parseDeck(deckText());
    expect(first).toMatchObject({ lesson: 1, order: 1, kana: "わたし", kanji: "私", hanViet: "TƯ", meaningVi: "tôi" });
  });

  it("báo lỗi rõ khi thiếu header export", () => {
    expect(() => parseDeck(DECK_ROWS.join("\n"))).toThrow(/thiếu header/);
  });

  it("báo lỗi rõ khi sai số cột", () => {
    const bad = deckText([DECK_ROWS[0].split("\t").slice(0, 5).join("\t")]);
    expect(() => parseDeck(bad)).toThrow(ContentError);
    expect(() => parseDeck(bad)).toThrow(/Dòng 5: có 5 cột/);
  });

  it("báo lỗi khi mã thẻ trùng", () => {
    expect(() => parseDeck(deckText([DECK_ROWS[0], DECK_ROWS[0]]))).toThrow(/trùng/);
  });
});

describe("chuẩn hoá & dạng từ điển", () => {
  it("bỏ ký hiệu và phần tuỳ chọn", () => {
    const c = lookupCandidates("[お]くに", "[お]国");
    expect(c.map((x) => `${x.kana}|${x.kanji}`)).toEqual(["くに|国", "くに|お国", "おくに|国", "おくに|お国"]);
  });

  it("ます → nhóm 1, nhóm 2, する, くる", () => {
    expect(masuToDict("のみます", "飲みます").map((x) => x.kanji)).toContain("飲む");
    expect(masuToDict("たべます", "食べます").map((x) => x.kanji)).toContain("食べる");
    expect(masuToDict("します", "")[0].kana).toBe("する");
    expect(masuToDict("きます", "来ます")[0].kanji).toBe("来る");
  });
});

describe("buildContent", () => {
  it("ghép JMdict cho động từ dạng ます và danh từ + します", () => {
    const v = vocabOf(buildContent(baseInput()));
    expect(v.find((x) => x.kana === "のみます")?.jmdict?.dictForm).toBe("飲む");
    expect(v.find((x) => x.kana === "たべます")?.jmdict?.glossEn).toEqual(["to eat"]);
    expect(v.find((x) => x.kana === "べんきょうします")?.jmdict?.dictForm).toBe("勉強する");
  });

  it("không khớp nhầm bằng kana khi bộ thẻ có kanji", () => {
    const input = baseInput({ deckText: deckText([DECK_ROWS[0], "Từ vựng Minna\tBài 01 - 09\tBài 01\tはなします\t話します\t\tnói\t\t\t"]) });
    const v = vocabOf(buildContent(input));
    expect(v[1].jmdict).toBeUndefined();
  });

  it("âm Hán Việt của kanji lấy từ bộ thẻ, KANJIDIC2 chỉ dự phòng", () => {
    const out = buildContent(baseInput());
    const kanji = out.lessons.flatMap((l) => l.kanji);
    expect(kanji.find((k) => k.id === "食")).toMatchObject({ hanViet: ["THỰC"], hanVietSource: "deck" });
    expect(kanji.find((k) => k.id === "先")).toMatchObject({ hanViet: ["TIÊN"], firstLesson: 1 });
  });

  it("từ lặp lại ở nhiều bài: mỗi bài một bản ghi, trỏ seeAlso cho nhau", () => {
    const v = vocabOf(buildContent(baseInput())).filter((x) => x.kana === "せんせい");
    expect(v).toHaveLength(2);
    expect(v[0].seeAlso).toEqual([v[1].id]);
    expect(v[1].seeAlso).toEqual([v[0].id]);
  });

  it("ID giữ nguyên khi sắp xếp lại bộ thẻ và khi sửa nghĩa qua override", () => {
    const first = buildContent(baseInput());
    const idOf = (out: ReturnType<typeof buildContent>, kana: string) => vocabOf(out).find((x) => x.kana === kana)!.id;

    const reordered = buildContent(
      baseInput({ deckText: deckText([...DECK_ROWS].reverse()), registry: first.registry }),
    );
    for (const kana of ["わたし", "のみます", "あなた"]) expect(idOf(reordered, kana)).toBe(idOf(first, kana));

    const id = idOf(first, "わたし");
    const edited = buildContent(
      baseInput({
        registry: first.registry,
        overrides: { ...baseInput().overrides, vocab: { schemaVersion: 1, [id]: { meaningVi: "tôi (lịch sự)", verified: true } } },
      }),
    );
    const w = vocabOf(edited).find((x) => x.id === id)!;
    expect(w).toMatchObject({ meaningVi: "tôi (lịch sự)", verified: true, overridden: ["meaningVi"] });
  });

  it("từ mới nhận ID tiếp theo, không đụng ID cũ", () => {
    const first = buildContent(baseInput());
    const extra = "Từ vựng Minna\tBài 02 - 05\tBài 02\tみます\t見ます\tKIẾN\txem\t\t\t";
    const second = buildContent(baseInput({ deckText: deckText([...DECK_ROWS, extra]), registry: first.registry }));
    expect(vocabOf(second).at(-1)!.id).toBe("w0008");
    expect(second.registry.next).toBe(9);
  });

  it("dừng lại khi một từ trong sổ ID biến mất khỏi bộ thẻ", () => {
    const first = buildContent(baseInput());
    expect(() => buildContent(baseInput({ deckText: deckText(DECK_ROWS.slice(1)), registry: first.registry }))).toThrow(
      /không còn trong bộ thẻ/,
    );
  });

  it("override trỏ tới ID không tồn tại hoặc trường không cho phép thì báo lỗi", () => {
    const ov = baseInput().overrides;
    expect(() => buildContent(baseInput({ overrides: { ...ov, vocab: { schemaVersion: 1, w9999: { verified: true } } } }))).toThrow(
      /không còn tồn tại/,
    );
    expect(() => buildContent(baseInput({ overrides: { ...ov, vocab: { schemaVersion: 1, w0001: { id: "x" } } } }))).toThrow(
      /không được phép/,
    );
  });

  it("output tất định: build hai lần ra giống hệt", () => {
    const a = buildContent(baseInput());
    const b = buildContent(baseInput({ registry: a.registry }));
    expect(JSON.stringify(b.lessons)).toBe(JSON.stringify(a.lessons));
  });

  it("gắn giải thích ngữ pháp theo ID và báo lỗi khi ID lạ", () => {
    const explanation = { structure: "N1 は N2 です", meaningVi: "…", conjugation: "", examples: [{ ja: "わたしは がくせいです。", vi: "Tôi là sinh viên." }], commonMistakes: [] };
    const out = buildContent(baseInput({ explanations: { schemaVersion: 1, "g01-01": explanation } }));
    expect(out.lessons[0].grammar[0].explanation).toEqual(explanation);
    expect(out.lessons[0].grammar[0]).toMatchObject({ source: "ai", verified: false });
    expect(() => buildContent(baseInput({ explanations: { "g09-09": explanation } }))).toThrow(/không có trong/);
  });
});

describe("parseLessons", () => {
  it("đọc một bài hoặc một khoảng", () => {
    expect(parseLessons("3")).toEqual([3]);
    expect(parseLessons("1-5")).toEqual([1, 2, 3, 4, 5]);
    expect(() => parseLessons("0-60")).toThrow(ContentError);
    expect(() => parseLessons(undefined)).toThrow(/--lessons/);
  });
});
