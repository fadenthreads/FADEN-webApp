import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@faden/database";

export async function POST(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const supabaseResponse = NextResponse.redirect(loginUrl);

  if (isSupabaseConfigured()) {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });
    await supabase.auth.signOut();
  }

  return supabaseResponse;
}
