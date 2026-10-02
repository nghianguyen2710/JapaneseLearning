// Chỗ DUY NHẤT trong app được chạm vào localStorage (CLAUDE.md quy tắc 2).

import {
  createUserStorage,
  KEY_PREFIX,
  type KeyValueBackend,
  type UserStorage,
} from "./user-storage";

/** null khi chạy trên server hoặc trình duyệt chặn localStorage */
function getLocalBackend(): KeyValueBackend | null {
  try {
    if (typeof window === "undefined") return null;
    const ls = window.localStorage;
    const probe = `${KEY_PREFIX}__probe__`;
    ls.setItem(probe, "1");
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

let cached: UserStorage | null = null;

/** Gọi ở client (trong effect/handler), không gọi lúc render trên server */
export function getUserStorage(): UserStorage {
  if (typeof window === "undefined") return createUserStorage(null);
  cached ??= createUserStorage(getLocalBackend());
  return cached;
}
