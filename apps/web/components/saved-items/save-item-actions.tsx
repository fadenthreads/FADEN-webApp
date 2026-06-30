"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@faden/utils";
import type { SavedItemInput } from "@faden/validators";
import { useSavedItems } from "@/components/saved-items/saved-items-context";
import type { SavedListKind } from "@/lib/saved-items/types";

interface SaveItemActionsProps {
  item: SavedItemInput;
  showWishlist?: boolean;
  showCart?: boolean;
  size?: "sm" | "md";
  className?: string;
  stopPropagation?: boolean;
}

function ActionButton({
  kind,
  active,
  label,
  onClick,
  size,
  stopPropagation,
  children,
}: {
  kind: SavedListKind;
  active: boolean;
  label: string;
  onClick: () => void;
  size: "sm" | "md";
  stopPropagation?: boolean;
  children: React.ReactNode;
}) {
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={(event) => {
        if (stopPropagation) {
          event.preventDefault();
          event.stopPropagation();
        }
        onClick();
      }}
      className={cn(
        "rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        padding,
        active
          ? kind === "wishlist"
            ? "border-red-accent/50 bg-red-accent/15 text-red-accent"
            : "border-gold/50 bg-navy/10 text-navy font-medium"
          : "border-border/80 bg-background/80 text-foreground-muted hover:border-gold/40 hover:text-gold",
      )}
    >
      {children}
    </button>
  );
}

export function SaveItemActions({
  item,
  showWishlist = true,
  showCart = true,
  size = "md",
  className,
  stopPropagation = true,
}: SaveItemActionsProps) {
  const { isSaved, toggleItem } = useSavedItems();
  const inWishlist = isSaved("wishlist", item.boutiqueSlug, item.designId);
  const inCart = isSaved("cart", item.boutiqueSlug, item.designId);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showWishlist && (
        <ActionButton
          kind="wishlist"
          active={inWishlist}
          label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          size={size}
          stopPropagation={stopPropagation}
          onClick={() => void toggleItem("wishlist", item)}
        >
          <Heart className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", inWishlist && "fill-current")} />
        </ActionButton>
      )}
      {showCart && (
        <ActionButton
          kind="cart"
          active={inCart}
          label={inCart ? "Remove from cart" : "Add to cart"}
          size={size}
          stopPropagation={stopPropagation}
          onClick={() => void toggleItem("cart", item)}
        >
          <ShoppingBag className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        </ActionButton>
      )}
    </div>
  );
}
