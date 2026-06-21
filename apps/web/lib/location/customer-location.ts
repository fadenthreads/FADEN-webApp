import {
  DEFAULT_CUSTOMER_LOCATION,
  type CustomerLocation,
} from "@/lib/location/customer-location-types";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";
import type { GeoPoint } from "@/lib/location/geo";

export const CUSTOMER_LOCATION_KEY = "faden:customer-location";

export const CUSTOMER_LOCATIONS = [
  "Hyderabad, TS",
  "Mumbai, Maharashtra",
  "Jaipur, Rajasthan",
  "Bangalore, Karnataka",
  "Chennai, Tamil Nadu",
] as const;

export { DEFAULT_CUSTOMER_LOCATION };
export type { CustomerLocation };

function parseStoredLocation(raw: string | null): CustomerLocation | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CustomerLocation;
    if (parsed?.label && parsed.lat != null && parsed.lng != null) {
      return parsed;
    }
  } catch {
    /* legacy plain-text label */
  }

  if (raw.trim()) {
    const coords = resolveCityCoordinates(raw);
    return {
      label: raw,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      source: "preset",
    };
  }

  return null;
}

export function getDefaultCustomerLocation(): CustomerLocation {
  const coords = resolveCityCoordinates(DEFAULT_CUSTOMER_LOCATION);
  return {
    label: DEFAULT_CUSTOMER_LOCATION,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    source: "preset",
  };
}

export function getStoredCustomerLocation(): CustomerLocation {
  if (typeof window === "undefined") return getDefaultCustomerLocation();
  return parseStoredLocation(localStorage.getItem(CUSTOMER_LOCATION_KEY)) ?? getDefaultCustomerLocation();
}

/** @deprecated Use getStoredCustomerLocation().label */
export function getStoredCustomerLocationLabel(): string {
  return getStoredCustomerLocation().label;
}

export function setStoredCustomerLocation(location: CustomerLocation): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_LOCATION_KEY, JSON.stringify(location));
}

export function customerLocationToGeoPoint(location: CustomerLocation): GeoPoint | null {
  if (location.lat != null && location.lng != null) {
    return { lat: location.lat, lng: location.lng };
  }
  return resolveCityCoordinates(location.label);
}
