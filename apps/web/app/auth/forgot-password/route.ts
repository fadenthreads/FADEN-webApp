import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Auth not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const redirectTo = `${process.env.WEB_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/account/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "An error occurred" }, { status: 500 });
  }
}
