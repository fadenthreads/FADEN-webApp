import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@faden/validators";
import { resolveAuthRedirect } from "@/lib/boutique/auth-redirect";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

function authErrorResponse(message: string, status = 401) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function applyCookies(response: NextResponse, cookies: SupabaseCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return authErrorResponse("Supabase is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return authErrorResponse("Invalid request body.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return authErrorResponse(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const requestedNext =
    typeof (body as { next?: string })?.next === "string" &&
    (body as { next: string }).next.startsWith("/")
      ? (body as { next: string }).next
      : "/";

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

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const msg = formatAuthErrorMessage(error.message || "Invalid login credentials");
    return authErrorResponse(msg, 401);
  }

  if (!data.session) {
    return authErrorResponse(
      "Sign in succeeded but no session was returned. Confirm your email or disable email confirmation in Supabase.",
      401,
    );
  }

  const nextPath = await resolveAuthRedirect(supabase, data.user.id, requestedNext);
  const redirectUrl = new URL(nextPath, request.url);
  const response = NextResponse.json({
    ok: true,
    redirect: redirectUrl.pathname + redirectUrl.search,
  });
  applyCookies(response, pendingCookies);

  return response;
}
