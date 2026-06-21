import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@faden/validators";
import { getSupabaseEnv, isSupabaseConfigured } from "@faden/database";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function authErrorResponse(message: string, status = 401) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
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

  const response = NextResponse.json({ ok: true, redirect: "/" });
  const { url, anonKey } = getSupabaseEnv();

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

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return authErrorResponse(error.message || "Invalid login credentials", 401);
  }

  if (!data.session) {
    return authErrorResponse(
      "Sign in succeeded but no session was returned. Confirm your email or disable email confirmation in Supabase.",
      401,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return authErrorResponse("This account does not have admin access.", 403);
  }

  return response;
}
