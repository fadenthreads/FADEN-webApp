"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@faden/types";
import {
  captureHomeVisitMeasurementsSchema,
  completeHomeVisitSchema,
  confirmHomeVisitSchema,
} from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listBoutiqueStaff } from "@/lib/dashboard/boutique-staff";
import {
  captureHomeVisitMeasurements,
  completeHomeMeasurementVisit,
  confirmHomeMeasurementVisit,
} from "@/lib/home-visits/queries";
import { createCustomerMeasurementProfile } from "@/lib/measurement/saved-profiles";
import { formatSelfMeasurementsSummary } from "@/data/measurement-fields";

async function assertOwnerBoutique(boutiqueId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };

  const { data: boutique, error } = await supabase
    .from("boutiques")
    .select("id, owner_id")
    .eq("id", boutiqueId)
    .maybeSingle();

  if (error || !boutique) return { ok: false as const, error: "Boutique not found." };
  if (boutique.owner_id !== user.id) {
    return { ok: false as const, error: "Only the boutique owner can manage home visits." };
  }

  return { ok: true as const, supabase, boutique };
}

function revalidateHomeVisitPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/account/appointments");
}

export async function confirmHomeVisit(input: {
  boutiqueId: string;
  visitId: string;
  confirmedStart: string;
  confirmedEnd: string;
  assignedStaffId?: string;
  ownerNotes?: string;
  assistantGenderPreference: "female" | "male" | "any";
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = confirmHomeVisitSchema.safeParse({
    visitId: input.visitId,
    confirmedStart: input.confirmedStart,
    confirmedEnd: input.confirmedEnd,
    assignedStaffId: input.assignedStaffId,
    ownerNotes: input.ownerNotes,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid confirmation" };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    const staff = await listBoutiqueStaff(auth.supabase, input.boutiqueId);
    await confirmHomeMeasurementVisit(auth.supabase, input.boutiqueId, input.visitId, {
      confirmedStart: parsed.data.confirmedStart,
      confirmedEnd: parsed.data.confirmedEnd,
      assignedStaffId: parsed.data.assignedStaffId,
      ownerNotes: parsed.data.ownerNotes,
      staffRoster: staff,
      assistantGenderPreference: input.assistantGenderPreference,
    });
    revalidateHomeVisitPaths();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to confirm visit" };
  }
}

export async function captureHomeVisitMeasurementsAction(input: {
  boutiqueId: string;
  visitId: string;
  measurements: Record<string, string | undefined>;
  measurementUnit: "in" | "cm";
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = captureHomeVisitMeasurementsSchema.safeParse({
    visitId: input.visitId,
    measurements: input.measurements,
    measurementUnit: input.measurementUnit,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid measurements" };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    await captureHomeVisitMeasurements(auth.supabase, input.boutiqueId, input.visitId, {
      measurements: parsed.data.measurements as import("@/data/measurement-fields").SelfMeasurements,
      measurementUnit: parsed.data.measurementUnit,
    });
    revalidateHomeVisitPaths();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save measurements" };
  }
}

export async function completeHomeVisitAction(input: {
  boutiqueId: string;
  visitId: string;
  saveToCustomerAccount?: boolean;
  savedMeasurementLabel?: string;
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = completeHomeVisitSchema.safeParse({
    visitId: input.visitId,
    saveToCustomerAccount: input.saveToCustomerAccount,
    savedMeasurementLabel: input.savedMeasurementLabel,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid request" };
  }

  const auth = await assertOwnerBoutique(input.boutiqueId);
  if (!auth.ok) return auth;

  try {
    const visit = await completeHomeMeasurementVisit(auth.supabase, input.boutiqueId, input.visitId);

    if (visit.capturedMeasurements && visit.customizationRequestId) {
      const summary = formatSelfMeasurementsSummary(
        visit.capturedMeasurements,
        visit.measurementUnit ?? "in",
      );
      const { data: request } = await auth.supabase
        .from("customization_requests")
        .select("form_payload")
        .eq("id", visit.customizationRequestId)
        .maybeSingle();

      const payload =
        request?.form_payload && typeof request.form_payload === "object"
          ? (request.form_payload as Record<string, unknown>)
          : {};

      await auth.supabase
        .from("customization_requests")
        .update({
          form_payload: {
            ...payload,
            selfMeasurements: visit.capturedMeasurements,
            measurementUnit: visit.measurementUnit ?? "in",
            measurements: summary,
            homeVisitCompleted: true,
          },
        })
        .eq("id", visit.customizationRequestId);
    }

    if (parsed.data.saveToCustomerAccount && visit.capturedMeasurements) {
      await createCustomerMeasurementProfile(auth.supabase, visit.customerId, {
        label: parsed.data.savedMeasurementLabel?.trim() || "Home visit measurements",
        measurementUnit: visit.measurementUnit ?? "in",
        measurements: visit.capturedMeasurements,
      });
    }

    revalidateHomeVisitPaths();
    revalidatePath("/account/sizes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to complete visit" };
  }
}
