"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScissorsLoadingProps {
  onComplete: () => void;
}

export function ScissorsLoading({ onComplete }: ScissorsLoadingProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const duration = reducedMotion ? 800 : 2200;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] overflow-hidden bg-black"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* Top panel — slides up after cut */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: reducedMotion ? "-100%" : "-100%" }}
        transition={{ delay: reducedMotion ? 0.3 : 1.1, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-x-0 top-0 h-1/2 origin-top bg-background"
      />

      {/* Bottom panel — slides down after cut */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ delay: reducedMotion ? 0.3 : 1.1, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-background"
      />

      {/* Cut line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute left-0 right-0 top-1/2 h-px origin-left bg-gradient-to-r from-transparent via-gold to-transparent"
        aria-hidden
      />

      {/* Scissors traveling across */}
      <motion.div
        initial={{ x: "-20%", y: "-50%" }}
        animate={{ x: "120%", y: "-50%" }}
        transition={{
          delay: reducedMotion ? 0 : 0.4,
          duration: reducedMotion ? 0.5 : 1.2,
          ease: "easeInOut",
        }}
        className="absolute top-1/2"
        aria-hidden
      >
        <motion.svg
          width="80"
          height="48"
          viewBox="0 0 80 48"
          animate={reducedMotion ? {} : { rotate: [0, -8, 4, -6, 0] }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          <defs>
            <linearGradient id="scissorBlade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
            <linearGradient id="scissorHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
          </defs>
          <motion.g
            animate={reducedMotion ? {} : { rotate: [20, -5, 20] }}
            transition={{ duration: 0.25, repeat: 4, delay: 0.4 }}
            style={{ transformOrigin: "40px 24px" }}
          >
            <path d="M8 6 L32 24 L8 42 Z" fill="url(#scissorBlade)" stroke="#666" strokeWidth="0.5" />
            <path d="M72 6 L48 24 L72 42 Z" fill="url(#scissorBlade)" stroke="#666" strokeWidth="0.5" />
            <circle cx="40" cy="24" r="5" fill="url(#scissorHandle)" />
            <circle cx="40" cy="24" r="2" fill="#1a1a1a" />
          </motion.g>
        </motion.svg>
      </motion.div>

      <p className="absolute bottom-16 left-0 right-0 text-center text-sm tracking-[0.2em] text-gold/70">
        CUTTING THROUGH…
      </p>
    </motion.div>
  );
}
