"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@faden/types";
import {
  savedMeasurementProfileSchema,
  updateSavedMeasurementProfileSchema,
} from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  createCustomerMeasurementProfile,
  deleteCustomerMeasurementProfile,
  updateCustomerMeasurementProfile,
} from "@/lib/measurement/saved-profiles";

function revalidateAccount() {
  revalidatePath("/account");
  revalidatePath("/account/sizes");
  revalidatePath("/account/requests");
  revalidatePath("/customize");
}

export async function saveMeasurementProfile(input: {
  label: string;
  outfitType?: string;
  outfitAudience?: "women" | "men" | "kids";
  measurementUnit?: "in" | "cm";
  measurements: Record<string, string | undefined>;
}): Promise<ActionResult<{ id: string }>> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = savedMeasurementProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid size profile" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to save sizes." };

  try {
    const created = await createCustomerMeasurementProfile(supabase, user.id, parsed.data);
    revalidateAccount();
    return { ok: true, data: created };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save profile" };
  }
}

export async function updateMeasurementProfile(input: {
  id: string;
  label?: string;
  outfitType?: string;
  outfitAudience?: "women" | "men" | "kids";
  measurementUnit?: "in" | "cm";
  measurements?: Record<string, string | undefined>;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = updateSavedMeasurementProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid size profile" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to update sizes." };

  try {
    await updateCustomerMeasurementProfile(supabase, user.id, parsed.data.id, parsed.data);
    revalidateAccount();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

export async function deleteMeasurementProfile(profileId: string): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to delete sizes." };

  try {
    await deleteCustomerMeasurementProfile(supabase, user.id, profileId);
    revalidateAccount();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete profile" };
  }
}
