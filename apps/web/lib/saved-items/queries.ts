import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedItemInput } from "@faden/validators";
import type { SavedItem, SavedListKind } from "@/lib/saved-items/types";
import { normalizeDesignRef } from "@/lib/saved-items/types";

const TABLE: Record<SavedListKind, "wishlist_items" | "cart_items"> = {
  wishlist: "wishlist_items",
  cart: "cart_items",
};

type Row = {
  id: string;
  boutique_slug: string | null;
  design_ref: string | null;
  item_type: string | null;
  title: string | null;
  image_url: string | null;
  price_hint: string | null;
  outfit_label: string | null;
  created_at: string;
  boutiques: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function mapRow(row: Row): SavedItem {
  const boutique = Array.isArray(row.boutiques) ? row.boutiques[0] : row.boutiques;
  const designRef = normalizeDesignRef(row.design_ref);
  return {
    id: row.id,
    savedAt: row.created_at,
    itemType: (row.item_type === "design" ? "design" : designRef ? "design" : "boutique") as SavedItem["itemType"],
    boutiqueSlug: row.boutique_slug ?? boutique?.slug ?? "",
    boutiqueName: boutique?.name ?? row.title ?? "Boutique",
    designId: designRef || undefined,
    title: row.title ?? boutique?.name ?? "Saved item",
    imageUrl: row.image_url ?? undefined,
    priceHint: row.price_hint ?? undefined,
    outfitLabel: row.outfit_label ?? undefined,
  };
}

async function resolveBoutiqueId(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ id: string | null; name: string | null }> {
  const { data } = await supabase.from("boutiques").select("id, name").eq("slug", slug).maybeSingle();
  return { id: (data?.id as string | undefined) ?? null, name: (data?.name as string | undefined) ?? null };
}

export async function listSavedItemsFromDb(
  supabase: SupabaseClient,
  kind: SavedListKind,
  customerId: string,
): Promise<SavedItem[]> {
  const { data, error } = await supabase
    .from(TABLE[kind])
    .select(
      `
      id,
      boutique_slug,
      design_ref,
      item_type,
      title,
      image_url,
      price_hint,
      outfit_label,
      created_at,
      boutiques ( name, slug )
    `,
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Row));
}

export async function addSavedItemToDb(
  supabase: SupabaseClient,
  kind: SavedListKind,
  customerId: string,
  input: SavedItemInput,
): Promise<SavedItem> {
  const designRef = normalizeDesignRef(input.designId);
  const boutique = await resolveBoutiqueId(supabase, input.boutiqueSlug);

  const payload = {
    customer_id: customerId,
    boutique_id: boutique.id,
    boutique_slug: input.boutiqueSlug,
    design_ref: designRef,
    item_type: input.itemType,
    title: input.title,
    image_url: input.imageUrl ?? null,
    price_hint: input.priceHint ?? null,
    outfit_label: input.outfitLabel ?? null,
  };

  await supabase
    .from(TABLE[kind])
    .delete()
    .eq("customer_id", customerId)
    .eq("boutique_slug", input.boutiqueSlug)
    .eq("design_ref", designRef);

  const { data, error } = await supabase
    .from(TABLE[kind])
    .insert(payload)
    .select(
      `
      id,
      boutique_slug,
      design_ref,
      item_type,
      title,
      image_url,
      price_hint,
      outfit_label,
      created_at,
      boutiques ( name, slug )
    `,
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save item");
  return mapRow(data as Row);
}

export async function removeSavedItemFromDb(
  supabase: SupabaseClient,
  kind: SavedListKind,
  customerId: string,
  boutiqueSlug: string,
  designId?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE[kind])
    .delete()
    .eq("customer_id", customerId)
    .eq("boutique_slug", boutiqueSlug)
    .eq("design_ref", normalizeDesignRef(designId));

  if (error) throw new Error(error.message);
}

export async function syncLocalItemsToDb(
  supabase: SupabaseClient,
  kind: SavedListKind,
  customerId: string,
  items: SavedItemInput[],
): Promise<SavedItem[]> {
  for (const item of items) {
    await addSavedItemToDb(supabase, kind, customerId, item);
  }
  return listSavedItemsFromDb(supabase, kind, customerId);
}
