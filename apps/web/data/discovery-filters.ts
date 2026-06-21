/**
 * Discovery filters — Phase 3: live verified boutiques via /api/boutiques (client)
 * or server lib/boutique/queries.ts
 */
import type { BoutiqueData } from "./boutiques";
import { MOCK_BOUTIQUES } from "./boutiques";
import {
  filterBoutiquesForDiscovery,
  type DiscoverySearchFilters,
} from "@/lib/boutique/discovery-search";

export type DiscoveryFilters = DiscoverySearchFilters;

/** Mock-only fallback when Supabase is unavailable */
export function getBoutiquesForDiscovery(filters: DiscoveryFilters = {}): BoutiqueData[] {
  return filterBoutiquesForDiscovery(MOCK_BOUTIQUES, filters);
}

/** Unfiltered mock + caller-provided list for suggestion building in mock mode */
export function getAllBoutiquesForSuggestions(extra: BoutiqueData[] = []): BoutiqueData[] {
  const slugs = new Set(extra.map((b) => b.slug));
  return [...extra, ...MOCK_BOUTIQUES.filter((b) => !slugs.has(b.slug))];
}
