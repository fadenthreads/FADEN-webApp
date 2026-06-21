"use client";

import { motion } from "framer-motion";

interface ScissorsCutProps {
  trigger: boolean;
  onComplete: () => void;
}

export function ScissorsCut({ trigger, onComplete }: ScissorsCutProps) {
  if (!trigger) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="mt-2"
      onAnimationComplete={() => {
        setTimeout(onComplete, 700);
      }}
    >
      <motion.svg
        width="60"
        height="40"
        viewBox="0 0 60 40"
        aria-hidden
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -5, 0] }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <defs>
          <linearGradient id="scissorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8B8B8" />
            <stop offset="100%" stopColor="#888888" />
          </linearGradient>
        </defs>
        <motion.g
          initial={{ rotate: 25 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{ transformOrigin: "30px 20px" }}
        >
          <path d="M5 5 L25 20 L5 35 Z" fill="url(#scissorGrad)" />
          <path d="M55 5 L35 20 L55 35 Z" fill="url(#scissorGrad)" />
          <circle cx="30" cy="20" r="4" fill="#666" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
