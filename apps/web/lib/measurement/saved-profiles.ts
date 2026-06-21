import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedMeasurementProfileInput } from "@faden/validators";
import {
  EMPTY_SELF_MEASUREMENTS,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";

export interface SavedMeasurementProfile {
  id: string;
  customerId: string;
  label: string;
  outfitType: string | null;
  outfitAudience: "women" | "men" | "kids" | null;
  measurementUnit: MeasurementUnit;
  measurements: SelfMeasurements;
  createdAt: string;
  updatedAt: string;
}

export const SAVED_PROFILES_SETUP_MESSAGE =
  "Saved sizes are not enabled on the database yet. Run migration 023_measurements_and_home_visits.sql in the Supabase SQL editor.";

function isSchemaMismatchError(message: string): boolean {
  return /could not find the table|schema cache|does not exist|PGRST204|PGRST205|42703|42P01|customer_measurement_profiles/i.test(
    message,
  );
}

function normalizeMeasurements(raw: unknown): SelfMeasurements {
  const source = raw && typeof raw === "object" ? (raw as Record<string, string>) : {};
  return { ...EMPTY_SELF_MEASUREMENTS, ...source };
}

function mapProfileRow(row: Record<string, unknown>): SavedMeasurementProfile {
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    label: row.label as string,
    outfitType: (row.outfit_type as string | null) ?? null,
    outfitAudience:
      row.outfit_audience === "women" || row.outfit_audience === "men" || row.outfit_audience === "kids"
        ? row.outfit_audience
        : null,
    measurementUnit: row.measurement_unit === "cm" ? "cm" : "in",
    measurements: normalizeMeasurements(row.measurements),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function isSavedProfilesAvailable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("customer_measurement_profiles").select("id").limit(1);
  if (!error) return true;
  return !isSchemaMismatchError(error.message);
}

export async function listCustomerMeasurementProfiles(
  supabase: SupabaseClient,
  customerId: string,
): Promise<SavedMeasurementProfile[]> {
  const { data, error } = await supabase
    .from("customer_measurement_profiles")
    .select("*")
    .eq("customer_id", customerId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isSchemaMismatchError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapProfileRow(row as Record<string, unknown>));
}

export async function getCustomerMeasurementProfile(
  supabase: SupabaseClient,
  customerId: string,
  profileId: string,
): Promise<SavedMeasurementProfile | null> {
  const { data, error } = await supabase
    .from("customer_measurement_profiles")
    .select("*")
    .eq("customer_id", customerId)
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) return null;
    throw new Error(error.message);
  }

  return data ? mapProfileRow(data as Record<string, unknown>) : null;
}

export async function createCustomerMeasurementProfile(
  supabase: SupabaseClient,
  customerId: string,
  input: SavedMeasurementProfileInput,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("customer_measurement_profiles")
    .insert({
      customer_id: customerId,
      label: input.label.trim(),
      outfit_type: input.outfitType?.trim() || null,
      outfit_audience: input.outfitAudience ?? null,
      measurement_unit: input.measurementUnit ?? "in",
      measurements: input.measurements ?? {},
    })
    .select("id")
    .single();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(SAVED_PROFILES_SETUP_MESSAGE);
    throw new Error(error.message);
  }

  return { id: data.id as string };
}

export async function updateCustomerMeasurementProfile(
  supabase: SupabaseClient,
  customerId: string,
  profileId: string,
  input: Partial<SavedMeasurementProfileInput>,
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.label !== undefined) payload.label = input.label.trim();
  if (input.outfitType !== undefined) payload.outfit_type = input.outfitType.trim() || null;
  if (input.outfitAudience !== undefined) payload.outfit_audience = input.outfitAudience ?? null;
  if (input.measurementUnit !== undefined) payload.measurement_unit = input.measurementUnit;
  if (input.measurements !== undefined) payload.measurements = input.measurements;

  const { data, error } = await supabase
    .from("customer_measurement_profiles")
    .update(payload)
    .eq("id", profileId)
    .eq("customer_id", customerId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(SAVED_PROFILES_SETUP_MESSAGE);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Saved size profile not found");
}

export async function deleteCustomerMeasurementProfile(
  supabase: SupabaseClient,
  customerId: string,
  profileId: string,
): Promise<void> {
  const { error } = await supabase
    .from("customer_measurement_profiles")
    .delete()
    .eq("id", profileId)
    .eq("customer_id", customerId);

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(SAVED_PROFILES_SETUP_MESSAGE);
    throw new Error(error.message);
  }
}
