import type { SupabaseClient } from "@supabase/supabase-js";
import type { AudienceCategory } from "@faden/validators";
import {
  listFeaturedDesignsFromDb,
  type FeaturedDesignItem,
} from "@/lib/boutique/featured-designs";

function matchesOutfitQuery(design: FeaturedDesignItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    design.title,
    design.material,
    design.description,
    design.boutiqueName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function listClothingByQuerySync(
  _query: string,
  _audience?: AudienceCategory | null,
  _limit = 48,
): FeaturedDesignItem[] {
  return [];
}

export async function listClothingByQuery(
  supabase: SupabaseClient | null,
  query: string,
  audience?: AudienceCategory | null,
  limit = 48,
): Promise<FeaturedDesignItem[]> {
  if (!supabase) return [];

  const items = await listFeaturedDesignsFromDb(supabase, 120, audience);
  return items.filter((item) => matchesOutfitQuery(item, query)).slice(0, limit);
}
