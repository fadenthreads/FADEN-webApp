"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FadenEmblem({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const reducedMotion = useReducedMotion();
  const sizeClass =
    size === "sm" ? "h-24 w-24 md:h-28 md:w-28" : size === "md" ? "h-32 w-32 md:h-36 md:w-36" : "h-40 w-40 md:h-48 md:w-48 lg:h-52 lg:w-52";

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 120, delay: 0.15 }}
      className="relative flex flex-col items-center"
      aria-hidden
    >
      <svg viewBox="0 0 200 200" className={sizeClass} role="img" aria-label="FADEN emblem">
        <defs>
          <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B87A" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>

        {/* Outer solid ring */}
        <circle cx="100" cy="100" r="94" fill="none" stroke="#0A1A30" strokeWidth="1.2" opacity="0.85" />

        {/* Dashed stitch ring */}
        <motion.g
          animate={reducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="url(#emblemGold)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.95"
          />
        </motion.g>

        {/* Navy spoked wheel */}
        <circle cx="100" cy="100" r="68" fill="#0A1A30" stroke="url(#emblemGold)" strokeWidth="1" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 100 + Math.cos(rad) * 64;
          const y2 = 100 + Math.sin(rad) * 64;
          return (
            <line
              key={angle}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="#F5F0E6"
              strokeWidth="0.6"
              opacity="0.55"
            />
          );
        })}

        {/* Center button / thread spool (behind label) */}
        <circle cx="100" cy="100" r="10" fill="#F5F0E6" stroke="url(#emblemGold)" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="4.5" fill="url(#emblemGold)" />

        {/* FADEN — horizontal across wheel center */}
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#emblemGold)"
          fontSize="12.5"
          fontFamily="Georgia, 'Cormorant Garamond', serif"
          letterSpacing="0.11em"
          fontWeight="600"
        >
          FADEN
        </text>
      </svg>
    </motion.div>
  );
}
