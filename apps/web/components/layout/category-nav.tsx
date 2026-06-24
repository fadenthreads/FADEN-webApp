"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@faden/utils";
import {
  AUDIENCE_CATEGORIES,
  getOutfitNavTypesForCategory,
  outfitTypeNavHref,
  parseAudienceCategory,
} from "@/lib/landing/audience-categories";
import { homeHref } from "@/lib/landing/home-nav";

interface CategoryNavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function CategoryNav({ mobile, onNavigate }: CategoryNavProps) {
  return (
    <Suspense fallback={mobile ? null : <CategoryNavBarFallback />}>
      <CategoryNavContent mobile={mobile} onNavigate={onNavigate} />
    </Suspense>
  );
}

function CategoryNavBarFallback() {
  return (
    <nav
      aria-label="Category navigation"
      className="sticky top-[72px] z-30 border-b border-border bg-background shadow-sm"
    >
      <div className="mx-auto flex h-12 max-w-container items-center px-4 lg:px-12" />
    </nav>
  );
}

function CategoryNavContent({ mobile, onNavigate }: CategoryNavProps) {
  const t = useTranslations("CategoryNav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = parseAudienceCategory(searchParams.get("category"));
  const searchQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";
  const searchAudience = parseAudienceCategory(searchParams.get("audience"));
  const outfitNavTypes = getOutfitNavTypesForCategory(pathname === "/" ? category : searchAudience);

  const audienceLabel = (id: (typeof AUDIENCE_CATEGORIES)[number]["id"]) => {
    if (id === "all") return t("all");
    return t(id);
  };

  const isAudienceActive = (id: (typeof AUDIENCE_CATEGORIES)[number]["id"]) => {
    if (pathname !== "/") return false;
    if (id === "all") return !category;
    return category === id;
  };

  const isOutfitActive = (outfitType: string) =>
    pathname === "/search" && searchQuery.toLowerCase() === outfitType.toLowerCase();

  const audienceLinks = AUDIENCE_CATEGORIES.map((cat) => (
    <Link
      key={cat.id}
      href={cat.href}
      onClick={onNavigate}
      className={cn(
        "shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-foreground-muted transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        isAudienceActive(cat.id) && "border-gold text-gold",
      )}
    >
      {audienceLabel(cat.id)}
    </Link>
  ));

  const activeAudienceForOutfits = pathname === "/" ? category : searchAudience;
  const outfitLinks = outfitNavTypes.map((outfitType) => (
    <Link
      key={outfitType}
      href={outfitTypeNavHref(outfitType, activeAudienceForOutfits)}
      onClick={onNavigate}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isOutfitActive(outfitType)
          ? "border-gold bg-gold/15 text-gold"
          : "border-border bg-background-elevated text-foreground-muted hover:border-gold/40 hover:text-gold",
      )}
    >
      {outfitType}
    </Link>
  ));

  if (mobile) {
    return (
      <nav aria-label={t("ariaLabel")} className="space-y-4">
        <div className="flex flex-col gap-1">{audienceLinks}</div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            {t("outfitTypes")}
          </p>
          <div className="flex flex-wrap gap-2">{outfitLinks}</div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="sticky top-[72px] z-30 border-b border-border bg-background shadow-sm"
    >
      <div className="mx-auto max-w-container px-4 lg:px-12">
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">{audienceLinks}</div>
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto border-t border-border/60 py-2">
          {outfitLinks}
          <Link
            href={homeHref({ hash: "featured-boutiques" })}
            className="shrink-0 text-xs font-medium text-gold hover:underline"
          >
            {t("browseAll")}
          </Link>
          <Link
            href="/alterations"
            className="shrink-0 text-xs font-medium text-gold hover:underline"
          >
            {t("alterations")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
