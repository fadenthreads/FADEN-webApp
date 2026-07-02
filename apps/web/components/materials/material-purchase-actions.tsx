"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@faden/ui";
import { useSavedItems } from "@/components/saved-items/saved-items-context";
import { savedMaterialItem } from "@/lib/saved-items/build-item";
import type { FeaturedMaterialItem } from "@/lib/materials/featured-materials";

interface MaterialPurchaseActionsProps {
  material: FeaturedMaterialItem;
  layout?: "inline" | "stack";
  onAction?: () => void;
}

export function MaterialPurchaseActions({
  material,
  layout = "stack",
  onAction,
}: MaterialPurchaseActionsProps) {
  const router = useRouter();
  const { addItem, isSaved } = useSavedItems();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cartItem = savedMaterialItem(material);
  const inCart = isSaved("cart", material.boutiqueSlug, material.id);

  function handleAddToCart() {
    startTransition(async () => {
      await addItem("cart", cartItem);
      setMessage("Added to cart");
      onAction?.();
    });
  }

  function handleBuyMaterial() {
    startTransition(async () => {
      if (!inCart) {
        await addItem("cart", cartItem);
      }
      onAction?.();
      router.push("/cart");
    });
  }

  const buttonClass = layout === "inline" ? "flex-1" : "w-full";

  return (
    <div className="space-y-2">
      <div className={layout === "inline" ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2"}>
        <Button
          type="button"
          variant="luxury"
          className={buttonClass}
          disabled={pending}
          onClick={handleBuyMaterial}
        >
          <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
          Buy material
        </Button>
        <Button
          type="button"
          variant="luxury-outline"
          className={buttonClass}
          disabled={pending || inCart}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
          {inCart ? "In cart" : "Add to cart"}
        </Button>
      </div>
      <Button asChild variant="ghost" size="sm" className="w-full text-navy/80">
        <Link href={`/customize?boutique=${encodeURIComponent(material.boutiqueSlug)}`}>
          Customize with this material
        </Link>
      </Button>
      {message && <p className="text-center text-xs text-gold">{message}</p>}
    </div>
  );
}
