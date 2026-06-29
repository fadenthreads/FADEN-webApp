import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@faden/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabaseEnv();
  const pathname = request.nextUrl.pathname;
  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/auth/");

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
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
    if (error) return supabaseResponse; // Supabase error — allow through
    user = data.user;
  } catch {
    return supabaseResponse; // Supabase unreachable — don't lock admins out
  }

  if (!user) {
    if (!isPublic) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  let profile: { role?: string } | null = null;
  try {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    profile = data;
  } catch {
    return supabaseResponse;
  }

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    if (!isPublic) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}
