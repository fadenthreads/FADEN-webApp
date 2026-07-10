"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Shirt, Store, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AudienceCategory } from "@faden/validators";
import { cn } from "@faden/utils";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/45 backdrop-blur-[2px]"
            aria-label="Close outfit type options"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="outfit-choice-title"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "fixed z-[101] border border-gold/30 bg-background-elevated shadow-2xl",
              "inset-x-0 bottom-0 max-h-[min(85dvh,520px)] overflow-y-auto rounded-t-2xl p-6",
              "pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
              "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[90vh] md:w-[min(92vw,360px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-6",
            )}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-navy/15 md:hidden" aria-hidden />

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
    </AnimatePresence>,
    document.body,
  );
}
