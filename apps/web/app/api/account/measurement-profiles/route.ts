import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { listCustomerMeasurementProfiles } from "@/lib/measurement/saved-profiles";

/** GET /api/account/measurement-profiles — saved size profiles for signed-in customer */
export async function GET() {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ profiles: [] });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ profiles: [] }, { status: 401 });
    }

    const profiles = await listCustomerMeasurementProfiles(supabase, user.id);
    return NextResponse.json({ profiles });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load saved sizes";
    return NextResponse.json({ profiles: [], error: message }, { status: 500 });
  }
}
