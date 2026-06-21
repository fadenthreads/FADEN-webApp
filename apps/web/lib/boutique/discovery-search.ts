import type { BoutiqueData } from "@/data/boutiques";
import { ALL_OUTFIT_TYPES } from "@/lib/boutique/audiences";
import { filterBoutiquesByAudience } from "@/lib/boutique/audiences";
import {
  attachDistanceToBoutiques,
  filterBoutiquesByMaxDistance,
} from "@/lib/boutique/boutique-distance";
import type { GeoPoint } from "@/lib/location/geo";

export const FABRIC_TYPES = [
  "Silk",
  "Cotton",
  "Georgette",
  "Chiffon",
  "Velvet",
  "Banarasi",
  "Linen",
  "Organza",
  "Net",
  "Crepe",
  "Satin",
  "Brocade",
  "Khadi",
  "Zari",
] as const;

export type SearchSuggestionKind = "boutique" | "outfit" | "fabric";

export interface SearchSuggestion {
  kind: SearchSuggestionKind;
  label: string;
  value: string;
}

export interface DiscoverySearchFilters {
  query?: string;
  locationLabel?: string;
  audience?: import("@faden/validators").AudienceCategory | null;
  minRating?: number | null;
  customerLat?: number | null;
  customerLng?: number | null;
  maxDistanceKm?: number | null;
  useGeoSort?: boolean;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function includesMatch(needle: string, haystack: string): boolean {
  const n = normalize(needle);
  const h = normalize(haystack);
  if (!n || !h) return false;
  return h.includes(n) || n.includes(h);
}

function boutiqueSearchText(boutique: BoutiqueData): string {
  return [
    boutique.name,
    boutique.location,
    boutique.experienceSummary ?? "",
    ...(boutique.outfitTypes ?? []),
    ...(boutique.fabrics ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

/** Extract fabric keywords mentioned in boutique text fields. */
export function extractFabricsFromText(...parts: Array<string | null | undefined>): string[] {
  const blob = parts.filter(Boolean).join(" ").toLowerCase();
  return FABRIC_TYPES.filter((fabric) => blob.includes(fabric.toLowerCase()));
}

export function boutiqueMatchesQuery(boutique: BoutiqueData, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  if (includesMatch(q, boutique.name)) return true;
  if (includesMatch(q, boutique.location)) return true;
  if (boutique.experienceSummary && includesMatch(q, boutique.experienceSummary)) return true;

  if ((boutique.outfitTypes ?? []).some((outfit) => includesMatch(q, outfit))) return true;
  if ((boutique.fabrics ?? []).some((fabric) => includesMatch(q, fabric))) return true;

  return includesMatch(q, boutiqueSearchText(boutique));
}

export function filterBoutiquesForDiscovery(
  boutiques: BoutiqueData[],
  filters: DiscoverySearchFilters,
): BoutiqueData[] {
  let results = [...boutiques];

  const q = filters.query?.trim();
  if (q) {
    results = results.filter((boutique) => boutiqueMatchesQuery(boutique, q));
  }

  if (filters.locationLabel?.trim() && filters.customerLat == null && filters.customerLng == null) {
    const city = normalize(filters.locationLabel).split(",")[0]?.trim() ?? normalize(filters.locationLabel);
    results = results.filter((boutique) => normalize(boutique.location).includes(city));
  }

  if (filters.minRating != null && filters.minRating > 0) {
    results = results.filter((boutique) => boutique.rating >= filters.minRating!);
  }

  if (filters.audience) {
    results = filterBoutiquesByAudience(results, filters.audience);
  }

  const customerPoint: GeoPoint | null =
    filters.customerLat != null && filters.customerLng != null
      ? { lat: filters.customerLat, lng: filters.customerLng }
      : null;

  if (customerPoint) {
    results = attachDistanceToBoutiques(results, customerPoint, {
      customerLocationLabel: filters.locationLabel,
    });
    results = filterBoutiquesByMaxDistance(results, filters.maxDistanceKm);
  }

  return results;
}

export function buildSearchSuggestions(
  boutiques: BoutiqueData[],
  query: string,
  limit = 8,
): SearchSuggestion[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  const push = (kind: SearchSuggestionKind, label: string, value: string) => {
    const key = `${kind}:${normalize(value)}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push({ kind, label, value });
  };

  for (const boutique of boutiques) {
    if (includesMatch(q, boutique.name)) {
      push("boutique", boutique.name, boutique.name);
    }
  }

  for (const outfit of ALL_OUTFIT_TYPES) {
    if (includesMatch(q, outfit)) {
      push("outfit", outfit, outfit);
    }
  }

  for (const fabric of FABRIC_TYPES) {
    if (includesMatch(q, fabric)) {
      push("fabric", fabric, fabric);
    }
  }

  for (const boutique of boutiques) {
    for (const outfit of boutique.outfitTypes ?? []) {
      if (includesMatch(q, outfit)) push("outfit", outfit, outfit);
    }
    for (const fabric of boutique.fabrics ?? []) {
      if (includesMatch(q, fabric)) push("fabric", fabric, fabric);
    }
  }

  return suggestions.slice(0, limit);
}

export function suggestionKindLabel(kind: SearchSuggestionKind): string {
  switch (kind) {
    case "boutique":
      return "Boutique";
    case "outfit":
      return "Outfit type";
    case "fabric":
      return "Fabric";
  }
}

export interface BoutiquePickerSuggestion {
  slug: string;
  name: string;
  location: string;
}

/** Boutique-only suggestions for customize wizard — returns slug for form storage. */
export function buildBoutiquePickerSuggestions(
  boutiques: BoutiqueData[],
  query: string,
  limit = 8,
): BoutiquePickerSuggestion[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const matches = boutiques.filter((boutique) => {
    if (includesMatch(q, boutique.name)) return true;
    if (includesMatch(q, boutique.slug.replace(/-/g, " "))) return true;
    if (normalize(boutique.slug).includes(q)) return true;
    return boutiqueMatchesQuery(boutique, q);
  });

  const exactSlug = boutiques.find((boutique) => normalize(boutique.slug) === q);
  if (exactSlug && !matches.some((boutique) => boutique.slug === exactSlug.slug)) {
    matches.unshift(exactSlug);
  }

  return matches.slice(0, limit).map((boutique) => ({
    slug: boutique.slug,
    name: boutique.name,
    location: boutique.location,
  }));
}

export function findBoutiqueBySlug(
  boutiques: BoutiqueData[],
  slug: string,
): BoutiquePickerSuggestion | null {
  const normalized = normalize(slug);
  const boutique = boutiques.find((item) => normalize(item.slug) === normalized);
  if (!boutique) return null;
  return { slug: boutique.slug, name: boutique.name, location: boutique.location };
}
