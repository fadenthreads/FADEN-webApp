import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rescheduleFittingAppointmentSchema } from "@faden/validators";
import { rescheduleFittingAppointment } from "@/lib/appointments/reschedule-appointment";
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
 * POST /api/appointments/reschedule
 *
 * Called after Cal.com confirms a new slot during owner reschedule flow.
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

  const parsed = rescheduleFittingAppointmentSchema.safeParse(body);
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
    return errorResponse("You must be signed in to reschedule a fitting.", 401);
  }

  const result = await rescheduleFittingAppointment(supabase, user.id, {
    ...parsed.data,
    source: parsed.data.source ?? "owner_rescheduled",
  });

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
