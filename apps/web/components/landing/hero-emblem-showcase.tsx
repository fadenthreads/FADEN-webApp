"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadenEmblem } from "@/components/animations/faden-emblem";

interface HeroEmblemShowcaseProps {
  size?: "splash" | "hero";
}

export function HeroEmblemShowcase({ size = "hero" }: HeroEmblemShowcaseProps) {
  const reducedMotion = useReducedMotion();
  const emblemSize = size === "splash" ? "lg" : "md";

  return (
    <div
      className={
        size === "splash"
          ? "relative mx-auto flex w-full max-w-md flex-col items-center justify-center"
          : "relative mx-auto flex w-full max-w-sm flex-col items-center justify-center lg:max-w-md"
      }
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          className={size === "splash" ? "h-14 w-px bg-gradient-to-b from-transparent via-gold/70 to-gold/40" : "h-10 w-px bg-gradient-to-b from-transparent via-gold/70 to-gold/40"}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative">
          {!reducedMotion && (
            <>
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20"
                animate={{ rotate: 360, opacity: [0.35, 0.65, 0.35] }}
                transition={{
                  rotate: { duration: size === "splash" ? 18 : 24, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 4, repeat: Infinity },
                }}
              />
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[138%] w-[138%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy/10"
                animate={{ rotate: -360 }}
                transition={{
                  duration: size === "splash" ? 22 : 36,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </>
          )}

          <div className="relative rounded-full p-3">
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-gold/10 blur-2xl"
              animate={reducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <FadenEmblem size={emblemSize} wheelSpeed={size === "splash" ? "splash" : "slow"} />
          </div>
        </div>
      </div>
    </div>
  );
}
