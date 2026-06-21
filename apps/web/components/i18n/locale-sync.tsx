"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { setLocalePreference } from "@/actions/locale";
import {
  readLocaleFromDocumentCookie,
  readLocaleFromStorage,
  writeLocaleToStorage,
} from "@/lib/i18n/locale-storage";

/**
 * On first load, sync localStorage preference to the server cookie so SSR matches.
 */
export function LocaleSync() {
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    void (async () => {
      const fromStorage = readLocaleFromStorage();
      const fromCookie = readLocaleFromDocumentCookie();

      if (fromStorage && fromStorage !== fromCookie) {
        await setLocalePreference(fromStorage);
        router.refresh();
        return;
      }

      if (fromCookie && !fromStorage) {
        writeLocaleToStorage(fromCookie);
      }
    })();
  }, [router]);

  return null;
}
