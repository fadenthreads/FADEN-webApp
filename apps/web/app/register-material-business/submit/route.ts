import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { materialBusinessRegistrationSchema } from "@faden/validators";
import { registerMaterialBusinessForUser } from "@/lib/material-business/register-material-business";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import { formatSupabaseKeyError } from "@/lib/supabase/errors";
import { supabaseClientOptions } from "@/lib/supabase/fetch";
import type { SupabaseCookie } from "@/lib/supabase/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function applyCookies(response: NextResponse, cookiesToSet: SupabaseCookie[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = materialBusinessRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid registration data", 400);
  }

  const pendingCookies: SupabaseCookie[] = [];
  const { url, anonKey } = getWebSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    ...supabaseClientOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return errorResponse(formatSupabaseKeyError(authError.message), 503);
  }

  if (!user) {
    return errorResponse("You must be signed in to register a material business.", 401);
  }

  const result = await registerMaterialBusinessForUser(supabase, user.id, parsed.data);
  if (!result.ok) {
    return errorResponse(formatSupabaseKeyError(result.error), 400);
  }

  revalidatePath("/register-material-business");

  const response = NextResponse.json({
    ok: true,
    applicationId: result.applicationId,
  });
  applyCookies(response, pendingCookies);
  return response;
}
