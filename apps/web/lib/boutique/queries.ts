import type { SupabaseClient } from "@supabase/supabase-js";
import type { Boutique } from "@faden/types";
import type { BoutiqueData } from "@/data/boutiques";
import type { BoutiqueProfileData, BoutiqueReview } from "@/data/boutique-profiles";
import { MOCK_BOUTIQUES } from "@/data/boutiques";
import { getBoutiqueProfile as getMockBoutiqueProfile } from "@/data/boutique-profiles";
import { slugify } from "@faden/utils";
import {
  getBoutiqueReviewStats,
  listBoutiqueReviews,
  loadReviewStatsByBoutiqueIds,
} from "@/lib/review/queries";

import {
  extractFabricsFromText,
  filterBoutiquesForDiscovery,
  type DiscoverySearchFilters,
} from "@/lib/boutique/discovery-search";
import { inferAudiencesFromOutfitLabels, inferOutfitAudience, type AudienceCategory } from "@faden/validators";
import { mapPortfolioItemsToDesigns, type PortfolioItemRow } from "@/lib/boutique/portfolio";
import { listPublicCreativeDispatch } from "@/lib/boutique/creative-dispatch-queries";
import { resolveBoutiqueLocation } from "@/lib/location/city-coordinates";
import { readAvailabilityNotice } from "@/lib/dashboard/boutique-listings";

const GRADIENTS = [
  "from-burgundy/60 via-rose-900/40 to-background-soft",
  "from-amber-900/50 via-burgundy/40 to-background-soft",
  "from-purple-900/40 via-burgundy/30 to-background-soft",
  "from-emerald-900/30 via-burgundy/40 to-background-soft",
  "from-indigo-900/40 via-burgundy/30 to-background-soft",
  "from-pink-900/40 via-rose-900/30 to-background-soft",
];

type OutfitRow = { id: string; label: string; audience?: string | null };
type ServiceRow = { label: string };
type PortfolioRow = PortfolioItemRow;

type BoutiqueRow = Boutique & {
  availability_notice?: string | null;
  audiences?: AudienceCategory[] | null;
  boutique_outfit_types: OutfitRow[] | null;
  boutique_services: ServiceRow[] | null;
  boutique_portfolio_items: PortfolioRow[] | null;
};

function experienceLabel(years: number | null): string {
  if (years == null || years <= 0) return "Experienced studio";
  return years === 1 ? "1 year" : `${years} years`;
}

function defaultRating(completedOrders: number | null): number {
  if (completedOrders != null && completedOrders >= 100) return 4.9;
  if (completedOrders != null && completedOrders >= 25) return 4.8;
  return 4.7;
}

