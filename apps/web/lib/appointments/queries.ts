import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookedAppointmentRow } from "@/lib/appointments/book-appointment";
import { mapAppointmentRow } from "@/lib/appointments/book-appointment";

export type FittingAppointmentSummary = ReturnType<typeof mapAppointmentRow>;

export async function listCustomerAppointments(
  supabase: SupabaseClient,
  customerId: string,
): Promise<FittingAppointmentSummary[]> {
  const now = new Date();
  now.setHours(now.getHours() - 1);

  const { data, error } = await supabase
    .from("fitting_appointments")
    .select(
      `
      id,
      customer_id,
      tailor_id,
      boutique_id,
      customization_request_id,
      cal_booking_id,
      cal_booking_uid,
      scheduled_start,
      scheduled_end,
      daily_room_name,
      daily_room_url,
      status,
      metadata,
      boutiques ( name, slug )
    `,
    )
    .eq("customer_id", customerId)
    .gte("scheduled_end", now.toISOString())
    .in("status", ["pending", "confirmed"])
    .order("scheduled_start", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapAppointmentRow(row as BookedAppointmentRow));
}

export type TailorAppointmentSummary = FittingAppointmentSummary & {
  customer: { name: string | null; email: string | null } | null;
};

function mapTailorAppointmentRow(
  row: BookedAppointmentRow & {
    profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  },
): TailorAppointmentSummary {
  const base = mapAppointmentRow(row);
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    ...base,
    customer: profile
      ? {
          name: profile.full_name,
          email: profile.email,
        }
      : null,
  };
}

export async function listTailorAppointments(
  supabase: SupabaseClient,
  tailorId: string,
): Promise<TailorAppointmentSummary[]> {
  const now = new Date();
  now.setHours(now.getHours() - 1);

  const { data, error } = await supabase
    .from("fitting_appointments")
    .select(
      `
      id,
      customer_id,
      tailor_id,
      boutique_id,
      customization_request_id,
      cal_booking_id,
      cal_booking_uid,
      scheduled_start,
      scheduled_end,
      daily_room_name,
      daily_room_url,
      status,
      metadata,
      boutiques ( name, slug ),
      profiles!fitting_appointments_customer_id_fkey ( full_name, email )
    `,
    )
    .eq("tailor_id", tailorId)
    .gte("scheduled_end", now.toISOString())
    .in("status", ["pending", "confirmed"])
    .order("scheduled_start", { ascending: true })
    .limit(20);

  if (error) throw error;
  return (data ?? []).map((row) => mapTailorAppointmentRow(row as BookedAppointmentRow & {
    profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  }));
}

export function appointmentJoinWindow(startIso: string, endIso: string): {
  isUpcoming: boolean;
  isActive: boolean;
  isPast: boolean;
} {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const joinOpens = start - 10 * 60 * 1000;

  return {
    isUpcoming: now < joinOpens,
    isActive: now >= joinOpens && now <= end + 15 * 60 * 1000,
    isPast: now > end + 15 * 60 * 1000,
  };
}

export function formatAppointmentWhen(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${startTime} – ${endTime}`;
}
