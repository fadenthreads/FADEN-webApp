"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { BoutiqueDesign } from "@/data/boutique-profiles";
import { DesignDetailModal } from "./design-detail-modal";
import { DressImage } from "./dress-image";
import { savedDesignItem } from "@/lib/saved-items/build-item";
import { SaveItemActions } from "@/components/saved-items/save-item-actions";
import { OwnerDesignActions } from "@/components/boutique/owner-design-actions";

interface LatestDesignsProps {
  boutiqueName: string;
  boutiqueSlug: string;
  designs: BoutiqueDesign[];
  ownerMode?: boolean;
  onEditDesign?: (design: BoutiqueDesign) => void;
  onDeleteDesign?: (designId: string) => void;
}

export function LatestDesigns({
  boutiqueName,
  boutiqueSlug,
  designs,
  ownerMode = false,
  onEditDesign,
  onDeleteDesign,
}: LatestDesignsProps) {
  const [selected, setSelected] = useState<BoutiqueDesign | null>(null);
  const displayDesigns = ownerMode ? designs : designs.slice(0, 6);
  const showSection = ownerMode || designs.length > 0;

  return (
    <>
      {showSection && (
      <section className="border-t border-border py-section-gap" aria-labelledby="latest-designs-heading">
        <h2 id="latest-designs-heading" className="font-display text-2xl font-semibold">
          {ownerMode ? "All your past outfits" : "Latest Designs"}
        </h2>
        <p className="mt-2 text-foreground-muted">
          {ownerMode
            ? designs.length > 0
              ? `${designs.length} outfit${designs.length === 1 ? "" : "s"} in your portfolio — tap Edit on any piece to update it.`
              : "Upload outfits using Add outfit above. They will appear here for editing."
            : `Recent work from ${boutiqueName} — tap any item for full specs, reviews, and customize reference.`}
        </p>

        {displayDesigns.length === 0 ? (
          ownerMode ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
              No outfits uploaded yet.
            </div>
          ) : null
        ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayDesigns.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background-elevated text-left transition-all hover:border-gold/30 hover:shadow-gold"
            >
              <div className="absolute right-3 top-3 z-10">
                {ownerMode ? (
                  <OwnerDesignActions
                    designId={d.id}
                    onEdit={onEditDesign ? () => onEditDesign(d) : undefined}
                    onDelete={onDeleteDesign}
                  />
                ) : (
                  <SaveItemActions
                    item={savedDesignItem(d, boutiqueSlug, boutiqueName)}
                    size="sm"
                  />
                )}
              </div>
              {ownerMode ? (
                <button
                  type="button"
                  onClick={() => onEditDesign?.(d)}
                  className="block w-full text-left"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <DressImage design={d} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug">{d.title}</h3>
                    {d.outfitLabel && (
                      <p className="mt-1 text-xs text-gold">{d.outfitLabel}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-sm text-gold">
                      <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
                      {d.rating}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs italic text-foreground-muted">
                      &ldquo;{d.review}&rdquo;
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {d.turnaround}
                      </span>
                      <span>{d.madeAgo}</span>
                    </div>
                  </div>
                </button>
              ) : (
                <Link href={`/boutique/${boutiqueSlug}/dress/${d.id}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden">
                    <DressImage design={d} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug">{d.title}</h3>
                    <div className="mt-2 flex items-center gap-1 text-sm text-gold">
                      <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
                      {d.rating}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs italic text-foreground-muted">
                      &ldquo;{d.review}&rdquo;
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {d.turnaround}
                      </span>
                      <span>{d.madeAgo}</span>
                    </div>
                  </div>
                </Link>
              )}
              <div className="border-t border-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  className="text-xs font-medium text-gold hover:underline"
                >
                  Quick preview
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>
      )}

      <DesignDetailModal
        design={selected}
        boutiqueSlug={boutiqueSlug}
        boutiqueName={boutiqueName}
        ownerMode={ownerMode}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
