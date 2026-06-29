"use client";

import { motion, useReducedMotion } from "framer-motion";

const LETTERS = ["F", "A", "D", "E", "N"] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.15 },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 36,
    rotateX: -55,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function FadenSplashWordmark() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="relative flex flex-col items-center px-6">
        <div className="mb-5 h-px w-28 bg-gradient-to-r from-transparent via-gold/70 to-transparent md:w-36" />
        <h1
          className="faden-splash-wordmark font-display text-[3.5rem] font-bold leading-none tracking-[0.22em] text-navy md:text-[5.5rem] lg:text-[6.5rem]"
          aria-label="FADEN"
        >
          FADEN
        </h1>
        <p className="mt-5 text-[10px] font-medium tracking-[0.42em] text-gold/90 md:text-xs">HERITAGE · TRUST</p>
        <div className="mt-5 h-px w-28 bg-gradient-to-r from-transparent via-gold/70 to-transparent md:w-36" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center px-6">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl md:h-56 md:w-96"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        aria-hidden
      />

      {/* Top rule */}
      <motion.div
        className="relative z-10 mb-6 flex items-center gap-3 md:mb-8 md:gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        aria-hidden
      >
        <motion.span
          className="h-px w-12 origin-right bg-gradient-to-l from-gold/80 to-transparent md:w-16"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-gold"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.55, type: "spring", stiffness: 320, damping: 18 }}
        />
        <motion.span
          className="h-px w-12 origin-left bg-gradient-to-r from-gold/80 to-transparent md:w-16"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Letter-by-letter wordmark */}
      <motion.h1
        className="faden-splash-wordmark relative z-10 flex font-display text-[3.5rem] font-bold leading-none tracking-[0.22em] text-navy md:text-[5.5rem] lg:text-[6.5rem]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="FADEN"
        style={{ perspective: 800 }}
      >
        {LETTERS.map((char, index) => (
          <motion.span
            key={char}
            variants={letterVariants}
            className="inline-block origin-bottom"
            style={{ transformStyle: "preserve-3d" }}
          >
            {char}
            {index < LETTERS.length - 1 && (
              <span className="inline-block w-[0.06em] md:w-[0.05em]" aria-hidden />
            )}
          </motion.span>
        ))}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="relative z-10 mt-6 text-[10px] font-medium tracking-[0.42em] text-gold/90 md:mt-8 md:text-xs"
        initial={{ opacity: 0, y: 10, letterSpacing: "0.55em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.42em" }}
        transition={{ duration: 0.85, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        HERITAGE · TRUST
      </motion.p>

      {/* Bottom rule */}
      <motion.div
        className="relative z-10 mt-6 flex items-center gap-3 md:mt-8 md:gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.05 }}
        aria-hidden
      >
        <motion.span
          className="h-px w-12 origin-right bg-gradient-to-l from-gold/80 to-transparent md:w-16"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="h-1 w-1 rotate-45 bg-gold/80"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 1.45, type: "spring", stiffness: 320, damping: 18 }}
        />
        <motion.span
          className="h-px w-12 origin-left bg-gradient-to-r from-gold/80 to-transparent md:w-16"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Shimmer sweep after letters land */}
      <motion.div
        className="faden-splash-shimmer pointer-events-none absolute inset-0 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ duration: 1.1, delay: 1.35, ease: "easeInOut" }}
        aria-hidden
      />
    </div>
  );
}
