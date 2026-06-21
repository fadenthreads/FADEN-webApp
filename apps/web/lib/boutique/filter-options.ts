import type { SearchSort } from "@/lib/boutique/search-nav";

export const RATING_FILTER_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any rating", value: null },
  { label: "4+ stars", value: 4 },
  { label: "4.5+ stars", value: 4.5 },
  { label: "4.8+ stars", value: 4.8 },
];

export const DISTANCE_FILTER_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any distance", value: null },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
  { label: "Within 25 km", value: 25 },
];

export const SORT_OPTIONS: { label: string; value: SearchSort }[] = [
  { label: "Best match", value: "best-match" },
  { label: "Nearest first", value: "distance-asc" },
  { label: "Highest rated", value: "rating-desc" },
  { label: "Lowest rated", value: "rating-asc" },
  { label: "Default order", value: "default" },
];

export interface DiscoveryFilterValues {
  minRating: number | null;
  maxDistanceKm: number | null;
  sort: SearchSort;
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilterValues = {
  minRating: null,
  maxDistanceKm: null,
  sort: "best-match",
};

export function getMinRatingLabel(value: number | null): string | null {
  if (value == null) return null;
  return RATING_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? `${value}+ stars`;
}

export function getDistanceLabel(value: number | null): string | null {
  if (value == null) return null;
  return DISTANCE_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? `Within ${value} km`;
}

export function getSortLabel(value: SearchSort): string {
  return SORT_OPTIONS.find((option) => option.value === value)?.label ?? "Best match";
}

export function countActiveDiscoveryFilters(filters: Pick<DiscoveryFilterValues, "minRating" | "maxDistanceKm">): number {
  let count = 0;
  if (filters.minRating != null) count += 1;
  if (filters.maxDistanceKm != null) count += 1;
  return count;
}

export function hasNonDefaultDiscoveryFilters(filters: DiscoveryFilterValues): boolean {
  return (
    filters.minRating != null ||
    filters.maxDistanceKm != null ||
    filters.sort !== DEFAULT_DISCOVERY_FILTERS.sort
  );
}
