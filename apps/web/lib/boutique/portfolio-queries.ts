import type { SupabaseClient } from "@supabase/supabase-js";
import { inferOutfitAudience } from "@faden/validators";
import type { DressLengthDetails } from "@/data/boutique-profiles";
import { parseLengthDetailsJson } from "@/lib/boutique/dress-specs";

export interface OwnerPortfolioItem {
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

export interface OwnerOutfitTypeOption {
  id: string;
  label: string;
}

const PORTFOLIO_LIST_SELECTS = [
  "id, title, description, price_hint, size_label, length_details, media_url, sort_order, outfit_type_id",
  "id, title, description, price_hint, media_url, sort_order, outfit_type_id",
  "id, media_url, media_type, caption, sort_order, outfit_type_id",
  "id, media_url, media_type, caption, sort_order",
];

function isSchemaMismatchError(message: string): boolean {
  return /column|does not exist|PGRST204|42703|relationship|schema cache/i.test(message);
}

function mapPortfolioListRow(
  row: Record<string, unknown>,
  outfitLabels: Map<string, string>,
): OwnerPortfolioItem {
  const outfitTypeId = (row.outfit_type_id as string | null | undefined) ?? null;
  return {
    id: row.id as string,
    title: (row.title as string | null | undefined) ?? (row.caption as string | null | undefined) ?? null,
    description: (row.description as string | null | undefined) ?? null,
    price_hint: (row.price_hint as string | null | undefined) ?? null,
    size_label: (row.size_label as string | null | undefined) ?? null,
    length_details: parseLengthDetailsJson(row.length_details),
    media_url: row.media_url as string,
    sort_order: row.sort_order as number,
    outfit_type_id: outfitTypeId,
    outfit_label: outfitTypeId ? (outfitLabels.get(outfitTypeId) ?? null) : null,
  };
}

export async function listOwnerOutfitTypes(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OwnerOutfitTypeOption[]> {
  const { data, error } = await supabase
    .from("boutique_outfit_types")
    .select("id, label")
    .eq("boutique_id", boutiqueId)
    .order("label");

  if (error) throw new Error(error.message);
  return (data ?? []) as OwnerOutfitTypeOption[];
}

export async function ensureOwnerOutfitType(
  supabase: SupabaseClient,
  boutiqueId: string,
  label: string,
): Promise<string | null> {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const existing = await listOwnerOutfitTypes(supabase, boutiqueId);
  const match = existing.find((item) => item.label.toLowerCase() === trimmed.toLowerCase());
  if (match) return match.id;

  const withAudience = {
    boutique_id: boutiqueId,
    label: trimmed,
    audience: inferOutfitAudience(trimmed),
  };

  let result = await supabase.from("boutique_outfit_types").insert(withAudience).select("id").single();
  if (result.error && isSchemaMismatchError(result.error.message)) {
    result = await supabase
      .from("boutique_outfit_types")
      .insert({ boutique_id: boutiqueId, label: trimmed })
      .select("id")
      .single();
  }

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "Failed to add outfit type");
  }

  return result.data.id as string;
}

export async function resolveOwnerOutfitTypeId(
  supabase: SupabaseClient,
  boutiqueId: string,
  outfitTypeId?: string | null,
  outfitTypeLabel?: string | null,
): Promise<string | null> {
  if (outfitTypeId) return outfitTypeId;
  if (outfitTypeLabel?.trim()) {
    return ensureOwnerOutfitType(supabase, boutiqueId, outfitTypeLabel);
  }
  return null;
}

