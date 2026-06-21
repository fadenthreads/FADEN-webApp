import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listVerifiedBoutiquesForDiscovery } from "@/lib/boutique/queries";
import { getAllBoutiquesForSuggestions } from "@/data/discovery-filters";
import {
  buildBoutiquePickerSuggestions,
  findBoutiqueBySlug,
} from "@/lib/boutique/discovery-search";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** GET /api/boutiques/picker-suggestions?q=&slug= — boutique name autocomplete for customize wizard */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") ?? undefined;
  const query = searchParams.get("q") ?? "";
  const slug = searchParams.get("slug") ?? "";

  let customerLat = parseNumber(searchParams.get("lat"));
  let customerLng = parseNumber(searchParams.get("lng"));
  if ((customerLat == null || customerLng == null) && location) {
    const cityCoords = resolveCityCoordinates(location);
    if (cityCoords) {
      customerLat = cityCoords.lat;
      customerLng = cityCoords.lng;
    }
  }

  let boutiques = getAllBoutiquesForSuggestions();

  if (isWebSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      boutiques = await listVerifiedBoutiquesForDiscovery(supabase, {
        locationLabel: location,
        customerLat,
        customerLng,
      });
    } catch {
      /* mock fallback */
    }
  }

  if (slug.trim()) {
    const match = findBoutiqueBySlug(boutiques, slug.trim());
    return NextResponse.json({ boutique: match });
  }

  if (query.trim().length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = buildBoutiquePickerSuggestions(boutiques, query, 8);
  return NextResponse.json({ suggestions });
}
