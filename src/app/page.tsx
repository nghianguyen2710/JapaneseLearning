import { Furigana, Jp } from "@/components/japanese";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Học tiếng Nhật</h1>
      <section className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Kiểm tra font và furigana</p>
        <p lang="ja" className="mt-4 text-4xl leading-loose">
          <Furigana text="私" reading="わたし" /> は <Furigana text="学生" reading="がくせい" />{" "}
          です。
        </p>
        <p className="mt-2 text-sm text-muted">
          <Jp>直 · 骨 · 誤 · 写 · 画</Jp> (glyph kiểu Nhật)
        </p>
      </section>
    </main>
  );
}
