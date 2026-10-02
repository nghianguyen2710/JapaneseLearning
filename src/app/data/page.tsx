import type { Metadata } from "next";
import Link from "next/link";
import { DataScreen } from "@/components/data/data-screen";

export const metadata: Metadata = { title: "Dữ liệu · Học tiếng Nhật" };

export default function DataPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Trang chủ
        </Link>
        <h1 className="text-lg font-semibold">Dữ liệu</h1>
      </nav>
      <DataScreen />
    </main>
  );
}
