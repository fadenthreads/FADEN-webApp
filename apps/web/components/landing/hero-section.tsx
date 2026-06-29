"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { HeroDecoration } from "./hero-decoration";
import { HeroStats } from "./hero-stats";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
  onExploreClothing?: () => void;
}

export function HeroSection({ onExploreBoutiques, onExploreClothing }: HeroSectionProps) {
  const t = useTranslations("Hero");
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
            {t("headlinePrefix")}{" "}
            <span className="faden-trust-gradient">{t("headlineTrust")}</span>
          </motion.h1>

          <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6">
            <h2 className="text-xs font-semibold tracking-[0.3em] text-gold">{t("whyFaden")}</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-foreground-muted md:text-lg">
              {t("subtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={fadeUpTransition}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <Button variant="luxury" size="lg" onClick={onExploreBoutiques}>
              {t("exploreBoutiques")}
            </Button>
            <Button variant="luxury-outline" size="lg" onClick={onExploreClothing}>
              {t("exploreClothing")}
            </Button>
            <Button asChild variant="luxury-outline" size="lg">
              <Link href="/customize">{t("customizeOutfit")}</Link>
            </Button>
            <Button asChild variant="luxury-outline" size="lg">
              <Link href="/signup?next=/register-boutique&role=boutique_owner">{t("registerBoutique")}</Link>
            </Button>
            <Button asChild variant="luxury-outline" size="lg">
              <Link href="/alterations">{t("alterations")}</Link>
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
