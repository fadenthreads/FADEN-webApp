/** Common boutique / tailoring services for autocomplete in dashboard listings. */
export const BOUTIQUE_SERVICE_SUGGESTIONS = [
  "Custom stitching",
  "Alterations & fittings",
  "Blouse stitching",
  "Lehenga stitching",
  "Saree fall & pico",
  "Embroidery work",
  "Bridal wear",
  "Design consultation",
  "Pattern making",
  "Men's tailoring",
  "Kids wear",
  "Indo-western stitching",
  "Ready-to-wear",
  "Home delivery",
  "Virtual consultation",
  "Rush orders",
  "Dupatta finishing",
  "Kurta & sherwani stitching",
  "Bridal trial fittings",
  "Fabric sourcing assistance",
] as const;

export function filterServiceSuggestions(
  suggestions: readonly string[],
  existingLabels: string[],
  query = "",
): string[] {
  const existing = new Set(existingLabels.map((label) => label.trim().toLowerCase()));
  const needle = query.trim().toLowerCase();

  return suggestions.filter((label) => {
    if (existing.has(label.toLowerCase())) return false;
    if (!needle) return true;
    return label.toLowerCase().includes(needle);
  });
}
