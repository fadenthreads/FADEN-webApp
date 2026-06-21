import type { BoutiqueDesign, DressLengthDetails } from "@/data/boutique-profiles";

export const DRESS_LENGTH_FIELDS: {
  key: keyof DressLengthDetails;
  label: string;
}[] = [
  { key: "blouseLength", label: "Blouse / choli length" },
  { key: "skirtLength", label: "Skirt / lehenga length" },
  { key: "dupattaLength", label: "Dupatta length" },
  { key: "sleeveLength", label: "Sleeve length" },
  { key: "overallLength", label: "Overall length" },
];

export function hasDressLengthDetails(details?: DressLengthDetails | null): boolean {
  if (!details) return false;
  return DRESS_LENGTH_FIELDS.some(({ key }) => Boolean(details[key]?.trim()));
}

export function getDressLengthEntries(
  details?: DressLengthDetails | null,
): { label: string; value: string }[] {
  if (!details) return [];
  return DRESS_LENGTH_FIELDS.flatMap(({ key, label }) => {
    const value = details[key]?.trim();
    return value ? [{ label, value }] : [];
  });
}

export function formatDressSpecsForOrderNotes(design: Pick<
  BoutiqueDesign,
  "title" | "description" | "sizeLabel" | "lengthDetails" | "material" | "price"
>): string {
  const lines = [`Order same outfit: ${design.title}`];

  if (design.description?.trim()) {
    lines.push(`Description: ${design.description.trim()}`);
  }
  if (design.material?.trim()) {
    lines.push(`Material: ${design.material.trim()}`);
  }
  if (design.sizeLabel?.trim()) {
    lines.push(`Size: ${design.sizeLabel.trim()}`);
  }

  for (const entry of getDressLengthEntries(design.lengthDetails)) {
    lines.push(`${entry.label}: ${entry.value}`);
  }

  if (design.price?.trim()) {
    lines.push(`Listed price: ${design.price.trim()}`);
  }

  lines.push("Please replicate this piece as shown. I will confirm measurements at fitting if needed.");
  return lines.join("\n");
}

export function parseLengthDetailsJson(value: unknown): DressLengthDetails {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const pick = (key: keyof DressLengthDetails) =>
    typeof raw[key] === "string" ? raw[key] : undefined;

  return {
    blouseLength: pick("blouseLength"),
    skirtLength: pick("skirtLength"),
    dupattaLength: pick("dupattaLength"),
    sleeveLength: pick("sleeveLength"),
    overallLength: pick("overallLength"),
    notes: pick("notes"),
  };
}
