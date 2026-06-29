"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { FadenEmblem } from "@/components/animations/faden-emblem";
import { TaglineReveal } from "@/components/animations/tagline-reveal";
import { HeroCtaArrow, HeroFeatureBar } from "@/components/landing/hero-feature-bar";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
  onExploreClothing?: () => void;
}

export function HeroSection({ onExploreBoutiques, onExploreClothing }: HeroSectionProps) {
  const t = useTranslations("Hero");
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="faden-hero-backdrop relative min-h-[min(88vh,920px)] overflow-hidden"
      >
        {/* Warm overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f5f0e6]/55 via-[#f5f1e9]/75 to-background" aria-hidden />

        {/* Decorative gold flourish */}
        <div className="pointer-events-none absolute bottom-24 right-4 h-24 w-24 opacity-30 md:right-12 md:h-32 md:w-32" aria-hidden>
          <svg viewBox="0 0 100 100" className="h-full w-full text-gold">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <path d="M50 10 Q70 30 50 50 Q30 70 50 90" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </svg>
        </div>

        <motion.div
          className="relative z-10 mx-auto flex min-h-[min(88vh,920px)] max-w-container flex-col items-center justify-center px-4 pb-16 pt-8 text-center lg:px-12 lg:pb-20 lg:pt-12"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={fadeUp} transition={fadeUpTransition}>
            <FadenEmblem size="md" />
          </motion.div>

          <motion.div variants={fadeUp} transition={fadeUpTransition}>
            <p id="hero-heading" className="font-display mt-4 text-[3.25rem] font-bold leading-none tracking-[0.12em] text-navy md:text-[5rem] lg:text-[5.5rem]" aria-label="FADEN">
              FADEN
            </p>
          </motion.div>

          <motion.div variants={fadeUp} transition={fadeUpTransition}>
            <TaglineReveal />
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={fadeUpTransition}
            className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Button variant="luxury" size="lg" className="w-full sm:w-auto" onClick={onExploreClothing}>
              <HeroCtaArrow>{t("shopCollection")}</HeroCtaArrow>
            </Button>
            <Button variant="luxury-outline" size="lg" className="w-full bg-white/60 sm:w-auto" onClick={onExploreBoutiques}>
              <HeroCtaArrow>{t("exploreBoutiques")}</HeroCtaArrow>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={fadeUpTransition}
            className="mt-5 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild variant="ghost" size="sm" className="text-navy/70 hover:text-navy">
              <Link href="/customize">{t("customizeOutfit")}</Link>
            </Button>
            <span className="text-navy/20" aria-hidden>·</span>
            <Button asChild variant="ghost" size="sm" className="text-navy/70 hover:text-navy">
              <Link href="/signup?next=/register-boutique&role=boutique_owner">{t("registerBoutique")}</Link>
            </Button>
            <span className="text-navy/20" aria-hidden>·</span>
            <Button asChild variant="ghost" size="sm" className="text-navy/70 hover:text-navy">
              <Link href="/alterations">{t("alterations")}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <HeroFeatureBar />
    </>
  );
}
