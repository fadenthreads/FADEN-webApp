import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { signupSchema } from "@faden/validators";
import { resolveAuthRedirect } from "@/lib/boutique/auth-redirect";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import { formatSupabaseKeyError } from "@/lib/supabase/errors";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import type { SupabaseCookie } from "@/lib/supabase/types";

function authErrorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
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

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return authErrorResponse(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const nextPath =
    typeof (body as { next?: string })?.next === "string" &&
    (body as { next: string }).next.startsWith("/")
      ? (body as { next: string }).next
      : "/register-boutique";

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

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return authErrorResponse(
      formatAuthErrorMessage(formatSupabaseKeyError(error.message || "Sign up failed")),
      400,
    );
  }

  if (!data.session || !data.user) {
    return NextResponse.json({ ok: true, redirect: "/login?registered=1" });
  }

  const redirectPath = await resolveAuthRedirect(supabase, data.user.id, nextPath);
  const response = NextResponse.json({ ok: true, redirect: redirectPath });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
