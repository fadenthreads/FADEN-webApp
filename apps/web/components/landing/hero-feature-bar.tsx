"use client";

import { Gem, Heart, Layers, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

const FEATURES = [
  { icon: Sparkles, title: "Designed In-House", description: "Thoughtfully designed with love" },
  { icon: Gem, title: "Artisan Crafted", description: "Rooted in tradition, crafted to perfection" },
  { icon: Layers, title: "Limited Production", description: "Quality over quantity, always" },
  { icon: Heart, title: "Made With Passion", description: "For you, with care and intention" },
] as const;

export function HeroFeatureBar() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={staggerContainer}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      aria-label="FADEN values"
      className="relative z-10 mx-4 -mt-2 max-w-container lg:mx-auto"
    >
      <div className="overflow-hidden rounded-t-2xl bg-gold shadow-md">
        <div className="grid grid-cols-2 divide-x divide-y divide-navy/15 md:grid-cols-4 md:divide-y-0">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={fadeUpTransition}
                className="flex flex-col items-center px-4 py-5 text-center md:px-5 md:py-7"
              >
                <Icon className="h-5 w-5 text-navy" strokeWidth={1.25} aria-hidden />
                <p className="mt-2.5 text-[10px] font-semibold tracking-[0.16em] text-navy md:text-[11px]">
                  {feature.title.toUpperCase()}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-navy/75 md:text-xs">
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
