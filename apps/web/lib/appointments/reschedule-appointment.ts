import type { SupabaseClient } from "@supabase/supabase-js";
import type { RescheduleFittingAppointmentInput } from "@faden/validators";
import {
  calcomBookingPageUrl,
  fetchCalcomBookingDetails,
  normalizeCalcomBooking,
} from "@/lib/appointments/calcom";
import { isCalcomConfigured } from "@/lib/appointments/env";
import {
  type BookedAppointmentRow,
  mapAppointmentRow,
} from "@/lib/appointments/book-appointment";
import { sendAppointmentRescheduledEmails } from "@/lib/email/appointment-confirmation";

export async function rescheduleFittingAppointment(
  supabase: SupabaseClient,
  actorUserId: string,
  input: RescheduleFittingAppointmentInput,
): Promise<{ appointment: ReturnType<typeof mapAppointmentRow> } | { error: string }> {
  const { data: existing, error: fetchError } = await supabase
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
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Appointment not found" };
  }

  if (existing.tailor_id !== actorUserId) {
    return { error: "Only the boutique owner can reschedule this appointment" };
  }

  if (existing.status === "cancelled" || existing.status === "completed") {
    return { error: "This appointment can no longer be rescheduled" };
  }

  const cal = normalizeCalcomBooking({
    bookingId: input.calBookingId ?? existing.cal_booking_id,
    uid: input.calBookingUid ?? existing.cal_booking_uid,
    startTime: input.scheduledStart,
    endTime: input.scheduledEnd,
  });

  if (!cal.scheduledStart || !cal.scheduledEnd) {
    return { error: "scheduledStart and scheduledEnd are required" };
  }

  let meetingUrl: string | null = existing.daily_room_url as string | null;
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
    return { error: "calBookingUid is required to finalize the reschedule" };
  }

  const scheduledStart = new Date(cal.scheduledStart);
  const scheduledEnd = new Date(cal.scheduledEnd);

  if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(scheduledEnd.getTime())) {
    return { error: "Invalid appointment time" };
  }

  const previousMetadata =
    existing.metadata && typeof existing.metadata === "object"
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const { data: appointment, error: updateError } = await supabase
    .from("fitting_appointments")
    .update({
      cal_booking_id: cal.calBookingId ?? existing.cal_booking_id,
      cal_booking_uid: cal.calBookingUid ?? existing.cal_booking_uid,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      daily_room_url: meetingUrl,
      status: "confirmed",
      metadata: {
        ...previousMetadata,
        source: input.source ?? "owner_rescheduled",
        customerEmail: input.customerEmail ?? previousMetadata.customerEmail ?? null,
        customerName: input.customerName ?? previousMetadata.customerName ?? null,
        videoProvider: "calcom",
        calLocation,
        rescheduledAt: new Date().toISOString(),
        previousScheduledStart: existing.scheduled_start,
        previousScheduledEnd: existing.scheduled_end,
      },
    })
    .eq("id", input.appointmentId)
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

  if (updateError || !appointment) {
    return { error: updateError?.message ?? "Failed to update appointment" };
  }

  const mapped = mapAppointmentRow(appointment as BookedAppointmentRow);
  const boutiqueName =
    mapped.boutique?.name ??
    (Array.isArray(existing.boutiques)
      ? existing.boutiques[0]?.name
      : (existing.boutiques as { name?: string } | null)?.name) ??
    "Boutique";

  void sendAppointmentRescheduledEmails({
    appointmentId: mapped.id,
    boutiqueName,
    scheduledStart: mapped.scheduled_start,
    scheduledEnd: mapped.scheduled_end,
    joinUrl: mapped.daily_room_url,
    customerId: mapped.customer_id,
    tailorId: mapped.tailor_id,
    customerEmail: input.customerEmail ?? (previousMetadata.customerEmail as string | undefined),
    customerName: input.customerName ?? (previousMetadata.customerName as string | undefined),
  }).catch((error) => {
    console.warn("[appointments] reschedule email failed:", error);
  });

  return { appointment: mapped };
}
