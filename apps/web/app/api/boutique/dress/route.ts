import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getPortfolioItemById, resolveBoutiqueProfile } from "@/lib/boutique/queries";

/** GET /api/boutique/dress?slug=&id= — dress detail for order / customize prefill */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const id = searchParams.get("id")?.trim();

  if (!slug || !id) {
    return NextResponse.json({ error: "slug and id are required" }, { status: 400 });
  }

  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ error: "Boutique not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const [profile, design] = await Promise.all([
    resolveBoutiqueProfile(supabase, slug),
    getPortfolioItemById(supabase, id),
  ]);

  if (!profile || !design) {
    return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
  }

  return NextResponse.json({
    design: {
      id: design.id,
      title: design.title,
      outfitLabel: design.outfitLabel,
      description: design.description,
      imageUrl: design.imageUrl,
      rating: design.rating,
      price: design.price,
      material: design.material,
      sizeLabel: design.sizeLabel,
      lengthDetails: design.lengthDetails,
      fitting: design.fitting,
      turnaround: design.turnaround,
    },
  });
}
