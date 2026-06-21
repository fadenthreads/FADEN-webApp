import type { SupabaseClient } from "@supabase/supabase-js";
import {
  customizationRequestSchema,
  splitList,
  type CustomizationRequestInput,
} from "@faden/validators";
import type { ActionResult } from "@faden/types";
import type { BoutiqueMatch } from "@/lib/boutique/matching";
import { createOrderForCustomizationRequest } from "@/lib/customization/create-order-for-request";

const MAX_MULTI_BOUTIQUES = 5;

import {
  EMPTY_SELF_MEASUREMENTS,
  formatSelfMeasurementsSummary,
} from "@/data/measurement-fields";
import { getCustomerMeasurementProfile } from "@/lib/measurement/saved-profiles";
import { createCustomerMeasurementProfile } from "@/lib/measurement/saved-profiles";
import {
  combineDateAndTime,
  createHomeMeasurementVisit,
  isHomeVisitsAvailable,
} from "@/lib/home-visits/queries";

function buildFormPayload(
  data: CustomizationRequestInput,
  matchedBoutiques: BoutiqueMatch[] = [],
  extra?: Record<string, unknown>,
) {
  const selfMeasurementSummary =
    data.measurementMode === "self" && data.selfMeasurements
      ? formatSelfMeasurementsSummary(
          { ...EMPTY_SELF_MEASUREMENTS, ...data.selfMeasurements },
          data.measurementUnit === "cm" ? "cm" : "in",
        )
      : "";

  return {
    flowOrder: data.flowOrder,
    outfitAudience: data.outfitAudience,
    sketchNotes: data.sketchNotes ?? "",
    mixOutfitNotes: data.mixOutfitNotes ?? "",
    mixOutfitLinks: data.mixOutfitLinks ?? "",
    mixOutfitImages: data.mixOutfitImages ?? [],
    fabricTypes: data.fabricTypes ?? "",
    fabricColors: data.fabricColors ?? "",
    colorCount: data.colorCount ?? "",
    measurementAssistantGender: data.measurementAssistantGender ?? "any",
    homeVisitNotes: data.homeVisitNotes ?? "",
    homeVisitLocationLabel: data.homeVisitLocationLabel ?? "",
    homeVisitLat: data.homeVisitLat ?? null,
    homeVisitLng: data.homeVisitLng ?? null,
    homeVisitDate: data.homeVisitDate ?? "",
    homeVisitTime: data.homeVisitTime ?? "",
    savedMeasurementProfileId: data.savedMeasurementProfileId ?? "",
    videoSessionDate: data.videoSessionDate ?? "",
    videoSessionTime: data.videoSessionTime ?? "",
    videoSessionNotes: data.videoSessionNotes ?? "",
    measurementUnit: data.measurementUnit ?? "in",
    selfMeasurements: data.selfMeasurements ?? {},
    measurements:
      selfMeasurementSummary ||
      data.measurements ||
      (data.measurementMode === "video" && data.videoSessionDate
        ? `Video session requested: ${data.videoSessionDate}${data.videoSessionTime ? ` ${data.videoSessionTime}` : ""}`
        : ""),
    neckDesign: data.neckDesign ?? "",
    neckDesignImages: data.neckDesignImages ?? [],
    sleeveDesign: data.sleeveDesign ?? "",
    sleeveDesignImages: data.sleeveDesignImages ?? [],
    backDesign: data.backDesign ?? "",
    backDesignImages: data.backDesignImages ?? [],
    embroideryDetails: data.embroideryDetails ?? "",
    embroideryDetailImages: data.embroideryDetailImages ?? [],
    budgetRange: data.budgetRange ?? "",
    specialRequests: data.specialRequests ?? "",
    specialRequestImages: data.specialRequestImages ?? [],
    selectedBoutiqueSlug: data.selectedBoutiqueSlug ?? "",
    matchedBoutiques,
    ...extra,
  };
}

