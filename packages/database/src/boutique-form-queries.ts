import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import { boutiqueRowToFormInput } from "./apply-boutique-details";

export interface BoutiqueFormRecord {
  boutiqueId: string;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
  form: BoutiqueRegistrationInput;
}

const BOUTIQUE_FORM_SELECT = `
  id,
  slug,
  name,
  status,
  created_at,
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
`;

function mapBoutiqueRowToFormRecord(boutique: Record<string, unknown>): BoutiqueFormRecord {
  const outfitTypes = (boutique.boutique_outfit_types as { label: string }[] | null) ?? [];
  const services = (boutique.boutique_services as { label: string }[] | null) ?? [];
  const portfolio = (boutique.boutique_portfolio_items as { media_url: string; sort_order: number }[] | null) ?? [];
  const verifications = boutique.boutique_verifications as { trust_media_urls: string | null }[] | null;

  portfolio.sort((a, b) => a.sort_order - b.sort_order);

  const form = boutiqueRowToFormInput({
    name: boutique.name as string,
    owner_name: boutique.owner_name as string,
    phone: boutique.phone as string | null,
    email: boutique.email as string | null,
    address: boutique.address as string | null,
    maps_url: boutique.maps_url as string | null,
    years_in_business: boutique.years_in_business as number | null,
    pricing_info: boutique.pricing_info as string | null,
    avg_delivery_time: boutique.avg_delivery_time as string | null,
    rush_orders_accepted: boutique.rush_orders_accepted as boolean,
    max_orders_per_month: boutique.max_orders_per_month as number | null,
    reviews_summary: boutique.reviews_summary as string | null,
    social_links: boutique.social_links as string | null,
    completed_orders_approx: boutique.completed_orders_approx as number | null,
    availability: boutique.availability as "open" | "closed",
    working_hours: boutique.working_hours as string | null,
    booking_mode: boutique.booking_mode as "appointment" | "video" | "both",
    communication_prefs: boutique.communication_prefs as string | null,
    audiences: (boutique.audiences as string[] | null) ?? null,
    outfit_types: outfitTypes.map((item) => item.label),
    services: services.map((item) => item.label),
    portfolio_urls: portfolio.map((item) => item.media_url),
    trust_media_urls: verifications?.[0]?.trust_media_urls ?? null,
  });

  return {
    boutiqueId: boutique.id as string,
    slug: boutique.slug as string,
    name: boutique.name as string,
    status: boutique.status as string,
    createdAt: boutique.created_at as string,
    form,
  };
}

export async function getBoutiqueFormById(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<BoutiqueFormRecord | null> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(BOUTIQUE_FORM_SELECT)
    .eq("id", boutiqueId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapBoutiqueRowToFormRecord(data as Record<string, unknown>);
}

export async function getBoutiqueFormByOwnerId(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<BoutiqueFormRecord | null> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(BOUTIQUE_FORM_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapBoutiqueRowToFormRecord(data as Record<string, unknown>);
}

export async function listAllBoutiqueForms(
  supabase: SupabaseClient,
): Promise<BoutiqueFormRecord[]> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(BOUTIQUE_FORM_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapBoutiqueRowToFormRecord(row as Record<string, unknown>));
}
