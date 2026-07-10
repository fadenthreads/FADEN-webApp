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
        className="faden-hero-studio relative overflow-hidden px-4 pb-10 pt-8 sm:pb-14 sm:pt-10 lg:px-12 lg:pb-16 lg:pt-14"
      >
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-container flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
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

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-4 sm:mt-5">
              <motion.h1
                id="hero-heading"
                className="font-display text-[1.75rem] font-semibold leading-[1.1] tracking-tight text-navy sm:text-4xl lg:text-[2.85rem]"
              >
                {t("headlinePrefix")}{" "}
                <span className="text-navy">{t("headlineTrust")}</span>
              </motion.h1>
              <p className="font-display mt-3 max-w-xl text-[15px] leading-relaxed text-navy/75 sm:text-lg">
                {t("tagline")}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6 border-t border-navy/10 pt-5 sm:mt-7 sm:pt-6">
              <h2 className="text-[10px] font-semibold tracking-[0.32em] text-gold">{t("whyFaden")}</h2>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-foreground-muted sm:mt-3 sm:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-7 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button variant="luxury" size="lg" className="w-full sm:w-auto" onClick={onExploreBoutiques}>
                {t("exploreBoutiques")}
              </Button>
              <Button variant="luxury-outline" size="lg" className="w-full sm:w-auto" onClick={onExploreClothing}>
                {t("exploreClothing")}
              </Button>
              <Button asChild variant="luxury-outline" size="lg" className="w-full sm:w-auto">
                <Link href="/customize">{t("customizeOutfit")}</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-navy/70"
            >
              <button type="button" className="hover:text-navy hover:underline" onClick={onExploreMaterials}>
                {t("exploreMaterials")}
              </button>
              <Link href="/signup?next=/register-boutique&role=boutique_owner" className="hover:text-navy hover:underline">
                {t("registerBoutique")}
              </Link>
              <Link href="/signup?next=/register-material-business" className="hover:text-navy hover:underline">
                {t("registerMaterialBusiness")}
              </Link>
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
