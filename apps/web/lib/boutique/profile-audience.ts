import type { AudienceCategory } from "@faden/validators";
import { inferOutfitAudience } from "@faden/validators";
import type { BoutiqueCategory, BoutiqueDesign } from "@/data/boutique-profiles";

export function resolveCategoryAudience(category: BoutiqueCategory): AudienceCategory {
  if (category.audience) return category.audience;
  return inferOutfitAudience(category.label);
}

export function filterCategoriesByAudience(
  categories: BoutiqueCategory[],
  audience: AudienceCategory | null | undefined,
): BoutiqueCategory[] {
  if (!audience) return categories;
  return categories.filter((category) => resolveCategoryAudience(category) === audience);
}

export function filterDesignsByAudience(
  designs: BoutiqueDesign[],
  categories: BoutiqueCategory[],
  audience: AudienceCategory | null | undefined,
): BoutiqueDesign[] {
  const allowedIds = new Set(filterCategoriesByAudience(categories, audience).map((cat) => cat.id));
  return designs.filter((design) => allowedIds.has(design.categoryId));
}
