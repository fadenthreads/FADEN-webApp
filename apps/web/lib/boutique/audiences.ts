import type { AudienceCategory } from "@faden/validators";
import {
  inferAudiencesFromOutfitLabels,
  inferOutfitAudience,
} from "@faden/validators";
import type { BoutiqueData } from "@/data/boutiques";

export type { AudienceCategory };

export const AUDIENCE_LABELS: Record<AudienceCategory, string> = {
  women: "Women",
  men: "Men",
  kids: "Kids",
};

export const OUTFIT_TYPES_BY_AUDIENCE: Record<AudienceCategory, readonly string[]> = {
  women: [
    "Lehenga",
    "Saree",
    "Kurti",
    "Anarkali",
    "Sharara",
    "Gown",
    "Bridal",
    "Indo-Western",
    "Blouse",
    "Other",
  ],
  men: [
    "Sherwani",
    "Kurta Set",
    "Bandhgala",
    "Jodhpuri Suit",
    "Indo-Western Suit",
    "Nehru Jacket",
    "Pathani Suit",
    "Other",
  ],
  kids: [
    "Kids Lehenga",
    "Kids Kurta",
    "Kids Sharara",
    "Kids Gown",
    "Kids Indo-Western",
    "Party Wear",
    "Other",
  ],
};

export const ALL_OUTFIT_TYPES = [
  ...OUTFIT_TYPES_BY_AUDIENCE.women.filter((type) => type !== "Other"),
  ...OUTFIT_TYPES_BY_AUDIENCE.men.filter((type) => type !== "Other"),
  ...OUTFIT_TYPES_BY_AUDIENCE.kids.filter((type) => type !== "Other"),
  "Other",
];

export function getOutfitTypesForAudience(audience: AudienceCategory): readonly string[] {
  return OUTFIT_TYPES_BY_AUDIENCE[audience];
}

export function getOutfitNavTypes(audience: AudienceCategory | null | undefined): string[] {
  if (!audience) {
    return [
      "Lehenga",
      "Saree",
      "Sherwani",
      "Kurta Set",
      "Kids Lehenga",
      "Kids Kurta",
      "Bridal",
    ];
  }
  return [...OUTFIT_TYPES_BY_AUDIENCE[audience].filter((type) => type !== "Other")];
}

export function resolveBoutiqueAudiences(boutique: BoutiqueData): AudienceCategory[] {
  if (boutique.audiences?.length) return boutique.audiences;
  return inferAudiencesFromOutfitLabels(boutique.outfitTypes ?? []);
}

export function boutiqueServesAudience(
  boutique: BoutiqueData,
  category: AudienceCategory,
): boolean {
  return resolveBoutiqueAudiences(boutique).includes(category);
}

export function filterBoutiquesByAudience(
  boutiques: BoutiqueData[],
  category: AudienceCategory | null | undefined,
): BoutiqueData[] {
  if (!category) return boutiques;
  return boutiques.filter((boutique) => boutiqueServesAudience(boutique, category));
}

export function inferOutfitAudienceFromType(outfitType: string): AudienceCategory | null {
  const trimmed = outfitType.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith(":other")) {
    const audience = trimmed.split(":")[0];
    if (audience === "women" || audience === "men" || audience === "kids") return audience;
  }
  for (const audience of ["women", "men", "kids"] as const) {
    if (OUTFIT_TYPES_BY_AUDIENCE[audience].includes(trimmed)) return audience;
  }
  return inferOutfitAudience(trimmed);
}

export { inferOutfitAudience, inferAudiencesFromOutfitLabels };
