import type { AudienceCategory } from "@faden/validators";
import { inferOutfitAudience } from "@faden/validators";
import { slugify } from "@faden/utils";
import type {
  BoutiqueCategory,
  BoutiqueDesign,
  BoutiqueProfileData,
  CreativePiece,
  DressLengthDetails,
} from "@/data/boutique-profiles";
import { mapPortfolioItemsToDesigns } from "@/lib/boutique/portfolio";
import type { PortfolioOutfitTypeOption } from "@/components/dashboard/portfolio-dress-form";
import type { PortfolioDressFormValues } from "@/components/dashboard/portfolio-dress-form";

export interface OwnerPortfolioApiItem {
  id: string;
  title: string | null;
  description: string | null;
  price_hint: string | null;
  size_label: string | null;
  length_details: DressLengthDetails | null;
  media_url: string;
  sort_order: number;
  outfit_type_id: string | null;
  outfit_label: string | null;
}

const GRADIENTS = [
  "from-burgundy/60 via-rose-900/40 to-background-soft",
  "from-amber-900/50 via-burgundy/40 to-background-soft",
  "from-purple-900/40 via-burgundy/30 to-background-soft",
  "from-emerald-900/30 via-burgundy/40 to-background-soft",
  "from-indigo-900/40 via-burgundy/30 to-background-soft",
  "from-pink-900/40 via-rose-900/30 to-background-soft",
];

const UNCATEGORIZED_CATEGORY_ID = "uncategorized";

function syncCategoriesFromOutfitTypes(
  profileCategories: BoutiqueCategory[],
  outfitTypes: PortfolioOutfitTypeOption[],
  includeUncategorized: boolean,
): BoutiqueCategory[] {
  let categories: BoutiqueCategory[];

  if (outfitTypes.length > 0) {
    categories = outfitTypes.map((type, index) => {
      const slug = slugify(type.label) || `cat-${index}`;
      const existing = profileCategories.find(
        (category) =>
          category.id === slug || category.label.toLowerCase() === type.label.toLowerCase(),
      );
      return {
        id: slug,
        label: type.label,
        audience: existing?.audience ?? (inferOutfitAudience(type.label) as AudienceCategory),
        iconGradient: existing?.iconGradient ?? GRADIENTS[index % GRADIENTS.length],
      };
    });
  } else {
    categories = profileCategories.length > 0 ? [...profileCategories] : [];
  }

  if (includeUncategorized && !categories.some((category) => category.id === UNCATEGORIZED_CATEGORY_ID)) {
    categories.push({
      id: UNCATEGORIZED_CATEGORY_ID,
      label: "Uncategorized",
      audience: "women",
      iconGradient: GRADIENTS[categories.length % GRADIENTS.length],
    });
  }

  return categories;
}

export function buildOwnerPreviewProfile(
  profile: BoutiqueProfileData,
  items: OwnerPortfolioApiItem[],
  outfitTypes: PortfolioOutfitTypeOption[],
  creativePieces: CreativePiece[],
): BoutiqueProfileData {
  const outfitTypesById = new Map(outfitTypes.map((type) => [type.id, type.label]));
  const hasUncategorized = items.some((item) => !item.outfit_type_id);
  const categories = syncCategoriesFromOutfitTypes(
    profile.categories,
    outfitTypes,
    hasUncategorized,
  );

  const portfolioDesigns =
    items.length > 0
      ? mapPortfolioItemsToDesigns({
          items: items.map(
            (item): Parameters<typeof mapPortfolioItemsToDesigns>[0]["items"][number] => ({
              id: item.id,
              media_url: item.media_url,
              media_type: "image",
              caption: item.title,
              sort_order: item.sort_order,
              title: item.title,
              description: item.description,
              price_hint: item.price_hint,
              size_label: item.size_label,
              length_details: item.length_details,
              outfit_type_id: item.outfit_type_id,
            }),
          ),
          categories,
          reviews: profile.reviews,
          boutiqueSlug: profile.slug,
          defaultRating: profile.rating,
          pricingInfo: profile.experienceSummary,
          servicesSummary: profile.outfitTypes?.join(" · "),
          outfitTypesById,
        }).map((design) => {
          const item = items.find((entry) => entry.id === design.id);
          if (item && !item.outfit_type_id) {
            return {
              ...design,
              categoryId: UNCATEGORIZED_CATEGORY_ID,
              outfitLabel: "Uncategorized",
            };
          }
          return design;
        })
      : [];

  return {
    ...profile,
    categories,
    portfolioDesigns,
    latestDesigns: portfolioDesigns,
    creativeDispatch: creativePieces,
  };
}

export function countDesignsByCategory(
  designs: BoutiqueDesign[],
  categoryId: string,
): number {
  return designs.filter((design) => design.categoryId === categoryId).length;
}

export function findDefaultOwnerCategoryId(
  categories: BoutiqueCategory[],
  designs: BoutiqueDesign[],
): string | null {
  if (categories.length === 0) return null;

  const withDesigns = categories.find(
    (category) => designs.filter((design) => design.categoryId === category.id).length > 0,
  );
  return withDesigns?.id ?? categories[0]?.id ?? null;
}

export function designToFormValues(
  design: BoutiqueDesign,
  outfitTypes: PortfolioOutfitTypeOption[],
): PortfolioDressFormValues {
  const match = outfitTypes.find(
    (type) => type.label.toLowerCase() === (design.outfitLabel ?? "").toLowerCase(),
  );

  return {
    title: design.title,
    description: design.description ?? "",
    priceHint: design.price !== "Quote on request" ? design.price : "",
    sizeLabel: design.sizeLabel ?? "",
    lengthDetails: design.lengthDetails ? { ...design.lengthDetails } : {},
    outfitTypeId: match?.id ?? "",
    outfitTypeLabel: match ? "" : (design.outfitLabel ?? ""),
    mediaUrl: design.imageUrl ?? "",
  };
}
