"use client";

import { CheckCircle2, MessageCircle, Search, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

const STEPS = [
  {
    icon: Search,
    title: "Discover",
    description: "Search boutiques by category, style, or location.",
  },
  {
    icon: MessageCircle,
    title: "Connect",
    description: "View portfolios, read reviews, and connect directly.",
  },
  {
    icon: Sparkles,
    title: "Customize",
    description: "Discuss your requirements and get a custom quote.",
  },
  {
    icon: CheckCircle2,
    title: "Create & Receive",
    description: "Approve the design and get your perfect outfit.",
  },
] as const;

export function HowItWorks() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-[160px] border-t border-navy/8 px-4 py-10 md:py-section-gap lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto max-w-container"
      >
        <motion.div variants={fadeUp} transition={fadeUpTransition} className="text-center">
          <p className="text-xs font-semibold tracking-[0.32em] text-gold">HOW IT WORKS</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-navy md:text-4xl">
            Custom Fashion, Simplified
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                variants={fadeUp}
                transition={{ ...fadeUpTransition, delay: index * 0.08 }}
                className="rounded-2xl border border-navy/10 bg-background-elevated p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <Icon className="h-5 w-5 text-gold" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
