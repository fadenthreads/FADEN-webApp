"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { FadenAnimatedLogo } from "@/components/brand/faden-animated-logo";
import { HeroFeatureBar } from "./hero-feature-bar";
import { HeroStats } from "./hero-stats";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
  onExploreClothing?: () => void;
  onExploreMaterials?: () => void;
  /** Skip draw animation when the opening splash already played it. */
  skipLogoAnimation?: boolean;
}

export function HeroSection({
  onExploreBoutiques,
  onExploreClothing,
  onExploreMaterials,
  skipLogoAnimation = false,
}: HeroSectionProps) {
  const t = useTranslations("Hero");
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="faden-hero-studio relative flex min-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden md:min-h-[calc(100dvh-8.5rem)]"
      >
        <motion.div
          className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-10"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={fadeUp} transition={fadeUpTransition} className="flex w-full flex-col items-center">
            <FadenAnimatedLogo
              fillViewport
              playAnimation={!skipLogoAnimation}
              className="flex w-full justify-center"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto w-full max-w-container px-4 pb-12 pt-2 lg:px-12 lg:pb-16"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <motion.p
                variants={fadeUp}
                transition={fadeUpTransition}
                className="text-[10px] font-semibold tracking-[0.32em] text-gold md:text-xs"
              >
                {t("eyebrow")}
              </motion.p>

              <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-4 border-t border-navy/10 pt-5">
                <h1 id="hero-heading" className="sr-only">
                  {t("headlinePrefix")} {t("headlineTrust")}
                </h1>
                <h2 className="text-[10px] font-semibold tracking-[0.32em] text-gold">{t("whyFaden")}</h2>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-foreground-muted md:text-base">
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
          </div>
        </motion.div>
      </section>

      <HeroFeatureBar />
    </>
  );
}