async function insertRequestForBoutique(
  supabase: SupabaseClient,
  customerId: string,
  data: CustomizationRequestInput,
  boutiqueId: string,
  matchedBoutiques: BoutiqueMatch[],
  extraPayload?: Record<string, unknown>,
) {
  const { data: request, error: requestError } = await supabase
    .from("customization_requests")
    .insert({
      customer_id: customerId,
      boutique_id: boutiqueId,
      status: "submitted",
      outfit_type: data.outfitType,
      outfit_audience: data.outfitAudience,
      outfit_description: data.outfitDescription || null,
      occasion: data.occasion || null,
      fabric_source: data.fabricSource,
      measurement_mode: data.measurementMode,
      delivery_date: data.deliveryDate || null,
      form_payload: buildFormPayload(data, matchedBoutiques, extraPayload),
    })
    .select("id")
    .single();

  if (requestError || !request) {
    return { error: requestError?.message ?? "Failed to save request" } as const;
  }

  const generalLinks = splitList(data.inspirationLinks).filter((url) => url.startsWith("http"));
  const mixLinks = splitList(data.mixOutfitLinks ?? "").filter((url) => url.startsWith("http"));
  const inspirationRows = [
    ...generalLinks.map((url, index) => ({
      request_id: request.id,
      url,
      notes: null as string | null,
      sort_order: index,
    })),
    ...mixLinks.map((url, index) => ({
      request_id: request.id,
      url,
      notes: "mix-outfit",
      sort_order: generalLinks.length + index,
    })),
  ];

  if (inspirationRows.length) {
    const { error: inspirationError } = await supabase
      .from("customization_inspirations")
      .insert(inspirationRows);

    if (inspirationError) return { error: inspirationError.message } as const;
  }

  const created = await createOrderForCustomizationRequest(supabase, {
    customerId,
    boutiqueId,
    requestId: request.id,
    outfitType: data.outfitType,
    outfitAudience: data.outfitAudience,
    occasion: data.occasion,
    budgetRange: data.budgetRange,
    deliveryDate: data.deliveryDate,
  });

  if ("error" in created) return { error: created.error } as const;

  return {
    requestId: request.id,
    orderId: created.orderId,
    conversationId: created.conversationId,
  } as const;
}

async function applyPostSubmitMeasurementExtras(
  supabase: SupabaseClient,
  customerId: string,
  boutiqueId: string,
  requestId: string,
  data: CustomizationRequestInput,
) {
  if (data.savedMeasurementProfileId) {
    const profile = await getCustomerMeasurementProfile(
      supabase,
      customerId,
      data.savedMeasurementProfileId,
    );
    if (profile) {
      const summary = formatSelfMeasurementsSummary(profile.measurements, profile.measurementUnit);
      const { data: request } = await supabase
        .from("customization_requests")
        .select("form_payload")
        .eq("id", requestId)
        .maybeSingle();
      const payload =
        request?.form_payload && typeof request.form_payload === "object"
          ? (request.form_payload as Record<string, unknown>)
          : {};
      await supabase
        .from("customization_requests")
        .update({
          form_payload: {
            ...payload,
            selfMeasurements: profile.measurements,
            measurementUnit: profile.measurementUnit,
            measurements: summary,
            savedMeasurementProfileId: profile.id,
            savedMeasurementLabel: profile.label,
          },
        })
        .eq("id", requestId);
    }
  }

  if (
    data.measurementMode === "self" &&
    data.saveMeasurementToAccount &&
    data.savedMeasurementLabel?.trim() &&
    data.selfMeasurements
  ) {
    await createCustomerMeasurementProfile(supabase, customerId, {
      label: data.savedMeasurementLabel.trim(),
      outfitType: data.outfitType,
      outfitAudience: data.outfitAudience,
      measurementUnit: data.measurementUnit === "cm" ? "cm" : "in",
      measurements: { ...EMPTY_SELF_MEASUREMENTS, ...data.selfMeasurements },
    }).catch(() => undefined);
  }

  if (data.measurementMode === "home") {
    const visitsAvailable = await isHomeVisitsAvailable(supabase);
    if (!visitsAvailable) return;

    const slot =
      combineDateAndTime(data.homeVisitDate ?? "", data.homeVisitTime ?? "") ??
      (() => {
        const start = new Date();
        start.setDate(start.getDate() + 2);
        start.setHours(10, 0, 0, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return { start: start.toISOString(), end: end.toISOString() };
      })();

    await createHomeMeasurementVisit(supabase, {
      customerId,
      boutiqueId,
      customizationRequestId: requestId,
      requestedStart: slot.start,
      requestedEnd: slot.end,
      visitAddress: formatHomeVisitAddress(data),
      visitLatitude: data.homeVisitLat ?? null,
      visitLongitude: data.homeVisitLng ?? null,
      assistantGenderPreference: data.measurementAssistantGender ?? "any",
    }).catch(() => undefined);
  }
}

function formatHomeVisitAddress(data: CustomizationRequestInput): string | undefined {
  const parts = [data.homeVisitLocationLabel, data.homeVisitNotes]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length ? parts.join("\n") : data.homeVisitNotes?.trim() || undefined;
}

async function resolveVerifiedBoutiqueIds(
  supabase: SupabaseClient,
  slugs: string[],
): Promise<{ ids: string[]; error?: string }> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (!unique.length) return { ids: [], error: "Select at least one boutique." };

  const { data, error } = await supabase
    .from("boutiques")
    .select("id, slug")
    .in("slug", unique)
    .eq("status", "verified");

  if (error) return { ids: [], error: error.message };

  const found = data ?? [];
  if (found.length !== unique.length) {
    return { ids: [], error: "One or more selected boutiques are not available." };
  }

  return { ids: found.map((row) => row.id as string) };
}

export async function submitCustomizationRequest(
  supabase: SupabaseClient,
  customerId: string,
  input: CustomizationRequestInput,
): Promise<
  ActionResult<{
    requestId: string;
    orderId?: string;
    conversationId?: string;
  }>
