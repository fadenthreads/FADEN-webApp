import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listFeaturedDesignsFromDb } from "@/lib/boutique/featured-designs";
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
    return NextResponse.json({ designs: [], source: "empty" });
  }

  try {
    const supabase = await createClient();
    const designs = query
      ? await listClothingByQuery(supabase, query, audience)
      : await listFeaturedDesignsFromDb(supabase, 24, audience);
    return NextResponse.json({
      designs,
      source: designs.length ? "live" : "empty",
    });
  } catch {
    return NextResponse.json({ designs: [], source: "empty" });
  }
}
