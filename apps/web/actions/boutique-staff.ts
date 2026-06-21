"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@faden/types";
import { createBoutiqueStaffSchema, updateBoutiqueStaffSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  createBoutiqueStaffMember,
  deleteBoutiqueStaffMember,
  updateBoutiqueStaffMember,
} from "@/lib/dashboard/boutique-staff";

async function assertOwnerBoutique(boutiqueId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };

  const { data: boutique, error } = await supabase
    .from("boutiques")
    .select("id, owner_id, slug")
    .eq("id", boutiqueId)
    .maybeSingle();

  if (error || !boutique) return { ok: false as const, error: "Boutique not found." };
  if (boutique.owner_id !== user.id) {
    return { ok: false as const, error: "Only the boutique owner can manage staff." };
  }

  return { ok: true as const, supabase, boutique };
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
}

export async function addBoutiqueStaffMember(input: {
  boutiqueId: string;
  fullName: string;
  role?: string;
  phone?: string;
  email?: string;
  payAmount: string;
  payPeriod: "monthly" | "weekly" | "hourly" | "per_piece";
  notes?: string;
  gender?: "female" | "male";
  canDoHomeVisits?: boolean;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = createBoutiqueStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid staff details" };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    await createBoutiqueStaffMember(auth.supabase, input.boutiqueId, {
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone,
      email: parsed.data.email,
      payAmount: parsed.data.payAmount,
      payPeriod: parsed.data.payPeriod,
      notes: parsed.data.notes,
      gender: parsed.data.gender,
      canDoHomeVisits: parsed.data.canDoHomeVisits,
    });
    revalidateDashboard();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to add staff member" };
  }
}

export async function updateBoutiqueStaffMemberAction(input: {
  boutiqueId: string;
  id: string;
  fullName?: string;
  role?: string;
  phone?: string;
  email?: string;
  payAmount?: string;
  payPeriod?: "monthly" | "weekly" | "hourly" | "per_piece";
  notes?: string;
  isActive?: boolean;
  gender?: "female" | "male";
  canDoHomeVisits?: boolean;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = updateBoutiqueStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid staff details" };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    await updateBoutiqueStaffMember(auth.supabase, input.boutiqueId, parsed.data.id, {
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone,
      email: parsed.data.email,
      payAmount: parsed.data.payAmount,
      payPeriod: parsed.data.payPeriod,
      isActive: parsed.data.isActive,
      notes: parsed.data.notes,
      gender: parsed.data.gender,
      canDoHomeVisits: parsed.data.canDoHomeVisits,
    });
    revalidateDashboard();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update staff member" };
  }
}

export async function removeBoutiqueStaffMember(input: {
  boutiqueId: string;
  staffId: string;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    await deleteBoutiqueStaffMember(auth.supabase, input.boutiqueId, input.staffId);
    revalidateDashboard();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to remove staff member" };
  }
}
