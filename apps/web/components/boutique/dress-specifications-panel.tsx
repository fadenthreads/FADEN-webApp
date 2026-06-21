"use client";

import Link from "next/link";
import { Ruler, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@faden/ui";
import type { BoutiqueDesign } from "@/data/boutique-profiles";
import {
  buildCustomizeReferenceHref,
  buildDirectDressOrderHref,
} from "@/lib/boutique/portfolio";
import {
  getDressLengthEntries,
  hasDressLengthDetails,
} from "@/lib/boutique/dress-specs";
import { savedDesignItem } from "@/lib/saved-items/build-item";
import { SaveItemActions } from "@/components/saved-items/save-item-actions";

interface DressSpecificationsPanelProps {
  design: BoutiqueDesign;
  boutiqueSlug: string;
  boutiqueName?: string;
  compact?: boolean;
  previewOnly?: boolean;
}

export function DressSpecificationsPanel({
  design,
  boutiqueSlug,
  boutiqueName,
  compact = false,
  previewOnly = false,
}: DressSpecificationsPanelProps) {
  const lengthEntries = getDressLengthEntries(design.lengthDetails);
  const orderHref = buildDirectDressOrderHref({
    boutiqueSlug,
    dressId: design.id,
    outfitType: design.outfitLabel,
  });
  const customizeHref = buildCustomizeReferenceHref({
    boutiqueSlug,
    dressId: design.id,
    outfitType: design.outfitLabel,
  });
  const savedItem = savedDesignItem(design, boutiqueSlug, boutiqueName ?? "Boutique");

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="flex justify-end">
          <SaveItemActions item={savedItem} />
        </div>
      )}
      <section className="rounded-xl border border-border bg-background-elevated p-4 md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">About this outfit</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {design.description ?? design.review}
        </p>
      </section>

      <section className="rounded-xl border border-gold/25 bg-gold/5 p-4 md:p-5">
        <div className="flex items-center gap-2 text-gold">
          <Ruler className="h-4 w-4" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Size & lengths</h2>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          Reference measurements from this finished piece. Order the same size or adjust during customize.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
            <dt className="text-foreground-muted">Size</dt>
            <dd className="max-w-[65%] text-right font-medium">
              {design.sizeLabel ?? "Contact boutique for sizing"}
            </dd>
          </div>
          {lengthEntries.length > 0 ? (
            lengthEntries.map((entry) => (
              <div key={entry.label} className="flex justify-between gap-4">
                <dt className="text-foreground-muted">{entry.label}</dt>
                <dd className="font-medium">{entry.value}</dd>
              </div>
            ))
          ) : (
            !design.sizeLabel && (
              <p className="text-sm text-foreground-muted">
                Length details not listed yet — the boutique can confirm before production.
              </p>
            )
          )}
          {design.lengthDetails?.notes?.trim() && (
            <div className="border-t border-border/60 pt-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Additional notes
              </dt>
              <dd className="mt-1 text-sm text-foreground-muted">{design.lengthDetails.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {!compact && !previewOnly && (
        <section className="rounded-xl border border-border bg-background-soft p-4 md:p-5">
          <h2 className="text-sm font-semibold text-foreground">Ready to order?</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {boutiqueName
              ? `Request this exact outfit from ${boutiqueName}. Size and lengths above will be sent with your order.`
              : "Request this exact outfit from the boutique. Size and lengths above will be sent with your order."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="luxury">
              <Link href={orderHref}>
                <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
                Order this outfit
              </Link>
            </Button>
            <Button asChild variant="luxury-outline">
              <Link href={customizeHref}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                Customize with changes
              </Link>
            </Button>
          </div>
        </section>
      )}

      {compact && !previewOnly && (
        <div className="space-y-3">
          <SaveItemActions item={savedItem} size="sm" />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="luxury" size="sm">
              <Link href={orderHref}>Order this outfit</Link>
            </Button>
            <Button asChild variant="luxury-outline" size="sm">
              <Link href={customizeHref}>Customize with changes</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DressQuickSpecs({ design }: { design: BoutiqueDesign }) {
  if (!design.sizeLabel && !hasDressLengthDetails(design.lengthDetails)) return null;

  return (
    <p className="mt-2 text-xs text-foreground-muted">
      {design.sizeLabel && <span>Size: {design.sizeLabel}</span>}
      {design.sizeLabel && hasDressLengthDetails(design.lengthDetails) && " · "}
      {hasDressLengthDetails(design.lengthDetails) && (
        <span>
          {getDressLengthEntries(design.lengthDetails)
            .slice(0, 2)
            .map((entry) => `${entry.label}: ${entry.value}`)
            .join(" · ")}
        </span>
      )}
    </p>
  );
}
