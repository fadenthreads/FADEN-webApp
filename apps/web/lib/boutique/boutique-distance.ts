import type { BoutiqueData } from "@/data/boutiques";
import {
  formatCityDisplayName,
  isCustomerAtCityCenter,
  resolveBoutiqueLocation,
} from "@/lib/location/city-coordinates";
import {
  bestMatchScore,
  formatDistanceKm,
  haversineDistanceKm,
  type GeoPoint,
} from "@/lib/location/geo";

export interface AttachDistanceOptions {
  customerLocationLabel?: string | null;
  customerLocationSource?: string | null;
}

export function formatBoutiqueDistanceLabel(options: {
  distanceKm: number | null | undefined;
  boutiquePrecision: "exact" | "neighborhood" | "city";
  cityName?: string | null;
  customerAtCityCenter?: boolean;
}): string | null {
  const { distanceKm, boutiquePrecision, cityName, customerAtCityCenter } = options;
  if (distanceKm == null || !Number.isFinite(distanceKm)) return null;

  const cityDisplay = cityName ? formatCityDisplayName(cityName) : null;
  const isCityLevel = boutiquePrecision === "city";
  const isEffectivelySameSpot = distanceKm < 0.05;

  if (isCityLevel && (isEffectivelySameSpot || customerAtCityCenter)) {
    if (cityDisplay) return `Near ${cityDisplay} (approx.)`;
    return "Nearby (approx.)";
  }

  const base = formatDistanceKm(distanceKm);
  if (!base) return null;
  if (isCityLevel) return `${base.replace(" away", "")} away (approx.)`;
  return base;
}

export function attachDistanceToBoutiques(
  boutiques: BoutiqueData[],
  customer: GeoPoint | null,
  options?: AttachDistanceOptions,
): BoutiqueData[] {
  if (!customer) return boutiques;

  const customerAtCityCenter = isCustomerAtCityCenter(
    customer,
    options?.customerLocationLabel,
    options?.customerLocationSource,
  );

  return boutiques.map((boutique) => {
    const resolved = resolveBoutiqueLocation({
      slug: boutique.slug,
      latitude: boutique.latitude,
      longitude: boutique.longitude,
      address: boutique.location,
    });

    if (!resolved) {
      return { ...boutique, distanceKm: null, distanceLabel: null };
    }

    const distanceKm = haversineDistanceKm(customer, resolved.point);
    return {
      ...boutique,
      latitude: boutique.latitude ?? resolved.point.lat,
      longitude: boutique.longitude ?? resolved.point.lng,
      distanceKm,
      distanceLabel: formatBoutiqueDistanceLabel({
        distanceKm,
        boutiquePrecision: resolved.precision,
        cityName: resolved.cityName,
        customerAtCityCenter,
      }),
    };
  });
}

export function filterBoutiquesByMaxDistance(
  boutiques: BoutiqueData[],
  maxDistanceKm: number | null | undefined,
): BoutiqueData[] {
  if (maxDistanceKm == null || maxDistanceKm <= 0) return boutiques;
  return boutiques.filter(
    (boutique) => boutique.distanceKm == null || boutique.distanceKm <= maxDistanceKm,
  );
}

export { bestMatchScore, formatDistanceKm };
