import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createCreativeDispatchSchema, updateCreativeDispatchSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import {
  createOwnerCreativeDispatchItem,
  CREATIVE_DISPATCH_SETUP_MESSAGE,
  deleteOwnerCreativeDispatchItem,
  isCreativeDispatchAvailable,
  listOwnerCreativeDispatch,
  mapCreativeDispatchRow,
  updateOwnerCreativeDispatchItem,
} from "@/lib/boutique/creative-dispatch-queries";

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

  if (!user) return { error: errorResponse("You must be signed in.", 401) };

  const boutique = await getOwnerBoutique(supabase, user.id);
  if (!boutique?.id) return { error: errorResponse("Register a boutique first.", 404) };

  return { supabase, boutique };
}

function revalidateOwnerBoutique(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/boutique/${slug}`, "page");
}

/** GET /api/boutique/creative-dispatch */
export async function GET() {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  try {
    const tableAvailable = await isCreativeDispatchAvailable(supabase);
    const items = await listOwnerCreativeDispatch(supabase, boutique.id);
    return NextResponse.json({
      ok: true,
      tableAvailable,
      items: items.map(mapCreativeDispatchRow),
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to load creative dispatch", 500);
  }
}

/** POST /api/boutique/creative-dispatch */
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

  const parsed = createCreativeDispatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid creative dispatch item", 400);
  }

  try {
    const result = await createOwnerCreativeDispatchItem(supabase, boutique.id, parsed.data);
    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save item";
    const status = message === CREATIVE_DISPATCH_SETUP_MESSAGE ? 503 : 500;
    return errorResponse(message, status);
  }
}

/** PATCH /api/boutique/creative-dispatch */
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

  const parsed = updateCreativeDispatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid creative dispatch item", 400);
  }

  try {
    await updateOwnerCreativeDispatchItem(supabase, boutique.id, parsed.data.id, parsed.data);
    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update item";
    const status = message === CREATIVE_DISPATCH_SETUP_MESSAGE ? 503 : 500;
    return errorResponse(message, status);
  }
}

/** DELETE /api/boutique/creative-dispatch?id= */
export async function DELETE(request: NextRequest) {
  const ctx = await requireOwnerBoutique();
  if ("error" in ctx && ctx.error) return ctx.error;
  const { supabase, boutique } = ctx as Exclude<typeof ctx, { error: NextResponse }>;

  const itemId = new URL(request.url).searchParams.get("id")?.trim();
  if (!itemId) return errorResponse("Item id is required.", 400);

  try {
    await deleteOwnerCreativeDispatchItem(supabase, boutique.id, itemId);
    revalidateOwnerBoutique(boutique.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete item";
    const status = message === CREATIVE_DISPATCH_SETUP_MESSAGE ? 503 : 500;
    return errorResponse(message, status);
  }
}
