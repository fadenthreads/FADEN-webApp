"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resetBodyScrollLock } from "@/lib/body-scroll-lock";

/** Clears any stuck body scroll lock when navigating between pages. */
export function ScrollLockRecovery() {
  const pathname = usePathname();

  useEffect(() => {
    resetBodyScrollLock();
  }, [pathname]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        resetBodyScrollLock();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return null;
}
