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
        className="faden-hero-studio relative overflow-hidden px-4 pb-14 pt-10 lg:px-12 lg:pb-16 lg:pt-14"
      >
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-container flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              transition={fadeUpTransition}
              className="text-[10px] font-semibold tracking-[0.32em] text-gold md:text-xs"
            >
              {t("eyebrow")}
            </motion.p>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-5">
              <motion.h1
                id="hero-heading"
                className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight text-navy md:text-4xl lg:text-[2.85rem]"
              >
                {t("headlinePrefix")}{" "}
                <span className="text-navy">{t("headlineTrust")}</span>
              </motion.h1>
              <p className="font-display mt-3 text-base italic leading-relaxed text-navy/70 md:text-lg">
                {t("tagline")}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-7 border-t border-navy/10 pt-6">
              <h2 className="text-[10px] font-semibold tracking-[0.32em] text-gold">{t("whyFaden")}</h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-foreground-muted md:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button variant="luxury" size="lg" onClick={onExploreBoutiques}>
                {t("exploreBoutiques")}
              </Button>
              <Button variant="luxury-outline" size="lg" onClick={onExploreClothing}>
                {t("exploreClothing")}
              </Button>
              <Button variant="luxury-outline" size="lg" onClick={onExploreMaterials}>
                {t("exploreMaterials")}
              </Button>
              <Button asChild variant="luxury-outline" size="lg">
                <Link href="/customize">{t("customizeOutfit")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="lg">
                <Link href="/signup?next=/register-boutique&role=boutique_owner">{t("registerBoutique")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="lg">
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
