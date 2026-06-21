import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import { ensureOwnerOutfitType } from "@/lib/boutique/portfolio-queries";

const createOutfitTypeSchema = z.object({
  label: z.string().trim().min(1, "Collection name is required").max(80),
});

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** POST /api/boutique/outfit-types — add a "what they make" collection */
export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse("You must be signed in.", 401);

  const boutique = await getOwnerBoutique(supabase, user.id);
  if (!boutique?.id) return errorResponse("Register a boutique first.", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = createOutfitTypeSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid collection", 400);
  }

  try {
    const id = await ensureOwnerOutfitType(supabase, boutique.id, parsed.data.label);
    revalidatePath("/dashboard");
    revalidatePath(`/boutique/${boutique.slug}`, "page");
    return NextResponse.json({ ok: true, id, label: parsed.data.label });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to add collection", 500);
  }
}
