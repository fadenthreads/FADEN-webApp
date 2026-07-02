"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button, EmptyState } from "@faden/ui";
import { useSavedItems } from "@/components/saved-items/saved-items-context";
import { buildDirectDressOrderHref, buildCustomizeReferenceHref } from "@/lib/boutique/portfolio";
import type { SavedItem, SavedListKind } from "@/lib/saved-items/types";

interface SavedItemsPageProps {
  kind: SavedListKind;
}

function itemHref(item: SavedItem): string {
  if (item.itemType === "material" && item.designId) {
    return `/#featured-materials`;
  }
  if (item.itemType === "design" && item.designId) {
    return `/boutique/${item.boutiqueSlug}/dress/${item.designId}`;
  }
  return `/boutique/${item.boutiqueSlug}`;
}

function SavedItemCard({ item, kind }: { item: SavedItem; kind: SavedListKind }) {
  const { removeItem } = useSavedItems();
  const href = itemHref(item);

  return (
    <article className="flex gap-4 rounded-xl border border-border bg-background-elevated p-4">
      <Link href={href} className="block shrink-0 overflow-hidden rounded-lg border border-border">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-28 w-24 object-cover" />
        ) : (
          <div className="flex h-28 w-24 items-center justify-center bg-gradient-to-br from-burgundy/40 to-background-soft text-xs text-foreground-muted">
            {item.itemType === "material" ? "Material" : item.itemType === "design" ? "Design" : "Boutique"}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          {item.itemType === "material"
            ? "Material"
            : item.itemType === "design"
              ? item.outfitLabel ?? "Design"
              : "Boutique"}
        </p>
        <Link href={href} className="mt-1 block font-display text-lg font-semibold hover:text-gold">
          {item.title}
        </Link>
        <p className="mt-1 text-sm text-foreground-muted">{item.boutiqueName}</p>
        {item.priceHint && <p className="mt-2 text-sm font-medium text-gold">{item.priceHint}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="luxury-outline" size="sm">
            <Link href={href}>View details</Link>
          </Button>
          {kind === "cart" && item.itemType === "material" && item.designId && (
            <>
              <Button asChild variant="luxury" size="sm">
                <Link href={`/boutique/${item.boutiqueSlug}`}>Buy material</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/customize?boutique=${encodeURIComponent(item.boutiqueSlug)}`}>
                  Customize
                </Link>
              </Button>
            </>
          )}
          {kind === "cart" && item.itemType === "design" && item.designId && (
            <>
              <Button asChild variant="luxury" size="sm">
                <Link
                  href={buildDirectDressOrderHref({
                    boutiqueSlug: item.boutiqueSlug,
                    dressId: item.designId,
                    outfitType: item.outfitLabel,
                  })}
                >
                  Order this outfit
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildCustomizeReferenceHref({
                    boutiqueSlug: item.boutiqueSlug,
                    dressId: item.designId,
                    outfitType: item.outfitLabel,
                  })}
                >
                  Customize
                </Link>
              </Button>
            </>
          )}
          {kind === "cart" && item.itemType === "boutique" && (
            <Button asChild variant="luxury" size="sm">
              <Link href={`/appointments/schedule?boutique=${encodeURIComponent(item.boutiqueSlug)}`}>
                Book fitting
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-foreground-muted hover:text-red-accent"
            onClick={() => void removeItem(kind, item.boutiqueSlug, item.designId)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

export function SavedItemsPage({ kind }: SavedItemsPageProps) {
  const { wishlist, cart, ready } = useSavedItems();
  const items = kind === "wishlist" ? wishlist : cart;
  const Icon = kind === "wishlist" ? Heart : ShoppingBag;

  if (!ready) {
    return (
      <div className="px-4 py-section-gap lg:px-12">
        <div className="mx-auto max-w-container animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-background-elevated" />
          <div className="h-32 rounded-xl bg-background-elevated" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={kind === "wishlist" ? "Your wishlist is empty" : "Your cart is empty"}
        description={
          kind === "wishlist"
            ? "Save boutiques and designs you love."
            : "Items you add will appear here."
        }
      >
        <Button asChild variant={kind === "wishlist" ? "default" : "outline"}>
          <Link href="/">{kind === "wishlist" ? "Explore boutiques" : "Continue browsing"}</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="px-4 pb-section-gap pt-8 lg:px-12">
      <div className="mx-auto max-w-container">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gold" aria-hidden />
          <h1 className="font-display text-3xl font-semibold">
            {kind === "wishlist" ? "Wishlist" : "Cart"}
          </h1>
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-sm text-gold">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground-muted">
          {kind === "wishlist"
            ? "Boutiques and designs you saved for later."
            : "Designs, materials, and boutiques ready to order or customize."}
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <SavedItemCard key={item.id} item={item} kind={kind} />
          ))}
        </div>
      </div>
    </div>
  );
}
