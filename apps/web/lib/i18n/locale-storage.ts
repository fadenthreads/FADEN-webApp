import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  isAppLocale,
  resolveLocale,
  type AppLocale,
} from "@/lib/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readLocaleFromStorage(): AppLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return null;
    return isAppLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeLocaleToStorage(locale: AppLocale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // private browsing / quota exceeded
  }
}

export function readLocaleFromDocumentCookie(): AppLocale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return null;
  return resolveLocale(decodeURIComponent(match.split("=")[1] ?? ""));
}

export function writeLocaleCookie(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

/** Persist locale in localStorage + cookie so SSR and client stay in sync. */
export function persistLocalePreference(locale: AppLocale): void {
  writeLocaleToStorage(locale);
  writeLocaleCookie(locale);
}

/** On first client load, promote localStorage preference to cookie if needed. */
export function syncStoredLocaleToCookie(): { locale: AppLocale; changed: boolean } {
  const fromStorage = readLocaleFromStorage();
  const fromCookie = readLocaleFromDocumentCookie();

  if (fromStorage && fromStorage !== fromCookie) {
    writeLocaleCookie(fromStorage);
    return { locale: fromStorage, changed: true };
  }

  if (fromCookie) {
    if (!fromStorage) writeLocaleToStorage(fromCookie);
    return { locale: fromCookie, changed: false };
  }

  writeLocaleToStorage(DEFAULT_LOCALE);
  writeLocaleCookie(DEFAULT_LOCALE);
  return { locale: DEFAULT_LOCALE, changed: false };
}
