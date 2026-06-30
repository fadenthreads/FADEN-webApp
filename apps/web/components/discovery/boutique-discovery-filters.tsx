"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@faden/utils";
import { Button } from "@faden/ui";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import type { SearchSort } from "@/lib/boutique/search-nav";
import {
  countActiveDiscoveryFilters,
  DEFAULT_DISCOVERY_FILTERS,
  DISTANCE_FILTER_OPTIONS,
  getDistanceLabel,
  getMinRatingLabel,
  getSortLabel,
  RATING_FILTER_OPTIONS,
  SORT_OPTIONS,
  type DiscoveryFilterValues,
} from "@/lib/boutique/filter-options";

interface BoutiqueDiscoveryFiltersProps {
  minRating: number | null;
  maxDistanceKm: number | null;
  sort: SearchSort;
  onApply: (filters: DiscoveryFilterValues) => void;
  className?: string;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function FilterRadioOption({
  name,
  checked,
  label,
  onChange,
}: {
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-background-soft">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-navy"
      />
      <span className={cn("text-sm", checked ? "font-medium text-navy" : "text-foreground-muted")}>
        {label}
      </span>
    </label>
  );
}

function ActiveFilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
    >
      {label}
      <X className="h-3 w-3" aria-hidden />
    </button>
  );
}

export function BoutiqueDiscoveryFilters({
  minRating,
  maxDistanceKm,
  sort,
  onApply,
  className,
}: BoutiqueDiscoveryFiltersProps) {
  const sortSelectId = useId();
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<DiscoveryFilterValues>({
    minRating,
    maxDistanceKm,
    sort,
  });

  const activeFilterCount = countActiveDiscoveryFilters({ minRating, maxDistanceKm });

  useEffect(() => {
    if (!panelOpen) {
      setDraft({ minRating, maxDistanceKm, sort });
    }
  }, [minRating, maxDistanceKm, sort, panelOpen]);

  useBodyScrollLock(panelOpen);

  useEffect(() => {
    if (!panelOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [panelOpen]);

  function openPanel() {
    setDraft({ minRating, maxDistanceKm, sort });
    setPanelOpen(true);
  }

  function applyDraft() {
    onApply(draft);
    setPanelOpen(false);
  }

  function clearAll() {
    onApply({ minRating: null, maxDistanceKm: null, sort });
    setDraft({ minRating: null, maxDistanceKm: null, sort });
    setPanelOpen(false);
  }

  function removeMinRating() {
    onApply({ minRating: null, maxDistanceKm, sort });
  }

  function removeMaxDistance() {
    onApply({ minRating, maxDistanceKm: null, sort });
  }

  const minRatingLabel = getMinRatingLabel(minRating);
  const distanceLabel = getDistanceLabel(maxDistanceKm);

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="luxury-outline"
            size="sm"
            onClick={openPanel}
            className="relative gap-2 normal-case tracking-normal"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <label htmlFor={sortSelectId} className="sr-only">
              Sort boutiques
            </label>
            <span className="hidden text-xs text-foreground-muted sm:inline">Sort by</span>
            <div className="relative">
              <select
                id={sortSelectId}
                value={sort}
                onChange={(event) =>
                  onApply({
                    minRating,
                    maxDistanceKm,
                    sort: event.target.value as SearchSort,
                  })
                }
                className="h-9 appearance-none rounded-lg border border-border bg-background-elevated py-1.5 pl-3 pr-9 text-sm text-foreground outline-none transition-colors focus:border-gold/40 focus:ring-1 focus:ring-gold/30"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                aria-hidden
              />
            </div>
          </div>
        </div>

        {(minRatingLabel || distanceLabel) && (
          <div className="flex flex-wrap items-center gap-2">
            {minRatingLabel && (
              <ActiveFilterPill label={minRatingLabel} onRemove={removeMinRating} />
            )}
            {distanceLabel && (
              <ActiveFilterPill label={distanceLabel} onRemove={removeMaxDistance} />
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-foreground-muted underline-offset-2 hover:text-gold hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close filters"
            onClick={() => setPanelOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="boutique-filters-title"
            className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 id="boutique-filters-title" className="font-display text-lg font-semibold">
                  Filters
                </h2>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  Combine rating and distance filters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-soft hover:text-foreground"
                aria-label="Close filters panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterSection title="Customer rating">
                {RATING_FILTER_OPTIONS.map((option) => (
                  <FilterRadioOption
                    key={option.label}
                    name="minRating"
                    label={option.label}
                    checked={draft.minRating === option.value}
                    onChange={() => setDraft((current) => ({ ...current, minRating: option.value }))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Distance from you">
                {DISTANCE_FILTER_OPTIONS.map((option) => (
                  <FilterRadioOption
                    key={option.label}
                    name="maxDistance"
                    label={option.label}
                    checked={draft.maxDistanceKm === option.value}
                    onChange={() =>
                      setDraft((current) => ({ ...current, maxDistanceKm: option.value }))
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Sort results">
                {SORT_OPTIONS.map((option) => (
                  <FilterRadioOption
                    key={option.value}
                    name="sort"
                    label={option.label}
                    checked={draft.sort === option.value}
                    onChange={() => setDraft((current) => ({ ...current, sort: option.value }))}
                  />
                ))}
              </FilterSection>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="luxury-outline"
                  className="flex-1 normal-case tracking-normal"
                  onClick={() => setDraft(DEFAULT_DISCOVERY_FILTERS)}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="luxury"
                  className="flex-1 normal-case tracking-normal"
                  onClick={applyDraft}
                >
                  Apply filters
                </Button>
              </div>
              {sort !== draft.sort && (
                <p className="mt-2 text-center text-[11px] text-foreground-muted">
                  Sort: {getSortLabel(draft.sort)}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
