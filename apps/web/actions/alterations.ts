"use server";

import { revalidatePath } from "next/cache";
import { alterationRequestSchema, alterationStatusUpdateSchema } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  createAlterationRequest,
  findMockAlterationBoutique,
  findNearestAlterationBoutique,
  updateAlterationRequestStatus,
} from "@/lib/alterations/queries";
import type { GeoPoint } from "@/lib/location/geo";

export async function submitAlterationRequest(
  raw: unknown,
): Promise<
  ActionResult<{
    requestId: string;
    boutiqueName?: string;
    boutiqueSlug?: string;
    distanceKm?: number | null;
  }>
> {
  const parsed = alterationRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const customerPoint: GeoPoint | null =
    parsed.data.customerLat != null && parsed.data.customerLng != null
      ? { lat: parsed.data.customerLat, lng: parsed.data.customerLng }
      : null;

  if (!isWebSupabaseConfigured()) {
    const boutique = findMockAlterationBoutique(customerPoint);
    return {
      ok: true,
      data: {
        requestId: `mock-${Date.now()}`,
        boutiqueName: boutique?.name,
        boutiqueSlug: boutique?.slug,
        distanceKm: boutique?.distanceKm,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to book an alteration." };
  }

  try {
    const boutique = await findNearestAlterationBoutique(supabase, customerPoint);

    const row = await createAlterationRequest(supabase, user.id, parsed.data, boutique);
    revalidatePath("/alterations");
    revalidatePath("/account");
    revalidatePath("/dashboard");

    return {
      ok: true,
      data: {
        requestId: row.id,
        boutiqueName: boutique?.name,
        boutiqueSlug: boutique?.slug,
        distanceKm: boutique?.distanceKm,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not submit alteration request",
    };
  }
}

export async function updateAlterationStatus(
  raw: unknown,
): Promise<ActionResult<{ status: string }>> {
  const parsed = alterationStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  if (!isWebSupabaseConfigured()) {
    return { ok: true, data: { status: parsed.data.status } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in required." };
  }

  const { data: boutique } = await supabase
    .from("boutiques")
    .select("id")
    .eq("id", parsed.data.boutiqueId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!boutique) {
    return { ok: false, error: "You can only update alterations for your boutique." };
  }

  const { data: request } = await supabase
    .from("alteration_requests")
    .select("id, boutique_id")
    .eq("id", parsed.data.requestId)
    .maybeSingle();

  if (!request || request.boutique_id !== parsed.data.boutiqueId) {
    return { ok: false, error: "Alteration request not found." };
  }

  try {
    await updateAlterationRequestStatus(supabase, parsed.data.requestId, parsed.data.status);
    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { ok: true, data: { status: parsed.data.status } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update alteration status",
    };
  }
}