function mapPortfolioToMedia(items: PortfolioRow[] | null | undefined, slug: string): BoutiqueData["media"] {
  const sorted = [...(items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  if (!sorted.length) {
    return [
      {
        type: "image",
        label: "Portfolio",
        gradient: GRADIENTS[0],
      },
    ];
  }

  return sorted.map((item, index) => ({
    type: item.media_type === "video" ? ("video" as const) : ("image" as const),
    label: item.caption || `${slug} look ${index + 1}`,
    gradient: GRADIENTS[index % GRADIENTS.length],
    url: item.media_url?.startsWith("http") ? item.media_url : undefined,
  }));
}

export type DiscoveryFilters = DiscoverySearchFilters;

export function mapBoutiqueRowToDiscovery(
  row: BoutiqueRow,
  ratingOverride?: number,
  reviewCountOverride?: number,
): BoutiqueData {
  const years = row.years_in_business;
  const experience = experienceLabel(years);
  const location = row.address?.split(",").slice(-2).join(",").trim() || row.address || "India";
  const outfitTypes = (row.boutique_outfit_types ?? []).map((item) => item.label);
  const audiences: AudienceCategory[] =
    row.audiences?.length
      ? (row.audiences.filter((item): item is AudienceCategory =>
          item === "women" || item === "men" || item === "kids",
        ) as AudienceCategory[])
      : inferAudiencesFromOutfitLabels(outfitTypes);
  const serviceLabels = (row.boutique_services ?? []).map((item) => item.label);
  const fabrics = [
    ...extractFabricsFromText(row.pricing_info, row.reviews_summary, ...serviceLabels),
    ...serviceLabels.filter((label) =>
      /silk|cotton|georgette|chiffon|velvet|banarasi|linen|organza|net|crepe|satin|brocade|khadi|zari|fabric/i.test(
        label,
      ),
    ),
  ];

  const coords = resolveBoutiqueLocation({
    slug: row.slug,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
  });

  return {
    slug: row.slug,
    name: row.name,
    location,
    latitude: row.latitude ?? coords?.point.lat ?? null,
    longitude: row.longitude ?? coords?.point.lng ?? null,
    rating: ratingOverride ?? defaultRating(row.completed_orders_approx),
    reviewCount: reviewCountOverride,
    experience,
    audiences,
    outfitTypes,
    fabrics: [...new Set(fabrics)],
    experienceSummary:
      row.pricing_info?.slice(0, 120) ||
      row.reviews_summary?.slice(0, 120) ||
      `${experience} of bespoke fashion · ${row.owner_name}`,
    media: mapPortfolioToMedia(row.boutique_portfolio_items, row.slug),
    availability: row.availability ?? "open",
    availabilityMessage:
      row.availability === "closed" ? readAvailabilityNotice(row) : null,
  };
}

function mapReviewRecordsToProfile(
  row: BoutiqueRow,
  reviewRecords: Awaited<ReturnType<typeof listBoutiqueReviews>>,
  avgRating: number,
): BoutiqueReview[] {
  const outfitTypes = row.boutique_outfit_types ?? [];
  const gradients = GRADIENTS;

  const platformReviews = reviewRecords.map((review, index) => ({
    id: review.id,
    name: "Verified customer",
    rating: review.rating,
    text: review.body || "Great experience with this boutique.",
    outfit: review.outfit_type ?? outfitTypes[0]?.label ?? "Custom outfit",
    photoGradient: gradients[index % gradients.length],
  }));

  const summaryText = row.reviews_summary?.trim();
  if (summaryText && !platformReviews.length) {
    return [
      {
        id: `${row.slug}-summary`,
        name: "FADEN verified",
        rating: avgRating || defaultRating(row.completed_orders_approx),
        text: summaryText,
        outfit: outfitTypes[0]?.label ?? "Custom outfit",
        photoGradient: GRADIENTS[1],
      },
    ];
  }

  return platformReviews;
}

export async function mapBoutiqueRowToProfile(
  supabase: SupabaseClient,
  row: BoutiqueRow,
): Promise<BoutiqueProfileData> {
  const [reviewRecords, stats] = await Promise.all([
    listBoutiqueReviews(supabase, row.id, 12).catch(() => []),
    getBoutiqueReviewStats(supabase, row.id).catch(() => ({
      averageRating: 0,
      reviewCount: 0,
    })),
  ]);

  const rating =
    stats.reviewCount > 0 ? stats.averageRating : defaultRating(row.completed_orders_approx);
  const discovery = mapBoutiqueRowToDiscovery(row, rating);
  const outfitTypes = row.boutique_outfit_types ?? [];
  const services = row.boutique_services ?? [];

  const categories = outfitTypes.length
    ? outfitTypes.map((item, index) => ({
        id: slugify(item.label) || `cat-${index}`,
        label: item.label,
        audience: (item.audience === "women" || item.audience === "men" || item.audience === "kids"
          ? item.audience
          : inferOutfitAudience(item.label)) as AudienceCategory,
        iconGradient: GRADIENTS[index % GRADIENTS.length],
      }))
    : [{ id: "custom", label: "Custom wear", iconGradient: GRADIENTS[0] }];

  const reviews = mapReviewRecordsToProfile(row, reviewRecords, rating);
  const servicesSummary = services.map((s) => s.label).join(" · ");

  const portfolioDesigns = (row.boutique_portfolio_items ?? []).length
    ? mapPortfolioItemsToDesigns({
        items: row.boutique_portfolio_items ?? [],
        categories,
        reviews,
        boutiqueSlug: row.slug,
        defaultRating: rating,
        avgDeliveryTime: row.avg_delivery_time,
        pricingInfo: row.pricing_info,
        servicesSummary,
        outfitTypesById: new Map(outfitTypes.map((item) => [item.id, item.label])),
      })
    : [];

  const creativeDispatch = await listPublicCreativeDispatch(supabase, row.id);

  return {
    ...discovery,
    owner: row.owner_name,
    experienceSummary:
      servicesSummary ||
      `${discovery.experience} crafting ${outfitTypes.map((o) => o.label).join(", ") || "custom outfits"}.`,
    categories,
    portfolioDesigns,
    latestDesigns: portfolioDesigns.slice(0, 6),
    creativeDispatch,
    reviews,
  };
}

function isSchemaMismatchError(message: string): boolean {
  return /column|does not exist|PGRST204|42703|relationship|schema cache/i.test(message);
}

const BOUTIQUE_SELECT_CORE = `
  *,
  boutique_outfit_types ( id, label ),
  boutique_services ( label ),
  boutique_portfolio_items ( id, media_url, media_type, caption, sort_order )
`;

const BOUTIQUE_SELECT_MEDIUM = `
  *,
  boutique_outfit_types ( id, label, audience ),
  boutique_services ( label ),
  boutique_portfolio_items (
    id, media_url, media_type, caption, sort_order, title, description, price_hint, outfit_type_id
  )
`;

const BOUTIQUE_SELECT_FULL = `
  *,
  boutique_outfit_types ( id, label, audience ),
  boutique_services ( label ),
  boutique_portfolio_items (
    id, media_url, media_type, caption, sort_order, title, description, price_hint,
    size_label, length_details, outfit_type_id
  )
`;

async function fetchBoutiqueRowBySlug(
  supabase: SupabaseClient,
  slug: string,
  options?: { ownerId?: string | null },
): Promise<BoutiqueRow | null> {
  const selects = [BOUTIQUE_SELECT_CORE, BOUTIQUE_SELECT_MEDIUM, BOUTIQUE_SELECT_FULL];

  for (const select of selects) {
    let query = supabase.from("boutiques").select(select).eq("slug", slug);
    if (options?.ownerId) {
      query = query.eq("owner_id", options.ownerId);
    } else {
      query = query.eq("status", "verified");
    }

    const { data, error } = await query.maybeSingle();
    if (!error && data) return data as unknown as BoutiqueRow;
    if (error && isSchemaMismatchError(error.message)) continue;
    if (error) throw new Error(error.message);
  }

  return null;
}

async function fetchVerifiedBoutiqueRows(supabase: SupabaseClient): Promise<BoutiqueRow[]> {
  for (const select of [BOUTIQUE_SELECT_CORE, BOUTIQUE_SELECT_MEDIUM, BOUTIQUE_SELECT_FULL]) {
    const { data, error } = await supabase
      .from("boutiques")
      .select(select)
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (!error) return (data ?? []) as unknown as BoutiqueRow[];
    if (isSchemaMismatchError(error.message)) continue;
    throw new Error(error.message);
  }

  return [];
}

export async function listVerifiedBoutiquesForDiscovery(
  supabase: SupabaseClient,
  filters: DiscoveryFilters = {},
): Promise<BoutiqueData[]> {
  const rows = await fetchVerifiedBoutiqueRows(supabase);
  const reviewStats = await loadReviewStatsByBoutiqueIds(
    supabase,
    rows.map((row) => row.id),
  );

  const live = rows.map((row) => {
    const stats = reviewStats.get(row.id);
    const rating =
      stats && stats.reviewCount > 0
        ? stats.averageRating
        : defaultRating(row.completed_orders_approx);
    return mapBoutiqueRowToDiscovery(row, rating, stats?.reviewCount);
  });

  const liveSlugs = new Set(live.map((b) => b.slug));
  const mockFallback = MOCK_BOUTIQUES.filter((b) => !liveSlugs.has(b.slug)).map((boutique) => ({
    ...boutique,
    availability: boutique.availability ?? "open",
  }));

  return filterBoutiquesForDiscovery([...live, ...mockFallback], filters);
}

export async function getLiveBoutiqueProfileBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<BoutiqueProfileData | null> {
  let row = await fetchBoutiqueRowBySlug(supabase, slug);
  if (!row) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      row = await fetchBoutiqueRowBySlug(supabase, slug, { ownerId: user.id });
    }
  }
  if (!row) return null;

  try {
    return await mapBoutiqueRowToProfile(supabase, row);
  } catch {
    return null;
  }
}

