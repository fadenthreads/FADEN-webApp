"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Store } from "lucide-react";
import { cn } from "@faden/utils";
import type { FeaturedMaterialItem } from "@/lib/materials/featured-materials";
import { MaterialDetailModal } from "@/components/materials/material-detail-modal";

const LOOP_REPEATS = 3;

function MaterialCard({
  material,
  onSelect,
}: {
  material: FeaturedMaterialItem;
  onSelect: (material: FeaturedMaterialItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(material)}
      className="group relative w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-background-elevated text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md md:w-[200px]"
    >
      <div className={cn("aspect-[3/4] bg-gradient-to-br transition-transform duration-300 group-hover:scale-[1.02]", material.gradient)} />
      <div className="p-3.5">
        <p className="truncate font-display text-sm font-semibold leading-tight text-navy">{material.name}</p>
        <div className="mt-1 flex items-center gap-1">
          <Store className="h-3 w-3 shrink-0 text-gold" aria-hidden />
          <p className="truncate text-xs text-gold">{material.boutiqueName}</p>
        </div>
        {material.priceHint && (
          <p className="mt-1 truncate text-xs text-foreground-muted">{material.priceHint}</p>
        )}
      </div>
    </button>
  );
}

export function InfiniteMaterialsThread({ materials }: { materials: FeaturedMaterialItem[] }) {
  const [selected, setSelected] = useState<FeaturedMaterialItem | null>(null);
  const cycle = useMemo(() => materials, [materials]);
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
    requestAnimationFrame(() => {
      isAdjustingRef.current = false;
    });
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
      requestAnimationFrame(() => {
        isAdjustingRef.current = false;
      });
      return;
    }
    if (el.scrollLeft <= buffer) {
      isAdjustingRef.current = true;
      el.scrollLeft += segmentWidth;
      requestAnimationFrame(() => {
        isAdjustingRef.current = false;
      });
    }
  }, [seamless, measureSegment]);

  if (cycle.length === 0) return null;

  return (
    <>
      <div className="relative mt-8">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-none"
          role="region"
          aria-label="Featured materials"
        >
          <div ref={trackRef} className="flex w-max items-stretch gap-4">
            {loopItems.map((material, i) => (
              <MaterialCard key={`${material.id}-${i}`} material={material} onSelect={setSelected} />
            ))}
          </div>
        </div>
      </div>
      <MaterialDetailModal material={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </>
  );
}
