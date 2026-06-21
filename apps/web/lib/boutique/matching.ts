import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomizationRequestInput } from "@faden/validators";
import { inferAudiencesFromOutfitLabels } from "@faden/validators";
import type { AudienceCategory } from "@faden/validators";
import {
  isBoutiqueNearCustomer,
  locationMatchLabel,
  locationProximityScore,
} from "@/lib/boutique/location-match";
import { resolveBoutiqueLocation, isCustomerAtCityCenter } from "@/lib/location/city-coordinates";
import { formatBoutiqueDistanceLabel } from "@/lib/boutique/boutique-distance";
import { haversineDistanceKm } from "@/lib/location/geo";

export interface BoutiqueMatch {
  boutiqueId: string;
  slug: string;
  name: string;
  score: number;
  reasons: string[];
  location: string;
  rating: number;
  experience: string;
  experienceSummary: string;
  makesOutfit: boolean;
  nearby: boolean;
  locationLabel: string | null;
  distanceKm?: number | null;
  distanceLabel?: string | null;
}

export interface MatchBoutiquesInput extends Pick<
  CustomizationRequestInput,
  "outfitAudience" | "outfitType" | "occasion" | "budgetRange" | "deliveryDate"
> {
  customerLocation?: string;
  customerLat?: number | null;
  customerLng?: number | null;
}

