"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const GOLD = "#B38B38";
const GOLD_LIGHT = "#C5A059";
const NAVY = "#0A1128";

const EASE = [0.42, 0, 0.58, 1] as const;

function DrawPath({
  d,
  delay = 0,
  duration = 1.5,
  strokeWidth = 1.2,
  className,
}: {
  d: string;
  delay?: number;
  duration?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={GOLD}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration, delay, ease: EASE }}
    />
  );
}

interface FadenAnimatedLogoProps {
  className?: string;
  onAnimationComplete?: () => void;
  /** When true, sizes to fill hero viewport. */
  fillViewport?: boolean;
  /** When false, shows the finished logo image without drawing. */
  playAnimation?: boolean;
}

export function FadenAnimatedLogo({
  className,
  onAnimationComplete,
  fillViewport = false,
  playAnimation = true,
}: FadenAnimatedLogoProps) {
  const reducedMotion = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion || !playAnimation) {
      onAnimationComplete?.();
      return;
    }
    const timer = window.setTimeout(() => {
      setDone(true);
      onAnimationComplete?.();
    }, 6800);
    return () => window.clearTimeout(timer);
  }, [onAnimationComplete, playAnimation, reducedMotion]);

  const sizeClass = fillViewport
    ? "h-[min(68vh,720px)] w-auto max-w-[min(92vw,520px)]"
    : "h-auto w-full max-w-[min(92vw,360px)]";

  if (reducedMotion || !playAnimation) {
    return (
      <div className={className}>
        <Image
          src="/faden-logo.png"
          alt="FADEN"
          width={320}
          height={448}
          priority
          className={
            fillViewport
              ? "h-[min(68vh,720px)] w-auto max-w-[min(92vw,520px)] object-contain"
              : "h-auto w-full max-w-[min(92vw,360px)] object-contain"
          }
        />
      </div>
    );
  }

  return (
    <div className={className} aria-label="FADEN">
      <svg
        viewBox="0 0 320 480"
        className={sizeClass}
        role="img"
        aria-hidden={!done}
      >
        <defs>
          <linearGradient id="fadenGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B87A" />
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
        </defs>

        {/* Phase 1 — Mughal arch frame (0–1.5s) */}
        <g id="arch-frame">
          <DrawPath
            d="M 160 28 C 118 28, 98 62, 98 98 L 98 168 L 222 168 L 222 98 C 222 62, 202 28, 160 28 Z"
            delay={0}
            duration={1.5}
            strokeWidth={1.4}
          />
          <DrawPath
            d="M 160 38 C 126 38, 110 66, 110 98 L 110 158 L 210 158 L 210 98 C 210 66, 194 38, 160 38 Z"
            delay={0.15}
            duration={1.35}
            strokeWidth={0.9}
          />
          <DrawPath d="M 98 168 L 222 168" delay={1.1} duration={0.4} strokeWidth={1.2} />
        </g>

        {/* Phase 2 — Mannequin & dress silhouette (1–3s) */}
        <g id="dress-silhouette">
          <motion.path
            d="M 160 72 L 152 88 L 148 108 L 132 118 L 128 168 L 192 168 L 188 118 L 172 108 L 168 88 Z"
            fill={NAVY}
            fillOpacity={0.08}
            stroke={GOLD}
            strokeWidth={1.2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1, ease: EASE }}
          />
          <DrawPath
            d="M 128 168 Q 128 210, 118 248 Q 108 286, 112 320 Q 116 354, 160 360 Q 204 354, 208 320 Q 212 286, 202 248 Q 192 210, 192 168"
            delay={1.2}
            duration={1.8}
            strokeWidth={1.3}
          />
        </g>

        {/* Phase 3 — Intricate vine & floral details (2.5–4.5s) */}
        <g id="dress-details" stroke={GOLD} strokeWidth={0.7} fill="none" strokeLinecap="round">
          <DrawPath d="M 160 200 Q 150 230, 152 260 Q 154 290, 160 310" delay={2.5} duration={1.2} strokeWidth={0.8} />
          <DrawPath d="M 160 200 Q 170 228, 168 258 Q 166 288, 160 308" delay={2.65} duration={1.1} strokeWidth={0.8} />
          <DrawPath d="M 145 220 Q 138 240, 142 255" delay={2.8} duration={0.9} strokeWidth={0.6} />
          <DrawPath d="M 175 220 Q 182 240, 178 255" delay={2.9} duration={0.9} strokeWidth={0.6} />
          <DrawPath d="M 160 175 Q 148 185, 146 198 Q 144 208, 150 215" delay={3} duration={1} strokeWidth={0.6} />
          <DrawPath d="M 160 175 Q 172 185, 174 198 Q 176 208, 170 215" delay={3.1} duration={1} strokeWidth={0.6} />
          <DrawPath d="M 135 270 Q 128 285, 132 300" delay={3.2} duration={0.85} strokeWidth={0.55} />
          <DrawPath d="M 185 270 Q 192 285, 188 300" delay={3.3} duration={0.85} strokeWidth={0.55} />
        </g>

        {/* Phase 4 — Brand name FADEN (4–5.5s) */}
        <motion.text
          x="160"
          y="400"
          textAnchor="middle"
          fill={NAVY}
          fontSize="42"
          fontFamily="Georgia, 'Cormorant Garamond', serif"
          letterSpacing="0.18em"
          fontWeight="600"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 4, ease: EASE }}
        >
          FADEN
        </motion.text>

        {/* Phase 5 — Tagline flourishes & copy (5–6.5s) */}
        <g id="tagline-lockup">
          <motion.path
            d="M 72 418 H 248"
            fill="none"
            stroke="url(#fadenGold)"
            strokeWidth={0.8}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 5, ease: EASE }}
          />
          <motion.circle
            cx="160"
            cy="418"
            r="2.5"
            fill={GOLD}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 5.4, ease: EASE }}
          />
          <motion.text
            x="160"
            y="442"
            textAnchor="middle"
            fill={GOLD}
            fontSize="9"
            fontFamily="Georgia, 'Cormorant Garamond', serif"
            letterSpacing="0.28em"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 5.2, ease: EASE }}
          >
            IT ALL STARTS WITH A THREAD
          </motion.text>
          <motion.path
            d="M 160 452 Q 145 458, 138 468 Q 132 476, 140 478 M 160 452 Q 175 458, 182 468 Q 188 476, 180 478"
            fill="none"
            stroke={GOLD_LIGHT}
            strokeWidth={0.7}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1, delay: 5.5, ease: EASE }}
          />
        </g>
      </svg>
    </div>
  );
}
