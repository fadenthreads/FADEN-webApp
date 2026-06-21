"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { writeListingPauseReason } from "@/lib/dashboard/boutique-listings";

async function assertOwnerBoutique(boutiqueId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };

  const { data: boutique, error } = await supabase
    .from("boutiques")
    .select("id, owner_id, slug, communication_prefs")
    .eq("id", boutiqueId)
    .maybeSingle();

  if (error || !boutique) return { ok: false as const, error: "Boutique not found." };
  if (boutique.owner_id !== user.id) {
    return { ok: false as const, error: "Only the boutique owner can update listings." };
  }

  return { ok: true as const, supabase, boutique };
}

function revalidateBoutiquePaths(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/boutique/${slug}`, "page");
  revalidatePath("/");
}

export async function updateBoutiqueListingSettings(input: {
  boutiqueId: string;
  pricingInfo?: string;
  avgDeliveryTime?: string;
  availability?: "open" | "closed";
  workingHours?: string;
  pauseReason?: string;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.pricingInfo !== undefined) {
    updates.pricing_info = input.pricingInfo.trim() || null;
  }
  if (input.avgDeliveryTime !== undefined) {
    updates.avg_delivery_time = input.avgDeliveryTime.trim() || null;
  }
  if (input.workingHours !== undefined) {
    updates.working_hours = input.workingHours.trim() || null;
  }
  if (input.availability !== undefined) {
    updates.availability = input.availability;
    const notice =
      input.availability === "closed" ? input.pauseReason?.trim() || null : null;
    updates.availability_notice = notice;
    updates.communication_prefs = writeListingPauseReason(
      (auth.boutique.communication_prefs as string | null) ?? null,
      notice,
    );
  } else if (input.pauseReason !== undefined) {
    const notice = input.pauseReason.trim() || null;
    updates.availability_notice = notice;
    updates.communication_prefs = writeListingPauseReason(
      (auth.boutique.communication_prefs as string | null) ?? null,
      notice,
    );
  }

  const { data, error } = await auth.supabase
    .from("boutiques")
    .update(updates)
    .eq("id", input.boutiqueId)
    .select("id, availability, slug")
    .maybeSingle();

  if (error) {
    if (/availability_notice|column|does not exist|PGRST204|42703/i.test(error.message)) {
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.availability_notice;
      const { data: fallbackData, error: fallbackError } = await auth.supabase
        .from("boutiques")
        .update(fallbackUpdates)
        .eq("id", input.boutiqueId)
        .select("id, availability, slug")
        .maybeSingle();
      if (fallbackError) return { ok: false, error: fallbackError.message };
      if (!fallbackData) {
        return {
          ok: false,
          error: "Update did not apply. Confirm you are signed in as the boutique owner.",
        };
      }
      revalidateBoutiquePaths(fallbackData.slug as string);
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  if (!data) {
    return {
      ok: false,
      error: "Update did not apply. Confirm you are signed in as the boutique owner.",
    };
  }

  revalidateBoutiquePaths(data.slug as string);
  return { ok: true };
}

export async function addBoutiqueService(input: {
  boutiqueId: string;
  label: string;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const label = input.label.trim();
  if (!label) return { ok: false, error: "Service name is required." };

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  const { error } = await auth.supabase.from("boutique_services").insert({
    boutique_id: input.boutiqueId,
    label,
  });

  if (error) return { ok: false, error: error.message };

  revalidateBoutiquePaths(auth.boutique.slug as string);
  return { ok: true };
}

export async function removeBoutiqueService(input: {
  boutiqueId: string;
  serviceId: string;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  const { error } = await auth.supabase
    .from("boutique_services")
    .delete()
    .eq("id", input.serviceId)
    .eq("boutique_id", input.boutiqueId);

  if (error) return { ok: false, error: error.message };

  revalidateBoutiquePaths(auth.boutique.slug as string);
  return { ok: true };
}
