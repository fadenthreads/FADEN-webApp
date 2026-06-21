"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function SwipeDownPrompt() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-12 flex flex-col items-center gap-2" aria-hidden>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-[11px] font-medium tracking-[0.35em] text-gold md:text-xs"
      >
        SWIPE DOWN
      </motion.span>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.85, duration: 0.6 }}
      >
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-gold" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </div>
  );
}
