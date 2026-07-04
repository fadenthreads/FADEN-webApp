"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface OpeningSequenceProps {
  onComplete: () => void;
}

/** First-page splash — FADEN brand mark, then advances to home. */
export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reducedMotion ? 1800 : 4800;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.3 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="FADEN opening"
          aria-live="polite"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.35 : 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <Image
              src="/faden-logo.png"
              alt="FADEN — It All Starts With a Thread"
              width={760}
              height={1060}
              priority
              className="h-[min(72vh,640px)] w-auto object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
