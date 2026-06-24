import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlterationRequestInput } from "@faden/validators";
import { listVerifiedBoutiquesForDiscovery } from "@/lib/boutique/queries";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import type { GeoPoint } from "@/lib/location/geo";

const ALTERATION_KEYWORDS = ["alteration", "alterations", "fitting", "hem", "stitch"];

export interface MatchedAlterationBoutique {
  id: string;
  name: string;
  slug: string;
  distanceKm: number | null;
}

async function boutiqueIdForSlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data } = await supabase.from("boutiques").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function boutiqueOffersAlterations(supabase: SupabaseClient, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("boutiques")
    .select("id, boutique_services ( label )")
    .eq("slug", slug)
    .maybeSingle();

  const labels = ((data?.boutique_services as { label: string }[] | null) ?? []).map((s) =>
    s.label.toLowerCase(),
  );

  if (labels.some((label) => ALTERATION_KEYWORDS.some((keyword) => label.includes(keyword)))) {
    return true;
  }

  // Default: verified boutiques can take alterations unless explicitly closed
  return Boolean(data?.id);
}

export async function findNearestAlterationBoutique(
  supabase: SupabaseClient,
  customer: GeoPoint | null,
): Promise<MatchedAlterationBoutique | null> {
  const boutiques = await listVerifiedBoutiquesForDiscovery(supabase, {
    customerLat: customer?.lat,
    customerLng: customer?.lng,
    maxDistanceKm: 25,
  });

  const open = boutiques.filter((b) => b.availability !== "closed");
  const sorted = [...open].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  for (const candidate of sorted) {
    const offers = await boutiqueOffersAlterations(supabase, candidate.slug);
    if (!offers) continue;

    const id = await boutiqueIdForSlug(supabase, candidate.slug);
    if (!id) continue;

    return {
      id,
      name: candidate.name,
      slug: candidate.slug,
      distanceKm: candidate.distanceKm ?? null,
    };
  }

  return null;
}

export function findMockAlterationBoutique(customer: GeoPoint | null): MatchedAlterationBoutique | null {
  const boutiques = getBoutiquesForDiscovery({
    customerLat: customer?.lat,
    customerLng: customer?.lng,
    maxDistanceKm: 25,
  });

  const match = boutiques[0];
  if (!match) return null;

  return {
    id: match.slug,
    name: match.name,
    slug: match.slug,
    distanceKm: match.distanceKm ?? null,
  };
}

export async function createAlterationRequest(
  supabase: SupabaseClient,
  customerId: string,
  input: AlterationRequestInput,
  boutique: MatchedAlterationBoutique | null,
) {
  const boutiqueId =
    boutique && !boutique.id.includes("-") && boutique.id.length > 20 ? boutique.id : null;

  const { data, error } = await supabase
    .from("alteration_requests")
    .insert({
      customer_id: customerId,
      boutique_id: boutiqueId,
      alteration_type: input.alterationType,
      urgency_hours: input.urgencyHours,
      home_service_ok: input.homeServiceOk,
      home_address: input.homeAddress ?? null,
      home_lat: input.homeLat ?? null,
      home_lng: input.homeLng ?? null,
      photo_urls: input.photoUrls,
      notes: input.notes ?? null,
      customer_lat: input.customerLat ?? null,
      customer_lng: input.customerLng ?? null,
      status: boutiqueId ? "assigned" : "requested",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export type AlterationRequestStatus =
  | "requested"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AlterationRequestSummary {
  id: string;
  customerId: string;
  boutiqueId: string | null;
  alterationType: string;
  urgencyHours: number;
  homeServiceOk: boolean;
  homeAddress: string | null;
  photoUrls: string[];
  notes: string | null;
  status: AlterationRequestStatus;
  createdAt: string;
  updatedAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  boutiqueName?: string | null;
  boutiqueSlug?: string | null;
}

export const ALTERATIONS_SETUP_MESSAGE =
  "Alteration requests are not enabled on the database yet. Run migration 026_alteration_requests.sql in the Supabase SQL editor.";

function isAlterationsSchemaError(message: string): boolean {
  return /could not find the table|schema cache|does not exist|PGRST204|PGRST205|42703|42P01|alteration_requests/i.test(
    message,
  );
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) return (value[0] as T | undefined) ?? null;
  return (value as T | null) ?? null;
}

function mapAlterationRow(row: Record<string, unknown>): AlterationRequestSummary {
  const customer = readNestedRecord<{ full_name: string | null; email: string }>(row.profiles);
  const boutique = readNestedRecord<{ name: string; slug: string }>(row.boutiques);

  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    boutiqueId: (row.boutique_id as string | null) ?? null,
    alterationType: row.alteration_type as string,
    urgencyHours: row.urgency_hours as number,
    homeServiceOk: Boolean(row.home_service_ok),
    homeAddress: (row.home_address as string | null) ?? null,
    photoUrls: Array.isArray(row.photo_urls) ? (row.photo_urls as string[]) : [],
    notes: (row.notes as string | null) ?? null,
    status: row.status as AlterationRequestStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    customerName: customer?.full_name ?? null,
    customerEmail: customer?.email ?? null,
    boutiqueName: boutique?.name ?? null,
    boutiqueSlug: boutique?.slug ?? null,
  };
}

const ALTERATION_SELECT = `
  *,
  profiles ( full_name, email ),
  boutiques ( name, slug )
`;

export async function listBoutiqueAlterationRequests(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<AlterationRequestSummary[]> {
  const { data, error } = await supabase
    .from("alteration_requests")
    .select(ALTERATION_SELECT)
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isAlterationsSchemaError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapAlterationRow(row as Record<string, unknown>));
}

export async function listCustomerAlterationRequests(
  supabase: SupabaseClient,
  customerId: string,
): Promise<AlterationRequestSummary[]> {
  const { data, error } = await supabase
    .from("alteration_requests")
    .select(ALTERATION_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isAlterationsSchemaError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapAlterationRow(row as Record<string, unknown>));
}

export async function updateAlterationRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: AlterationRequestStatus,
): Promise<void> {
  const { error } = await supabase
    .from("alteration_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}
