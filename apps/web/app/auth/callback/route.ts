import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@faden/database";
import { applyOAuthSignupRole } from "@/lib/auth/oauth-callback-role";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const role = searchParams.get("role");

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const redirectUrl = `${origin}${next.startsWith("/") ? next : "/"}`;
  const supabaseResponse = NextResponse.redirect(redirectUrl);
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") ?? "");
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  if (data.user && role === "boutique_owner") {
    await applyOAuthSignupRole(data.user.id, "boutique_owner");
  }

  return supabaseResponse;
}

function parseCookieHeader(header: string): { name: string; value: string }[] {
  if (!header) return [];
  return header.split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return { name: name ?? "", value: rest.join("=") };
  });
}
