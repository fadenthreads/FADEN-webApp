import type { SavedItem, SavedListKind } from "@/lib/saved-items/types";

const LEGACY_KEYS: Record<SavedListKind, string> = {
  wishlist: "faden-wishlist-v1",
  cart: "faden-cart-v1",
};

function storageKey(kind: SavedListKind, userId?: string | null): string {
  if (userId) return `${LEGACY_KEYS[kind]}:user:${userId}`;
  return `${LEGACY_KEYS[kind]}:guest`;
}

/** Move pre-user-scoping keys into guest storage once, then drop the legacy key. */
function migrateLegacyStorage(kind: SavedListKind): void {
  if (typeof window === "undefined") return;
  const legacyKey = LEGACY_KEYS[kind];
  const raw = window.localStorage.getItem(legacyKey);
  if (!raw) return;

  const guestKey = storageKey(kind, null);
  if (!window.localStorage.getItem(guestKey)) {
    window.localStorage.setItem(guestKey, raw);
  }
  window.localStorage.removeItem(legacyKey);
}

export function readLocalSavedItems(kind: SavedListKind, userId?: string | null): SavedItem[] {
  if (typeof window === "undefined") return [];
  migrateLegacyStorage(kind);
  try {
    const raw = window.localStorage.getItem(storageKey(kind, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalSavedItems(
  kind: SavedListKind,
  items: SavedItem[],
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(kind, userId), JSON.stringify(items));
}

export function clearLocalSavedItems(kind: SavedListKind, userId?: string | null): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(kind, userId));
}
