import type { SupabaseClient } from "@supabase/supabase-js";
import type { MeasurementAssistantGender, MeasurementUnit, SelfMeasurements } from "@/data/measurement-fields";
import { EMPTY_SELF_MEASUREMENTS } from "@/data/measurement-fields";
import type { OwnerStaffMember } from "@/lib/dashboard/boutique-staff";
import { pickStaffForHomeVisit } from "@/lib/home-visits/staff-assignment";

export type HomeVisitStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface HomeMeasurementVisit {
  id: string;
  customerId: string;
  boutiqueId: string;
  customizationRequestId: string | null;
  requestedStart: string;
  requestedEnd: string;
  confirmedStart: string | null;
  confirmedEnd: string | null;
  visitAddress: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;
  assistantGenderPreference: MeasurementAssistantGender;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  status: HomeVisitStatus;
  ownerNotes: string | null;
  capturedMeasurements: SelfMeasurements | null;
  measurementUnit: MeasurementUnit | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  boutiqueName?: string | null;
  boutiqueSlug?: string | null;
}

export const HOME_VISITS_SETUP_MESSAGE =
  "Home measurement visits are not enabled on the database yet. Run migration 023_measurements_and_home_visits.sql in the Supabase SQL editor.";

function isSchemaMismatchError(message: string): boolean {
  return /could not find the table|schema cache|does not exist|PGRST204|PGRST205|42703|42P01|home_measurement_visits/i.test(
    message,
  );
}

function normalizeMeasurements(raw: unknown): SelfMeasurements {
  const source = raw && typeof raw === "object" ? (raw as Record<string, string>) : {};
  return { ...EMPTY_SELF_MEASUREMENTS, ...source };
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) return (value[0] as T | undefined) ?? null;
  return (value as T | null) ?? null;
}

function mapVisitRow(row: Record<string, unknown>): HomeMeasurementVisit {
  const staff = readNestedRecord<{ full_name: string }>(row.boutique_staff);
  const customer = readNestedRecord<{ full_name: string | null; email: string }>(row.profiles);
  const boutique = readNestedRecord<{ name: string; slug: string }>(row.boutiques);

  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    boutiqueId: row.boutique_id as string,
    customizationRequestId: (row.customization_request_id as string | null) ?? null,
    requestedStart: row.requested_start as string,
    requestedEnd: row.requested_end as string,
    confirmedStart: (row.confirmed_start as string | null) ?? null,
    confirmedEnd: (row.confirmed_end as string | null) ?? null,
    visitAddress: (row.visit_address as string | null) ?? null,
    visitLatitude: (row.visit_latitude as number | null) ?? null,
    visitLongitude: (row.visit_longitude as number | null) ?? null,
    assistantGenderPreference:
      row.assistant_gender_preference === "female" || row.assistant_gender_preference === "male"
        ? row.assistant_gender_preference
        : "any",
    assignedStaffId: (row.assigned_staff_id as string | null) ?? null,
    assignedStaffName: staff?.full_name ?? null,
    status: row.status as HomeVisitStatus,
    ownerNotes: (row.owner_notes as string | null) ?? null,
    capturedMeasurements: row.captured_measurements
      ? normalizeMeasurements(row.captured_measurements)
      : null,
    measurementUnit: row.measurement_unit === "cm" ? "cm" : row.measurement_unit === "in" ? "in" : null,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    customerName: customer?.full_name ?? null,
    customerEmail: customer?.email ?? null,
    boutiqueName: boutique?.name ?? null,
    boutiqueSlug: boutique?.slug ?? null,
  };
}

const VISIT_SELECT = `
  *,
  profiles ( full_name, email ),
  boutiques ( name, slug ),
  boutique_staff ( full_name )
`;

export async function isHomeVisitsAvailable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("home_measurement_visits").select("id").limit(1);
  if (!error) return true;
  return !isSchemaMismatchError(error.message);
}

