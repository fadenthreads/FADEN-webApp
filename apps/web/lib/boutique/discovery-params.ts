import type { CustomerLocation } from "@/lib/location/customer-location-types";

export function buildBoutiqueDiscoveryParams(options: {
  location: CustomerLocation;
  query?: string;
  audience?: string | null;
  minRating?: number | null;
  maxDistanceKm?: number | null;
}): URLSearchParams {
  const params = new URLSearchParams({ location: options.location.label });

  if (options.location.lat != null && options.location.lng != null) {
    params.set("lat", String(options.location.lat));
    params.set("lng", String(options.location.lng));
  }

  if (options.query?.trim()) params.set("q", options.query.trim());
  if (options.audience?.trim()) params.set("category", options.audience.trim());
  if (options.minRating != null && options.minRating > 0) {
    params.set("minRating", String(options.minRating));
  }
  if (options.maxDistanceKm != null && options.maxDistanceKm > 0) {
    params.set("maxDistance", String(options.maxDistanceKm));
  }

  return params;
}
