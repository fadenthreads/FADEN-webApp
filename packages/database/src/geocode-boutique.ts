const NOMINATIM_USER_AGENT = "FADEN/1.0 (boutique registration)";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

/** Parse lat/lng from common Google Maps URL formats. */
export function parseCoordinatesFromMapsUrl(mapsUrl: string): GeoCoordinates | null {
  const trimmed = mapsUrl.trim();
  if (!trimmed) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/** Forward-geocode a street address via OpenStreetMap Nominatim. */
export async function geocodeAddress(address: string): Promise<GeoCoordinates | null> {
  const query = address.trim();
  if (!query) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": NOMINATIM_USER_AGENT,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const results = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const first = results[0];
    if (!first?.lat || !first.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

/** Prefer maps URL coords, then geocode the address. */
export async function resolveBoutiqueLatLng(
  address: string,
  mapsUrl?: string | null,
): Promise<GeoCoordinates | null> {
  if (mapsUrl?.trim()) {
    const fromUrl = parseCoordinatesFromMapsUrl(mapsUrl);
    if (fromUrl) return fromUrl;
  }

  return geocodeAddress(address);
}
