import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { VerificationStatus } from "@faden/types";
import { boutiqueRowToFormInput } from "@faden/database";

export interface OwnerBoutiqueEditDetails {
  boutiqueId: string;
  slug: string;
  name: string;
  status: string;
  form: BoutiqueRegistrationInput;
}

export interface BoutiqueModificationSummary {
  id: string;
  status: VerificationStatus;
  owner_notes: string | null;
  admin_notes: string | null;
  submitted_at: string;
  payload: BoutiqueRegistrationInput;
}

export async function getOwnerBoutiqueEditDetails(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<OwnerBoutiqueEditDetails | null> {
  const { data: boutique, error } = await supabase
    .from("boutiques")
    .select(
      `
      id,
      slug,
      name,
      status,
      owner_name,
      phone,
      email,
      address,
      maps_url,
      years_in_business,
      pricing_info,
      avg_delivery_time,
      rush_orders_accepted,
      max_orders_per_month,
      reviews_summary,
      social_links,
      completed_orders_approx,
      availability,
      working_hours,
      booking_mode,
      communication_prefs,
      audiences,
      boutique_outfit_types ( label ),
      boutique_services ( label ),
      boutique_portfolio_items ( media_url, sort_order ),
      boutique_verifications ( trust_media_urls )
    `,
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!boutique) return null;

  const outfitTypes = (boutique.boutique_outfit_types as { label: string }[] | null) ?? [];
  const services = (boutique.boutique_services as { label: string }[] | null) ?? [];
  const portfolio = (boutique.boutique_portfolio_items as { media_url: string; sort_order: number }[] | null) ?? [];
  const verifications = boutique.boutique_verifications as { trust_media_urls: string | null }[] | null;

  portfolio.sort((a, b) => a.sort_order - b.sort_order);

  const form = boutiqueRowToFormInput({
    name: boutique.name,
    owner_name: boutique.owner_name,
    phone: boutique.phone,
    email: boutique.email,
    address: boutique.address,
    maps_url: boutique.maps_url,
    years_in_business: boutique.years_in_business,
    pricing_info: boutique.pricing_info,
    avg_delivery_time: boutique.avg_delivery_time,
    rush_orders_accepted: boutique.rush_orders_accepted,
    max_orders_per_month: boutique.max_orders_per_month,
    reviews_summary: boutique.reviews_summary,
    social_links: boutique.social_links,
    completed_orders_approx: boutique.completed_orders_approx,
    availability: boutique.availability,
    working_hours: boutique.working_hours,
    booking_mode: boutique.booking_mode,
    communication_prefs: boutique.communication_prefs,
    audiences: boutique.audiences as string[] | null,
    outfit_types: outfitTypes.map((item) => item.label),
    services: services.map((item) => item.label),
    portfolio_urls: portfolio.map((item) => item.media_url),
    trust_media_urls: verifications?.[0]?.trust_media_urls ?? null,
  });

  return {
    boutiqueId: boutique.id,
    slug: boutique.slug,
    name: boutique.name,
    status: boutique.status,
    form,
  };
}

export async function getPendingBoutiqueModification(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<BoutiqueModificationSummary | null> {
  const { data, error } = await supabase
    .from("boutique_modification_requests")
    .select("id, status, owner_notes, admin_notes, submitted_at, payload")
    .eq("boutique_id", boutiqueId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    if (error.message.includes("boutique_modification_requests")) {
      return null;
    }
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    id: data.id,
    status: data.status as VerificationStatus,
    owner_notes: data.owner_notes,
    admin_notes: data.admin_notes,
    submitted_at: data.submitted_at,
    payload: data.payload as BoutiqueRegistrationInput,
  };
}
