import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "./env";
import { supabaseClientOptions } from "./fetch";

export async function createClient() {
  if (!isWebSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getWebSupabaseEnv();

  return createServerClient(url, anonKey, {
    ...supabaseClientOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — middleware will refresh sessions.
        }
      },
    },
  });
}
