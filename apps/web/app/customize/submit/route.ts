import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { customizationRequestSchema } from "@faden/validators";
import {
  submitCustomizationRequest,
  submitCustomizationToMultipleBoutiques,
} from "@/lib/customization/submit-customization";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
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

  const raw = body as Record<string, unknown>;
  const multiSlugs = Array.isArray(raw.selectedBoutiqueSlugs)
    ? (raw.selectedBoutiqueSlugs as string[])
    : null;

  const parsed = customizationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid customization data", 400);
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse("You must be signed in to submit a customization request.", 401);
  }

  if (multiSlugs && multiSlugs.length > 1) {
    const result = await submitCustomizationToMultipleBoutiques(
      supabase,
      user.id,
      body as typeof parsed.data,
      multiSlugs,
    );
    if (!result.ok) {
      return errorResponse(result.error ?? "Submission failed", 400);
    }

    revalidatePath("/account");
    revalidatePath("/dashboard");

    const response = NextResponse.json({
      ok: true,
      multi: true,
      requestIds: result.data?.requestIds ?? [],
      orderIds: result.data?.orderIds ?? [],
      boutiqueCount: result.data?.boutiqueCount ?? 0,
    });
    applyCookies(response, pendingCookies);
    return response;
  }

  const slug =
    multiSlugs?.[0] ??
    (typeof raw.selectedBoutiqueSlug === "string" ? raw.selectedBoutiqueSlug : parsed.data.selectedBoutiqueSlug);

  const result = await submitCustomizationRequest(supabase, user.id, {
    ...parsed.data,
    selectedBoutiqueSlug: slug ?? "",
    ...(body as object),
  });

  if (!result.ok) {
    return errorResponse(result.error ?? "Submission failed", 400);
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");

  const response = NextResponse.json({
    ok: true,
    requestId: result.data?.requestId ?? "",
    orderId: result.data?.orderId ?? null,
    conversationId: result.data?.conversationId ?? null,
  });
  applyCookies(response, pendingCookies);
  return response;
}
