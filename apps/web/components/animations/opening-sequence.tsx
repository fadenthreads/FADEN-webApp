"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadenAnimatedLogo } from "@/components/brand/faden-animated-logo";

interface OpeningSequenceProps {
  onComplete: () => void;
}

/** First-page splash — animated FADEN brand draw, then advances to home. */
export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
    window.setTimeout(() => setVisible(false), reducedMotion ? 400 : 900);
  }, [reducedMotion]);

  useEffect(() => {
    const fallbackMs = reducedMotion ? 2400 : 9500;
    const timer = window.setTimeout(() => setVisible(false), fallbackMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background faden-opening-bg px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.3 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="FADEN opening"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0.35 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col items-center"
          >
            <FadenAnimatedLogo
              fillViewport
              className="flex w-full justify-center"
              onAnimationComplete={handleAnimationComplete}
            />
            {animationDone && !reducedMotion && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display mt-4 text-xs tracking-[0.35em] text-navy/50"
              >
                CUTTING IN
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
