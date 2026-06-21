import type { GeoPoint } from "@/lib/location/geo";

/** City centers used when the customer picks a preset location label. */
export const CITY_COORDINATES: Record<string, GeoPoint> = {
  hyderabad: { lat: 17.385, lng: 78.4867 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
};

/** Mock + seed boutique slug coordinates for distance when DB columns are empty. */
export const BOUTIQUE_COORDINATES: Record<string, GeoPoint> = {
  "silk-thread-studio": { lat: 19.076, lng: 72.8777 },
  "royal-stitch": { lat: 26.9124, lng: 75.7873 },
  "elegant-drapes": { lat: 17.4156, lng: 78.4487 },
  "thread-craft": { lat: 12.9716, lng: 77.5946 },
  "lakshmi-stitches-hyd": { lat: 17.4156, lng: 78.4487 },
  "royal-threads-hyd": { lat: 17.4225, lng: 78.4077 },
  "saree-sabha-hyd": { lat: 17.44, lng: 78.3489 },
  "gown-gallery-hyd": { lat: 17.4435, lng: 78.3772 },
  "sharara-house-hyd": { lat: 17.4485, lng: 78.3908 },
  "silk-route-hyd": { lat: 17.4615, lng: 78.367 },
  "bridal-bloom-hyd": { lat: 17.4399, lng: 78.4983 },
  "anarkali-atelier-hyd": { lat: 17.4449, lng: 78.4662 },
  "fusion-faden-hyd": { lat: 17.4375, lng: 78.4482 },
  "heritage-weaves-hyd": { lat: 17.3993, lng: 78.4695 },
};

export type BoutiqueCoordinatePrecision = "exact" | "neighborhood" | "city";

export interface ResolvedBoutiqueLocation {
  point: GeoPoint;
  precision: BoutiqueCoordinatePrecision;
  cityName: string | null;
}

const CITY_DISPLAY_NAMES: Record<string, string> = {
  hyderabad: "Hyderabad",
  mumbai: "Mumbai",
  jaipur: "Jaipur",
  bangalore: "Bangalore",
  chennai: "Chennai",
};

function normalizeCityKey(locationLabel: string): string {
  return locationLabel.split(",")[0]?.trim().toLowerCase() ?? "";
}

export function formatCityDisplayName(cityKey: string): string {
  const key = cityKey.toLowerCase();
  return CITY_DISPLAY_NAMES[key] ?? cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
}

export function resolveCityCoordinates(locationLabel: string): GeoPoint | null {
  const cityKey = normalizeCityKey(locationLabel);
  return CITY_COORDINATES[cityKey] ?? null;
}

export function extractCityKeyFromAddress(address: string | null | undefined): string | null {
  const normalized = (address ?? "").toLowerCase();
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (normalized.includes(city)) return city;
  }
  return null;
}

export function isSameGeoPoint(a: GeoPoint, b: GeoPoint, epsilon = 0.0001): boolean {
  return Math.abs(a.lat - b.lat) <= epsilon && Math.abs(a.lng - b.lng) <= epsilon;
}

export function findMatchingCityCenter(point: GeoPoint): string | null {
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (isSameGeoPoint(point, coords)) return city;
  }
  return null;
}

export function isCustomerAtCityCenter(
  customer: GeoPoint,
  locationLabel?: string | null,
  source?: string | null,
): boolean {
  if (source === "preset") return true;
  if (findMatchingCityCenter(customer)) return true;
  if (locationLabel) {
    const cityCoords = resolveCityCoordinates(locationLabel);
    if (cityCoords && isSameGeoPoint(customer, cityCoords)) return true;
  }
  return false;
}

export function resolveBoutiqueLocation(options: {
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): ResolvedBoutiqueLocation | null {
  if (options.latitude != null && options.longitude != null) {
    const point = { lat: options.latitude, lng: options.longitude };
    const cityAtCenter = findMatchingCityCenter(point);
    return {
      point,
      precision: "exact",
      cityName: cityAtCenter ?? extractCityKeyFromAddress(options.address),
    };
  }

  const fromSlug = BOUTIQUE_COORDINATES[options.slug];
  if (fromSlug) {
    return {
      point: fromSlug,
      precision: "neighborhood",
      cityName: extractCityKeyFromAddress(options.address) ?? findMatchingCityCenter(fromSlug),
    };
  }

  const address = (options.address ?? "").toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (address.includes(city)) {
      return { point: coords, precision: "city", cityName: city };
    }
  }

  return null;
}

/** @deprecated Prefer resolveBoutiqueLocation for precision-aware distance labels. */
export function resolveBoutiqueCoordinates(options: {
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): GeoPoint | null {
  return resolveBoutiqueLocation(options)?.point ?? null;
}
