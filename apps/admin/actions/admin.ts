"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, applyBoutiqueDetails } from "@faden/database";
import type { ActionResult } from "@faden/types";
import {
  modificationDecisionSchema,
  updateUserRoleSchema,
  verificationDecisionSchema,
  type BoutiqueRegistrationInput,
} from "@faden/validators";
import { createClient } from "@/lib/supabase/server";

async function revalidateWebDiscovery() {
  const webUrl = process.env.WEB_APP_URL ?? "http://localhost:3000";
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;

  try {
    await fetch(`${webUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
  } catch {
    /* non-blocking — web may be offline in local dev */
  }
}

async function assertAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") throw new Error("Admin access required.");

  return { supabase, adminId: user.id };
}

export async function decideBoutiqueVerification(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = verificationDecisionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, adminId } = await assertAdmin();
    const { boutiqueId, decision, notes } = parsed.data;

    const boutiqueStatus =
      decision === "approved" ? "verified" : decision === "rejected" ? "rejected" : "pending_verification";

    const verificationStatus = decision;

    const { error: boutiqueError } = await supabase
      .from("boutiques")
      .update({ status: boutiqueStatus })
      .eq("id", boutiqueId);

    if (boutiqueError) return { ok: false, error: boutiqueError.message };

    const { error: verificationError } = await supabase
      .from("boutique_verifications")
      .update({
        status: verificationStatus,
        reviewer_id: adminId,
        notes: notes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("boutique_id", boutiqueId);

    if (verificationError) return { ok: false, error: verificationError.message };

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: `boutique_verification_${decision}`,
      entity_type: "boutique",
      entity_id: boutiqueId,
      metadata: { notes: notes ?? null },
    });

    revalidatePath("/boutiques");
    revalidatePath("/");

    if (decision === "approved") {
      await revalidateWebDiscovery();
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function decideBoutiqueModification(input: unknown): Promise<ActionResult> {
  try {
    const parsed = modificationDecisionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, adminId } = await assertAdmin();
    const { requestId, decision, notes } = parsed.data;

    const { data: request, error: requestError } = await supabase
      .from("boutique_modification_requests")
      .select("id, boutique_id, status, payload")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError || !request) {
      return { ok: false, error: "Modification request not found." };
    }

    if (request.status !== "pending") {
      return { ok: false, error: "This request has already been reviewed." };
    }

    if (decision === "approved") {
      const applyResult = await applyBoutiqueDetails(
        supabase,
        request.boutique_id,
        request.payload as BoutiqueRegistrationInput,
      );
      if (!applyResult.ok) {
        return { ok: false, error: applyResult.error };
      }
    }

    const { error: updateError } = await supabase
      .from("boutique_modification_requests")
      .update({
        status: decision,
        reviewer_id: adminId,
        admin_notes: notes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) return { ok: false, error: updateError.message };

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: `boutique_modification_${decision}`,
      entity_type: "boutique_modification_request",
      entity_id: requestId,
      metadata: { boutique_id: request.boutique_id, notes: notes ?? null },
    });

    revalidatePath("/modifications");
    revalidatePath("/boutiques");

    if (decision === "approved") {
      await revalidateWebDiscovery();
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function updateUserRole(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateUserRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, adminId } = await assertAdmin();

    const { error } = await supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.userId);

    if (error) return { ok: false, error: error.message };

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: "update_user_role",
      entity_type: "profile",
      entity_id: parsed.data.userId,
      metadata: { role: parsed.data.role },
    });

    revalidatePath("/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
