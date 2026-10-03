import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import "./globals.css";

// Font CJK rất nặng: không preload, trình duyệt chỉ tải các khoảng unicode thực sự dùng
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Học tiếng Nhật",
  description: "Ôn từ vựng và ngữ pháp Minna no Nihongo",
  appleWebApp: { capable: true, title: "Tiếng Nhật", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // Tràn ra vùng tai thỏ, body tự chừa lề bằng env(safe-area-inset-*) (globals.css)
  viewportFit: "cover",
  // Khớp --background ở globals.css
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
