"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadenSplashWordmark } from "./faden-splash-wordmark";

interface OpeningSequenceProps {
  onComplete: () => void;
}

/** Netflix-style logo splash — auto-advances to the next phase. */
export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reducedMotion ? 1400 : 3600;
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
          transition={{ duration: reducedMotion ? 0.3 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="FADEN opening"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <FadenSplashWordmark />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
