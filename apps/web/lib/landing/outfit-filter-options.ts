/** Canonical outfit types for discovery filters (multi-select). */
export const DISCOVERY_OUTFIT_TYPES = [
  "Lehenga",
  "Saree",
  "Kurta Set",
  "Sherwani",
  "Anarkali",
  "Salwar Suit",
  "Gown",
  "Co-ord Set",
  "Dress",
  "Shirt",
  "T-shirt",
  "Jeans",
  "Trousers",
  "Blazer",
  "Skirt",
  "Jumpsuit",
  "Indo-Western",
  "Casual",
  "Formal",
  "Party Wear",
] as const;

export type DiscoveryOutfitType = (typeof DISCOVERY_OUTFIT_TYPES)[number];

export function filterOutfitTypes(query: string): DiscoveryOutfitType[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...DISCOVERY_OUTFIT_TYPES];
  return DISCOVERY_OUTFIT_TYPES.filter((type) => type.toLowerCase().includes(needle));
}
