"use client";

import Link from "next/link";
import { ArrowRight, Gem, Heart, Layers, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Designed In-House",
    description: "Thoughtfully designed with love",
  },
  {
    icon: Gem,
    title: "Artisan Crafted",
    description: "Rooted in tradition, crafted to perfection",
  },
  {
    icon: Layers,
    title: "Limited Production",
    description: "Quality over quantity, always",
  },
  {
    icon: Heart,
    title: "Made With Passion",
    description: "For you, with care and intention",
  },
] as const;

export function HeroFeatureBar() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={staggerContainer}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      aria-label="FADEN values"
      className="relative z-10 mx-4 -mt-6 max-w-container lg:mx-auto"
    >
      <div className="overflow-hidden rounded-t-2xl bg-navy shadow-lg">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={fadeUpTransition}
                className="flex flex-col items-center px-4 py-6 text-center md:px-6 md:py-8"
              >
                <Icon className="h-6 w-6 text-gold" strokeWidth={1.25} aria-hidden />
                <p className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-gold md:text-xs">
                  {feature.title.toUpperCase()}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75 md:text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export function HeroFeatureBarCompact() {
  return (
    <section aria-label="FADEN values" className="border-y border-border bg-navy px-4 py-8 lg:px-12">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.25} aria-hidden />
              <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-gold">{feature.title.toUpperCase()}</p>
              <p className="mt-1 text-xs text-white/70">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HeroCtaArrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </span>
  );
}

export function HeroStudioLink() {
  return (
    <Link
      href="/customize"
      className="inline-flex items-center gap-1 rounded-full border border-gold/50 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-navy transition-colors hover:border-gold hover:bg-gold/10"
    >
      STUDIO EXPERIENCE
      <span className="text-gold">+</span>
    </Link>
  );
}
