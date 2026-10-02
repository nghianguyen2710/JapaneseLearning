import type { Metadata } from "next";
import Link from "next/link";
import { ReviewScreen } from "@/components/review/review-screen";

export const metadata: Metadata = { title: "Ôn thẻ · Học tiếng Nhật" };

export default function ReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Trang chủ
        </Link>
        <h1 className="text-lg font-semibold">Ôn từ vựng</h1>
      </nav>
      <ReviewScreen />
    </main>
  );
}
