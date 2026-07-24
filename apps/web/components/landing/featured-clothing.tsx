"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@faden/utils";
import { fadeUp, fadeUpTransition, scaleIn, staggerContainer } from "@/lib/motion-presets";
import { InfiniteClothingThread } from "@/components/landing/infinite-clothing-thread";
import { DEMO_FEATURED_CLOTHING } from "@/data/demo-featured-clothing";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import type { AudienceCategory } from "@/lib/landing/audience-categories";

type Tab = AudienceCategory | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "kids", label: "Kids" },
];

function filterDemoClothing(tab: Tab): FeaturedDesignItem[] {
  if (tab === "all") return DEMO_FEATURED_CLOTHING;
  return DEMO_FEATURED_CLOTHING.filter((item) => item.audience === tab);
}

export function FeaturedClothing({ audienceCategory = null }: { audienceCategory?: AudienceCategory | null }) {
  const t = useTranslations("Home");
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>(audienceCategory ?? "all");
  const [designs, setDesigns] = useState<FeaturedDesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

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
      .then((payload: { designs?: FeaturedDesignItem[] }) => {
        if (cancelled) return;
        const live = payload.designs ?? [];
        if (live.length > 0) {
          setDesigns(live);
          setIsDemo(false);
        } else {
          setDesigns(filterDemoClothing(activeTab));
          setIsDemo(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDesigns(filterDemoClothing(activeTab));
          setIsDemo(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const demoLabel = useMemo(
    () => (isDemo ? "Demo preview — live portfolios appear here once boutiques join FADEN." : null),
    [isDemo],
  );

  return (
    <section id="featured-clothing" aria-labelledby="featured-clothing-heading" className="faden-section-neat scroll-mt-[200px] border-t px-4 py-10 md:scroll-mt-[160px] md:py-section-gap lg:px-12">
      <motion.div variants={staggerContainer} initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <motion.h2 id="featured-clothing-heading" variants={fadeUp} transition={fadeUpTransition} className="font-display text-2xl font-semibold text-navy md:text-3xl">
              {t("featuredClothing")}
            </motion.h2>
            <motion.p variants={fadeUp} transition={fadeUpTransition} className="mt-2 text-foreground-muted">
              {t("featuredClothingSubtitle")}
            </motion.p>
            {demoLabel && (
              <motion.p variants={fadeUp} transition={fadeUpTransition} className="mt-2 text-xs font-medium tracking-wide text-gold">
                {demoLabel}
              </motion.p>
            )}
          </div>
        </div>

        <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter clothing by audience">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "faden-tab-pill shrink-0 rounded-full border px-5 py-1.5 text-sm font-medium transition-all duration-300",
                activeTab === id
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-border text-foreground-muted hover:border-navy/30 hover:text-navy",
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <motion.div variants={scaleIn} transition={fadeUpTransition}>
          {loading ? (
            <div className="-mx-4 mt-8 flex gap-4 overflow-hidden px-4">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={`skeleton-${index}`} className="faden-shimmer aspect-[3/4] w-[180px] shrink-0 rounded-xl border border-border bg-background-elevated md:w-[200px]" />
              ))}
            </div>
          ) : designs.length === 0 ? (
            <p className="mt-8 text-center text-sm leading-relaxed text-foreground-muted">
              Featured clothing from verified boutiques will appear here as portfolios are added.
            </p>
          ) : (
            <InfiniteClothingThread designs={designs} />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
