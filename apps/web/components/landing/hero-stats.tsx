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
      transition={{ duration: 0.8, delay: 0.6 }}
      className="rounded-2xl border border-navy/10 bg-background-elevated/80 px-6 py-5 shadow-sm backdrop-blur-sm"
    >
      <div className="flex flex-wrap gap-6 md:gap-8 lg:justify-end">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
            className="text-center lg:text-right"
          >
            <div className="flex items-center justify-center gap-1 lg:justify-end">
              <span className="faden-stat-gradient font-display text-2xl font-bold md:text-3xl">
                {stat.value}
              </span>
              {stat.showStar && (
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
              )}
            </div>
            <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-foreground-muted">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
