import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlterationRequestInput } from "@faden/validators";
import { listVerifiedBoutiquesForDiscovery } from "@/lib/boutique/queries";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import type { GeoPoint } from "@/lib/location/geo";

const ALTERATION_KEYWORDS = ["alteration", "alterations", "fitting", "hem", "stitch"];

export interface MatchedAlterationBoutique {
  id: string;
  name: string;
  slug: string;
  distanceKm: number | null;
}

async function boutiqueIdForSlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data } = await supabase.from("boutiques").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function boutiqueOffersAlterations(supabase: SupabaseClient, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("boutiques")
    .select("id, boutique_services ( label )")
    .eq("slug", slug)
    .maybeSingle();

  const labels = ((data?.boutique_services as { label: string }[] | null) ?? []).map((s) =>
    s.label.toLowerCase(),
  );

  if (labels.some((label) => ALTERATION_KEYWORDS.some((keyword) => label.includes(keyword)))) {
    return true;
  }

  // Default: verified boutiques can take alterations unless explicitly closed
  return Boolean(data?.id);
}

export async function findNearestAlterationBoutique(
  supabase: SupabaseClient,
  customer: GeoPoint | null,
): Promise<MatchedAlterationBoutique | null> {
  const boutiques = await listVerifiedBoutiquesForDiscovery(supabase, {
    customerLat: customer?.lat,
    customerLng: customer?.lng,
    maxDistanceKm: 25,
  });

  const open = boutiques.filter((b) => b.availability !== "closed");
  const sorted = [...open].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  for (const candidate of sorted) {
    const offers = await boutiqueOffersAlterations(supabase, candidate.slug);
    if (!offers) continue;

    const id = await boutiqueIdForSlug(supabase, candidate.slug);
    if (!id) continue;

    return {
      id,
      name: candidate.name,
      slug: candidate.slug,
      distanceKm: candidate.distanceKm ?? null,
    };
  }

  return null;
}

export function findMockAlterationBoutique(customer: GeoPoint | null): MatchedAlterationBoutique | null {
  const boutiques = getBoutiquesForDiscovery({
    customerLat: customer?.lat,
    customerLng: customer?.lng,
    maxDistanceKm: 25,
  });

  const match = boutiques[0];
  if (!match) return null;

  return {
    id: match.slug,
    name: match.name,
    slug: match.slug,
    distanceKm: match.distanceKm ?? null,
  };
}

export async function createAlterationRequest(
  supabase: SupabaseClient,
  customerId: string,
  input: AlterationRequestInput,
  boutique: MatchedAlterationBoutique | null,
) {
  const boutiqueId =
    boutique && !boutique.id.includes("-") && boutique.id.length > 20 ? boutique.id : null;

  const { data, error } = await supabase
    .from("alteration_requests")
    .insert({
      customer_id: customerId,
      boutique_id: boutiqueId,
      alteration_type: input.alterationType,
      urgency_hours: input.urgencyHours,
      home_service_ok: input.homeServiceOk,
      home_address: input.homeAddress ?? null,
      home_lat: input.homeLat ?? null,
      home_lng: input.homeLng ?? null,
      photo_urls: input.photoUrls,
      notes: input.notes ?? null,
      customer_lat: input.customerLat ?? null,
      customer_lng: input.customerLng ?? null,
      status: boutiqueId ? "assigned" : "requested",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
