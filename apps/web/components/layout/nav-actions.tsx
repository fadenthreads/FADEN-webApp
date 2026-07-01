"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@faden/utils";
import { ProfileMenu } from "./profile-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useSavedItems } from "@/components/saved-items/saved-items-context";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-accent px-1 text-[10px] font-semibold text-white">
      {count}
    </span>
  );
}

interface NavActionsProps {
  className?: string;
}

export function NavActions({ className }: NavActionsProps) {
  const t = useTranslations("Nav");
  const { wishlist, cart } = useSavedItems();

  return (
    <div className={cn("flex shrink-0 items-center gap-2 sm:gap-3", className ?? "flex")}>
      <Link
        href="/wishlist"
        className="relative rounded-full p-2 text-gold transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={wishlist.length ? t("wishlistWithCount", { count: wishlist.length }) : t("wishlist")}
      >
        <Heart className="h-5 w-5" />
        <Badge count={wishlist.length} />
      </Link>
      <Link
        href="/cart"
        className="relative rounded-full p-2 text-gold transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={cart.length ? t("cartWithCount", { count: cart.length }) : t("cart")}
      >
        <ShoppingBag className="h-5 w-5" />
        <Badge count={cart.length} />
      </Link>
      <NotificationBell />
      <ProfileMenu />
    </div>
  );
}
