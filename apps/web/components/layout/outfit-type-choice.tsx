"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Shirt, Store, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AudienceCategory } from "@faden/validators";
import { clothingSearchHref, outfitTypeNavHref } from "@/lib/landing/audience-categories";

interface OutfitTypeChoiceProps {
  outfitType: string;
  audience?: AudienceCategory | null;
  open: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export function OutfitTypeChoice({ outfitType, audience, open, onClose, onNavigate }: OutfitTypeChoiceProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const boutiqueHref = outfitTypeNavHref(outfitType, audience);
  const clothingHref = clothingSearchHref(outfitType, audience);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-navy/40 backdrop-blur-[2px]"
            aria-label="Close outfit type options"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="outfit-choice-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold/30 bg-background-elevated p-6 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Explore</p>
                <h2 id="outfit-choice-title" className="mt-1 font-display text-xl font-semibold text-foreground">
                  {outfitType}
                </h2>
                <p className="mt-2 text-sm text-foreground-muted">
                  Browse boutiques that make {outfitType.toLowerCase()}, or shop individual outfits.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-navy/5 hover:text-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href={clothingHref}
                onClick={() => {
                  onClose();
                  onNavigate?.();
                }}
                className="group flex items-center gap-4 rounded-xl border border-border bg-background-soft p-4 transition-all hover:border-gold/50 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy/25 bg-gold text-navy">
                  <Shirt className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-foreground group-hover:text-navy">Clothing</span>
                  <span className="mt-0.5 block text-xs text-foreground-muted">
                    {outfitType} outfits from different boutiques
                  </span>
                </span>
              </Link>
              <Link
                href={boutiqueHref}
                onClick={() => {
                  onClose();
                  onNavigate?.();
                }}
                className="group flex items-center gap-4 rounded-xl border border-border bg-background-soft p-4 transition-all hover:border-gold/50 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy/25 bg-gold text-navy">
                  <Store className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-foreground group-hover:text-navy">Boutiques</span>
                  <span className="mt-0.5 block text-xs text-foreground-muted">
                    Studios specializing in {outfitType.toLowerCase()}
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
