"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, scaleIn, staggerContainer } from "@/lib/motion-presets";

export function VisionStatement() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="border-t border-border px-4 py-10 md:py-section-gap">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto max-w-container text-center"
      >
        <motion.p variants={fadeUp} transition={fadeUpTransition} className="text-xs font-semibold tracking-[0.3em] text-gold">
          VISION STATEMENT
        </motion.p>
        <motion.blockquote
          variants={scaleIn}
          transition={fadeUpTransition}
          className="mx-auto mt-8 max-w-2xl font-display text-2xl italic leading-relaxed text-foreground md:text-3xl"
        >
          &ldquo;To become the most trusted platform for discovering, customizing, and managing
          boutique fashion.&rdquo;
        </motion.blockquote>
      </motion.div>
    </section>
  );
}
