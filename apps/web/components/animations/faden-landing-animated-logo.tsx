"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const GOLD = "#B38B38";
const EASE: [number, number, number, number] = [0.42, 0, 0.58, 1];

const LANDING_LOGO = "/faden-landing-logo.png";

const ARCH_PATH =
  "M 160 28 L 248 88 L 248 248 L 72 248 L 72 88 Z M 160 28 L 72 88 M 160 28 L 248 88";

const DRESS_SILHOUETTE =
  "M 160 78 L 132 98 L 118 130 L 108 248 L 212 248 L 202 130 L 188 98 Z M 160 78 L 160 108";

const DETAIL_PATHS = [
  "M 160 118 C 160 140, 148 168, 132 210",
  "M 160 118 C 160 140, 172 168, 188 210",
  "M 160 130 L 160 220",
  "M 145 150 C 152 165, 155 180, 148 195",
  "M 175 150 C 168 165, 165 180, 172 195",
  "M 128 230 L 192 230",
];

function DrawStroke({
  d,
  delay,
  duration,
  strokeWidth = 1.4,
}: {
  d: string;
  delay: number;
  duration: number;
  strokeWidth?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={GOLD}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration, delay, ease: EASE }}
    />
  );
}

interface FadenLandingAnimatedLogoProps {
  onSequenceComplete?: () => void;
}

export function FadenLandingAnimatedLogo({ onSequenceComplete }: FadenLandingAnimatedLogoProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="relative mx-auto w-full max-w-[min(92vw,420px)]">
        <Image
          src={LANDING_LOGO}
          alt="FADEN — It all starts with a thread"
          width={420}
          height={580}
          priority
          className="h-auto w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto aspect-[420/580] w-full max-w-[min(92vw,420px)]"
      aria-label="FADEN brand reveal"
    >
      {/* Phases 3–5: logo artwork reveals top → bottom */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)", y: 10 }}
        animate={{
          opacity: 1,
          clipPath: ["inset(100% 0 0 0)", "inset(38% 0 0 0)", "inset(8% 0 0 0)", "inset(0 0 0 0)"],
          y: [10, 6, 3, 0],
        }}
        transition={{
          duration: 4,
          delay: 2.4,
          times: [0, 0.35, 0.65, 1],
          ease: EASE,
        }}
        onAnimationComplete={() => onSequenceComplete?.()}
      >
        <Image
          src={LANDING_LOGO}
          alt="FADEN — It all starts with a thread"
          fill
          priority
          sizes="(max-width: 420px) 92vw, 420px"
          className="object-contain object-center"
        />
      </motion.div>

      {/* Phases 1–3: gold thread draw (fades once artwork appears) */}
      <motion.svg
        viewBox="0 0 320 280"
        className="absolute inset-x-0 top-0 h-[48%] w-full"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 4.1, duration: 0.9, ease: EASE }}
        aria-hidden
      >
        <DrawStroke d={ARCH_PATH} delay={0} duration={1.5} strokeWidth={1.6} />
        <DrawStroke d={DRESS_SILHOUETTE} delay={1} duration={2} strokeWidth={1.5} />
        {DETAIL_PATHS.map((path, index) => (
          <DrawStroke key={path} d={path} delay={2.5 + index * 0.12} duration={1.4} strokeWidth={0.9} />
        ))}
      </motion.svg>

      {/* Phase 5: soft gold shimmer on tagline zone */}
      <motion.div
        className="pointer-events-none absolute inset-x-[20%] bottom-[4%] h-[8%] rounded-full bg-gold/20 blur-md"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 0.55, 0.25], scale: [0.85, 1.05, 1] }}
        transition={{ delay: 5, duration: 1.5, ease: EASE }}
        aria-hidden
      />
    </div>
  );
}
