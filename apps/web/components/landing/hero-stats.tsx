"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

const STATS = [
  { value: "1,240+", label: "BOUTIQUES" },
  { value: "48K+", label: "HAPPY CUSTOMERS" },
  { value: "4.9", label: "AVG RATING", showStar: true },
];

export function HeroStats() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="flex flex-wrap gap-8 md:gap-12 lg:justify-end"
    >
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 + i * 0.12 }}
          className="text-center lg:text-right"
        >
          <div className="flex items-center justify-center gap-1 lg:justify-end">
            <span className="faden-stat-gradient font-display text-3xl font-bold md:text-4xl">
              {stat.value}
            </span>
            {stat.showStar && (
              <Star className="h-5 w-5 fill-red-accent text-red-accent" aria-hidden />
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium tracking-[0.2em] text-foreground-muted">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
