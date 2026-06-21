export const LOCALES = ["en", "hi", "te"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_COOKIE = "FADEN_LOCALE";

export const LOCALE_STORAGE_KEY = "faden-locale";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు",
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return LOCALES.includes(value as AppLocale);
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}
