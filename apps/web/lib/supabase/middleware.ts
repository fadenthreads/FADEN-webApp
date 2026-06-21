import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import { supabaseMiddlewareClientOptions } from "@/lib/supabase/fetch";

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.value.length > 0,
  );
}

function isProtectedPath(pathname: string): boolean {
  const isRegistrationSubmit = pathname === "/register-boutique/submit";
  const isCustomizationSubmit = pathname === "/customize/submit";

  if (isRegistrationSubmit || isCustomizationSubmit) return false;

  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/register-boutique") ||
    pathname.startsWith("/account")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isWebSupabaseConfigured()) {
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;
  const protectedRoute = isProtectedPath(pathname);
  const hasAuthCookie = hasSupabaseAuthCookie(request);

  // Skip Supabase on public pages for guests — avoids slow auth calls on every navigation.
  if (!protectedRoute && !hasAuthCookie) {
    return supabaseResponse;
  }

  const { url, anonKey } = getWebSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    ...supabaseMiddlewareClientOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return supabaseResponse;
    }
    user = data.user;
  } catch {
    // Supabase unreachable or timed out — don't block public pages or lock users out offline.
    return supabaseResponse;
  }

  if (protectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
