import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { bookFittingAppointmentSchema } from "@faden/validators";
import { bookFittingAppointment } from "@/lib/appointments/book-appointment";
import { resolveBookingCustomerId } from "@/lib/appointments/resolve-booking-customer";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function applyCookies(response: NextResponse, cookies: SupabaseCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

/**
 * POST /api/appointments/book
 *
 * Called after Cal.com confirms a slot (embed callback or webhook relay).
 * Video join link comes from Cal.com (Cal Video / Meet / Zoom) — no Daily.co.
 *
 * Request body:
 * {
 *   boutiqueId: UUID,
 *   calBookingUid?: string,      // Cal.com booking uid — verified via Cal API
 *   calBookingId?: string|number,
 *   scheduledStart: ISO8601,
 *   scheduledEnd: ISO8601,
 *   customizationRequestId?: UUID,
 *   customerEmail?: string,
 *   customerName?: string,
 *   source?: "cal_embed" | "cal_webhook" | "manual"
 * }
 *
 * Success response:
 * {
 *   ok: true,
 *   appointment: { id, scheduled_start, daily_room_url, status, ... },
 *   joinUrl: string
 * }
 */
export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = bookFittingAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const pendingCookies: SupabaseCookie[] = [];
  const { url, anonKey } = getWebSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse("You must be signed in to book a fitting.", 401);
  }

  const customerResolution = await resolveBookingCustomerId(supabase, user.id, {
    boutiqueId: parsed.data.boutiqueId,
    customizationRequestId: parsed.data.customizationRequestId,
  });

  if ("error" in customerResolution) {
    return errorResponse(customerResolution.error, 403);
  }

  const bookingInput =
    customerResolution.customerId !== user.id
      ? { ...parsed.data, source: parsed.data.source ?? ("owner_scheduled" as const) }
      : parsed.data;

  const result = await bookFittingAppointment(supabase, customerResolution.customerId, bookingInput);

  if ("error" in result) {
    return errorResponse(result.error, 400);
  }

  const response = NextResponse.json({
    ok: true,
    appointment: result.appointment,
    joinUrl: result.appointment.daily_room_url,
  });
  applyCookies(response, pendingCookies);
  return response;
}
