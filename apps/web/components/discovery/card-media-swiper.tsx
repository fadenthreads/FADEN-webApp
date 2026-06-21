"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BoutiqueMedia } from "@/data/boutiques";

interface CardMediaSwiperProps {
  media: BoutiqueMedia[];
}

export function CardMediaSwiper({ media }: CardMediaSwiperProps) {
  const [slide, setSlide] = useState(0);
  const prev = () => setSlide((s) => (s === 0 ? media.length - 1 : s - 1));
  const next = () => setSlide((s) => (s === media.length - 1 ? 0 : s + 1));

  return (
    <div className="relative h-[200px] overflow-hidden">
      {media[slide].url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media[slide].url}
          alt={media[slide].label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${media[slide].gradient} transition-all duration-500`}
        />
      )}
      {media[slide].type === "video" && (
        <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] tracking-wider text-gold">
          VIDEO
        </span>
      )}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === slide ? "bg-gold" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
