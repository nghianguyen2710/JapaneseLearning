// Storage adapter cho dữ liệu người dùng. CLAUDE.md quy tắc 2: UI chỉ đọc/ghi qua đây.
// Mỗi key lưu dạng { schemaVersion, data }. Không bao giờ throw ra UI: mọi lỗi trả về Result.
// Dữ liệu hỏng hoặc version mới hơn app thì báo lỗi và KHÔNG tự ghi đè (docs/schema.md mục 5).

import type {
  CardFlags,
  CardId,
  CardState,
  ErrorReport,
  ReviewLogEntry,
  Settings,
} from "@/lib/user-data/schema";
import { USER_SCHEMA_VERSION } from "@/lib/user-data/schema";
import {
  isArrayOf,
  isCardFlags,
  isCardState,
  isErrorReport,
  isObject,
  isRecordOf,
  isReviewLogEntry,
  isSettings,
} from "@/lib/user-data/validate";

export const KEY_PREFIX = "jp-app:";

export const DEFAULT_SETTINGS: Settings = { currentLesson: 1, newCardsPerDay: 10 };

export type UserData = {
  reviews: ReviewLogEntry[];
  "card-state": Record<CardId, CardState>;
  "card-flags": CardFlags;
  reports: ErrorReport[];
  settings: Settings;
};
export type StorageKey = keyof UserData;

export type StorageError =
  | { kind: "unavailable"; message: string }
  | { kind: "corrupt"; key: StorageKey; message: string }
  | { kind: "newer-version"; key: StorageKey; version: number }
  | { kind: "quota"; key: StorageKey; message: string };

export type Result<T> = { ok: true; value: T } | { ok: false; error: StorageError };

/** Phần tối thiểu của Web Storage mà adapter cần; test dùng bản trong bộ nhớ */
export type KeyValueBackend = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type UserStorage = {
  load<K extends StorageKey>(key: K): Result<UserData[K]>;
  save<K extends StorageKey>(key: K, value: UserData[K]): Result<void>;
  remove(key: StorageKey): Result<void>;
};

type Spec<T> = { fallback: () => T; check: (v: unknown) => v is T };

const SPECS: { [K in StorageKey]: Spec<UserData[K]> } = {
  reviews: { fallback: () => [], check: (v) => isArrayOf(v, isReviewLogEntry) },
  "card-state": {
    fallback: () => ({}),
    check: (v): v is Record<CardId, CardState> => isRecordOf(v, isCardState),
  },
  "card-flags": { fallback: () => ({}), check: isCardFlags },
  reports: { fallback: () => [], check: (v) => isArrayOf(v, isErrorReport) },
  settings: { fallback: () => ({ ...DEFAULT_SETTINGS }), check: isSettings },
};

/** migrate(vN → vN+1) theo từng key. Hiện chỉ có v1 nên chưa có bước nào. */
const MIGRATIONS: Record<number, (data: unknown, key: StorageKey) => unknown> = {};

export function migrate(
  key: StorageKey,
  version: number,
  data: unknown,
): { ok: true; data: unknown } | { ok: false; error: StorageError } {
  if (version > USER_SCHEMA_VERSION) {
    return { ok: false, error: { kind: "newer-version", key, version } };
  }
  let current = data;
  for (let v = version; v < USER_SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) {
      return {
        ok: false,
        error: { kind: "corrupt", key, message: `Không có migration từ v${v}` },
      };
    }
    current = step(current, key);
  }
  return { ok: true, data: current };
}

const unavailable = (message: string): Result<never> => ({
  ok: false,
  error: { kind: "unavailable", message },
});

function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
}

export function createUserStorage(backend: KeyValueBackend | null): UserStorage {
  return {
    load(key) {
      if (!backend) return unavailable("Trình duyệt không cho dùng bộ nhớ cục bộ");
      const spec = SPECS[key];
      let raw: string | null;
      try {
        raw = backend.getItem(KEY_PREFIX + key);
      } catch (e) {
        return unavailable(String(e));
      }
      if (raw === null) return { ok: true, value: spec.fallback() };

      const corrupt = (message: string): Result<never> => ({
        ok: false,
        error: { kind: "corrupt", key, message },
      });
      let envelope: unknown;
      try {
        envelope = JSON.parse(raw);
      } catch {
        return corrupt("Không đọc được JSON");
      }
      if (!isObject(envelope) || !Number.isInteger(envelope.schemaVersion)) {
        return corrupt("Thiếu schemaVersion");
      }
      const migrated = migrate(key, envelope.schemaVersion as number, envelope.data);
      if (!migrated.ok) return migrated;
      if (!spec.check(migrated.data)) return corrupt("Dữ liệu sai cấu trúc");
      return { ok: true, value: migrated.data };
    },

    save(key, value) {
      if (!backend) return unavailable("Trình duyệt không cho dùng bộ nhớ cục bộ");
      try {
        backend.setItem(
          KEY_PREFIX + key,
          JSON.stringify({ schemaVersion: USER_SCHEMA_VERSION, data: value }),
        );
        return { ok: true, value: undefined };
      } catch (e) {
        if (isQuotaError(e)) {
          return { ok: false, error: { kind: "quota", key, message: "Bộ nhớ trình duyệt đã đầy" } };
        }
        return unavailable(String(e));
      }
    },

    remove(key) {
      if (!backend) return unavailable("Trình duyệt không cho dùng bộ nhớ cục bộ");
      try {
        backend.removeItem(KEY_PREFIX + key);
        return { ok: true, value: undefined };
      } catch (e) {
        return unavailable(String(e));
      }
    },
  };
}

/** Thông báo tiếng Việt cho UI */
export function describeStorageError(error: StorageError): string {
  switch (error.kind) {
    case "unavailable":
      return "Không truy cập được bộ nhớ của trình duyệt (có thể đang ở chế độ ẩn danh). Dữ liệu sẽ không được lưu.";
    case "corrupt":
      return `Dữ liệu "${error.key}" bị hỏng (${error.message}). App không ghi đè; hãy import lại từ file backup.`;
    case "newer-version":
      return `Dữ liệu "${error.key}" được tạo bởi bản app mới hơn (v${error.version}). Hãy cập nhật app.`;
    case "quota":
      return "Bộ nhớ trình duyệt đã đầy. Hãy export backup rồi xoá bớt dữ liệu trang web khác.";
  }
}
