"use client";

import { motion, useReducedMotion } from "framer-motion";

const TAGLINE = "It All Starts With a Thread";

export function TaglineReveal() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <p className="font-display mt-5 text-center text-lg italic text-gold/90 md:text-xl">
        {TAGLINE}
      </p>
    );
  }

  return (
    <p
      className="font-display mt-5 text-center text-lg italic text-gold/90 md:text-xl"
      aria-label={TAGLINE}
    >
      {TAGLINE.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 + i * 0.02, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </p>
  );
}
