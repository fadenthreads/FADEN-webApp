import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { bookFittingAppointmentSchema } from "@faden/validators";
import { bookFittingAppointment } from "@/lib/appointments/book-appointment";
import { getAppointmentIntegrationsEnv } from "@/lib/appointments/env";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

/**
 * POST /api/appointments/webhooks/calcom
 *
 * Signature: Cal.com sends X-Cal-Signature-256 as HMAC-SHA256(rawBody, secret).
 * Raw body must be read first before JSON parsing so the HMAC is computed
 * over the exact bytes Cal.com signed.
 */
export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured() || !isAdminClientConfigured()) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 503 });
  }

  const { calcomWebhookSecret } = getAppointmentIntegrationsEnv();
  const signature = request.headers.get("x-cal-signature-256");

  let rawBody: string;
  let payload: Record<string, unknown>;
  try {
    rawBody = await request.text();
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (calcomWebhookSecret) {
    const expected = createHmac("sha256", calcomWebhookSecret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signature ?? "");
    const expBuffer = Buffer.from(expected);
    const signaturesMatch =
      sigBuffer.length === expBuffer.length && timingSafeEqual(sigBuffer, expBuffer);
    if (!signaturesMatch) {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  const trigger = payload.triggerEvent as string | undefined;
  if (trigger && trigger !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const booking = (payload.payload ?? payload) as Record<string, unknown>;
  const uid = (booking.uid ?? booking.bookingUid) as string | undefined;
  const startTime = (booking.startTime ?? booking.start) as string | undefined;
  const endTime = (booking.endTime ?? booking.end) as string | undefined;
  const bookingId = booking.id ?? booking.bookingId;
  const metadata = (booking.metadata ?? {}) as Record<string, string>;
  const boutiqueId = metadata.boutiqueId ?? metadata.boutique_id;
  const attendees = (booking.attendees ?? []) as { email?: string; name?: string }[];
  const customerEmail = attendees[0]?.email ?? (booking.responses as { email?: string })?.email;

  if (!boutiqueId || typeof boutiqueId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing metadata.boutiqueId on Cal.com event type" },
      { status: 400 },
    );
  }

  if (!startTime || !endTime) {
    return NextResponse.json({ ok: false, error: "Missing start/end time" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin client not configured" }, { status: 503 });
  }

  let customerId: string | null = null;
  if (customerEmail) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();
    customerId = profile?.id ?? null;
  }

  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: "Could not match customer email to a FADEN profile" },
      { status: 422 },
    );
  }

  const input = bookFittingAppointmentSchema.parse({
    boutiqueId,
    calBookingUid: uid,
    calBookingId: bookingId,
    scheduledStart: startTime,
    scheduledEnd: endTime,
    customerEmail,
    customerName: attendees[0]?.name,
    source: "cal_webhook",
  });

  const result = await bookFittingAppointment(admin, customerId, input);

  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    appointmentId: result.appointment.id,
    joinUrl: result.appointment.daily_room_url,
  });
}
