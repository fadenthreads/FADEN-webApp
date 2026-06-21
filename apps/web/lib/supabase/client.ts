import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "./env";
import { supabaseClientOptions } from "./fetch";

let browserClient: SupabaseClient | undefined;

/** @param fresh — new client for sign-in/sign-up to avoid auth lock contention with useUser */
export function createBrowserClient(options?: { fresh?: boolean }) {
  if (!isWebSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { url, anonKey } = getWebSupabaseEnv();

  if (options?.fresh) {
    return createSupabaseBrowserClient(url, anonKey, supabaseClientOptions);
  }

  if (browserClient) {
    return browserClient;
  }

  browserClient = createSupabaseBrowserClient(url, anonKey, supabaseClientOptions);
  return browserClient;
}

export function isBrowserSupabaseConfigured(): boolean {
  return isWebSupabaseConfigured();
}

/** Full page navigation so middleware picks up fresh auth cookies. */
export function navigateAfterAuth(path: string) {
  const target = path.startsWith("/") ? path : "/";
  window.location.href = target;
}

const AUTH_TIMEOUT_MS = 20_000;

/** POST to auth route handlers with timeout so the UI never hangs forever. */
export async function authFetch(path: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "AbortError")),
    AUTH_TIMEOUT_MS,
  );

  try {
    const res = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await res.json()) as { ok?: boolean; error?: string; redirect?: string };
    return { res, payload };
  } finally {
    clearTimeout(timer);
  }
}

/** Race auth calls so the UI never hangs on "Signing in…" forever. */
export async function withAuthTimeout<T>(
  promise: Promise<T>,
  message = "Request timed out. Check your connection and try again.",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
