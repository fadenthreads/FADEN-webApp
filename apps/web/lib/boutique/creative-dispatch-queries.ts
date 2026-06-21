import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreativePiece } from "@/data/boutique-profiles";

export interface OwnerCreativeDispatchItem {
  id: string;
  title: string;
  tag: string | null;
  description: string | null;
  media_url: string | null;
  gradient: string;
  sort_order: number;
}

const DEFAULT_GRADIENT = "from-burgundy/60 via-rose-900/40 to-background-soft";

export const CREATIVE_DISPATCH_SETUP_MESSAGE =
  "Creative Dispatch is not enabled on the database yet. Run migration 021_boutique_creative_dispatch.sql in the Supabase SQL editor, then try again.";

function isSchemaMismatchError(message: string): boolean {
  return /could not find the table|schema cache|does not exist|PGRST204|PGRST205|42703|42P01|relation .* does not exist|boutique_creative_dispatch/i.test(
    message,
  );
}

function rethrowCreativeDispatchError(error: { message: string }): never {
  if (isSchemaMismatchError(error.message)) {
    throw new Error(CREATIVE_DISPATCH_SETUP_MESSAGE);
  }
  throw new Error(error.message);
}

export function mapCreativeDispatchRow(row: OwnerCreativeDispatchItem): CreativePiece {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag?.trim() || "Showcase",
    description: row.description?.trim() || "",
    gradient: row.gradient || DEFAULT_GRADIENT,
    imageUrl: row.media_url,
  };
}

export async function listOwnerCreativeDispatch(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OwnerCreativeDispatchItem[]> {
  const { data, error } = await supabase
    .from("boutique_creative_dispatch")
    .select("id, title, tag, description, media_url, gradient, sort_order")
    .eq("boutique_id", boutiqueId)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isSchemaMismatchError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as OwnerCreativeDispatchItem[];
}

export async function listPublicCreativeDispatch(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<CreativePiece[]> {
  try {
    const rows = await listOwnerCreativeDispatch(supabase, boutiqueId);
    return rows.map(mapCreativeDispatchRow);
  } catch {
    return [];
  }
}

async function nextCreativeSortOrder(supabase: SupabaseClient, boutiqueId: string): Promise<number> {
  const { data: last, error } = await supabase
    .from("boutique_creative_dispatch")
    .select("sort_order")
    .eq("boutique_id", boutiqueId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) return 0;
    throw new Error(error.message);
  }

  return (last?.sort_order ?? -1) + 1;
}

export async function createOwnerCreativeDispatchItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  input: {
    title: string;
    tag?: string;
    description?: string;
    mediaUrl?: string;
    gradient?: string;
  },
): Promise<{ id: string }> {
  const sortOrder = await nextCreativeSortOrder(supabase, boutiqueId);
  const { data, error } = await supabase
    .from("boutique_creative_dispatch")
    .insert({
      boutique_id: boutiqueId,
      title: input.title,
      tag: input.tag?.trim() || null,
      description: input.description?.trim() || null,
      media_url: input.mediaUrl?.trim() || null,
      gradient: input.gradient?.trim() || DEFAULT_GRADIENT,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) rethrowCreativeDispatchError(error);
  return { id: data!.id as string };
}

export async function updateOwnerCreativeDispatchItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  itemId: string,
  input: {
    title?: string;
    tag?: string;
    description?: string;
    mediaUrl?: string;
    gradient?: string;
  },
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.tag !== undefined) payload.tag = input.tag?.trim() || null;
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.mediaUrl !== undefined) payload.media_url = input.mediaUrl?.trim() || null;
  if (input.gradient !== undefined) payload.gradient = input.gradient?.trim() || DEFAULT_GRADIENT;

  const { data, error } = await supabase
    .from("boutique_creative_dispatch")
    .update(payload)
    .eq("id", itemId)
    .eq("boutique_id", boutiqueId)
    .select("id")
    .maybeSingle();

  if (error) rethrowCreativeDispatchError(error);
  if (!data) throw new Error("Creative dispatch item not found");
}

export async function deleteOwnerCreativeDispatchItem(
  supabase: SupabaseClient,
  boutiqueId: string,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("boutique_creative_dispatch")
    .delete()
    .eq("id", itemId)
    .eq("boutique_id", boutiqueId);

  if (error) rethrowCreativeDispatchError(error);
}

export async function isCreativeDispatchAvailable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("boutique_creative_dispatch").select("id").limit(1);
  if (!error) return true;
  return !isSchemaMismatchError(error.message);
}