type MatchableBoutique = {
  id: string;
  slug: string;
  name: string;
  owner_name: string;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  availability: string;
  rush_orders_accepted: boolean;
  completed_orders_approx: number | null;
  avg_delivery_time: string | null;
  pricing_info: string | null;
  reviews_summary: string | null;
  boutique_outfit_types: { label: string; audience?: string | null }[] | null;
  boutique_services: { label: string }[] | null;
  audiences?: string[] | null;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function labelsMatch(input: string, labels: string[]): boolean {
  const needle = normalize(input);
  if (!needle) return false;
  return labels.some(
    (label) => normalize(label).includes(needle) || needle.includes(normalize(label)),
  );
}

function boutiqueMakesOutfit(boutique: MatchableBoutique, outfitType: string): boolean {
  const outfitLabels = (boutique.boutique_outfit_types ?? []).map((item) => item.label);
  if (!outfitLabels.length) return outfitType.toLowerCase() === "other";
  return labelsMatch(outfitType, outfitLabels);
}

function boutiqueServesAudience(boutique: MatchableBoutique, audience: AudienceCategory): boolean {
  if (boutique.audiences?.length) {
    return boutique.audiences.includes(audience);
  }
  const labels = (boutique.boutique_outfit_types ?? []).map((item) => item.label);
  return inferAudiencesFromOutfitLabels(labels).includes(audience);
}

function scoreBoutique(
  boutique: MatchableBoutique,
  input: MatchBoutiquesInput,
  avgRating: number | null,
): BoutiqueMatch | null {
  const outfitLabels = (boutique.boutique_outfit_types ?? []).map((item) => item.label);
  const serviceLabels = (boutique.boutique_services ?? []).map((item) => item.label);
  const makesOutfit = boutiqueMakesOutfit(boutique, input.outfitType);
  const servesAudience = boutiqueServesAudience(boutique, input.outfitAudience);
  const customerLocation = input.customerLocation?.trim() ?? "";
  const customerCoords =
    input.customerLat != null && input.customerLng != null
      ? { lat: input.customerLat, lng: input.customerLng }
      : null;
  const boutiqueResolved = resolveBoutiqueLocation({
    slug: boutique.slug,
    latitude: boutique.latitude,
    longitude: boutique.longitude,
    address: boutique.address,
  });
  const distanceKm =
    customerCoords && boutiqueResolved
      ? haversineDistanceKm(customerCoords, boutiqueResolved.point)
      : null;
  const customerAtCityCenter = customerCoords
    ? isCustomerAtCityCenter(customerCoords, customerLocation)
    : false;
  const distanceLabel = formatBoutiqueDistanceLabel({
    distanceKm,
    boutiquePrecision: boutiqueResolved?.precision ?? "city",
    cityName: boutiqueResolved?.cityName,
    customerAtCityCenter,
  });

  if (!makesOutfit || !servesAudience) return null;

  const reasons: string[] = [];
  let score = 0;

  reasons.push(`Creates ${input.outfitType} for ${input.outfitAudience}`);
  score += 45;

  if (input.occasion?.trim()) {
    const occasion = normalize(input.occasion);
    const haystack = [...outfitLabels, ...serviceLabels].map(normalize).join(" ");
    if (haystack.includes(occasion) || occasion.split(/\s+/).some((word) => haystack.includes(word))) {
      score += 12;
      reasons.push(`Experience with ${input.occasion}`);
    }
  }

  const proximity = distanceKm != null
    ? Math.max(0, 30 - Math.min(distanceKm, 30))
    : locationProximityScore(boutique.address, customerLocation);
  if (proximity > 0) {
    score += proximity;
    if (distanceKm != null) {
      if (distanceLabel) reasons.push(distanceLabel);
    } else {
      const nearLabel = locationMatchLabel(boutique.address, customerLocation);
      if (nearLabel) reasons.push(nearLabel);
    }
  }

  if (boutique.availability === "open") {
    score += 10;
    reasons.push("Currently accepting orders");
  }

  if (avgRating != null && avgRating >= 4.5) {
    score += 12;
    reasons.push(`Rated ${avgRating.toFixed(1)} by customers`);
  } else if (avgRating != null && avgRating >= 4) {
    score += 6;
  }

  if (boutique.completed_orders_approx != null && boutique.completed_orders_approx >= 25) {
    score += 8;
  }

  if (input.deliveryDate && boutique.rush_orders_accepted) {
    const daysUntil =
      (new Date(input.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntil > 0 && daysUntil <= 45) {
      score += 8;
      reasons.push("Accepts rush timelines");
    }
  }

  const location =
    boutique.address?.split(",").slice(-2).join(",").trim() || boutique.address || "India";
  const rating = avgRating ?? defaultRating(boutique.completed_orders_approx);
  const nearby =
    distanceKm != null ? distanceKm <= 25 : isBoutiqueNearCustomer(boutique.address, customerLocation);

  return {
    boutiqueId: boutique.id,
    slug: boutique.slug,
    name: boutique.name,
    score: Math.min(score, 100),
    reasons: reasons.slice(0, 4),
    location,
    rating,
    experience: experienceLabel(boutique.completed_orders_approx),
    experienceSummary:
      boutique.pricing_info?.slice(0, 120) ||
      boutique.reviews_summary?.slice(0, 120) ||
      `${experienceLabel(boutique.completed_orders_approx)} of bespoke fashion · ${boutique.owner_name}`,
    makesOutfit: true,
    nearby,
    locationLabel: distanceLabel ?? locationMatchLabel(boutique.address, customerLocation),
    distanceKm,
    distanceLabel,
  };
}

function experienceLabel(completedOrders: number | null): string {
  if (completedOrders != null && completedOrders >= 100) return "Highly experienced";
  if (completedOrders != null && completedOrders >= 25) return "Experienced studio";
  return "Boutique studio";
}

function defaultRating(completedOrders: number | null): number {
  if (completedOrders != null && completedOrders >= 100) return 4.9;
  if (completedOrders != null && completedOrders >= 25) return 4.8;
  return 4.7;
}

async function loadReviewAverages(
  supabase: SupabaseClient,
  boutiqueIds: string[],
): Promise<Map<string, number>> {
  if (!boutiqueIds.length) return new Map();

  const { data, error } = await supabase
    .from("reviews")
    .select("boutique_id, rating")
    .in("boutique_id", boutiqueIds);

  if (error) throw new Error(error.message);

  const totals = new Map<string, { sum: number; count: number }>();
  for (const row of data ?? []) {
    const id = row.boutique_id as string;
    const entry = totals.get(id) ?? { sum: 0, count: 0 };
    entry.sum += Number(row.rating);
    entry.count += 1;
    totals.set(id, entry);
  }

  const averages = new Map<string, number>();
  for (const [id, { sum, count }] of totals) {
    averages.set(id, sum / count);
  }
  return averages;
}

function sortMatches(matches: BoutiqueMatch[], customerLocation: string): BoutiqueMatch[] {
  const withDistance = matches.filter((match) => match.distanceKm != null);
  const withoutDistance = matches.filter((match) => match.distanceKm == null);

  const byScore = (a: BoutiqueMatch, b: BoutiqueMatch) => b.score - a.score;
  const byDistance = (a: BoutiqueMatch, b: BoutiqueMatch) =>
    (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY) ||
    b.rating - a.rating;

  if (withDistance.length) {
    withDistance.sort(byDistance);
    withoutDistance.sort(byScore);
    return [...withDistance, ...withoutDistance];
  }

  const nearby = matches.filter((match) => match.nearby);
  const far = matches.filter((match) => !match.nearby);
  nearby.sort(byScore);
  far.sort(byScore);

  if (customerLocation.trim() && nearby.length) {
    return [...nearby, ...far];
  }

  return [...matches].sort(byScore);
}

export async function matchBoutiquesForRequest(
  supabase: SupabaseClient,
  input: MatchBoutiquesInput,
  limit = 8,
): Promise<BoutiqueMatch[]> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(
      `
      id,
      slug,
      name,
      owner_name,
      address,
      latitude,
      longitude,
      availability,
      rush_orders_accepted,
      completed_orders_approx,
      avg_delivery_time,
      pricing_info,
      reviews_summary,
      audiences,
      boutique_outfit_types ( label, audience ),
      boutique_services ( label )
    `,
    )
    .eq("status", "verified")
    .eq("availability", "open");

  if (error) throw new Error(error.message);

  const boutiques = (data ?? []) as MatchableBoutique[];
  const averages = await loadReviewAverages(
    supabase,
    boutiques.map((boutique) => boutique.id),
  );

  const customerLocation = input.customerLocation?.trim() ?? "";

  let results = boutiques
    .map((boutique) => scoreBoutique(boutique, input, averages.get(boutique.id) ?? null))
    .filter((match): match is BoutiqueMatch => match != null);

  results = sortMatches(results, customerLocation);

  if (customerLocation && results.some((match) => match.nearby)) {
    results = results.filter((match) => match.nearby);
  }

  return results.slice(0, limit);
}