export async function resolveBoutiqueProfile(
  supabase: SupabaseClient,
  slug: string,
  options?: { allowMock?: boolean },
): Promise<BoutiqueProfileData | null> {
  const allowMock = options?.allowMock ?? true;
  const live = await getLiveBoutiqueProfileBySlug(supabase, slug);
  if (live) return live;
  if (allowMock) return getMockBoutiqueProfile(slug) ?? null;
  return null;
}

export async function getPortfolioItemById(
  supabase: SupabaseClient,
  itemId: string,
): Promise<import("@/data/boutique-profiles").BoutiqueDesign | null> {
  const { data, error } = await supabase
    .from("boutique_portfolio_items")
    .select(`
      id, media_url, media_type, caption, sort_order,
      title, description, price_hint, size_label, length_details,
      boutiques ( name, slug, avg_delivery_time, pricing_info )
    `)
    .eq("id", itemId)
    .maybeSingle();

  if (error || !data) return null;

  type BoutiqueJoin = {
    name: string;
    slug: string;
    avg_delivery_time?: string | null;
    pricing_info?: string | null;
  };
  const rawBoutique = data.boutiques as unknown;
  const boutiqueData: BoutiqueJoin | null = Array.isArray(rawBoutique)
    ? ((rawBoutique[0] as BoutiqueJoin) ?? null)
    : (rawBoutique as BoutiqueJoin | null);

  const item: PortfolioItemRow = {
    id: data.id as string,
    media_url: (data.media_url as string) ?? "",
    media_type: (data.media_type as string) ?? "image",
    caption: data.caption as string | null,
    sort_order: (data.sort_order as number) ?? 0,
    title: data.title as string | null,
    description: data.description as string | null,
    price_hint: data.price_hint as string | null,
    size_label: data.size_label as string | null,
    length_details: data.length_details,
  };

  const designs = mapPortfolioItemsToDesigns({
    items: [item],
    categories: [],
    reviews: [],
    boutiqueSlug: boutiqueData?.slug ?? "",
    defaultRating: 4.5,
    avgDeliveryTime: boutiqueData?.avg_delivery_time ?? null,
    pricingInfo: boutiqueData?.pricing_info ?? null,
  });

  return designs[0] ?? null;
}

export async function getOwnerBoutique(supabase: SupabaseClient, ownerId: string) {
  const { data, error } = await supabase
    .from("boutiques")
    .select("id, slug, name, status, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
