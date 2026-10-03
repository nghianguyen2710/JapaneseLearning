"use client";

// Đăng ký service worker (public/sw.js, D20). Chỉ chạy ở bản production để dev server không bị cache.

import { useEffect } from "react";
import { LESSON_COUNT, loadLesson } from "@/lib/content/load";

/** Tải ngầm cả 50 bài (~270KB nén) qua service worker để offline mở được mọi bài, kể cả trang Dữ liệu */
async function warmLessonCache() {
  for (let lesson = 1; lesson <= LESSON_COUNT; lesson++) {
    await loadLesson(lesson);
  }
}

function whenControlled(): Promise<void> {
  if (navigator.serviceWorker.controller) return Promise.resolve();
  return new Promise((resolve) =>
    navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }),
  );
}

export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let registration: ServiceWorkerRegistration | undefined;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((r) => {
        registration = r;
        return whenControlled();
      })
      .then(warmLessonCache)
      .catch(() => {
        // Không có service worker hoặc mất mạng giữa chừng: app vẫn chạy, lần mở sau tải tiếp
      });

    // App mở từ màn hình chính có thể chạy nhiều ngày không tải lại: kiểm tra bản mới mỗi lần quay lại app
    function onVisible() {
      if (document.visibilityState === "visible") registration?.update().catch(() => {});
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  return null;
}
