/**
 * Discovery filters — live verified boutiques via /api/boutiques (client)
 * or server lib/boutique/queries.ts
 */
import type { BoutiqueData } from "./boutiques";
import type { DiscoverySearchFilters } from "@/lib/boutique/discovery-search";

export type DiscoveryFilters = DiscoverySearchFilters;

/** Live-data only — returns empty when Supabase is unavailable. */
export function getBoutiquesForDiscovery(_filters: DiscoveryFilters = {}): BoutiqueData[] {
  return [];
}

export function getAllBoutiquesForSuggestions(extra: BoutiqueData[] = []): BoutiqueData[] {
  return extra;
}
