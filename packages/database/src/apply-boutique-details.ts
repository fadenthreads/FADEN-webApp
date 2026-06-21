import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatAudiencesForForm,
  inferOutfitAudience,
  parseAudiences,
  splitList,
  type AudienceCategory,
  type BoutiqueRegistrationInput,
} from "@faden/validators";
import { resolveBoutiqueLatLng } from "./geocode-boutique";

export async function applyBoutiqueDetails(
  supabase: SupabaseClient,
  boutiqueId: string,
  data: BoutiqueRegistrationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const coords = await resolveBoutiqueLatLng(data.address, data.mapsUrl);

  const { error: boutiqueError } = await supabase
    .from("boutiques")
    .update({
      name: data.name,
      owner_name: data.ownerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      maps_url: data.mapsUrl || null,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      years_in_business: data.yearsInBusiness ?? null,
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
    .eq("id", boutiqueId);

  if (boutiqueError) return { ok: false, error: boutiqueError.message };

  const { error: deleteOutfitsError } = await supabase
    .from("boutique_outfit_types")
    .delete()
    .eq("boutique_id", boutiqueId);
  if (deleteOutfitsError) return { ok: false, error: deleteOutfitsError.message };

  const outfitTypes = splitList(data.outfitTypes);
  if (outfitTypes.length) {
    const { error } = await supabase.from("boutique_outfit_types").insert(
      outfitTypes.map((label) => ({
        boutique_id: boutiqueId,
        label,
        audience: inferOutfitAudience(label),
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const { error: deleteServicesError } = await supabase
    .from("boutique_services")
    .delete()
    .eq("boutique_id", boutiqueId);
  if (deleteServicesError) return { ok: false, error: deleteServicesError.message };

  const services = splitList(data.servicesOffered);
  if (services.length) {
    const { error } = await supabase.from("boutique_services").insert(
      services.map((label) => ({ boutique_id: boutiqueId, label })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const { error: deletePortfolioError } = await supabase
    .from("boutique_portfolio_items")
    .delete()
    .eq("boutique_id", boutiqueId);
  if (deletePortfolioError) return { ok: false, error: deletePortfolioError.message };

  const portfolioUrls = splitList(data.portfolioPhotoUrls);
  if (portfolioUrls.length) {
    const { error } = await supabase.from("boutique_portfolio_items").insert(
      portfolioUrls.map((media_url, index) => ({
        boutique_id: boutiqueId,
        media_url,
        media_type: "image",
        sort_order: index,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  const { error: verificationError } = await supabase
    .from("boutique_verifications")
    .update({ trust_media_urls: data.trustMediaUrls || null })
    .eq("boutique_id", boutiqueId);
  if (verificationError) return { ok: false, error: verificationError.message };

  return { ok: true };
}

/** Map stored boutique rows into the registration/edit form shape. */
export function boutiqueRowToFormInput(row: {
  name: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  maps_url: string | null;
  years_in_business: number | null;
  pricing_info: string | null;
  avg_delivery_time: string | null;
  rush_orders_accepted: boolean;
  max_orders_per_month: number | null;
  reviews_summary: string | null;
  social_links: string | null;
  completed_orders_approx: number | null;
  availability: "open" | "closed";
  working_hours: string | null;
  booking_mode: "appointment" | "video" | "both";
  communication_prefs: string | null;
  audiences?: string[] | null;
  outfit_types?: string[];
  services?: string[];
  portfolio_urls?: string[];
  trust_media_urls?: string | null;
}): BoutiqueRegistrationInput {
  return {
    name: row.name,
    ownerName: row.owner_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    mapsUrl: row.maps_url ?? "",
    yearsInBusiness: row.years_in_business ?? undefined,
    portfolioPhotoUrls: (row.portfolio_urls ?? []).join("\n"),
    audiences: formatAudiencesForForm((row.audiences ?? ["women"]) as AudienceCategory[]),
    outfitTypes: (row.outfit_types ?? []).join("\n"),
    servicesOffered: (row.services ?? []).join("\n"),
    pricingInfo: row.pricing_info ?? "",
    avgDeliveryTime: row.avg_delivery_time ?? "",
    rushOrdersAccepted: row.rush_orders_accepted ? "yes" : "no",
    maxOrdersPerMonth: row.max_orders_per_month ?? undefined,
    reviewsSummary: row.reviews_summary ?? "",
    trustMediaUrls: row.trust_media_urls ?? "",
    socialLinks: row.social_links ?? "",
    completedOrdersApprox: row.completed_orders_approx ?? undefined,
    availabilityStatus: row.availability,
    workingHours: row.working_hours ?? "",
    bookingMode: row.booking_mode,
    communicationPrefs: row.communication_prefs ?? "",
  };
}
