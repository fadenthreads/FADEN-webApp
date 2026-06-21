import type { AudienceCategory } from "@faden/validators";
import { searchHref } from "@/lib/boutique/search-nav";
import { homeHref } from "@/lib/landing/home-nav";
import {
  filterBoutiquesByAudience,
  getOutfitNavTypes,
} from "@/lib/boutique/audiences";

export type { AudienceCategory };

export const AUDIENCE_CATEGORIES: { id: AudienceCategory | "all"; label: string; href: string }[] = [
  { id: "all", label: "All", href: homeHref({ hash: "featured-boutiques" }) },
  { id: "women", label: "Women", href: homeHref({ hash: "featured-boutiques", category: "women" }) },
  { id: "men", label: "Men", href: homeHref({ hash: "featured-boutiques", category: "men" }) },
  { id: "kids", label: "Kids", href: homeHref({ hash: "featured-boutiques", category: "kids" }) },
];

export function outfitTypeNavHref(outfitType: string, audience?: AudienceCategory | null): string {
  return searchHref({ q: outfitType, audience: audience ?? undefined });
}

export function getOutfitNavTypesForCategory(
  audience: AudienceCategory | null | undefined,
): string[] {
  return getOutfitNavTypes(audience);
}

export { filterBoutiquesByAudience };

export function audienceCategoryLabel(category: AudienceCategory | null | undefined): string | null {
  if (!category) return null;
  return AUDIENCE_CATEGORIES.find((item) => item.id === category)?.label ?? null;
}

export function parseAudienceCategory(value: string | null | undefined): AudienceCategory | null {
  if (value === "women" || value === "men" || value === "kids") return value;
  return null;
}