> {
  const parsed = customizationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid customization data" };
  }

  const data = parsed.data;

  if (!data.selectedBoutiqueSlug?.trim()) {
    return {
      ok: false,
      error: "Select a boutique from suggested matches before submitting.",
    };
  }

  const slug = data.selectedBoutiqueSlug.trim();
  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id")
    .eq("slug", slug)
    .eq("status", "verified")
    .maybeSingle();

  if (boutiqueError) return { ok: false, error: boutiqueError.message };
  if (!boutique) {
    return { ok: false, error: "Selected boutique is not available. Pick another match." };
  }

  const boutiqueId = boutique.id;
  const matchedBoutiques: BoutiqueMatch[] =
    (input as CustomizationRequestInput & { previewMatches?: BoutiqueMatch[] }).previewMatches ??
    [];

  const result = await insertRequestForBoutique(
    supabase,
    customerId,
    data,
    boutiqueId,
    matchedBoutiques,
  );

  if ("error" in result) return { ok: false, error: result.error };

  await applyPostSubmitMeasurementExtras(supabase, customerId, boutiqueId, result.requestId, data);

  return {
    ok: true,
    data: {
      requestId: result.requestId,
      orderId: result.orderId,
      conversationId: result.conversationId,
    },
  };
}

export async function submitCustomizationToMultipleBoutiques(
  supabase: SupabaseClient,
  customerId: string,
  input: CustomizationRequestInput,
  slugs: string[],
): Promise<
  ActionResult<{
    requestIds: string[];
    orderIds: string[];
    boutiqueCount: number;
  }>
> {
  const parsed = customizationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid customization data" };
  }

  const data = parsed.data;
  const limited = slugs.slice(0, MAX_MULTI_BOUTIQUES);
  const resolved = await resolveVerifiedBoutiqueIds(supabase, limited);
  if (resolved.error) return { ok: false, error: resolved.error };

  const matchedBoutiques: BoutiqueMatch[] =
    (input as CustomizationRequestInput & { previewMatches?: BoutiqueMatch[] }).previewMatches ??
    [];

  const batchId = crypto.randomUUID();
  const requestIds: string[] = [];
  const orderIds: string[] = [];

  for (const boutiqueId of resolved.ids) {
    const result = await insertRequestForBoutique(
      supabase,
      customerId,
      data,
      boutiqueId,
      matchedBoutiques,
      { quoteBatchId: batchId, multiQuote: true },
    );

    if ("error" in result) return { ok: false, error: result.error };

    requestIds.push(result.requestId);
    orderIds.push(result.orderId);
  }

  return {
    ok: true,
    data: {
      requestIds,
      orderIds,
      boutiqueCount: resolved.ids.length,
    },
  };
}

export async function connectRequestToBoutique(
  supabase: SupabaseClient,
  customerId: string,
  requestId: string,
  boutiqueSlug: string,
): Promise<ActionResult<{ orderId: string; conversationId: string }>> {
  const { data: request, error: requestError } = await supabase
    .from("customization_requests")
    .select("id, customer_id, boutique_id, status, outfit_type, occasion, delivery_date, form_payload")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) return { ok: false, error: "Request not found." };
  if (request.customer_id !== customerId) {
    return { ok: false, error: "You can only connect your own requests." };
  }
  if (request.boutique_id) {
    return { ok: false, error: "This request is already linked to a boutique." };
  }
  if (request.status === "cancelled") {
    return { ok: false, error: "This request was cancelled." };
  }

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, slug")
    .eq("slug", boutiqueSlug.trim())
    .eq("status", "verified")
    .maybeSingle();

  if (boutiqueError || !boutique) {
    return { ok: false, error: "Boutique not found or not verified." };
  }

  const payload = request.form_payload as { matchedBoutiques?: BoutiqueMatch[] } | null;
  const allowed = payload?.matchedBoutiques?.some((match) => match.slug === boutique.slug);
  if (!allowed) {
    return { ok: false, error: "This boutique is not in your suggested matches." };
  }

  const { error: updateError } = await supabase
    .from("customization_requests")
    .update({ boutique_id: boutique.id })
    .eq("id", requestId);

  if (updateError) return { ok: false, error: updateError.message };

  const budgetRange =
    typeof payload === "object" && payload && "budgetRange" in payload
      ? String((payload as { budgetRange?: string }).budgetRange ?? "")
      : "";

  const created = await createOrderForCustomizationRequest(supabase, {
    customerId,
    boutiqueId: boutique.id,
    requestId,
    outfitType: request.outfit_type ?? "Custom outfit",
    occasion: request.occasion,
    budgetRange: budgetRange || null,
    deliveryDate: request.delivery_date,
  });

  if ("error" in created) {
    return { ok: false, error: created.error };
  }

  return {
    ok: true,
    data: {
      orderId: created.orderId,
      conversationId: created.conversationId,
    },
  };
}
