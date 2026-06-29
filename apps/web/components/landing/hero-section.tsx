"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { FadenEmblem } from "@/components/animations/faden-emblem";
import { HeroDecoration } from "./hero-decoration";
import { HeroFeatureBar } from "./hero-feature-bar";
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
    <>
      <section
        aria-labelledby="hero-heading"
        className="faden-hero-studio relative overflow-hidden px-4 pb-8 pt-10 lg:px-12 lg:pb-10 lg:pt-14"
      >
        <HeroDecoration />

        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-container flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-12"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              transition={fadeUpTransition}
              className="text-[10px] font-semibold tracking-[0.28em] text-gold md:text-xs"
            >
              {t("eyebrow")}
            </motion.p>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <FadenEmblem size="sm" />
              <div>
                <motion.h1
                  id="hero-heading"
                  className="font-display text-3xl font-bold leading-[1.1] tracking-[0.06em] text-navy md:text-4xl lg:text-[2.75rem]"
                >
                  {t("headlinePrefix")}{" "}
                  <span className="faden-trust-gradient">{t("headlineTrust")}</span>
                </motion.h1>
                <p className="font-display mt-2 text-base italic leading-relaxed text-navy/75 md:text-lg">
                  {t("tagline")}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6 border-t border-navy/10 pt-6">
              <h2 className="text-[10px] font-semibold tracking-[0.28em] text-gold">{t("whyFaden")}</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-foreground-muted md:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
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

      <HeroFeatureBar />
    </>
  );
}
