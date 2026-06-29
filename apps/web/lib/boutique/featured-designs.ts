import type { SupabaseClient } from "@supabase/supabase-js";
import type { AudienceCategory } from "@faden/validators";
import { BOUTIQUE_PROFILES } from "@/data/boutique-profiles";
import { mapPortfolioItemsToDesigns } from "@/lib/boutique/portfolio";
import type { PortfolioItemRow } from "@/lib/boutique/portfolio";

export interface FeaturedDesignItem {
  id: string;
  title: string;
  imageUrl: string;
  gradient?: string;
  price?: string;
  material?: string;
  description?: string;
  boutiqueName: string;
  boutiqueSlug: string;
  mediaType: string;
  audience?: string;
}

type BoutiqueRow = {
  id: string;
  name: string;
  slug: string;
  audience?: string | null;
  boutique_portfolio_items: PortfolioItemRow[] | null;
};

export async function listFeaturedDesignsFromDb(
  supabase: SupabaseClient,
  limit = 24,
  audience?: AudienceCategory | null,
): Promise<FeaturedDesignItem[]> {
  let query = supabase
    .from("boutiques")
    .select(`
      id, name, slug, audience,
      boutique_portfolio_items (
        id, media_url, media_type, caption, sort_order, title, description, price_hint
      )
    `)
    .eq("status", "verified")
    .order("rating", { ascending: false })
    .limit(40);

  if (audience) {
    query = query.or(`audience.eq.${audience},audience.eq.all`);
  }

  const { data, error } = await query;
  if (error || !data?.length) return [];

  const items: FeaturedDesignItem[] = [];

  for (const row of data as BoutiqueRow[]) {
    const designs = mapPortfolioItemsToDesigns({
      items: row.boutique_portfolio_items ?? [],
      boutiqueSlug: row.slug,
      reviews: [],
      categories: [],
      defaultRating: 4.5,
    });

    for (const design of designs) {
      if (!design.imageUrl) continue;
      items.push({
        id: design.id,
        title: design.title,
        imageUrl: design.imageUrl,
        price: design.price ?? undefined,
        material: design.material ?? undefined,
        description: design.description ?? undefined,
        boutiqueName: row.name,
        boutiqueSlug: row.slug,
        mediaType: design.imageUrl.startsWith("data:video") ? "video" : "image",
        audience: row.audience ?? undefined,
      });
      if (items.length >= limit) return items;
    }
  }

  return items;
}

export function listFeaturedDesignsFromMock(
  limit = 24,
  audience?: AudienceCategory | null,
): FeaturedDesignItem[] {
  const items: FeaturedDesignItem[] = [];

  for (const profile of Object.values(BOUTIQUE_PROFILES)) {
    if (audience) {
      const boutiqueAudiences = (profile as { audiences?: AudienceCategory[] }).audiences ?? [];
      if (boutiqueAudiences.length > 0 && !boutiqueAudiences.includes(audience)) continue;
    }

    const designs = profile.portfolioDesigns?.length ? profile.portfolioDesigns : profile.latestDesigns;

    for (const design of designs) {
      items.push({
        id: design.id,           // Matches getDesignById IDs exactly (e.g. silk-thread-studio-d0)
        title: design.title,
        imageUrl: design.imageUrl ?? "",
        gradient: design.gradient,
        price: design.price,
        material: design.material,
        description: design.description ?? undefined,
        boutiqueName: profile.name,
        boutiqueSlug: profile.slug,
        mediaType: "image",
      });
      if (items.length >= limit) return items;
    }
  }

  return items;
}