export async function createHomeMeasurementVisit(
  supabase: SupabaseClient,
  input: {
    customerId: string;
    boutiqueId: string;
    customizationRequestId?: string;
    requestedStart: string;
    requestedEnd: string;
    visitAddress?: string;
    visitLatitude?: number | null;
    visitLongitude?: number | null;
    assistantGenderPreference: MeasurementAssistantGender;
  },
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .insert({
      customer_id: input.customerId,
      boutique_id: input.boutiqueId,
      customization_request_id: input.customizationRequestId ?? null,
      requested_start: input.requestedStart,
      requested_end: input.requestedEnd,
      visit_address: input.visitAddress?.trim() || null,
      visit_latitude: input.visitLatitude ?? null,
      visit_longitude: input.visitLongitude ?? null,
      assistant_gender_preference: input.assistantGenderPreference,
      status: "requested",
    })
    .select("id")
    .single();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(HOME_VISITS_SETUP_MESSAGE);
    throw new Error(error.message);
  }

  return { id: data.id as string };
}

export async function listCustomerHomeVisits(
  supabase: SupabaseClient,
  customerId: string,
): Promise<HomeMeasurementVisit[]> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .select(VISIT_SELECT)
    .eq("customer_id", customerId)
    .order("requested_start", { ascending: false });

  if (error) {
    if (isSchemaMismatchError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapVisitRow(row as Record<string, unknown>));
}

export async function listBoutiqueHomeVisits(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<HomeMeasurementVisit[]> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .select(VISIT_SELECT)
    .eq("boutique_id", boutiqueId)
    .order("requested_start", { ascending: true });

  if (error) {
    if (isSchemaMismatchError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapVisitRow(row as Record<string, unknown>));
}

export async function getHomeVisitByRequestId(
  supabase: SupabaseClient,
  requestId: string,
): Promise<HomeMeasurementVisit | null> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .select(VISIT_SELECT)
    .eq("customization_request_id", requestId)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) return null;
    throw new Error(error.message);
  }

  return data ? mapVisitRow(data as Record<string, unknown>) : null;
}

export async function confirmHomeMeasurementVisit(
  supabase: SupabaseClient,
  boutiqueId: string,
  visitId: string,
  input: {
    confirmedStart: string;
    confirmedEnd: string;
    assignedStaffId?: string;
    ownerNotes?: string;
    staffRoster: OwnerStaffMember[];
    assistantGenderPreference: MeasurementAssistantGender;
  },
): Promise<void> {
  let assignedStaffId = input.assignedStaffId ?? null;
  if (!assignedStaffId) {
    const suggested = pickStaffForHomeVisit(input.staffRoster, input.assistantGenderPreference);
    assignedStaffId = suggested?.id ?? null;
  }

  const { data, error } = await supabase
    .from("home_measurement_visits")
    .update({
      status: "confirmed",
      confirmed_start: input.confirmedStart,
      confirmed_end: input.confirmedEnd,
      assigned_staff_id: assignedStaffId,
      owner_notes: input.ownerNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("boutique_id", boutiqueId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(HOME_VISITS_SETUP_MESSAGE);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Home visit not found");
}

export async function captureHomeVisitMeasurements(
  supabase: SupabaseClient,
  boutiqueId: string,
  visitId: string,
  input: { measurements: SelfMeasurements; measurementUnit: MeasurementUnit },
): Promise<void> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .update({
      captured_measurements: input.measurements,
      measurement_unit: input.measurementUnit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("boutique_id", boutiqueId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(HOME_VISITS_SETUP_MESSAGE);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Home visit not found");
}

export async function completeHomeMeasurementVisit(
  supabase: SupabaseClient,
  boutiqueId: string,
  visitId: string,
): Promise<HomeMeasurementVisit> {
  const { data, error } = await supabase
    .from("home_measurement_visits")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("boutique_id", boutiqueId)
    .select(VISIT_SELECT)
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(HOME_VISITS_SETUP_MESSAGE);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Home visit not found");

  return mapVisitRow(data as Record<string, unknown>);
}

export function combineDateAndTime(date: string, time: string): { start: string; end: string } | null {
  if (!date.trim() || !time.trim()) return null;
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatHomeVisitWhen(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime())) return "—";
  const datePart = startDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = startDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = Number.isNaN(endDate.getTime())
    ? ""
    : endDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return endTime ? `${datePart} · ${startTime} – ${endTime}` : `${datePart} · ${startTime}`;
}
