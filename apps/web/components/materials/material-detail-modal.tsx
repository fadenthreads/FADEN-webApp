"use client";

import Link from "next/link";
import { Clock, Store, X } from "lucide-react";
import { Button } from "@faden/ui";
import type { FeaturedMaterialItem } from "@/lib/materials/featured-materials";
import { MaterialPurchaseActions } from "@/components/materials/material-purchase-actions";

interface MaterialDetailModalProps {
  material: FeaturedMaterialItem | null;
  open: boolean;
  onClose: () => void;
}

export function MaterialDetailModal({ material, open, onClose }: MaterialDetailModalProps) {
  if (!open || !material) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close material details"
        className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-detail-title"
        className="relative max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-[20px] border border-border/60 bg-background-elevated shadow-lg sm:rounded-2xl"
      >
        <div className={`aspect-[4/3] bg-gradient-to-br ${material.gradient}`} />
        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">Featured material</p>
              <h2 id="material-detail-title" className="mt-2 font-display text-2xl font-semibold text-navy">
                {material.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-navy/5 hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-gold">
            <Store className="h-4 w-4" aria-hidden />
            <span>{material.boutiqueName}</span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-foreground-muted">{material.description}</p>

          <dl className="mt-6 space-y-3 border-t border-border/60 pt-4 text-sm">
            {material.composition && (
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Composition</dt>
                <dd className="text-right font-medium">{material.composition}</dd>
              </div>
            )}
            {material.priceHint && (
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Pricing</dt>
                <dd className="font-medium text-gold">{material.priceHint}</dd>
              </div>
            )}
            {material.careInstructions && (
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Care</dt>
                <dd className="max-w-[16rem] text-right">{material.careInstructions}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-foreground-muted">Availability</dt>
              <dd className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gold" aria-hidden />
                Ready to order online
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <MaterialPurchaseActions material={material} onAction={onClose} />
          </div>

          <div className="mt-3">
            <Button asChild variant="luxury-outline" className="w-full">
              <Link href={`/boutique/${material.boutiqueSlug}`}>View supplier boutique</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
