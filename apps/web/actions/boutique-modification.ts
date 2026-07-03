"use server";

import { revalidatePath } from "next/cache";
import { applyBoutiqueDetails } from "@faden/database";
import {
  boutiqueModificationSchema,
  submitBoutiqueModificationSchema,
} from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { sendBoutiqueModificationAdminEmail } from "@/lib/email/admin-boutique-notifications";

const MODIFICATION_TABLE_MIGRATION =
  "packages/database/src/schema/008_boutique_modification_requests.sql";

function modificationTableError(message: string | undefined) {
  if (message?.includes("boutique_modification_requests")) {
    return `Database table missing. Run ${MODIFICATION_TABLE_MIGRATION} in the Supabase SQL editor, then try again.`;
  }
  return message ?? "Failed to submit modification request";
}

export async function updateOwnerBoutiqueDetails(input: unknown): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const body = input as { boutiqueId?: string; details?: unknown };
  if (!body.boutiqueId) {
    return { ok: false, error: "Boutique id is required." };
  }

  const parsed = boutiqueModificationSchema.safeParse(body.details);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, status, owner_id")
    .eq("id", body.boutiqueId)
    .maybeSingle();

  if (boutiqueError || !boutique) {
    return { ok: false, error: "Boutique not found." };
  }

  if (boutique.owner_id !== user.id) {
    return { ok: false, error: "Only the boutique owner can update details." };
  }

  if (boutique.status === "verified") {
    return {
      ok: false,
      error: "Verified boutiques must submit changes for admin approval.",
    };
  }

  const applyResult = await applyBoutiqueDetails(supabase, boutique.id, parsed.data);
  if (!applyResult.ok) {
    return { ok: false, error: applyResult.error };
  }

  revalidatePath("/account");
  revalidatePath("/register-boutique");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function submitBoutiqueModification(
  input: unknown,
): Promise<ActionResult<{ requestId: string }>> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = submitBoutiqueModificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { boutiqueId, details, ownerNotes } = parsed.data;

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, status, owner_id, name, slug")
    .eq("id", boutiqueId)
    .maybeSingle();

  if (boutiqueError || !boutique) {
    return { ok: false, error: "Boutique not found." };
  }

  if (boutique.owner_id !== user.id) {
    return { ok: false, error: "Only the boutique owner can request changes." };
  }

  if (boutique.status !== "verified") {
    return { ok: false, error: "Only verified boutiques can submit modification requests." };
  }

  const { data: existingPending, error: pendingCheckError } = await supabase
    .from("boutique_modification_requests")
    .select("id")
    .eq("boutique_id", boutiqueId)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingCheckError) {
    return { ok: false, error: modificationTableError(pendingCheckError.message) };
  }

  if (existingPending) {
    return {
      ok: false,
      error: "You already have a modification request awaiting admin review.",
    };
  }

  const { data: request, error: insertError } = await supabase
    .from("boutique_modification_requests")
    .insert({
      boutique_id: boutiqueId,
      owner_id: user.id,
      payload: details,
      owner_notes: ownerNotes?.trim() || null,
    })
    .select("id")
    .single();

  if (insertError || !request) {
    return { ok: false, error: modificationTableError(insertError?.message) };
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  void sendBoutiqueModificationAdminEmail({
    requestId: request.id,
    boutiqueId: boutique.id,
    boutiqueName: boutique.name as string,
    boutiqueSlug: boutique.slug as string,
    ownerName: (ownerProfile?.full_name as string | null) ?? parsed.data.details.ownerName ?? "Boutique owner",
    ownerEmail: (ownerProfile?.email as string | null) ?? null,
    ownerNotes: ownerNotes?.trim() || null,
  }).catch((error) => {
    console.warn("[email] boutique modification admin notify error:", error);
  });

  revalidatePath("/account");
  revalidatePath("/register-boutique");
  return { ok: true, data: { requestId: request.id } };
}
