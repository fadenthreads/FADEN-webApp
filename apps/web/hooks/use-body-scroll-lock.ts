"use client";

import { useEffect } from "react";
import { lockBodyScroll } from "@/lib/body-scroll-lock";

/** Lock page scroll while `locked` is true. Safe with nested overlays. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    return lockBodyScroll();
  }, [locked]);
}
