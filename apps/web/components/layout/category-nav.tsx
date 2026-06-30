"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@faden/utils";
import { fadenNavRailActive, fadenNavUnderlineActive, fadenPillActive } from "@/lib/ui/selection-styles";
import {
  AUDIENCE_CATEGORIES,
  getOutfitNavTypesForCategory,
  parseAudienceCategory,
} from "@/lib/landing/audience-categories";
import { OutfitTypeChoice } from "@/components/layout/outfit-type-choice";

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
    <nav aria-label="Category navigation" className="sticky top-[124px] z-30 border-b border-border bg-background shadow-sm md:top-[64px]">
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
  const [choiceOutfit, setChoiceOutfit] = useState<string | null>(null);

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
        mobile
          ? "flex w-full items-center rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-colors"
          : "shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium transition-colors hover:border-navy hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy",
        mobile
          ? isAudienceActive(cat.id)
            ? fadenNavRailActive + " border-l-4"
            : "border-transparent text-foreground-muted hover:bg-navy/5 hover:text-navy"
          : cn(
              "text-foreground-muted hover:border-navy hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy",
              isAudienceActive(cat.id) && fadenNavUnderlineActive,
            ),
      )}
    >
      {audienceLabel(cat.id)}
    </Link>
  ));

  const activeAudienceForOutfits = pathname === "/" ? category : searchAudience;

  function openOutfitChoice(outfitType: string) {
    setChoiceOutfit(outfitType);
  }

  const outfitLinks = outfitNavTypes.map((outfitType) => (
    <button
      key={outfitType}
      type="button"
      onClick={() => openOutfitChoice(outfitType)}
      className={cn(
        mobile
          ? "rounded-full border px-3 py-2 text-xs font-medium transition-colors"
          : "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isOutfitActive(outfitType)
          ? fadenPillActive
          : "border-navy/15 bg-background-elevated text-foreground-muted hover:border-navy/30 hover:text-navy",
      )}
    >
      {outfitType}
    </button>
  ));

  const choiceDialog = (
    <OutfitTypeChoice
      outfitType={choiceOutfit ?? ""}
      audience={activeAudienceForOutfits}
      open={Boolean(choiceOutfit)}
      onClose={() => setChoiceOutfit(null)}
      onNavigate={onNavigate}
    />
  );

  if (mobile) {
    return (
      <>
        <nav aria-label={t("ariaLabel")} className="space-y-5">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy">{t("ariaLabel")}</p>
            <div className="flex flex-col gap-1">{audienceLinks}</div>
          </div>
          {outfitLinks.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy">
                {t("outfitTypes")}
              </p>
              <div className="max-h-48 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2">{outfitLinks}</div>
              </div>
            </div>
          )}
        </nav>
        {choiceDialog}
      </>
    );
  }

  return (
    <>
      <nav aria-label={t("ariaLabel")} className="sticky top-[124px] z-30 border-b border-border bg-background shadow-sm md:top-[64px]">
        <div className="mx-auto max-w-container px-4 lg:px-12">
          <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
            {audienceLinks}
            <div className="ml-auto hidden shrink-0 items-center gap-4 pl-4 lg:flex">
              <Link href="/about" className="whitespace-nowrap text-xs font-medium text-foreground-muted transition-colors hover:text-navy">About Us</Link>
              <Link href="/careers" className="whitespace-nowrap text-xs font-medium text-foreground-muted transition-colors hover:text-navy">Careers</Link>
              <Link href="/contact" className="whitespace-nowrap text-xs font-medium text-foreground-muted transition-colors hover:text-navy">Contact Us</Link>
            </div>
          </div>
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto border-t border-border/60 py-2">
            {outfitLinks}
            <Link href={AUDIENCE_CATEGORIES[0].href} className="shrink-0 text-xs font-medium text-gold hover:underline">{t("browseAll")}</Link>
            <Link href="/alterations" className="shrink-0 text-xs font-medium text-gold hover:underline">{t("alterations")}</Link>
          </div>
        </div>
      </nav>
      {choiceDialog}
    </>
  );
}
