// Service worker tự viết, không dùng thư viện (D20). Quy tắc cache: docs/pwa.md
// - Trang (HTML): lấy mạng trước, mất mạng thì dùng bản đã lưu → deploy mới hiện ngay khi có mạng
// - /_next/static/ (JS, CSS, font, nội dung bài; tên file có hash, không bao giờ đổi): lấy cache trước
// - Request khác cùng origin (RSC, manifest, icon): lấy mạng trước, mất mạng thì dùng cache
// Đổi VERSION khi sửa file này theo cách không tương thích với cache cũ.

const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const STATIC = `static-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const PRECACHE_PAGES = ["/", "/review", "/data"];
/** Mỗi lần deploy thêm vài chục file hash mới; giữ số file mới nhất để cache không phình mãi */
const MAX_STATIC_ENTRIES = 500;

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [PAGES, STATIC, RUNTIME];
      for (const key of await caches.keys()) {
        if (!keep.includes(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(page(request, url));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staticAsset(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

/** Lưu sẵn các trang và mọi file JS/CSS mà trang đó cần, để offline mở được cả trang chưa từng vào */
async function precache() {
  const pages = await caches.open(PAGES);
  const assets = new Set();
  for (const path of PRECACHE_PAGES) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Không tải được ${path}`);
    const html = await res.clone().text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
    await pages.put(path, res);
  }
  const staticCache = await caches.open(STATIC);
  await Promise.all(
    [...assets].map(async (asset) => {
      if (await staticCache.match(asset)) return;
      const res = await fetch(asset);
      if (res.ok) await staticCache.put(asset, res);
    }),
  );
}

async function page(request, url) {
  const pages = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) await pages.put(url.pathname, res.clone());
    return res;
  } catch (e) {
    const cached = (await pages.match(url.pathname)) ?? (await pages.match("/"));
    if (cached) return cached;
    throw e;
  }
}

async function staticAsset(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) {
    await cache.put(request, res.clone());
    trim(cache);
  }
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

/** Xoá file cũ nhất (cache.keys() trả theo thứ tự thêm vào) */
async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_STATIC_ENTRIES))) {
    await cache.delete(key);
  }
}
