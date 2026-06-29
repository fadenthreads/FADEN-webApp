"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@faden/utils";
import type { BoutiqueMedia } from "@/data/boutiques";

interface CardMediaSwiperProps {
  media: BoutiqueMedia[];
  aspectClass?: string;
}

export function CardMediaSwiper({ media, aspectClass = "h-[200px]" }: CardMediaSwiperProps) {
  const [slide, setSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const prev = () => setSlide((s) => (s === 0 ? media.length - 1 : s - 1));
  const next = () => setSlide((s) => (s === media.length - 1 ? 0 : s + 1));

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
    touchStartY.current = event.touches[0]?.clientY ?? 0;
    swiping.current = false;
  }

  function handleTouchMove(event: React.TouchEvent) {
    const deltaX = Math.abs((event.touches[0]?.clientX ?? 0) - touchStartX.current);
    const deltaY = Math.abs((event.touches[0]?.clientY ?? 0) - touchStartY.current);
    if (deltaX > deltaY && deltaX > 8) {
      swiping.current = true;
    }
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (media.length <= 1) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(deltaX) < 40) return;
    event.preventDefault();
    event.stopPropagation();
    if (deltaX < 0) next();
    else prev();
  }

  function stopNav(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      className={cn("relative overflow-hidden", aspectClass)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={(event) => {
        if (swiping.current) {
          event.preventDefault();
          event.stopPropagation();
          swiping.current = false;
        }
      }}
    >
      {media[slide].url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media[slide].url}
          alt={media[slide].label}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${media[slide].gradient} transition-all duration-500`}
        />
      )}
      {media[slide].type === "video" && (
        <span className="absolute left-3 top-3 rounded bg-navy/60 px-2 py-0.5 text-[10px] tracking-wider text-gold">
          VIDEO
        </span>
      )}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              stopNav(e);
              prev();
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-navy/50 p-1.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stopNav(e);
              next();
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-navy/50 p-1.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === slide ? "bg-gold" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
