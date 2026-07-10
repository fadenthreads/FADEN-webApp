"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface SimpleSplashProps {
  onComplete: () => void;
}

/** Minimal brand splash — logo fade, then home. */
export function SimpleSplash({ onComplete }: SimpleSplashProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reducedMotion ? 600 : 1400;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#faf8f4] px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 0.4, ease: "easeOut" }}
          role="status"
          aria-label="Loading FADEN"
          aria-live="polite"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <Image
              src="/faden-logo.png"
              alt="FADEN"
              width={280}
              height={390}
              priority
              className="h-auto w-[min(42vw,180px)] object-contain"
            />
            {!reducedMotion && (
              <div className="flex items-center gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gold/70"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            )}
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
