"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScissorsLoadingProps {
  onComplete?: () => void;
  /** When true, runs once without auto-dismiss (route-level loading). */
  standalone?: boolean;
}

function ScissorsCutAnimation({ compact = false }: { compact?: boolean }) {
  const reducedMotion = useReducedMotion();
  const travelDuration = reducedMotion ? 1.1 : 1.85;
  const snipDuration = reducedMotion ? 0.18 : 0.22;

  return (
    <div
      className={`relative w-full ${compact ? "max-w-[220px]" : "max-w-md"} px-6`}
      aria-hidden
    >
      {/* Thread — left segment */}
      <motion.div
        className="absolute left-6 top-1/2 h-px origin-right bg-gold"
        initial={{ width: "42%", opacity: 1 }}
        animate={{ width: "42%", opacity: 1 }}
      />

      {/* Thread — right segment (falls after cut) */}
      <motion.div
        className="absolute right-6 top-1/2 h-px origin-left bg-gold"
        style={{ width: "42%" }}
        initial={{ opacity: 1, y: 0, rotate: 0 }}
        animate={
          reducedMotion
            ? { opacity: 0.35 }
            : { opacity: [1, 1, 0.45], y: [0, 0, 10], rotate: [0, 0, 4] }
        }
        transition={{ duration: travelDuration, times: [0, 0.72, 1], ease: "easeInOut" }}
      />

      {/* Scissors travel along the thread */}
      <motion.div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ left: "8%" }}
        animate={{ left: "92%" }}
        transition={{ duration: travelDuration, ease: "easeInOut" }}
      >
        <motion.svg
          width={compact ? 44 : 56}
          height={compact ? 44 : 56}
          viewBox="0 0 56 56"
          fill="none"
        >
          <defs>
            <linearGradient id="scissorBlade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C5A059" />
              <stop offset="100%" stopColor="#0A1A30" />
            </linearGradient>
          </defs>
          {/* Upper blade */}
          <motion.g
            style={{ transformOrigin: "28px 28px" }}
            animate={reducedMotion ? {} : { rotate: [0, -14, 0, -14, 0] }}
            transition={{
              duration: snipDuration * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              d="M28 28 L10 8 C8 6 10 4 13 6 L28 22 Z"
              fill="url(#scissorBlade)"
              stroke="#0A1A30"
              strokeWidth="0.6"
            />
          </motion.g>
          {/* Lower blade */}
          <motion.g
            style={{ transformOrigin: "28px 28px" }}
            animate={reducedMotion ? {} : { rotate: [0, 14, 0, 14, 0] }}
            transition={{
              duration: snipDuration * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              d="M28 28 L10 48 C8 50 10 52 13 50 L28 34 Z"
              fill="url(#scissorBlade)"
              stroke="#0A1A30"
              strokeWidth="0.6"
            />
          </motion.g>
          <circle cx="28" cy="28" r="4.5" fill="#0A1A30" stroke="#C5A059" strokeWidth="1" />
          {/* Handle rings */}
          <ellipse cx="12" cy="12" rx="5" ry="6" fill="none" stroke="#0A1A30" strokeWidth="1.4" />
          <ellipse cx="12" cy="44" rx="5" ry="6" fill="none" stroke="#0A1A30" strokeWidth="1.4" />
        </motion.svg>
      </motion.div>

      {/* Cut spark at midpoint */}
      {!reducedMotion && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/80"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0, 1, 0], scale: [0, 0, 1.4, 0] }}
          transition={{ duration: travelDuration, times: [0, 0.68, 0.74, 0.82], ease: "easeOut" }}
        />
      )}
    </div>
  );
}

export function ScissorsLoading({ onComplete, standalone = false }: ScissorsLoadingProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (standalone || !onComplete) return;
    const duration = reducedMotion ? 900 : 2200;
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion, standalone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-background faden-opening-bg"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <ScissorsCutAnimation />
        {!standalone && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-xs font-medium tracking-[0.35em] text-navy/70"
          >
            CUTTING IN
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/** Inline scissors loader for Next.js route loading UI. */
export function ScissorsRouteLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <ScissorsCutAnimation compact />
    </div>
  );
}
