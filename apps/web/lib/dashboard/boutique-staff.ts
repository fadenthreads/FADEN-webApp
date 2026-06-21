import type { SupabaseClient } from "@supabase/supabase-js";

export type StaffPayPeriod = "monthly" | "weekly" | "hourly" | "per_piece";

export interface OwnerStaffMember {
  id: string;
  boutiqueId: string;
  fullName: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  payAmount: string;
  payPeriod: StaffPayPeriod;
  notes: string | null;
  gender: "female" | "male" | null;
  canDoHomeVisits: boolean;
  isActive: boolean;
  sortOrder: number;
}

export const STAFF_SETUP_MESSAGE =
  "Staff management is not enabled on the database yet. Run migration 022_boutique_staff.sql in the Supabase SQL editor.";

function isSchemaMismatchError(message: string): boolean {
  return /could not find the table|schema cache|does not exist|PGRST204|PGRST205|42703|42P01|boutique_staff/i.test(
    message,
  );
}

function normalizePayPeriod(value: string | null | undefined): StaffPayPeriod {
  if (value === "weekly" || value === "hourly" || value === "per_piece") return value;
  return "monthly";
}

function mapStaffRow(row: Record<string, unknown>, boutiqueId: string): OwnerStaffMember {
  const gender = row.gender === "female" || row.gender === "male" ? row.gender : null;
  return {
    id: row.id as string,
    boutiqueId,
    fullName: row.full_name as string,
    role: (row.role as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    payAmount: row.pay_amount as string,
    payPeriod: normalizePayPeriod(row.pay_period as string),
    notes: (row.notes as string | null) ?? null,
    gender,
    canDoHomeVisits: row.can_do_home_visits === true,
    isActive: row.is_active !== false,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export async function isBoutiqueStaffAvailable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("boutique_staff").select("id").limit(1);
  if (!error) return true;
  return !isSchemaMismatchError(error.message);
}

export async function listBoutiqueStaff(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OwnerStaffMember[]> {
  const { data, error } = await supabase
    .from("boutique_staff")
    .select(
      "id, full_name, role, phone, email, pay_amount, pay_period, notes, is_active, sort_order, gender, can_do_home_visits",
    )
    .eq("boutique_id", boutiqueId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isSchemaMismatchError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapStaffRow(row as Record<string, unknown>, boutiqueId));
}

async function nextStaffSortOrder(supabase: SupabaseClient, boutiqueId: string): Promise<number> {
  const { data: last, error } = await supabase
    .from("boutique_staff")
    .select("sort_order")
    .eq("boutique_id", boutiqueId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isSchemaMismatchError(error.message)) {
    throw new Error(error.message);
  }

  return (last?.sort_order ?? -1) + 1;
}

export async function createBoutiqueStaffMember(
  supabase: SupabaseClient,
  boutiqueId: string,
  input: {
    fullName: string;
    role?: string;
    phone?: string;
    email?: string;
    payAmount: string;
    payPeriod: StaffPayPeriod;
    notes?: string;
    gender?: "female" | "male";
    canDoHomeVisits?: boolean;
  },
): Promise<{ id: string }> {
  const sortOrder = await nextStaffSortOrder(supabase, boutiqueId);
  const { data, error } = await supabase
    .from("boutique_staff")
    .insert({
      boutique_id: boutiqueId,
      full_name: input.fullName.trim(),
      role: input.role?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      pay_amount: input.payAmount.trim(),
      pay_period: input.payPeriod,
      notes: input.notes?.trim() || null,
      gender: input.gender ?? null,
      can_do_home_visits: input.canDoHomeVisits ?? false,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(STAFF_SETUP_MESSAGE);
    throw new Error(error.message);
  }

  return { id: data.id as string };
}

export async function updateBoutiqueStaffMember(
  supabase: SupabaseClient,
  boutiqueId: string,
  staffId: string,
  input: {
    fullName?: string;
    role?: string;
    phone?: string;
    email?: string;
    payAmount?: string;
    payPeriod?: StaffPayPeriod;
    notes?: string;
    isActive?: boolean;
    gender?: "female" | "male";
    canDoHomeVisits?: boolean;
  },
): Promise<void> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.fullName !== undefined) payload.full_name = input.fullName.trim();
  if (input.role !== undefined) payload.role = input.role.trim() || null;
  if (input.phone !== undefined) payload.phone = input.phone.trim() || null;
  if (input.email !== undefined) payload.email = input.email.trim() || null;
  if (input.payAmount !== undefined) payload.pay_amount = input.payAmount.trim();
  if (input.payPeriod !== undefined) payload.pay_period = input.payPeriod;
  if (input.notes !== undefined) payload.notes = input.notes.trim() || null;
  if (input.isActive !== undefined) payload.is_active = input.isActive;
  if (input.gender !== undefined) payload.gender = input.gender ?? null;
  if (input.canDoHomeVisits !== undefined) payload.can_do_home_visits = input.canDoHomeVisits;

  const { data, error } = await supabase
    .from("boutique_staff")
    .update(payload)
    .eq("id", staffId)
    .eq("boutique_id", boutiqueId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(STAFF_SETUP_MESSAGE);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Staff member not found");
}

export async function deleteBoutiqueStaffMember(
  supabase: SupabaseClient,
  boutiqueId: string,
  staffId: string,
): Promise<void> {
  const { error } = await supabase
    .from("boutique_staff")
    .delete()
    .eq("id", staffId)
    .eq("boutique_id", boutiqueId);

  if (error) {
    if (isSchemaMismatchError(error.message)) throw new Error(STAFF_SETUP_MESSAGE);
    throw new Error(error.message);
  }
}
