"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadenEmblem } from "./faden-emblem";
import { FadenWordmark } from "./faden-wordmark";
import { TaglineReveal } from "./tagline-reveal";
import { SwipeDownPrompt } from "./swipe-down-prompt";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { openingItem, openingStagger } from "@/lib/motion-presets";

interface OpeningSequenceProps {
  onComplete: () => void;
}

export function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(containerRef);
  const reducedMotion = useReducedMotion();
  const playedRef = useRef(false);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const handleComplete = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setVisible(false);
    onComplete();
  }, [exiting, onComplete]);

  useEffect(() => {
    if (reducedMotion && !playedRef.current) {
      playedRef.current = true;
      const timer = setTimeout(handleComplete, 1600);
      return () => clearTimeout(timer);
    }
  }, [reducedMotion, handleComplete]);

  useEffect(() => {
    if (!reducedMotion && scrollProgress >= 0.55) {
      handleComplete();
    }
  }, [scrollProgress, reducedMotion, handleComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") handleComplete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleComplete]);

  const content = (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <motion.div
        className="flex flex-col items-center"
        variants={openingStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={openingItem}>
          <FadenEmblem />
        </motion.div>
        <motion.div variants={openingItem}>
          <FadenWordmark />
        </motion.div>
        <motion.div variants={openingItem}>
          <TaglineReveal />
        </motion.div>
        <motion.div variants={openingItem}>
          <SwipeDownPrompt />
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="FADEN opening animation. Swipe down or press Escape to continue."
        >
          {reducedMotion ? (
            content
          ) : (
            <motion.div
              animate={{ opacity: exiting ? 0 : 1 }}
              transition={{ duration: 0.45 }}
            >
              {content}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
