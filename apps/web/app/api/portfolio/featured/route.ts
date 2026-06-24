import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  listFeaturedDesignsFromDb,
  listFeaturedDesignsFromMock,
} from "@/lib/boutique/featured-designs";

export async function GET() {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ designs: listFeaturedDesignsFromMock(), source: "mock" });
  }

  try {
    const supabase = await createClient();
    const designs = await listFeaturedDesignsFromDb(supabase);
    return NextResponse.json({
      designs: designs.length ? designs : listFeaturedDesignsFromMock(),
      source: designs.length ? "live" : "mock",
    });
  } catch {
    return NextResponse.json({ designs: listFeaturedDesignsFromMock(), source: "mock" });
  }
}
