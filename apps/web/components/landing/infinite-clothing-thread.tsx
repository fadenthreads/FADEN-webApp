"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Store } from "lucide-react";
import { CardMediaSwiper } from "@/components/discovery/card-media-swiper";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import type { BoutiqueMedia } from "@/data/boutiques";

const LOOP_REPEATS = 3;

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

function ClothingCard({ design }: { design: FeaturedDesignItem }) {
  return (
    <Link
      href={`/boutique/${design.boutiqueSlug}/dress/${design.id}`}
      className="group relative block w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-background-elevated shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md md:w-[200px]"
    >
      <CardMediaSwiper media={designToMedia(design)} aspectClass="aspect-[3/4]" />
      <div className="p-3">
        <p className="truncate font-display text-sm font-semibold leading-tight">{design.title}</p>
        <div className="mt-1 flex items-center gap-1">
          <Store className="h-3 w-3 shrink-0 text-gold" aria-hidden />
          <p className="truncate text-xs text-gold">{design.boutiqueName}</p>
        </div>
        {design.price && <p className="mt-1 truncate text-xs text-foreground-muted">{design.price}</p>}
      </div>
    </Link>
  );
}

export function InfiniteClothingThread({ designs }: { designs: FeaturedDesignItem[] }) {
  const cycle = useMemo(() => designs, [designs]);
  const loopItems = useMemo(
    () => (cycle.length >= 2 ? Array.from({ length: LOOP_REPEATS }, () => cycle).flat() : cycle),
    [cycle],
  );
  const seamless = cycle.length >= 2;

  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentWidthRef = useRef(0);
  const isAdjustingRef = useRef(false);

  const measureSegment = useCallback(() => {
    const track = trackRef.current;
    if (!track || !seamless) return 0;
    const width = track.scrollWidth / LOOP_REPEATS;
    if (width > 0) segmentWidthRef.current = width;
    return segmentWidthRef.current;
  }, [seamless]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !seamless) return;
    const segmentWidth = measureSegment();
    if (segmentWidth <= 0) return;
    isAdjustingRef.current = true;
    el.scrollLeft = segmentWidth;
    requestAnimationFrame(() => { isAdjustingRef.current = false; });
  }, [cycle, seamless, measureSegment]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isAdjustingRef.current || !seamless) return;
    const segmentWidth = segmentWidthRef.current || measureSegment();
    if (segmentWidth <= 0) return;
    const buffer = 4;
    const maxScroll = segmentWidth * 2;
    if (el.scrollLeft >= maxScroll - buffer) {
      isAdjustingRef.current = true;
      el.scrollLeft -= segmentWidth;
      requestAnimationFrame(() => { isAdjustingRef.current = false; });
      return;
    }
    if (el.scrollLeft <= buffer) {
      isAdjustingRef.current = true;
      el.scrollLeft += segmentWidth;
      requestAnimationFrame(() => { isAdjustingRef.current = false; });
    }
  }, [seamless, measureSegment]);

  if (cycle.length === 0) return null;

  return (
    <div className="relative mt-8">
      <div ref={scrollRef} onScroll={handleScroll} className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-none" role="region" aria-label="Featured clothing">
        <div ref={trackRef} className="flex w-max items-stretch gap-4">
          {loopItems.map((design, i) => (
            <ClothingCard key={`${design.id}-${i}`} design={design} />
          ))}
        </div>
      </div>
    </div>
  );
}
