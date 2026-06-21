import type { SupabaseClient } from "@supabase/supabase-js";

export interface OwnerListingSettings {
  boutiqueId: string;
  pricingInfo: string | null;
  avgDeliveryTime: string | null;
  availability: "open" | "closed";
  workingHours: string | null;
  pauseReason: string | null;
  services: { id: string; label: string }[];
  outfitTypes: { id: string; label: string }[];
}

const PAUSE_META_PREFIX = "__faden_listing__:";

export function readListingPauseReason(communicationPrefs: string | null): string | null {
  if (!communicationPrefs?.startsWith(PAUSE_META_PREFIX)) return null;
  try {
    const parsed = JSON.parse(communicationPrefs.slice(PAUSE_META_PREFIX.length)) as {
      pauseReason?: string;
    };
    return parsed.pauseReason?.trim() || null;
  } catch {
    return null;
  }
}

export function readAvailabilityNotice(row: {
  availability_notice?: string | null;
  communication_prefs?: string | null;
}): string | null {
  const direct = row.availability_notice?.trim();
  if (direct) return direct;
  return readListingPauseReason(row.communication_prefs ?? null);
}

export function writeListingPauseReason(
  existingPrefs: string | null,
  pauseReason: string | null,
): string | null {
  const trimmed = pauseReason?.trim() || null;
  if (!trimmed) {
    if (existingPrefs?.startsWith(PAUSE_META_PREFIX)) return null;
    return existingPrefs;
  }
  return `${PAUSE_META_PREFIX}${JSON.stringify({ pauseReason: trimmed })}`;
}

export async function getOwnerListingSettings(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OwnerListingSettings | null> {
  const selects = [
    `
      id,
      pricing_info,
      avg_delivery_time,
      availability,
      availability_notice,
      working_hours,
      communication_prefs,
      boutique_services ( id, label ),
      boutique_outfit_types ( id, label )
    `,
    `
      id,
      pricing_info,
      avg_delivery_time,
      availability,
      working_hours,
      communication_prefs,
      boutique_services ( id, label ),
      boutique_outfit_types ( id, label )
    `,
  ];

  let data: Record<string, unknown> | null = null;
  for (const select of selects) {
    const result = await supabase.from("boutiques").select(select).eq("id", boutiqueId).maybeSingle();
    if (!result.error && result.data) {
      data = result.data as unknown as Record<string, unknown>;
      break;
    }
    if (result.error && !/availability_notice|column|does not exist|PGRST204|42703/i.test(result.error.message)) {
      throw new Error(result.error.message);
    }
  }

  if (!data) return null;

  const services = (Array.isArray(data.boutique_services)
    ? data.boutique_services
    : data.boutique_services
      ? [data.boutique_services]
      : []) as { id: string; label: string }[];

  const outfitTypes = (Array.isArray(data.boutique_outfit_types)
    ? data.boutique_outfit_types
    : data.boutique_outfit_types
      ? [data.boutique_outfit_types]
      : []) as { id: string; label: string }[];

  return {
    boutiqueId: data.id as string,
    pricingInfo: (data.pricing_info as string | null) ?? null,
    avgDeliveryTime: (data.avg_delivery_time as string | null) ?? null,
    availability: (data.availability as "open" | "closed") ?? "open",
    workingHours: (data.working_hours as string | null) ?? null,
    pauseReason: readAvailabilityNotice({
      availability_notice: (data.availability_notice as string | null | undefined) ?? null,
      communication_prefs: (data.communication_prefs as string | null) ?? null,
    }),
    services: services.map((row) => ({ id: row.id, label: row.label })),
    outfitTypes: outfitTypes.map((row) => ({ id: row.id, label: row.label })),
  };
}
