export type SearchSort =
  | "rating-desc"
  | "rating-asc"
  | "distance-asc"
  | "best-match"
  | "default";

export const DEFAULT_SEARCH_SORT: SearchSort = "best-match";

export type SearchView = "boutiques" | "clothing";

export function searchHref(options: {
  q: string;
  audience?: string | null;
  minRating?: number | null;
  sort?: SearchSort | null;
  maxDistanceKm?: number | null;
  view?: SearchView | null;
}): string {
  const trimmed = options.q.trim();
  if (!trimmed) return "/search";

  const params = new URLSearchParams({ q: trimmed });
  if (options.view === "clothing") {
    params.set("view", "clothing");
  }
  if (options.audience?.trim()) {
    params.set("audience", options.audience.trim());
  }
  if (options.minRating != null && options.minRating > 0) {
    params.set("minRating", String(options.minRating));
  }
  const sort = options.sort ?? DEFAULT_SEARCH_SORT;
  if (sort !== "default") {
    params.set("sort", sort);
  }
  if (options.maxDistanceKm != null && options.maxDistanceKm > 0) {
    params.set("maxDistance", String(options.maxDistanceKm));
  }
  return `/search?${params.toString()}`;
}

export function parseSearchView(value: string | undefined): SearchView {
  return value === "clothing" ? "clothing" : "boutiques";
}

export function parseSearchMinRating(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseSearchMaxDistance(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseSearchSort(value: string | undefined): SearchSort {
  if (
    value === "rating-asc" ||
    value === "rating-desc" ||
    value === "distance-asc" ||
    value === "best-match" ||
    value === "default"
  ) {
    return value;
  }
  return DEFAULT_SEARCH_SORT;
}

export interface SortableBoutique {
  rating: number;
  name: string;
  distanceKm?: number | null;
}

export function sortBoutiquesByRating<T extends SortableBoutique>(
  boutiques: T[],
  sort: SearchSort,
): T[] {
  if (sort === "default") return boutiques;

  const sorted = [...boutiques];
  sorted.sort((a, b) => {
    if (sort === "rating-desc") {
      return b.rating - a.rating || a.name.localeCompare(b.name);
    }
    if (sort === "rating-asc") {
      return a.rating - b.rating || a.name.localeCompare(b.name);
    }
    return 0;
  });
  return sorted;
}

export function sortBoutiquesWithDistance<T extends SortableBoutique>(
  boutiques: T[],
  sort: SearchSort,
): T[] {
  if (sort === "rating-desc" || sort === "rating-asc") {
    return sortBoutiquesByRating(boutiques, sort);
  }

  if (sort === "default") return boutiques;

  const sorted = [...boutiques];

  if (sort === "distance-asc") {
    sorted.sort((a, b) => {
      const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
      if (aDistance !== bDistance) return aDistance - bDistance;
      return b.rating - a.rating || a.name.localeCompare(b.name);
    });
    return sorted;
  }

  if (sort === "best-match") {
    sorted.sort((a, b) => {
      const aScore =
        (a.rating / 5) * 0.55 +
        (a.distanceKm != null ? Math.max(0, 1 - Math.min(a.distanceKm, 50) / 50) * 0.45 : 0);
      const bScore =
        (b.rating / 5) * 0.55 +
        (b.distanceKm != null ? Math.max(0, 1 - Math.min(b.distanceKm, 50) / 50) * 0.45 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }

  return sorted;
}
