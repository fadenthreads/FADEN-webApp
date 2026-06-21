export const AUDIENCE_VALUES = ["women", "men", "kids"] as const;
export type AudienceCategory = (typeof AUDIENCE_VALUES)[number];

const MENS_OUTFIT_KEYWORDS = [
  "sherwani",
  "bandhgala",
  "jodhpuri",
  "nehru jacket",
  "kurta set",
  "indo-western suit",
  "pathani",
  "dhoti",
];

const KIDS_OUTFIT_KEYWORDS = ["kids", "kid ", "child", "children", "boy", "girl", "party wear"];

export function parseAudiences(value: string | null | undefined): AudienceCategory[] {
  if (!value?.trim()) return [];
  const parsed = value
    .split(/[\n,]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is AudienceCategory => AUDIENCE_VALUES.includes(item as AudienceCategory));
  return [...new Set(parsed)];
}

export function formatAudiencesForForm(audiences: AudienceCategory[] | null | undefined): string {
  return (audiences ?? []).join(", ");
}

export function inferOutfitAudience(label: string): AudienceCategory {
  const lower = label.trim().toLowerCase();
  if (!lower) return "women";
  if (KIDS_OUTFIT_KEYWORDS.some((keyword) => lower.includes(keyword))) return "kids";
  if (MENS_OUTFIT_KEYWORDS.some((keyword) => lower.includes(keyword))) return "men";
  return "women";
}

export function inferAudiencesFromOutfitLabels(labels: string[]): AudienceCategory[] {
  const inferred = new Set<AudienceCategory>();
  for (const label of labels) {
    inferred.add(inferOutfitAudience(label));
  }
  return inferred.size > 0 ? [...inferred] : ["women"];
}
