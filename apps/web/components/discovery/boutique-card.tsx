"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { BoutiqueData } from "@/data/boutiques";
import { AUDIENCE_LABELS, resolveBoutiqueAudiences } from "@/lib/boutique/audiences";
import { savedBoutiqueItem } from "@/lib/saved-items/build-item";
import { SaveItemActions } from "@/components/saved-items/save-item-actions";
import { CardMediaSwiper } from "./card-media-swiper";
import { BoutiqueAvailabilityBadge } from "@/components/boutique/boutique-availability-badge";

interface BoutiqueCardProps {
  boutique: BoutiqueData;
  className?: string;
}

export function BoutiqueCard({ boutique, className }: BoutiqueCardProps) {
  const audiences = resolveBoutiqueAudiences(boutique);

  return (
    <Link
      href={`/boutique/${boutique.slug}`}
      className={`group relative block overflow-hidden rounded-xl border border-border bg-background-elevated transition-all hover:border-gold/40 hover:shadow-gold ${className ?? "w-[300px] shrink-0 md:w-[320px]"}`}
    >
      {/* Thread anchor dot */}
      <span
        className="absolute left-1/2 top-0 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/60 bg-gold/80"
        aria-hidden
      />
      <div className="absolute right-3 top-3 z-20">
        <SaveItemActions item={savedBoutiqueItem(boutique)} size="sm" />
      </div>
      <CardMediaSwiper media={boutique.media} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug">{boutique.name}</h3>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-sm font-medium text-gold">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
              {boutique.rating}
            </span>
            <BoutiqueAvailabilityBadge availability={boutique.availability} size="sm" />
          </div>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-foreground-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          {boutique.distanceLabel ? `${boutique.distanceLabel} · ${boutique.location}` : boutique.location}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground-muted/90">
          {boutique.experienceSummary ?? `${boutique.experience} experience`}
        </p>
        {audiences.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-1">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold"
              >
                {AUDIENCE_LABELS[audience]}
              </span>
            ))}
          </p>
        )}
        {boutique.outfitTypes && boutique.outfitTypes.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-1">
            {boutique.outfitTypes.slice(0, 3).map((outfit) => (
              <span
                key={outfit}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground-muted"
              >
                {outfit}
              </span>
            ))}
          </p>
        )}
      </div>
    </Link>
  );
}
