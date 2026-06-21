import type { SupabaseClient } from "@supabase/supabase-js";
import {
  boutiqueRegistrationSchema,
  inferOutfitAudience,
  parseAudiences,
  splitList,
  type BoutiqueRegistrationInput,
} from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { resolveBoutiqueLatLng } from "@faden/database";
import { slugify } from "@faden/utils";

export async function registerBoutiqueForUser(
  supabase: SupabaseClient,
  userId: string,
  input: BoutiqueRegistrationInput,
): Promise<ActionResult<{ boutiqueId: string; slug: string }>> {
  const parsed = boutiqueRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid registration data" };
  }

  const data = parsed.data;
  let slug = slugify(data.name);
  if (!slug) slug = `boutique-${Date.now()}`;

  const { data: existingSlug } = await supabase
    .from("boutiques")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const coords = await resolveBoutiqueLatLng(data.address, data.mapsUrl);

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .insert({
      owner_id: userId,
      slug,
      name: data.name,
      owner_name: data.ownerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      maps_url: data.mapsUrl || null,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      years_in_business: data.yearsInBusiness ?? null,
      status: "pending_verification",
      pricing_info: data.pricingInfo || null,
      avg_delivery_time: data.avgDeliveryTime || null,
      rush_orders_accepted: data.rushOrdersAccepted === "yes",
      max_orders_per_month: data.maxOrdersPerMonth ?? null,
      reviews_summary: data.reviewsSummary || null,
      social_links: data.socialLinks || null,
      completed_orders_approx: data.completedOrdersApprox ?? null,
      availability: data.availabilityStatus,
      working_hours: data.workingHours || null,
      booking_mode: data.bookingMode,
      communication_prefs: data.communicationPrefs || null,
      audiences: parseAudiences(data.audiences),
    })
    .select("id, slug")
    .single();

  if (boutiqueError || !boutique) {
    return { ok: false, error: boutiqueError?.message ?? "Failed to save boutique" };
  }

  const outfitTypes = splitList(data.outfitTypes);
  if (outfitTypes.length) {
    const { error } = await supabase.from("boutique_outfit_types").insert(
      outfitTypes.map((label) => ({
        boutique_id: boutique.id,
        label,
        audience: inferOutfitAudience(label),
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const services = splitList(data.servicesOffered);
  if (services.length) {
    const { error } = await supabase.from("boutique_services").insert(
      services.map((label) => ({ boutique_id: boutique.id, label })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const portfolioUrls = splitList(data.portfolioPhotoUrls);
  if (portfolioUrls.length) {
    const { error } = await supabase.from("boutique_portfolio_items").insert(
      portfolioUrls.map((media_url, index) => ({
        boutique_id: boutique.id,
        media_url,
        media_type: "image",
        sort_order: index,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const { error: verificationError } = await supabase.from("boutique_verifications").insert({
    boutique_id: boutique.id,
    status: "pending",
    trust_media_urls: data.trustMediaUrls || null,
  });
  if (verificationError) return { ok: false, error: verificationError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "boutique_owner", phone: data.phone, full_name: data.ownerName })
    .eq("id", userId);
  if (profileError) return { ok: false, error: profileError.message };

  return { ok: true, data: { boutiqueId: boutique.id, slug: boutique.slug } };
}
