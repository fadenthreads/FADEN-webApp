"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@faden/types";
import { captureHomeVisitMeasurementsSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { formatSelfMeasurementsSummary } from "@/data/measurement-fields";

async function assertOwnerRequest(boutiqueId: string, requestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, owner_id")
    .eq("id", boutiqueId)
    .maybeSingle();

  if (boutiqueError || !boutique || boutique.owner_id !== user.id) {
    return { ok: false as const, error: "Only the boutique owner can update measurements." };
  }

  const { data: request, error: requestError } = await supabase
    .from("customization_requests")
    .select("id, form_payload")
    .eq("id", requestId)
    .eq("boutique_id", boutiqueId)
    .maybeSingle();

  if (requestError || !request) {
    return { ok: false as const, error: "Request not found." };
  }

  return { ok: true as const, supabase, request };
}

export async function captureRequestMeasurementsAction(input: {
  boutiqueId: string;
  requestId: string;
  measurements: Record<string, string | undefined>;
  measurementUnit: "in" | "cm";
}): Promise<ActionResult> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const parsed = captureHomeVisitMeasurementsSchema.safeParse({
    visitId: input.requestId,
    measurements: input.measurements,
    measurementUnit: input.measurementUnit,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid measurements" };
  }

  const auth = await assertOwnerRequest(input.boutiqueId, input.requestId);
  if (!auth.ok) return auth;

  const payload =
    auth.request.form_payload && typeof auth.request.form_payload === "object"
      ? (auth.request.form_payload as Record<string, unknown>)
      : {};

  const summary = formatSelfMeasurementsSummary(
    parsed.data.measurements as import("@/data/measurement-fields").SelfMeasurements,
    parsed.data.measurementUnit,
  );

  const { error } = await auth.supabase
    .from("customization_requests")
    .update({
      form_payload: {
        ...payload,
        selfMeasurements: parsed.data.measurements,
        measurementUnit: parsed.data.measurementUnit,
        measurements: summary,
        sessionMeasurementsCaptured: true,
      },
    })
    .eq("id", input.requestId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/requests/${input.requestId}`);
  revalidatePath("/account/requests");
  revalidatePath(`/account/requests/${input.requestId}`);

  return { ok: true };
}
