"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { BoutiqueCategory } from "@/data/boutique-profiles";
import { cn } from "@faden/utils";

interface CategoryThreadProps {
  categories: BoutiqueCategory[];
  activeCategoryId: string | null;
  boutiqueSlug: string;
  audience?: string | null;
  onSelect: (categoryId: string) => void;
  ownerMode?: boolean;
  onAddWhatTheyMake?: () => void;
  designCounts?: Record<string, number>;
}

export function CategoryThread({
  categories,
  activeCategoryId,
  boutiqueSlug,
  audience,
  onSelect,
  ownerMode = false,
  onAddWhatTheyMake,
  designCounts,
}: CategoryThreadProps) {
  const outfitHref = (categoryId: string) => {
    const params = new URLSearchParams();
    if (audience) params.set("audience", audience);
    const query = params.toString();
    return `/boutique/${boutiqueSlug}/outfit/${categoryId}${query ? `?${query}` : ""}`;
  };

  return (
    <section className="py-section-gap" aria-labelledby="category-thread-heading">
      <h2 id="category-thread-heading" className="font-display text-2xl font-semibold">
        What They Make
      </h2>
      <p className="mt-2 text-foreground-muted">
        {ownerMode
          ? "Select a collection to view and edit its outfits. Add new collections with the button at the end."
          : "Scroll through outfit categories — connected by thread. Tap to browse past works."}
      </p>

      <div className="category-thread-track relative mt-8 overflow-x-auto pb-4 scrollbar-none">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[70px] z-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent md:top-[78px]"
          aria-hidden
        />

        <div className="relative z-[1] flex w-max items-center gap-3 px-1">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center">
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onSelect(cat.id)}
                onDoubleClick={
                  ownerMode
                    ? undefined
                    : () => {
                        window.location.href = outfitHref(cat.id);
                      }
                }
                className={cn(
                  "group flex w-[120px] flex-col items-center gap-2 md:w-[132px]",
                  activeCategoryId === cat.id && "scale-[1.02]"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-[120px] w-full items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br transition-all md:h-[132px]",
                    cat.iconGradient,
                    activeCategoryId === cat.id
                      ? "border-gold shadow-gold"
                      : "border-border group-hover:border-gold/40"
                  )}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden
                  >
                    <span className="h-10 w-10 animate-pulse rounded-full border border-gold/30 bg-gold/10" />
                  </span>
                  <span className="relative z-[1] px-2 text-center font-display text-sm font-medium text-foreground/90">
                    {cat.label}
                    {ownerMode && designCounts && designCounts[cat.id] > 0 && (
                      <span className="mt-1 block text-[10px] font-normal text-gold">
                        {designCounts[cat.id]} outfit{designCounts[cat.id] === 1 ? "" : "s"}
                      </span>
                    )}
                  </span>
                </div>
              </motion.button>
              {i < categories.length - 1 && (
                <svg
                  width="28"
                  height="8"
                  viewBox="0 0 28 8"
                  className="mx-1 shrink-0 text-gold/40"
                  aria-hidden
                >
                  <path
                    d="M0 4 Q 7 1, 14 4 T 28 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </div>
          ))}

          {ownerMode && onAddWhatTheyMake && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onAddWhatTheyMake}
              className="flex w-[120px] flex-col items-center gap-2 md:w-[132px]"
            >
              <div className="flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 bg-gold/5 transition-colors hover:border-gold hover:bg-gold/10 md:h-[132px]">
                <Plus className="h-6 w-6 text-gold" aria-hidden />
                <span className="px-2 text-center text-xs font-medium text-gold">Add what they make</span>
              </div>
            </motion.button>
          )}
        </div>

        {activeCategoryId && !ownerMode && (
          <p className="mt-4 text-center text-xs text-foreground-muted">
            Double-tap a category or{" "}
            <Link href={outfitHref(activeCategoryId)} className="text-gold hover:underline">
              view all {categories.find((c) => c.id === activeCategoryId)?.label} works
            </Link>
          </p>
        )}

        {ownerMode && activeCategoryId && (
          <p className="mt-4 text-center text-xs text-foreground-muted">
            Editing{" "}
            <span className="font-medium text-gold">
              {categories.find((c) => c.id === activeCategoryId)?.label}
            </span>{" "}
            — use Edit or Remove on outfits below, or add a new outfit to this collection.
          </p>
        )}
      </div>
    </section>
  );
}
