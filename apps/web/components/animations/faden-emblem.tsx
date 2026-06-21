"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FadenEmblem() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 90, delay: 0.2 }}
      className="relative flex flex-col items-center"
      aria-hidden
    >
      {/* Gold thread from top */}
      <motion.div
        className="absolute bottom-full left-1/2 h-[18vh] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#C9A227] to-[#D4AF37]"
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      />

      <svg
        viewBox="0 0 200 200"
        className="h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64"
        role="img"
        aria-label="FADEN emblem"
      >
        <defs>
          <radialGradient id="redHalo" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#DC2626" stopOpacity="0" />
            <stop offset="85%" stopColor="#DC2626" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="centerGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pulsing red halo */}
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          fill="url(#redHalo)"
          animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Rotating dashed gold ring */}
        <motion.g
          animate={reducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.9"
          />
        </motion.g>

        {/* Solid inner ring */}
        <circle cx="100" cy="100" r="62" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />

        {/* Dark spoked wheel */}
        <circle cx="100" cy="100" r="52" fill="#0a0a0a" stroke="#D4AF37" strokeWidth="1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 100 + Math.cos(rad) * 48;
          const y2 = 100 + Math.sin(rad) * 48;
          return (
            <line
              key={angle}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="#D4AF37"
              strokeWidth="0.75"
              opacity="0.85"
            />
          );
        })}

        {/* Center glowing dot */}
        <motion.circle
          cx="100"
          cy="100"
          r="6"
          fill="#EF4444"
          filter="url(#centerGlow)"
          animate={reducedMotion ? {} : { opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small FADEN inside emblem */}
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fill="url(#goldGrad)"
          fontSize="11"
          fontFamily="Georgia, 'Playfair Display', serif"
          letterSpacing="0.2em"
          fontWeight="600"
        >
          FADEN
        </text>
      </svg>
    </motion.div>
  );
}
