import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createPortfolioItemSchema, updatePortfolioItemSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import { ALL_OUTFIT_TYPES } from "@/lib/boutique/audiences";
import {
  createOwnerPortfolioItem,
  deleteOwnerPortfolioItem,
  listOwnerOutfitTypes,
  listOwnerPortfolioItems,
  resolveOwnerOutfitTypeId,
  updateOwnerPortfolioItem,
} from "@/lib/boutique/portfolio-queries";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function requireOwnerBoutique() {
  if (!isWebSupabaseConfigured()) {
    return { error: errorResponse("Supabase is not configured.", 503) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: errorResponse("You must be signed in.", 401) };
  }

  const boutique = await getOwnerBoutique(supabase, user.id);
  if (!boutique?.id) {
    return { error: errorResponse("Register a boutique first.", 404) };
  }

  return { supabase, boutique };
}

function revalidateOwnerBoutique(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/boutique/${slug}`, "page");
}

/** GET /api/boutique/portfolio — owner's portfolio items + outfit types */
export async function GET() {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  try {
    const [items, outfitTypes] = await Promise.all([
      listOwnerPortfolioItems(supabase, boutique.id),
      listOwnerOutfitTypes(supabase, boutique.id),
    ]);

    const existingLabels = new Set(outfitTypes.map((type) => type.label.toLowerCase()));
    const dressTypeSuggestions = ALL_OUTFIT_TYPES.filter(
      (label) => label !== "Other" && !existingLabels.has(label.toLowerCase()),
    );

    return NextResponse.json({
      ok: true,
      items,
      outfitTypes,
      dressTypeSuggestions,
      boutiqueSlug: boutique.slug,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to load portfolio", 500);
  }
}

/** POST /api/boutique/portfolio — add a stitched dress photo */
export async function POST(request: NextRequest) {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = createPortfolioItemSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid portfolio item", 400);
  }

  try {
    const outfitTypeId = await resolveOwnerOutfitTypeId(
      supabase,
      boutique.id,
      parsed.data.outfitTypeId,
      parsed.data.outfitTypeLabel,
    );

    const result = await createOwnerPortfolioItem(supabase, boutique.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      priceHint: parsed.data.priceHint,
      sizeLabel: parsed.data.sizeLabel,
      lengthDetails: parsed.data.lengthDetails,
      outfitTypeId,
      mediaUrl: parsed.data.mediaUrl,
    });

    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to save portfolio item", 500);
  }
}

/** PATCH /api/boutique/portfolio — update an existing dress */
export async function PATCH(request: NextRequest) {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = updatePortfolioItemSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid portfolio item", 400);
  }

  try {
    const outfitTypeId = await resolveOwnerOutfitTypeId(
      supabase,
      boutique.id,
      parsed.data.outfitTypeId,
      parsed.data.outfitTypeLabel,
    );

    await updateOwnerPortfolioItem(supabase, boutique.id, parsed.data.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      priceHint: parsed.data.priceHint,
      sizeLabel: parsed.data.sizeLabel,
      lengthDetails: parsed.data.lengthDetails,
      outfitTypeId: parsed.data.outfitTypeId !== undefined || parsed.data.outfitTypeLabel
        ? outfitTypeId
        : undefined,
      mediaUrl: parsed.data.mediaUrl,
    });

    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update portfolio item", 500);
  }
}

/** DELETE /api/boutique/portfolio?id= */
export async function DELETE(request: NextRequest) {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  const itemId = new URL(request.url).searchParams.get("id")?.trim();
  if (!itemId) return errorResponse("Portfolio item id is required.", 400);

  try {
    await deleteOwnerPortfolioItem(supabase, boutique.id, itemId);
    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete portfolio item", 500);
  }
}
