"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@faden/utils";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";
import { InfiniteClothingThread } from "@/components/landing/infinite-clothing-thread";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import type { AudienceCategory } from "@/lib/landing/audience-categories";

type Tab = AudienceCategory | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "kids", label: "Kids" },
];

export function FeaturedClothing({ audienceCategory = null }: { audienceCategory?: AudienceCategory | null }) {
  const t = useTranslations("Home");
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>(audienceCategory ?? "all");
  const [designs, setDesigns] = useState<FeaturedDesignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (audienceCategory) setActiveTab(audienceCategory);
  }, [audienceCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("audience", activeTab);

    fetch(`/api/portfolio/featured?${params}`)
      .then((res) => res.json())
      .then((payload: { designs?: FeaturedDesignItem[] }) => { if (!cancelled) setDesigns(payload.designs ?? []); })
      .catch(() => { if (!cancelled) setDesigns([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeTab]);

  if (!loading && designs.length === 0) return null;

  return (
    <section id="featured-clothing" aria-labelledby="featured-clothing-heading" className="border-t border-border/60 bg-transparent px-4 py-section-gap lg:px-12">
      <motion.div variants={staggerContainer} initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <motion.h2 id="featured-clothing-heading" variants={fadeUp} transition={fadeUpTransition} className="font-display text-2xl font-semibold md:text-3xl">
              {t("featuredClothing")}
            </motion.h2>
            <motion.p variants={fadeUp} transition={fadeUpTransition} className="mt-2 text-foreground-muted">
              {t("featuredClothingSubtitle")}
            </motion.p>
          </div>
        </div>

        <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter clothing by audience">
          {TABS.map(({ id, label }) => (
            <button
              key={id} type="button" role="tab" aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-1.5 text-sm font-medium transition-colors",
                activeTab === id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold",
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} transition={fadeUpTransition}>
          {loading ? (
            <div className="-mx-4 mt-8 flex gap-4 overflow-hidden px-4">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={`skeleton-${index}`} className="aspect-[3/4] w-[180px] shrink-0 animate-pulse rounded-xl border border-border bg-background-elevated md:w-[200px]" />
              ))}
            </div>
          ) : (
            <InfiniteClothingThread designs={designs} />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
