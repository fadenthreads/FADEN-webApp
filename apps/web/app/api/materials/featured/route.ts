import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listFeaturedMaterialsFromDb } from "@/lib/materials/featured-materials";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "24");

  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ materials: [] });
  }

  try {
    const supabase = await createClient();
    const materials = await listFeaturedMaterialsFromDb(supabase, Number.isFinite(limit) ? limit : 24);
    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ materials: [] });
  }
}
