"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface SimpleSplashProps {
  onComplete: () => void;
}

/** Brand splash — full logo artwork, then home. */
export function SimpleSplash({ onComplete }: SimpleSplashProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reducedMotion ? 800 : 2000;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#faf8f4] px-4 py-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 0.45, ease: "easeOut" }}
          role="status"
          aria-label="Loading FADEN"
          aria-live="polite"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full w-full max-w-md items-center justify-center"
          >
            <Image
              src="/faden-splash.png"
              alt="FADEN — Fashion struggles reduced to near zero"
              width={800}
              height={1200}
              priority
              className="h-auto max-h-[min(92dvh,820px)] w-full max-w-[min(88vw,420px)] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Inline loader for route transitions. */
export function SimpleRouteLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-gold" aria-hidden />
      <p className="text-xs font-medium tracking-[0.2em] text-navy/50">LOADING</p>
    </div>
  );
}
