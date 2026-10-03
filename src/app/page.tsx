import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Học tiếng Nhật</h1>
      <DashboardScreen />
    </main>
  );
}
