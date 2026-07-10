"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { HeroFeatureBar } from "./hero-feature-bar";
import { HeroStats } from "./hero-stats";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
  onExploreClothing?: () => void;
  onExploreMaterials?: () => void;
}

export function HeroSection({
  onExploreBoutiques,
  onExploreClothing,
  onExploreMaterials,
}: HeroSectionProps) {
  const t = useTranslations("Hero");
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="faden-hero-studio relative overflow-hidden px-4 pb-8 pt-6 sm:pb-12 sm:pt-8 lg:px-12 lg:pb-14 lg:pt-12"
      >
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-container flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              transition={fadeUpTransition}
              className="text-[11px] font-semibold tracking-[0.28em] text-gold sm:text-xs"
            >
              {t("eyebrow")}
            </motion.p>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-3 sm:mt-4">
              <motion.h1
                id="hero-heading"
                className="font-display text-[1.75rem] font-semibold leading-[1.1] tracking-tight text-navy sm:text-4xl lg:text-[2.85rem]"
              >
                {t("headlinePrefix")}{" "}
                <span className="text-navy">{t("headlineTrust")}</span>
              </motion.h1>
              <p className="font-display mt-2.5 max-w-xl text-[15px] leading-relaxed text-navy/75 sm:mt-3 sm:text-lg">
                {t("tagline")}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-5 border-t border-navy/10 pt-4 sm:mt-6 sm:pt-5">
              <h2 className="text-[10px] font-semibold tracking-[0.32em] text-gold">{t("whyFaden")}</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-foreground-muted sm:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-6 grid grid-cols-1 gap-2 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3"
            >
              <Button variant="luxury" size="lg" className="w-full" onClick={onExploreBoutiques}>
                {t("exploreBoutiques")}
              </Button>
              <Button variant="luxury-outline" size="lg" className="w-full" onClick={onExploreClothing}>
                {t("exploreClothing")}
              </Button>
              <Button variant="luxury-outline" size="lg" className="w-full" onClick={onExploreMaterials}>
                {t("exploreMaterials")}
              </Button>
              <Button asChild variant="luxury-outline" size="lg" className="w-full">
                <Link href="/customize">{t("customizeOutfit")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="lg" className="w-full">
                <Link href="/signup?next=/register-boutique&role=boutique_owner">{t("registerBoutique")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="lg" className="w-full">
                <Link href="/signup?next=/register-material-business">{t("registerMaterialBusiness")}</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} transition={fadeUpTransition} className="w-full lg:max-w-sm lg:self-end">
            <HeroStats />
          </motion.div>
        </motion.div>
      </section>

      <HeroFeatureBar />
    </>
  );
}
