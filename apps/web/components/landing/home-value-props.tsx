"use client";

import { CircleDot, Gift, Leaf, MapPin, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

const VALUE_PROPS = [
  { icon: Sparkles, title: "Trending Now", subtitle: "Stay ahead of every trend" },
  { icon: Leaf, title: "Sustainable Choice", subtitle: "Conscious fashion for a better tomorrow" },
  { icon: MapPin, title: "Support Local", subtitle: "Empowering Indian boutiques & artisans" },
  { icon: Gift, title: "Exclusive Offers", subtitle: "Special deals for you" },
  { icon: CircleDot, title: "Threads of India", subtitle: "Rooted in tradition, crafted for today" },
] as const;

export function HomeValueProps() {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-label="FADEN highlights" className="border-t border-border bg-background px-4 py-10 lg:px-12 lg:py-12">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto grid max-w-container grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-4"
      >
        {VALUE_PROPS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              transition={fadeUpTransition}
              className="flex flex-col items-center text-center"
            >
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.25} aria-hidden />
              <p className="mt-2 text-[10px] font-semibold tracking-[0.14em] text-navy md:text-xs">
                {item.title.toUpperCase()}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{item.subtitle}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
