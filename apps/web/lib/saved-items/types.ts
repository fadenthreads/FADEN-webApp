import type { SavedItemInput } from "@faden/validators";

export type SavedListKind = "wishlist" | "cart";

export interface SavedItem extends SavedItemInput {
  id: string;
  savedAt: string;
}

export function normalizeDesignRef(designId?: string | null): string {
  return designId?.trim() ?? "";
}

export function savedItemKey(boutiqueSlug: string, designId?: string | null): string {
  return `${boutiqueSlug}:${normalizeDesignRef(designId)}`;
}

export function inputFromSavedItem(item: SavedItemInput): SavedItemInput {
  return {
    itemType: item.itemType,
    boutiqueSlug: item.boutiqueSlug,
    boutiqueName: item.boutiqueName,
    designId: normalizeDesignRef(item.designId) || undefined,
    title: item.title,
    imageUrl: item.imageUrl,
    priceHint: item.priceHint,
    outfitLabel: item.outfitLabel,
  };
}

export function toLocalSavedItem(input: SavedItemInput): SavedItem {
  const designId = normalizeDesignRef(input.designId);
  return {
    ...input,
    designId: designId || undefined,
    id: savedItemKey(input.boutiqueSlug, designId),
    savedAt: new Date().toISOString(),
  };
}

export function mergeSavedItems(existing: SavedItem[], incoming: SavedItem[]): SavedItem[] {
  const map = new Map<string, SavedItem>();
  for (const item of existing) map.set(savedItemKey(item.boutiqueSlug, item.designId), item);
  for (const item of incoming) map.set(savedItemKey(item.boutiqueSlug, item.designId), item);
  return [...map.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
