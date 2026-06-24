import type { SupabaseClient } from "@supabase/supabase-js";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import { mapPortfolioItemsToDesigns } from "@/lib/boutique/portfolio";
import type { PortfolioItemRow } from "@/lib/boutique/portfolio";

export interface FeaturedDesignItem {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  material?: string;
  description?: string;
  boutiqueName: string;
  boutiqueSlug: string;
  mediaType: string;
}

type BoutiqueRow = {
  id: string;
  name: string;
  slug: string;
  boutique_portfolio_items: PortfolioItemRow[] | null;
};

export async function listFeaturedDesignsFromDb(
  supabase: SupabaseClient,
  limit = 24,
): Promise<FeaturedDesignItem[]> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(
      `
      id,
      name,
      slug,
      boutique_portfolio_items (
        id,
        media_url,
        media_type,
        caption,
        sort_order,
        title,
        description,
        price_hint
      )
    `,
    )
    .eq("status", "verified")
    .order("rating", { ascending: false })
    .limit(40);

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
      });
      if (items.length >= limit) return items;
    }
  }

  return items;
}

export function listFeaturedDesignsFromMock(limit = 24): FeaturedDesignItem[] {
  const boutiques = getBoutiquesForDiscovery({});
  const items: FeaturedDesignItem[] = [];

  for (const boutique of boutiques) {
    for (const media of boutique.media ?? []) {
      const imageUrl = media.url ?? "";
      if (!imageUrl) continue;
      items.push({
        id: `${boutique.slug}-${items.length}`,
        title: media.label || `${boutique.name} design`,
        imageUrl,
        boutiqueName: boutique.name,
        boutiqueSlug: boutique.slug,
        mediaType: media.type ?? "image",
      });
      if (items.length >= limit) break;
    }
    if (items.length >= limit) break;
  }

  return items;
}
