"use client";

import { motion, useReducedMotion } from "framer-motion";

export function MissionVision() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="border-t border-border px-4 py-section-gap">
      <div className="mx-auto max-w-container space-y-16 text-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-semibold">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-foreground-muted">
            To connect customers with trusted boutiques and simplify the entire custom-fashion
            journey from discovery to delivery.
          </p>
        </motion.div>
        <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-3xl font-semibold">Our Vision</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-foreground-muted">
            To become the most trusted platform for discovering, customizing, and managing boutique
            fashion.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
