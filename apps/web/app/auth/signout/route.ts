import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true, redirect: "/" });

  if (isWebSupabaseConfigured()) {
    const { url, anonKey } = getWebSupabaseEnv();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    await supabase.auth.signOut();
  }

  return response;
}
