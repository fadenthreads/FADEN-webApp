"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Button } from "@faden/ui";
import { motion } from "framer-motion";
import type { BoutiqueDesign } from "@/data/boutique-profiles";
import { DressImage } from "@/components/boutique/dress-image";
import { DressQuickSpecs } from "@/components/boutique/dress-specifications-panel";
import { savedDesignItem } from "@/lib/saved-items/build-item";
import { SaveItemActions } from "@/components/saved-items/save-item-actions";
import { OwnerDesignActions } from "@/components/boutique/owner-design-actions";

interface CategoryGalleryProps {
  categoryLabel: string;
  categoryId: string;
  designs: BoutiqueDesign[];
  boutiqueSlug: string;
  boutiqueName?: string;
  ownerMode?: boolean;
  onEditDesign?: (design: BoutiqueDesign) => void;
  onDeleteDesign?: (designId: string) => void;
  onAddOutfit?: (categoryId: string, categoryLabel: string) => void;
}

function OutfitCardBody({ design, ownerMode }: { design: BoutiqueDesign; ownerMode: boolean }) {
  return (
    <>
      <div className="aspect-[4/5] overflow-hidden">
        <DressImage design={design} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold leading-snug">{design.title}</h4>
          <span className="flex shrink-0 items-center gap-1 text-sm text-gold">
            <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
            {design.rating}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">
          {design.description ?? design.review}
        </p>
        <DressQuickSpecs design={design} />
        {!ownerMode && (
          <p className="mt-3 text-xs font-medium text-gold">View details →</p>
        )}
      </div>
    </>
  );
}

export function CategoryGallery({
  categoryLabel,
  categoryId,
  designs,
  boutiqueSlug,
  boutiqueName,
  ownerMode = false,
  onEditDesign,
  onDeleteDesign,
  onAddOutfit,
}: CategoryGalleryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${categoryLabel} gallery`}
      className="mt-6 border-t border-border pt-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">{categoryLabel} Collection</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            {ownerMode
              ? `Outfits in ${categoryLabel} — use Edit or Remove on each piece.`
              : "Past works in this category — tap an outfit for details, reviews, and customize reference."}
          </p>
        </div>
        {ownerMode ? (
          onAddOutfit && (
            <Button
              type="button"
              variant="luxury-outline"
              size="sm"
              onClick={() => onAddOutfit(categoryId, categoryLabel)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Add outfit here
            </Button>
          )
        ) : (
          <Button asChild variant="luxury-outline" size="sm">
            <Link href={`/boutique/${boutiqueSlug}/outfit/${categoryId}`}>View all</Link>
          </Button>
        )}
      </div>

      {designs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-foreground-muted">
            No outfits in {categoryLabel} yet.
          </p>
          {ownerMode && onAddOutfit && (
            <button
              type="button"
              onClick={() => onAddOutfit(categoryId, categoryLabel)}
              className="mt-3 text-sm font-medium text-gold hover:text-gold-light"
            >
              Add the first outfit to this collection →
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.slice(0, 6).map((design, i) => (
            <motion.article
              key={design.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background-elevated"
            >
              <div className="absolute right-3 top-3 z-10">
                {ownerMode ? (
                  <OwnerDesignActions
                    designId={design.id}
                    onEdit={onEditDesign ? () => onEditDesign(design) : undefined}
                    onDelete={onDeleteDesign}
                  />
                ) : (
                  <SaveItemActions
                    item={savedDesignItem(design, boutiqueSlug, boutiqueName ?? "Boutique")}
                    size="sm"
                  />
                )}
              </div>
              {ownerMode ? (
                <button
                  type="button"
                  onClick={() => onEditDesign?.(design)}
                  className="block w-full text-left"
                >
                  <OutfitCardBody design={design} ownerMode={ownerMode} />
                </button>
              ) : (
                <Link href={`/boutique/${boutiqueSlug}/dress/${design.id}?outfit=${categoryId}`}>
                  <OutfitCardBody design={design} ownerMode={ownerMode} />
                </Link>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
