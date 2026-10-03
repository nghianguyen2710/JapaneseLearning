import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Học tiếng Nhật",
    short_name: "Tiếng Nhật",
    description: "Ôn từ vựng và ngữ pháp Minna no Nihongo",
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Khớp --background (stone-50) và --accent (indigo-600) ở globals.css
    background_color: "#fafaf9",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
