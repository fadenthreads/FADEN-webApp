import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listFeaturedDesignsFromDb, listFeaturedDesignsFromMock } from "@/lib/boutique/featured-designs";
import type { AudienceCategory } from "@faden/validators";

function parseAudience(value: string | null): AudienceCategory | null {
  if (value === "women" || value === "men" || value === "kids") return value;
  return null;
}

export async function GET(request: NextRequest) {
  const audience = parseAudience(request.nextUrl.searchParams.get("audience"));

  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ designs: listFeaturedDesignsFromMock(24, audience), source: "mock" });
  }

  try {
    const supabase = await createClient();
    const designs = await listFeaturedDesignsFromDb(supabase, 24, audience);
    return NextResponse.json({
      designs: designs.length ? designs : listFeaturedDesignsFromMock(24, audience),
      source: designs.length ? "live" : "mock",
    });
  } catch {
    return NextResponse.json({ designs: listFeaturedDesignsFromMock(24, audience), source: "mock" });
  }
}
