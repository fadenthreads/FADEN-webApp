"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { BoutiqueData } from "@/data/boutiques";
import { BoutiqueCard } from "./boutique-card";

interface InfiniteBoutiqueThreadProps {
  boutiques: BoutiqueData[];
}

const LOOP_REPEATS = 3;

export function InfiniteBoutiqueThread({ boutiques }: InfiniteBoutiqueThreadProps) {
  const cycle = useMemo(() => boutiques, [boutiques]);
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
    <div className="relative mt-8">
      <div className="thread-track relative py-6">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[calc(50%-2px)] z-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-gold/20"
          aria-hidden
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-[1] -mx-4 overflow-x-auto px-4 pb-4 pt-1 scrollbar-none"
          role="region"
          aria-label="Featured boutiques"
        >
          <div ref={trackRef} className="flex w-max items-stretch gap-4">
            {loopItems.map((boutique, i) => (
              <BoutiqueCard key={`${boutique.slug}-${i}`} boutique={boutique} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
