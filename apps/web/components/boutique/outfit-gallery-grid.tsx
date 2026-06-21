"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { BoutiqueDesign } from "@/data/boutique-profiles";
import { DressImage } from "@/components/boutique/dress-image";
import { DressQuickSpecs } from "@/components/boutique/dress-specifications-panel";

interface OutfitGalleryGridProps {
  boutiqueSlug: string;
  categoryLabel: string;
  designs: BoutiqueDesign[];
  outfitSlug: string;
}

export function OutfitGalleryGrid({
  boutiqueSlug,
  categoryLabel,
  designs,
  outfitSlug,
}: OutfitGalleryGridProps) {
  if (designs.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-foreground-muted">
        No past works in {categoryLabel} yet. Check back soon or browse other outfit types.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design, i) => (
        <motion.article
          key={design.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="overflow-hidden rounded-xl border border-border bg-background-elevated transition-all hover:border-gold/30"
        >
          <Link href={`/boutique/${boutiqueSlug}/dress/${design.id}?outfit=${outfitSlug}`}>
            <div className="aspect-[4/5] overflow-hidden">
              <DressImage design={design} />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-snug">{design.title}</h2>
                <span className="flex shrink-0 items-center gap-1 text-sm text-gold">
                  <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
                  {design.rating}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">
                {design.description ?? design.review}
              </p>
              <DressQuickSpecs design={design} />
              <p className="mt-3 text-xs font-medium text-gold">View details & reviews →</p>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
