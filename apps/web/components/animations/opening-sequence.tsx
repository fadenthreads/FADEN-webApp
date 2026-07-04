"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadenLandingAnimatedLogo } from "@/components/animations/faden-landing-animated-logo";

interface OpeningSequenceProps {
  onComplete: () => void;
}

/** First-page landing — premium SVG draw + logo reveal, then advances to home. */
export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    window.setTimeout(() => setVisible(false), reducedMotion ? 300 : 900);
  }, [reducedMotion]);

  useEffect(() => {
    const fallbackMs = reducedMotion ? 2200 : 9000;
    const timer = window.setTimeout(() => setVisible(false), fallbackMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#faf8f4] px-4 faden-opening-bg"
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-lg flex-col items-center justify-center"
          >
            <FadenLandingAnimatedLogo onSequenceComplete={dismiss} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
