import { slugify } from "@faden/utils";
import type { BoutiqueCategory, BoutiqueDesign, BoutiqueReview } from "@/data/boutique-profiles";
import { parseLengthDetailsJson } from "@/lib/boutique/dress-specs";

const GRADIENTS = [
  "from-burgundy/60 via-rose-900/40 to-background-soft",
  "from-amber-900/50 via-burgundy/40 to-background-soft",
  "from-purple-900/40 via-burgundy/30 to-background-soft",
  "from-emerald-900/30 via-burgundy/40 to-background-soft",
  "from-indigo-900/40 via-burgundy/30 to-background-soft",
  "from-pink-900/40 via-rose-900/30 to-background-soft",
];

export type PortfolioItemRow = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  sort_order: number;
  title?: string | null;
  description?: string | null;
  price_hint?: string | null;
  size_label?: string | null;
  length_details?: unknown;
  outfit_type_id?: string | null;
  boutique_outfit_types?: { label: string } | null;
};

export function resolveCategoryId(categories: BoutiqueCategory[], outfitLabel: string | null | undefined): string {
  if (!outfitLabel?.trim()) return categories[0]?.id ?? "custom";
  const needle = outfitLabel.trim().toLowerCase();
  const match = categories.find((cat) => cat.label.toLowerCase() === needle);
  if (match) return match.id;
  const slug = slugify(outfitLabel);
  return slug || categories[0]?.id || "custom";
}

export function mapPortfolioItemsToDesigns(options: {
  items: PortfolioItemRow[];
  categories: BoutiqueCategory[];
  reviews: BoutiqueReview[];
  boutiqueSlug: string;
  defaultRating: number;
  avgDeliveryTime?: string | null;
  pricingInfo?: string | null;
  servicesSummary?: string;
  outfitTypesById?: Map<string, string>;
}): BoutiqueDesign[] {
  const sorted = [...options.items].sort((a, b) => a.sort_order - b.sort_order);

  return sorted.map((item, index) => {
    const outfitLabel =
      item.boutique_outfit_types?.label ??
      (item.outfit_type_id ? options.outfitTypesById?.get(item.outfit_type_id) ?? null : null);
    const categoryId = resolveCategoryId(options.categories, outfitLabel);
    const title = item.title?.trim() || item.caption?.trim() || `Design ${index + 1}`;
    const description =
      item.description?.trim() ||
      item.caption?.trim() ||
      "Handcrafted piece from this boutique's portfolio.";
    const matchingReviews = outfitLabel
      ? options.reviews.filter((review) =>
          review.outfit.toLowerCase().includes(outfitLabel.toLowerCase()),
        )
      : options.reviews;
    const topReview = matchingReviews[0];

    return {
      id: item.id,
      title,
      categoryId,
      outfitLabel: outfitLabel ?? options.categories.find((c) => c.id === categoryId)?.label,
      rating: topReview?.rating ?? options.defaultRating,
      review: topReview?.text ?? "Crafted with care for our customers.",
      customerName: topReview?.name ?? "Verified client",
      turnaround: options.avgDeliveryTime || "Custom timeline",
      madeAgo: "Portfolio",
      material: options.servicesSummary || "Premium fabrics",
      price: item.price_hint?.trim() || options.pricingInfo?.split("\n")[0] || "Quote on request",
      fitting: "Custom fitted",
      gradient: GRADIENTS[index % GRADIENTS.length],
      imageUrl: item.media_url?.startsWith("http") || item.media_url?.startsWith("data:")
        ? item.media_url
        : null,
      description,
      sizeLabel: item.size_label?.trim() || null,
      lengthDetails: parseLengthDetailsJson(item.length_details),
      boutiqueSlug: options.boutiqueSlug,
    };
  });
}

export function buildCustomizeReferenceHref(options: {
  boutiqueSlug: string;
  dressId: string;
  outfitType?: string;
}): string {
  const params = new URLSearchParams({
    boutique: options.boutiqueSlug,
    reference: options.dressId,
  });
  if (options.outfitType?.trim()) {
    params.set("outfitType", options.outfitType.trim());
  }
  return `/customize?${params.toString()}`;
}

/** Direct re-order of the same dress (size/length prefilled). */
export function buildDirectDressOrderHref(options: {
  boutiqueSlug: string;
  dressId: string;
  outfitType?: string;
}): string {
  const params = new URLSearchParams({
    boutique: options.boutiqueSlug,
    reference: options.dressId,
    intent: "order-same",
  });
  if (options.outfitType?.trim()) {
    params.set("outfitType", options.outfitType.trim());
  }
  return `/customize?${params.toString()}`;
}

export function findCategoryByOutfitSlug(
  categories: BoutiqueCategory[],
  outfitSlug: string,
): BoutiqueCategory | undefined {
  const normalized = outfitSlug.toLowerCase();
  return categories.find((cat) => cat.id === normalized || slugify(cat.label) === normalized);
}
