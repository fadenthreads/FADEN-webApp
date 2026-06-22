import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { boutiqueRegistrationSchema } from "@faden/validators";
import { registerBoutiqueForUser } from "@/lib/boutique/register-boutique";
import { getBoutiqueRegistrationWriteClient } from "@/lib/boutique/registration-client";
import { getOwnerBoutique } from "@/lib/boutique/queries";
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

  const parsed = boutiqueRegistrationSchema.safeParse(body);
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
    return errorResponse("You must be signed in to register a boutique.", 401);
  }

  const existingBoutique = await getOwnerBoutique(supabase, user.id);
  if (existingBoutique) {
    return errorResponse("You already have a boutique. Use Modify Boutique on your account.", 400);
  }

  const writeClient = getBoutiqueRegistrationWriteClient(supabase);
  const result = await registerBoutiqueForUser(writeClient, user.id, parsed.data);
  if (!result.ok) {
    return errorResponse(formatSupabaseKeyError(result.error ?? "Submission failed"), 400);
  }

  revalidatePath("/dashboard");
  revalidatePath("/register-boutique");

  const response = NextResponse.json({
    ok: true,
    slug: result.data?.slug ?? "",
    boutiqueId: result.data?.boutiqueId ?? "",
  });
  applyCookies(response, pendingCookies);
  return response;
}
