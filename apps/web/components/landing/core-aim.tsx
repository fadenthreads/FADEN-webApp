"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

export function CoreAim() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="faden-section-neat border-t bg-background-soft/40 px-4 py-section-gap">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto max-w-container text-center"
      >
        <motion.p variants={fadeUp} transition={fadeUpTransition} className="text-xs font-semibold tracking-[0.3em] text-gold">
          FADEN&apos;S CORE AIM
        </motion.p>
        <motion.p
          variants={fadeUp}
          transition={fadeUpTransition}
          className="mx-auto mt-6 max-w-2xl font-display text-2xl leading-relaxed text-navy md:text-3xl"
        >
          To connect customers with trusted boutiques and simplify the entire custom-fashion journey
          from discovery to delivery.
        </motion.p>
      </motion.div>
    </section>
  );
}
