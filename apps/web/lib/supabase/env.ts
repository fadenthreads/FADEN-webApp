/** Client-safe Supabase env — read here so Next.js inlines NEXT_PUBLIC_* in the web bundle. */
export function getWebSupabaseEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();

  return { url, anonKey };
}

export function isWebSupabaseConfigured(): boolean {
  const { url, anonKey } = getWebSupabaseEnv();
  return Boolean(url && anonKey && url.startsWith("http"));
}
