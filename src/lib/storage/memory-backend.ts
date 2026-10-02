// Backend trong bộ nhớ, dùng cho test (không đụng localStorage).

import type { KeyValueBackend } from "./user-storage";

export function memoryBackend(
  initial: Record<string, string> = {},
): KeyValueBackend & { items: Record<string, string> } {
  const items = { ...initial };
  return {
    items,
    getItem: (k) => (k in items ? items[k] : null),
    setItem: (k, v) => {
      items[k] = v;
    },
    removeItem: (k) => {
      delete items[k];
    },
  };
}
