"use client";

import { motion } from "framer-motion";

export function ThreadReel() {
  return (
    <motion.div
      initial={{ y: -280, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 90, delay: 0.2 }}
      className="relative"
    >
      {/* Thread strand dropping from reel */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 48 }}
        transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
        className="absolute left-1/2 top-full w-px -translate-x-1/2 bg-gradient-to-b from-gold/80 to-gold/20"
        aria-hidden
      />

      <svg
        viewBox="0 0 240 88"
        className="h-[72px] w-[200px] md:h-[88px] md:w-[240px]"
        aria-label="FADEN thread reel"
      >
        <defs>
          <linearGradient id="reelBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a2218" />
            <stop offset="50%" stopColor="#1a1510" />
            <stop offset="100%" stopColor="#0f0d0a" />
          </linearGradient>
          <linearGradient id="reelSpindle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8b6914" />
          </linearGradient>
          <linearGradient id="fadenReelText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5d061" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#c97a3a" />
          </linearGradient>
        </defs>

        {/* Side spindles */}
        <rect x="8" y="26" width="14" height="36" rx="4" fill="url(#reelSpindle)" />
        <rect x="218" y="26" width="14" height="36" rx="4" fill="url(#reelSpindle)" />

        {/* Reel body */}
        <rect x="22" y="22" width="196" height="44" rx="10" fill="url(#reelBody)" stroke="#d4af37" strokeWidth="0.75" strokeOpacity="0.4" />

        {/* Thread windings */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            x1={38 + i * 22}
            y1="28"
            x2={38 + i * 22}
            y2="60"
            stroke="#d4af37"
            strokeWidth="0.5"
            strokeOpacity={0.25 + i * 0.05}
          />
        ))}

        {/* FADEN engraved in reel */}
        <text
          x="120"
          y="52"
          textAnchor="middle"
          fill="url(#fadenReelText)"
          fontSize="18"
          fontFamily="Georgia, 'Playfair Display', serif"
          fontWeight="700"
          letterSpacing="0.18em"
        >
          FADEN
        </text>
      </svg>
    </motion.div>
  );
}
