"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function SwipeDownPrompt() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-10 flex flex-col items-center gap-2" aria-hidden>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-[10px] font-medium tracking-[0.35em] text-navy/60 md:text-[11px]"
      >
        SWIPE DOWN
      </motion.span>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55, duration: 0.6 }}
      >
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-gold" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </div>
  );
}
