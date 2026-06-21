import { NextResponse, type NextRequest } from "next/server";
import { savedItemSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  addSavedItemToDb,
  listSavedItemsFromDb,
  removeSavedItemFromDb,
} from "@/lib/saved-items/queries";
import type { SavedListKind } from "@/lib/saved-items/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function requireUser() {
  if (!isWebSupabaseConfigured()) {
    return { error: errorResponse("Supabase is not configured.", 503) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: errorResponse("Sign in to sync your saved items.", 401) };
  return { supabase, userId: user.id };
}

export function createSavedRoutes(kind: SavedListKind) {
  return {
    async GET() {
      const ctx = await requireUser();
      if ("error" in ctx && ctx.error) return ctx.error;
      const { supabase, userId } = ctx as {
        supabase: Awaited<ReturnType<typeof createClient>>;
        userId: string;
      };

      try {
        const items = await listSavedItemsFromDb(supabase, kind, userId);
        return NextResponse.json({ ok: true, items });
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Failed to load items", 500);
      }
    },

    async POST(request: NextRequest) {
      const ctx = await requireUser();
      if ("error" in ctx && ctx.error) return ctx.error;
      const { supabase, userId } = ctx as {
        supabase: Awaited<ReturnType<typeof createClient>>;
        userId: string;
      };

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return errorResponse("Invalid request body.", 400);
      }

      const parsed = savedItemSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(parsed.error.errors[0]?.message ?? "Invalid item", 400);
      }

      try {
        const item = await addSavedItemToDb(supabase, kind, userId, parsed.data);
        return NextResponse.json({ ok: true, item });
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Failed to save item", 500);
      }
    },

    async DELETE(request: NextRequest) {
      const ctx = await requireUser();
      if ("error" in ctx && ctx.error) return ctx.error;
      const { supabase, userId } = ctx as {
        supabase: Awaited<ReturnType<typeof createClient>>;
        userId: string;
      };

      const boutiqueSlug = request.nextUrl.searchParams.get("boutiqueSlug")?.trim();
      if (!boutiqueSlug) return errorResponse("boutiqueSlug is required.", 400);
      const designId = request.nextUrl.searchParams.get("designId");

      try {
        await removeSavedItemFromDb(supabase, kind, userId, boutiqueSlug, designId);
        return NextResponse.json({ ok: true });
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Failed to remove item", 500);
      }
    },
  };
}
