import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookFittingAppointmentInput } from "@faden/validators";
import {
  calcomBookingPageUrl,
  fetchCalcomBookingDetails,
  normalizeCalcomBooking,
} from "@/lib/appointments/calcom";
import { isCalcomConfigured } from "@/lib/appointments/env";
import { sendAppointmentConfirmationEmails } from "@/lib/email/appointment-confirmation";

export interface BookedAppointmentRow {
  id: string;
  customer_id: string;
  tailor_id: string;
  boutique_id: string;
  customization_request_id: string | null;
  cal_booking_id: string | null;
  cal_booking_uid: string | null;
  scheduled_start: string;
  scheduled_end: string;
  daily_room_name: string | null;
  daily_room_url: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  metadata: Record<string, unknown>;
  boutiques?: { name: string; slug: string } | { name: string; slug: string }[] | null;
}

function normalizeBoutiqueJoin(
  boutiques: BookedAppointmentRow["boutiques"],
): { name: string; slug: string } | null {
  if (!boutiques) return null;
  if (Array.isArray(boutiques)) return boutiques[0] ?? null;
  return boutiques;
}

export function mapAppointmentRow(row: BookedAppointmentRow): BookedAppointmentRow & {
  boutique: { name: string; slug: string } | null;
} {
  return {
    ...row,
    boutique: normalizeBoutiqueJoin(row.boutiques),
  };
}

export async function bookFittingAppointment(
  supabase: SupabaseClient,
  customerId: string,
  input: BookFittingAppointmentInput,
): Promise<{ appointment: BookedAppointmentRow } | { error: string }> {
  const cal = normalizeCalcomBooking({
    bookingId: input.calBookingId,
    uid: input.calBookingUid,
    startTime: input.scheduledStart,
    endTime: input.scheduledEnd,
  });

  if (!cal.scheduledStart || !cal.scheduledEnd) {
    return { error: "scheduledStart and scheduledEnd are required" };
  }

  let meetingUrl: string | null = null;
  let calLocation: string | null = null;

  if (cal.calBookingUid) {
    const verified = await fetchCalcomBookingDetails(cal.calBookingUid);
    if (!verified.ok) {
      return { error: verified.error ?? "Could not verify Cal.com booking" };
    }
    if (verified.start) cal.scheduledStart = verified.start;
    if (verified.end) cal.scheduledEnd = verified.end;
    meetingUrl = verified.meetingUrl ?? calcomBookingPageUrl(cal.calBookingUid);
    calLocation = verified.location ?? null;
  } else if (isCalcomConfigured()) {
    return { error: "calBookingUid is required to finalize the appointment" };
  }

  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, name, slug, owner_id, status")
    .eq("id", input.boutiqueId)
    .maybeSingle();

  if (boutiqueError || !boutique) {
    return { error: "Boutique not found" };
  }

  if (boutique.status !== "verified") {
    return { error: "Boutique is not available for bookings" };
  }

  const scheduledStart = new Date(cal.scheduledStart);
  const scheduledEnd = new Date(cal.scheduledEnd);

  if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(scheduledEnd.getTime())) {
    return { error: "Invalid appointment time" };
  }

  const appointmentId = crypto.randomUUID();
  const joinUrl =
    meetingUrl ??
    (cal.calBookingUid ? calcomBookingPageUrl(cal.calBookingUid) : null);

  const { data: appointment, error: insertError } = await supabase
    .from("fitting_appointments")
    .insert({
      id: appointmentId,
      customer_id: customerId,
      tailor_id: boutique.owner_id,
      boutique_id: boutique.id,
      customization_request_id: input.customizationRequestId ?? null,
      cal_booking_id: cal.calBookingId,
      cal_booking_uid: cal.calBookingUid,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      daily_room_name: null,
      daily_room_url: joinUrl,
      status: "confirmed",
      metadata: {
        source: input.source ?? "cal_embed",
        customerEmail: input.customerEmail ?? null,
        customerName: input.customerName ?? null,
        videoProvider: "calcom",
        calLocation,
      },
    })
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
    .single();

  if (insertError || !appointment) {
    return { error: insertError?.message ?? "Failed to save appointment" };
  }

  const mapped = mapAppointmentRow(appointment as BookedAppointmentRow);

  void sendAppointmentConfirmationEmails({
    appointmentId: mapped.id,
    boutiqueName: boutique.name,
    scheduledStart: mapped.scheduled_start,
    scheduledEnd: mapped.scheduled_end,
    joinUrl: mapped.daily_room_url,
    customerId: mapped.customer_id,
    tailorId: mapped.tailor_id,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
  }).catch((error) => {
    console.warn("[appointments] confirmation email failed:", error);
  });

  return { appointment: mapped };
}
