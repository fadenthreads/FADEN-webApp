"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { DressImage } from "@/components/boutique/dress-image";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import type { AudienceCategory } from "@/lib/landing/audience-categories";

interface FeaturedClothingProps {
  audienceCategory?: AudienceCategory | null;
}

export function FeaturedClothing({ audienceCategory = null }: FeaturedClothingProps) {
  const t = useTranslations("Home");
  const reducedMotion = useReducedMotion();
  const [designs, setDesigns] = useState<FeaturedDesignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portfolio/featured")
      .then((res) => res.json())
      .then((payload: { designs?: FeaturedDesignItem[] }) => {
        if (!cancelled) setDesigns(payload.designs ?? []);
      })
      .catch(() => {
        if (!cancelled) setDesigns([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [audienceCategory]);

  if (!loading && designs.length === 0) return null;

  return (
    <section
      id="featured-clothing"
      aria-labelledby="featured-clothing-heading"
      className="border-t border-border px-4 py-section-gap lg:px-12"
    >
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h2
          id="featured-clothing-heading"
          variants={fadeUp}
          transition={fadeUpTransition}
          className="font-display text-2xl font-semibold md:text-3xl"
        >
          {t("featuredClothing")}
        </motion.h2>
        <motion.p variants={fadeUp} transition={fadeUpTransition} className="mt-2 text-foreground-muted">
          {t("featuredClothingSubtitle")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={fadeUpTransition}
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 8 }, (_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="aspect-[3/4] animate-pulse rounded-xl border border-border bg-background-elevated"
                />
              ))
            : designs.map((design) => (
              <Link
                key={design.id}
                href={`/boutique/${design.boutiqueSlug}/dress/${design.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-background-elevated transition-all hover:border-gold/30 hover:shadow-gold"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <DressImage
                    design={{ title: design.title, imageUrl: design.imageUrl, gradient: "from-burgundy/60 via-rose-900/40 to-background-soft" }}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-semibold">{design.title}</p>
                  <p className="mt-1 text-sm text-gold">{design.boutiqueName}</p>
                  {design.price && (
                    <p className="mt-1 text-sm text-foreground-muted">{design.price}</p>
                  )}
                </div>
              </Link>
            ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
