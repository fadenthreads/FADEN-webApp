"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, MessageCircle, Shield, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { PlatformStatsBar } from "./platform-stats-bar";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

interface HeroSectionProps {
  onExploreBoutiques?: () => void;
  onExploreClothing?: () => void;
  onExploreMaterials?: () => void;
}

const TRUST_ITEMS = [
  { icon: Shield, label: "Trusted Boutiques" },
  { icon: MapPin, label: "Near You" },
  { icon: MessageCircle, label: "Direct Connect" },
  { icon: Star, label: "Real Reviews" },
] as const;

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
        className="faden-hero-studio relative overflow-hidden px-4 pb-8 pt-6 sm:pb-10 sm:pt-8 lg:px-12 lg:pb-12 lg:pt-10"
      >
        <motion.div
          className="relative z-10 mx-auto grid w-full max-w-container gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12"
          variants={staggerContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <div className="max-w-xl">
            <motion.p
              variants={fadeUp}
              transition={fadeUpTransition}
              className="text-[11px] font-semibold tracking-[0.32em] text-gold sm:text-xs"
            >
              {t("eyebrow")}
            </motion.p>

            <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-4">
              <h1
                id="hero-heading"
                className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight text-navy sm:text-4xl lg:text-[2.85rem]"
              >
                {t("headlinePrefix")}{" "}
                <span className="font-display italic text-gold">{t("headlineTrust")}</span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-foreground-muted sm:text-base">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap"
            >
              <Button variant="luxury" size="lg" className="w-full sm:w-auto" onClick={onExploreBoutiques}>
                {t("exploreBoutiques")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
              <Button asChild variant="luxury-outline" size="lg" className="w-full sm:w-auto">
                <Link href="#how-it-works">{t("howItWorks")}</Link>
              </Button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-5"
            >
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-xs font-medium text-navy/80 sm:text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {label}
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={fadeUp}
              transition={fadeUpTransition}
              className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              <Button variant="luxury-outline" size="default" className="w-full" onClick={onExploreClothing}>
                {t("exploreClothing")}
              </Button>
              <Button variant="luxury-outline" size="default" className="w-full" onClick={onExploreMaterials}>
                {t("exploreMaterials")}
              </Button>
              <Button asChild variant="luxury-outline" size="default" className="w-full sm:col-span-2 lg:col-span-1">
                <Link href="/customize">{t("customizeOutfit")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="default" className="w-full">
                <Link href="/signup?next=/register-boutique&role=boutique_owner">{t("registerBoutique")}</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="default" className="w-full sm:col-span-2 lg:col-span-2">
                <Link href="/signup?next=/register-material-business">{t("registerMaterialBusiness")}</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} transition={fadeUpTransition} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-gold/50 bg-background-elevated p-3 shadow-lg sm:rounded-[2.5rem] sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                <Image
                  src="/hero-background.png"
                  alt="Premium boutique outfit showcase"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 520px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/25 via-transparent to-transparent" />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full border border-gold/30 bg-gold/10 blur-sm" aria-hidden />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full border border-navy/10 bg-white/60 blur-sm" aria-hidden />
          </motion.div>
        </motion.div>
      </section>

      <PlatformStatsBar />
    </>
  );
}
