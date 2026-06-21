import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { listCustomerAppointments, listTailorAppointments } from "@/lib/appointments/queries";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

function applyCookies(response: NextResponse, cookies: SupabaseCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

/** GET /api/appointments — upcoming fittings for signed-in customer or boutique owner */
export async function GET(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
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
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = request.nextUrl.searchParams.get("role");
  let appointments;

  if (role === "tailor") {
    appointments = await listTailorAppointments(supabase, user.id);
  } else {
    appointments = await listCustomerAppointments(supabase, user.id);
  }

  const response = NextResponse.json({ ok: true, appointments });
  applyCookies(response, pendingCookies);
  return response;
}
