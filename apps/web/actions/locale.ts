"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocalePreference(locale: string): Promise<void> {
  const resolved = resolveLocale(locale);
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, resolved, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}
