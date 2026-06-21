import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { customizationMatchSchema } from "@faden/validators";
import { matchBoutiquesForRequest } from "@/lib/boutique/matching";
import { DEFAULT_CUSTOMER_LOCATION } from "@/lib/location/customer-location";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

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

  const parsed = customizationMatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid match criteria", 400);
  }

  const { url, anonKey } = getWebSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  let customerLocation = parsed.data.customerLocation?.trim() || DEFAULT_CUSTOMER_LOCATION;
  let customerLat = parsed.data.customerLat ?? null;
  let customerLng = parsed.data.customerLng ?? null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("location_label, latitude, longitude")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.location_label?.trim()) {
      customerLocation = profile.location_label.trim();
    }
    if (profile?.latitude != null && profile?.longitude != null) {
      customerLat = profile.latitude;
      customerLng = profile.longitude;
    }
  }

  try {
    const matches = await matchBoutiquesForRequest(supabase, {
      ...parsed.data,
      customerLocation,
      customerLat,
      customerLng,
    });
    return NextResponse.json({ ok: true, matches, customerLocation });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Could not find matches", 500);
  }
}
