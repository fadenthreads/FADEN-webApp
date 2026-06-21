import { NextResponse, type NextRequest } from "next/server";
import { customerLocationUpdateSchema } from "@faden/validators";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** GET /api/account/location — saved profile location for signed-in customers */
export async function GET() {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ location: null });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ location: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("location_label, latitude, longitude")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.location_label?.trim()) {
      return NextResponse.json({ location: null });
    }

    let lat = profile.latitude as number | null;
    let lng = profile.longitude as number | null;
    if (lat == null || lng == null) {
      const cityCoords = resolveCityCoordinates(profile.location_label);
      lat = cityCoords?.lat ?? null;
      lng = cityCoords?.lng ?? null;
    }

    return NextResponse.json({
      location: {
        label: profile.location_label.trim(),
        lat,
        lng,
        source: lat != null && lng != null && profile.latitude != null ? "profile" : "preset",
      },
    });
  } catch {
    return NextResponse.json({ location: null });
  }
}

/** PATCH /api/account/location — persist map/city pick to customer profile */
export async function PATCH(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = customerLocationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid location", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse("Sign in to save your location.", 401);
  }

  const { label, lat, lng } = parsed.data;
  let latitude = lat ?? null;
  let longitude = lng ?? null;
  if (latitude == null || longitude == null) {
    const cityCoords = resolveCityCoordinates(label);
    latitude = cityCoords?.lat ?? null;
    longitude = cityCoords?.lng ?? null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      location_label: label.trim(),
      latitude,
      longitude,
    })
    .eq("id", user.id);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return NextResponse.json({
    ok: true,
    location: {
      label: label.trim(),
      lat: latitude,
      lng: longitude,
      source: lat != null && lng != null ? "map" : "preset",
    },
  });
}
