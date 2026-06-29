"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface OpeningSequenceProps {
  onComplete: () => void;
}

/** Netflix-style logo splash — auto-advances to the next phase. */
export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reducedMotion ? 1100 : 2600;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background faden-opening-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.3 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="FADEN opening"
          aria-live="polite"
        >
          <motion.h1
            className="font-display text-[3.75rem] font-bold tracking-[0.14em] text-navy md:text-[5.5rem] lg:text-[6.5rem]"
            aria-label="FADEN"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{
              opacity: reducedMotion ? 1 : [0, 1, 1],
              scale: reducedMotion ? 1 : [0.82, 1, 1],
            }}
            transition={{
              duration: reducedMotion ? 0.45 : 1.1,
              times: [0, 0.45, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            FADEN
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
