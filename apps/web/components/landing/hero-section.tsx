"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@faden/ui";
import { HeroDecoration } from "./hero-decoration";
import { HeroStats } from "./hero-stats";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
}

export function HeroSection({ onExploreBoutiques }: HeroSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="faden-hero-glow relative flex flex-col px-4 pb-6 pt-10 lg:px-12 lg:pb-8 lg:pt-14"
    >
      <HeroDecoration />

      <motion.div
        className="mx-auto flex w-full max-w-container flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-12"
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        animate="visible"
      >
        <div className="max-w-2xl">
          <motion.h1
            id="hero-heading"
            variants={fadeUp}
            transition={fadeUpTransition}
            className="font-display text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-[3.5rem]"
          >
            FADEN — Where Fashion Begins With{" "}
            <span className="faden-trust-gradient">Trust.</span>
          </motion.h1>

          <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6">
            <h2 className="text-xs font-semibold tracking-[0.3em] text-gold">WHY FADEN</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-foreground-muted md:text-lg">
              Discover highly rated boutiques, browse designer portfolios and get your dream outfits
              created with confidence — along with secure payments and verified reviews.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={fadeUpTransition}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button variant="luxury" size="lg" onClick={onExploreBoutiques}>
              Explore Boutiques
            </Button>
            <Button asChild variant="luxury-outline" size="lg">
              <Link href="/customize">Customize Outfit</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-8 lg:mt-0 lg:self-end">
          <HeroStats />
        </motion.div>
      </motion.div>
    </section>
  );
}
