import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listVerifiedBoutiquesForDiscovery } from "@/lib/boutique/queries";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import { parseAudienceCategory } from "@/lib/landing/audience-categories";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMinRating(value: string | null): number | null {
  const parsed = parseNumber(value);
  return parsed != null && parsed > 0 ? parsed : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") ?? undefined;
  const query = searchParams.get("q") ?? undefined;
  const audience = parseAudienceCategory(
    searchParams.get("category") ?? searchParams.get("audience"),
  );
  const minRating = parseMinRating(searchParams.get("minRating"));
  const maxDistanceKm = parseNumber(searchParams.get("maxDistance"));

  let customerLat = parseNumber(searchParams.get("lat"));
  let customerLng = parseNumber(searchParams.get("lng"));

  if ((customerLat == null || customerLng == null) && location) {
    const cityCoords = resolveCityCoordinates(location);
    if (cityCoords) {
      customerLat = cityCoords.lat;
      customerLng = cityCoords.lng;
    }
  }

  const filters = {
    locationLabel: location,
    query,
    audience,
    minRating,
    customerLat,
    customerLng,
    maxDistanceKm,
  };

  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({
      boutiques: getBoutiquesForDiscovery(filters),
      source: "mock",
      customer: customerLat != null && customerLng != null ? { lat: customerLat, lng: customerLng } : null,
    });
  }

  try {
    const supabase = await createClient();
    const boutiques = await listVerifiedBoutiquesForDiscovery(supabase, filters);
    return NextResponse.json({
      boutiques,
      source: "live",
      customer: customerLat != null && customerLng != null ? { lat: customerLat, lng: customerLng } : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load boutiques";
    return NextResponse.json(
      {
        error: message,
        boutiques: getBoutiquesForDiscovery(filters),
        customer: customerLat != null && customerLng != null ? { lat: customerLat, lng: customerLng } : null,
      },
      { status: 500 },
    );
  }
}
