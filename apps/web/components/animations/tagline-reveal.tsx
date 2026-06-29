"use client";

import { motion, useReducedMotion } from "framer-motion";

const TAGLINE = "Threads that connect stories, people & traditions.";

export function TaglineReveal() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <p className="font-display mt-4 max-w-md text-center text-base italic leading-relaxed text-navy/80 md:text-lg">
        {TAGLINE}
      </p>
    );
  }

  return (
    <p className="font-display mt-4 max-w-md text-center text-base italic leading-relaxed text-navy/80 md:text-lg" aria-label={TAGLINE}>
      {TAGLINE.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.018, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </p>
  );
}