export async function listOwnerPortfolioItems(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OwnerPortfolioItem[]> {
  const outfitTypes = await listOwnerOutfitTypes(supabase, boutiqueId);
  const outfitLabels = new Map(outfitTypes.map((item) => [item.id, item.label]));

  for (const select of PORTFOLIO_LIST_SELECTS) {
    const { data, error } = await supabase
      .from("boutique_portfolio_items")
      .select(select)
      .eq("boutique_id", boutiqueId)
      .order("sort_order", { ascending: true });

    if (!error) {
      return (data ?? []).map((row) => mapPortfolioListRow(row as unknown as Record<string, unknown>, outfitLabels));
    }
    if (!isSchemaMismatchError(error.message)) throw new Error(error.message);
  }

  return [];
}

async function nextPortfolioSortOrder(supabase: SupabaseClient, boutiqueId: string): Promise<number> {
  const { data: last } = await supabase
    .from("boutique_portfolio_items")
    .select("sort_order")
    .eq("boutique_id", boutiqueId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (last?.sort_order ?? -1) + 1;
}

function buildPortfolioInsertPayload(
  boutiqueId: string,
  sortOrder: number,
  input: {
    title: string;
    description?: string;
    priceHint?: string;
    sizeLabel?: string;
    lengthDetails?: DressLengthDetails;
    outfitTypeId?: string | null;
    mediaUrl: string;
  },
  options: { includeSpecs: boolean; includeRich: boolean },
) {
  if (!options.includeRich) {
    return {
      boutique_id: boutiqueId,
      caption: input.title,
      media_url: input.mediaUrl,
      media_type: "image",
      sort_order: sortOrder,
    };
  }

  const payload: Record<string, unknown> = {
    boutique_id: boutiqueId,
    title: input.title,
    description: input.description || null,
    price_hint: input.priceHint || null,
    outfit_type_id: input.outfitTypeId || null,
    media_url: input.mediaUrl,
    media_type: "image",
    sort_order: sortOrder,
  };

  if (options.includeSpecs) {
    payload.size_label = input.sizeLabel || null;
    payload.length_details = input.lengthDetails ?? {};
  }

  return payload;
}

export async function createOwnerPortfolioItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  input: {
    title: string;
    description?: string;
    priceHint?: string;
    sizeLabel?: string;
    lengthDetails?: DressLengthDetails;
    outfitTypeId?: string | null;
    mediaUrl: string;
  },
): Promise<{ id: string }> {
  const sortOrder = await nextPortfolioSortOrder(supabase, boutiqueId);

  const variants = [
    { includeSpecs: true, includeRich: true },
    { includeSpecs: false, includeRich: true },
    { includeSpecs: false, includeRich: false },
  ];

  for (const options of variants) {
    const { data, error } = await supabase
      .from("boutique_portfolio_items")
      .insert(buildPortfolioInsertPayload(boutiqueId, sortOrder, input, options))
      .select("id")
      .single();

    if (!error && data) return { id: data.id as string };
    if (error && isSchemaMismatchError(error.message)) continue;
    if (error) throw new Error(error.message);
  }

  throw new Error("Failed to save portfolio item");
}

function buildPortfolioUpdatePayload(
  input: {
    title?: string;
    description?: string;
    priceHint?: string;
    sizeLabel?: string;
    lengthDetails?: DressLengthDetails;
    outfitTypeId?: string | null;
    mediaUrl?: string;
  },
  includeSpecs: boolean,
) {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description || null;
  if (input.priceHint !== undefined) payload.price_hint = input.priceHint || null;
  if (input.outfitTypeId !== undefined) payload.outfit_type_id = input.outfitTypeId || null;
  if (input.mediaUrl !== undefined) payload.media_url = input.mediaUrl;

  if (includeSpecs) {
    if (input.sizeLabel !== undefined) payload.size_label = input.sizeLabel || null;
    if (input.lengthDetails !== undefined) payload.length_details = input.lengthDetails ?? {};
  }

  return payload;
}

export async function updateOwnerPortfolioItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  itemId: string,
  input: {
    title?: string;
    description?: string;
    priceHint?: string;
    sizeLabel?: string;
    lengthDetails?: DressLengthDetails;
    outfitTypeId?: string | null;
    mediaUrl?: string;
  },
): Promise<void> {
  for (const includeSpecs of [true, false]) {
    const payload = buildPortfolioUpdatePayload(input, includeSpecs);
    if (!Object.keys(payload).length) return;

    const { data, error } = await supabase
      .from("boutique_portfolio_items")
      .update(payload)
      .eq("id", itemId)
      .eq("boutique_id", boutiqueId)
      .select("id")
      .maybeSingle();

    if (!error && data) return;
    if (error && isSchemaMismatchError(error.message)) continue;
    if (error) throw new Error(error.message);
  }

  throw new Error("Failed to update portfolio item");
}

export async function deleteOwnerPortfolioItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("boutique_portfolio_items")
    .delete()
    .eq("id", itemId)
    .eq("boutique_id", boutiqueId);

  if (error) throw new Error(error.message);
}
