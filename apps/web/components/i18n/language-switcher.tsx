"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@faden/utils";
import { setLocalePreference } from "@/actions/locale";
import {
  LOCALE_LABELS,
  LOCALES,
  type AppLocale,
} from "@/lib/i18n/config";
import { writeLocaleToStorage } from "@/lib/i18n/locale-storage";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "select" | "buttons";
}

export function LanguageSwitcher({ className, variant = "select" }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AppLocale>(locale);

  function handleChange(nextLocale: AppLocale) {
    if (nextLocale === locale || pending) return;

    setSelected(nextLocale);
    writeLocaleToStorage(nextLocale);

    startTransition(async () => {
      await setLocalePreference(nextLocale);
      router.refresh();
    });
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex flex-wrap items-center gap-1", className)} role="group" aria-label={t("label")}>
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => handleChange(code)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
              locale === code
                ? "border-gold bg-gold/15 text-gold"
                : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold",
            )}
            aria-pressed={locale === code}
          >
            {LOCALE_LABELS[code]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <label className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Globe className="h-4 w-4 shrink-0 text-gold" aria-hidden />
      <span className="sr-only">{t("label")}</span>
      <select
        value={pending ? selected : locale}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as AppLocale)}
        aria-label={t("label")}
        className="cursor-pointer rounded-md border border-border bg-background-elevated px-2 py-1.5 text-xs text-foreground outline-none transition-colors hover:border-gold/40 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 disabled:opacity-60"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
