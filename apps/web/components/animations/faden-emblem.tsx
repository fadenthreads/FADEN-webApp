"use client";

import { motion, useReducedMotion } from "framer-motion";

const NAVY = "#161d6e";
const GOLD = "#C5A059";
const GOLD_DARK = "#B8860B";
const CENTER_GLOW = "#E85D4C";

export function FadenEmblem({
  size = "lg",
  wheelSpeed = "slow",
}: {
  size?: "sm" | "md" | "lg";
  wheelSpeed?: "off" | "slow" | "splash";
}) {
  const reducedMotion = useReducedMotion();
  const sizeClass =
    size === "sm"
      ? "h-24 w-24 md:h-28 md:w-28"
      : size === "md"
        ? "h-32 w-32 md:h-36 md:w-36"
        : "h-40 w-40 md:h-48 md:w-48 lg:h-52 lg:w-52";

  const spinEnabled = !reducedMotion && wheelSpeed !== "off";
  const spinDuration = wheelSpeed === "splash" ? 14 : 28;

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
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CENTER_GLOW} stopOpacity="0.95" />
            <stop offset="55%" stopColor={CENTER_GLOW} stopOpacity="0.35" />
            <stop offset="100%" stopColor={CENTER_GLOW} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="94" fill="none" stroke={NAVY} strokeWidth="1.2" opacity="0.85" />

        <motion.g
          animate={spinEnabled ? { rotate: 360 } : {}}
          transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
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

          <motion.circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke={CENTER_GLOW}
            strokeWidth="1"
            animate={spinEnabled ? { opacity: [0.2, 0.45, 0.2] } : {}}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <circle cx="100" cy="100" r="68" fill={NAVY} stroke="url(#emblemGold)" strokeWidth="1" />
          <circle cx="100" cy="100" r="22" fill="url(#centerGlow)" opacity="0.55" />

          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
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
                stroke={GOLD}
                strokeWidth="0.7"
                opacity="0.65"
              />
            );
          })}

          <circle cx="100" cy="100" r="10" fill="#FAF8F4" stroke="url(#emblemGold)" strokeWidth="1.2" />
          <circle cx="100" cy="100" r="4.5" fill="url(#emblemGold)" />
        </motion.g>

        <motion.g
          animate={spinEnabled ? { rotate: -360 } : {}}
          transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
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
        </motion.g>
      </svg>
    </motion.div>
  );
}
