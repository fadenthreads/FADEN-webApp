"use client";

import Link from "next/link";
import { X, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BoutiqueDesign } from "@/data/boutique-profiles";
import { DressImage } from "@/components/boutique/dress-image";
import { DressSpecificationsPanel } from "@/components/boutique/dress-specifications-panel";

interface DesignDetailModalProps {
  design: BoutiqueDesign | null;
  boutiqueSlug: string;
  boutiqueName?: string;
  ownerMode?: boolean;
  onClose: () => void;
}

export function DesignDetailModal({
  design,
  boutiqueSlug,
  boutiqueName,
  ownerMode = false,
  onClose,
}: DesignDetailModalProps) {
  return (
    <AnimatePresence>
      {design && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="design-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[80] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background-elevated shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <DressImage design={design} />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 id="design-modal-title" className="font-display text-xl font-semibold">
                  {design.title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1 text-foreground-muted hover:text-gold"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1 text-gold">
                <Star className="h-4 w-4 fill-gold" aria-hidden />
                <span className="font-medium">{design.rating}</span>
                <span className="text-sm text-foreground-muted">· {design.customerName}</span>
              </div>

              <dl className="mt-4 space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-muted">Material</dt>
                  <dd className="text-right font-medium">{design.material}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-muted">Price</dt>
                  <dd className="font-medium text-gold">{design.price}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-muted">Production time</dt>
                  <dd className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gold" aria-hidden />
                    {design.turnaround}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <DressSpecificationsPanel
                  design={design}
                  boutiqueSlug={boutiqueSlug}
                  boutiqueName={boutiqueName}
                  compact
                  previewOnly={ownerMode}
                />
              </div>

              {!ownerMode && (
                <div className="mt-4 border-t border-border pt-4">
                  <Link
                    href={`/boutique/${boutiqueSlug}/dress/${design.id}`}
                    className="text-sm font-medium text-gold hover:underline"
                  >
                    View full outfit page →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
