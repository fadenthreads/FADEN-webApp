"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@faden/utils";
import { Button } from "@faden/ui";
import { FilterBottomSheet } from "@/components/layout/filter-bottom-sheet";
import {
  AUDIENCE_CATEGORIES,
  parseAudienceCategory,
  type AudienceCategory,
} from "@/lib/landing/audience-categories";
import {
  DISCOVERY_OUTFIT_TYPES,
  filterOutfitTypes,
} from "@/lib/landing/outfit-filter-options";
import {
  getStoredOutfitFilters,
  setStoredOutfitFilters,
} from "@/lib/landing/outfit-filter-storage";
import { searchHref } from "@/lib/boutique/search-nav";
import { homeHref } from "@/lib/landing/home-nav";
import { fadenPillSoftActive } from "@/lib/ui/selection-styles";

function FilterBarFallback() {
  return (
    <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto h-14 max-w-container px-4 lg:px-12" />
    </div>
  );
}

export function DiscoveryFilterBar() {
  return (
    <Suspense fallback={<FilterBarFallback />}>
      <DiscoveryFilterBarContent />
    </Suspense>
  );
}

function DiscoveryFilterBarContent() {
  const t = useTranslations("CategoryNav");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = parseAudienceCategory(searchParams.get("category"));
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [outfitsOpen, setOutfitsOpen] = useState(false);
  const [outfitQuery, setOutfitQuery] = useState("");
  const [draftOutfits, setDraftOutfits] = useState<string[]>([]);

  useEffect(() => {
    setSelectedOutfits(getStoredOutfitFilters());
  }, []);

  const categoryLabel = useMemo(() => {
    if (pathname !== "/") return null;
    if (!category) return t("all");
    return t(category);
  }, [category, pathname, t]);

  const filteredOutfits = useMemo(() => filterOutfitTypes(outfitQuery), [outfitQuery]);

  const applyCategory = useCallback(
    (id: AudienceCategory | "all") => {
      setCategoryOpen(false);
      if (id === "all") {
        router.push(homeHref({ hash: "featured-boutiques" }));
        return;
      }
      router.push(homeHref({ hash: "featured-boutiques", category: id }));
    },
    [router],
  );

  const openOutfitsSheet = () => {
    setDraftOutfits(selectedOutfits);
    setOutfitQuery("");
    setOutfitsOpen(true);
  };

  const toggleDraftOutfit = (outfit: string) => {
    setDraftOutfits((current) =>
      current.includes(outfit) ? current.filter((item) => item !== outfit) : [...current, outfit],
    );
  };

  const applyOutfits = () => {
    setSelectedOutfits(draftOutfits);
    setStoredOutfitFilters(draftOutfits);
    setOutfitsOpen(false);

    if (draftOutfits.length === 1) {
      router.push(searchHref({ q: draftOutfits[0], audience: category ?? undefined, view: "boutiques" }));
    } else if (draftOutfits.length > 1) {
      router.push(
        searchHref({
          q: draftOutfits.join(", "),
          audience: category ?? undefined,
          view: "boutiques",
        }),
      );
    }
  };

  const removeOutfitChip = (outfit: string) => {
    const next = selectedOutfits.filter((item) => item !== outfit);
    setSelectedOutfits(next);
    setStoredOutfitFilters(next);
  };

  const outfitsButtonLabel =
    selectedOutfits.length === 0
      ? "Outfits"
      : selectedOutfits.length === 1
        ? selectedOutfits[0]
        : `${selectedOutfits.length} outfits`;

  return (
    <>
      <div className="sticky top-[var(--header-height)] z-30 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur-sm md:top-[64px]">
        <div className="mx-auto max-w-container px-4 py-3 lg:px-12">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCategoryOpen(true)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200",
                categoryLabel && pathname === "/"
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-border bg-background-elevated text-foreground hover:border-navy/30 hover:text-navy",
              )}
            >
              {pathname === "/" ? categoryLabel ?? t("all") : t("all")}
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </button>

            <button
              type="button"
              onClick={openOutfitsSheet}
              className={cn(
                "inline-flex h-10 max-w-[min(100%,220px)] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200",
                selectedOutfits.length > 0
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-border bg-background-elevated text-foreground hover:border-navy/30 hover:text-navy",
              )}
            >
              <span className="truncate">{outfitsButtonLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </button>

            <div className="ml-auto hidden items-center gap-4 lg:flex">
              <Link href="/about" className="text-xs font-medium text-foreground-muted transition-colors hover:text-navy">
                About Us
              </Link>
              <Link href="/careers" className="text-xs font-medium text-foreground-muted transition-colors hover:text-navy">
                Careers
              </Link>
              <Link href="/contact" className="text-xs font-medium text-foreground-muted transition-colors hover:text-navy">
                Contact Us
              </Link>
              <Link href="/alterations" className="text-xs font-medium text-navy/80 transition-colors hover:text-navy">
                {t("alterations")}
              </Link>
            </div>
          </div>

          {selectedOutfits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedOutfits.map((outfit) => (
                <button
                  key={outfit}
                  type="button"
                  onClick={() => removeOutfitChip(outfit)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                    fadenPillSoftActive,
                  )}
                >
                  {outfit}
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove {outfit}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilterBottomSheet
        open={categoryOpen}
        title="Categories"
        onClose={() => setCategoryOpen(false)}
      >
        <ul className="space-y-1">
          {AUDIENCE_CATEGORIES.map((item) => {
            const active = pathname === "/" && (item.id === "all" ? !category : category === item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => applyCategory(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors duration-200",
                    active
                      ? "bg-navy/10 font-medium text-navy"
                      : "text-foreground hover:bg-background-soft",
                  )}
                >
                  <span>{item.id === "all" ? t("all") : t(item.id)}</span>
                  {active ? <Check className="h-4 w-4 text-navy" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterBottomSheet>

      <FilterBottomSheet
        open={outfitsOpen}
        title="Outfits"
        onClose={() => setOutfitsOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="luxury-outline"
              className="flex-1"
              onClick={() => {
                setDraftOutfits([]);
              }}
            >
              Clear
            </Button>
            <Button type="button" variant="luxury" className="flex-1" onClick={applyOutfits}>
              Apply{draftOutfits.length > 0 ? ` (${draftOutfits.length})` : ""}
            </Button>
          </div>
        }
      >
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" aria-hidden />
          <input
            type="search"
            value={outfitQuery}
            onChange={(event) => setOutfitQuery(event.target.value)}
            placeholder="Search outfits…"
            className="faden-field h-11 w-full pl-11 pr-4"
          />
        </div>
        <ul className="space-y-1">
          {filteredOutfits.map((outfit) => {
            const selected = draftOutfits.includes(outfit);
            return (
              <li key={outfit}>
                <button
                  type="button"
                  onClick={() => toggleDraftOutfit(outfit)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors duration-200",
                    selected ? "bg-navy/10 font-medium text-navy" : "text-foreground hover:bg-background-soft",
                  )}
                >
                  <span>{outfit}</span>
                  {selected ? <Check className="h-4 w-4 text-navy" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
          {filteredOutfits.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-foreground-muted">No outfits match your search.</li>
          )}
        </ul>
      </FilterBottomSheet>
    </>
  );
}
