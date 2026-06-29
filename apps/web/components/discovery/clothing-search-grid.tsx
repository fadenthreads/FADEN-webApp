"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import { CardMediaSwiper } from "@/components/discovery/card-media-swiper";
import type { BoutiqueMedia } from "@/data/boutiques";

function designToMedia(design: FeaturedDesignItem): BoutiqueMedia[] {
  if (design.gallery?.length) return design.gallery;
  return [
    {
      type: "image",
      label: design.title,
      gradient: design.gradient ?? "from-navy/30 via-gold/20 to-background-soft",
      url: design.imageUrl || undefined,
    },
  ];
}

function ClothingResultCard({ design }: { design: FeaturedDesignItem }) {
  return (
    <Link
      href={`/boutique/${design.boutiqueSlug}/dress/${design.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-background-elevated transition-all hover:border-gold/40 hover:shadow-md"
    >
      <CardMediaSwiper media={designToMedia(design)} aspectClass="aspect-[3/4]" />
      <div className="p-4">
        <p className="font-display text-base font-semibold leading-tight">{design.title}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <p className="truncate text-sm text-gold">{design.boutiqueName}</p>
        </div>
        {design.price && <p className="mt-1 text-sm text-foreground-muted">{design.price}</p>}
      </div>
    </Link>
  );
}

export function ClothingSearchGrid({ designs }: { designs: FeaturedDesignItem[] }) {
  if (designs.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-foreground-muted">
        No outfits match this search yet. Try another outfit type or browse boutiques.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {designs.map((design) => (
        <ClothingResultCard key={design.id} design={design} />
      ))}
    </div>
  );
}
