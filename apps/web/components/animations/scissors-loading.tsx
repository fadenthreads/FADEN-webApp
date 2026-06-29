"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FadenEmblem } from "./faden-emblem";

interface ScissorsLoadingProps {
  onComplete: () => void;
}

export function ScissorsLoading({ onComplete }: ScissorsLoadingProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const duration = reducedMotion ? 900 : 2400;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-background faden-opening-bg"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* Thread line animation */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute left-[10%] right-[10%] top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-gold to-transparent"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        <FadenEmblem size="md" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs font-medium tracking-[0.35em] text-navy/70"
        >
          THREADING YOUR EXPERIENCE
        </motion.p>
        <motion.div
          className="mt-4 h-0.5 w-24 overflow-hidden rounded-full bg-navy/10"
          aria-hidden
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
