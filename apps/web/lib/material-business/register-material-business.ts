import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaterialBusinessRegistrationInput } from "@faden/validators";

export async function registerMaterialBusinessForUser(
  supabase: SupabaseClient,
  userId: string,
  input: MaterialBusinessRegistrationInput,
): Promise<{ ok: true; applicationId: string } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("material_business_applications")
    .select("id, status")
    .eq("applicant_id", userId)
    .in("status", ["pending", "reviewing", "approved"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      error: "You already have a material business application on file. Our team will contact you soon.",
    };
  }

  const { data, error } = await supabase
    .from("material_business_applications")
    .insert({
      applicant_id: userId,
      business_name: input.businessName,
      owner_name: input.ownerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      material_categories: input.materialCategories,
      inventory_summary: input.inventorySummary,
      online_store_url: input.onlineStoreUrl?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not submit application" };
  }

  return { ok: true, applicationId: data.id as string };
}
