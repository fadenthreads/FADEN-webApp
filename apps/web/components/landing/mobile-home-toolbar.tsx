"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Heart, Search, ShoppingBag, UserPlus } from "lucide-react";
import { SearchBar } from "@/components/layout/search-bar";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useSavedItems } from "@/components/saved-items/saved-items-context";

function SearchFallback() {
  return <div className="h-10 flex-1 rounded-full border border-border bg-background-elevated" />;
}

export function MobileHomeToolbar() {
  const t = useTranslations("Home");
  const { wishlist, cart } = useSavedItems();

  return (
    <div className="border-b border-border bg-background-soft px-4 py-3 md:hidden">
      <Suspense fallback={<SearchFallback />}>
        <SearchBar className="w-full" />
      </Suspense>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href="/signup"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gold/40 px-3 py-2 text-xs font-medium text-gold"
        >
          <UserPlus className="h-4 w-4" />
          {t("signUp")}
        </Link>
        <Link
          href="/wishlist"
          className="relative inline-flex items-center justify-center rounded-full p-2 text-gold"
          aria-label={t("wishlist")}
        >
          <Heart className="h-5 w-5" />
          {wishlist.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-accent px-1 text-[10px] font-semibold text-white">
              {wishlist.length}
            </span>
          )}
        </Link>
        <Link
          href="/cart"
          className="relative inline-flex items-center justify-center rounded-full p-2 text-gold"
          aria-label={t("cart")}
        >
          <ShoppingBag className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-accent px-1 text-[10px] font-semibold text-white">
              {cart.length}
            </span>
          )}
        </Link>
        <div className="shrink-0">
          <ProfileMenu />
        </div>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1 text-[10px] tracking-[0.25em] text-foreground-muted/70">
        <Search className="h-3 w-3" aria-hidden />
        FADEN
      </p>
    </div>
  );
}
