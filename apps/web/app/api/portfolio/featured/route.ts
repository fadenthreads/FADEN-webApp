import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listFeaturedDesignsFromDb, listFeaturedDesignsFromMock } from "@/lib/boutique/featured-designs";
import { listClothingByQuery } from "@/lib/boutique/clothing-search";
import type { AudienceCategory } from "@faden/validators";

function parseAudience(value: string | null): AudienceCategory | null {
  if (value === "women" || value === "men" || value === "kids") return value;
  return null;
}

export async function GET(request: NextRequest) {
  const audience = parseAudience(request.nextUrl.searchParams.get("audience"));
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!isWebSupabaseConfigured()) {
    const designs = query
      ? await listClothingByQuery(null, query, audience)
      : listFeaturedDesignsFromMock(24, audience);
    return NextResponse.json({ designs, source: "mock" });
  }

  try {
    const supabase = await createClient();
    const designs = query
      ? await listClothingByQuery(supabase, query, audience)
      : await listFeaturedDesignsFromDb(supabase, 24, audience);
    const fallback = query
      ? await listClothingByQuery(null, query, audience)
      : listFeaturedDesignsFromMock(24, audience);
    return NextResponse.json({
      designs: designs.length ? designs : fallback,
      source: designs.length ? "live" : "mock",
    });
  } catch {
    const designs = query
      ? await listClothingByQuery(null, query, audience)
      : listFeaturedDesignsFromMock(24, audience);
    return NextResponse.json({ designs, source: "mock" });
  }
}
