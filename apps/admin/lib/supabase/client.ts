import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "@faden/database";

let browserClient: SupabaseClient | undefined;

export function createBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnv();
  browserClient = createSupabaseBrowserClient(url, anonKey);
  return browserClient;
}

export function isBrowserSupabaseConfigured(): boolean {
  return isSupabaseConfigured();
}

export function navigateAfterAuth(path: string) {
  window.location.href = path.startsWith("/") ? path : "/";
}

const AUTH_TIMEOUT_MS = 20_000;

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
