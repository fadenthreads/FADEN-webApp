import type { BoutiqueData } from "@/data/boutiques";
import { filterBoutiquesByAudience } from "@/lib/boutique/audiences";
import type { AudienceCategory } from "@/lib/landing/audience-categories";

/** Max distance (km) to count as "near" for featured — matches boutique matching. */
export const FEATURED_NEAR_DISTANCE_KM = 25;

export const FEATURED_MIN_COUNT = 7;
export const FEATURED_TOP_COUNT = 10;

export interface PickFeaturedBoutiquesOptions {
  audience?: AudienceCategory | null;
  limit?: number;
  minCount?: number;
  maxDistanceKm?: number;
}

function sortFeaturedCandidates(boutiques: BoutiqueData[]): BoutiqueData[] {
  return [...boutiques].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
    if (aDistance !== bDistance) return aDistance - bDistance;
    return a.name.localeCompare(b.name);
  });
}

export function pickFeaturedBoutiques(
  boutiques: BoutiqueData[],
  options: PickFeaturedBoutiquesOptions = {},
): BoutiqueData[] {
  const limit = options.limit ?? FEATURED_TOP_COUNT;
  const minCount = options.minCount ?? FEATURED_MIN_COUNT;
  const maxDistanceKm = options.maxDistanceKm ?? FEATURED_NEAR_DISTANCE_KM;

  const pool = filterBoutiquesByAudience(boutiques, options.audience ?? null);
  const hasGeoDistances = pool.some((boutique) => boutique.distanceKm != null);
  const sorted = sortFeaturedCandidates(pool);

  const near = hasGeoDistances
    ? sorted.filter(
        (boutique) => boutique.distanceKm != null && boutique.distanceKm <= maxDistanceKm,
      )
    : sorted;

  const picked: BoutiqueData[] = [];
  const seen = new Set<string>();

  const addUnique = (candidate: BoutiqueData) => {
    if (seen.has(candidate.slug) || picked.length >= limit) return;
    seen.add(candidate.slug);
    picked.push(candidate);
  };

  for (const boutique of near) addUnique(boutique);

  if (picked.length < minCount) {
    for (const boutique of sorted) {
      if (picked.length >= minCount) break;
      addUnique(boutique);
    }
  }

  return picked;
}
