/** Client-safe Supabase env — read here so Next.js inlines NEXT_PUBLIC_* in the web bundle. */
export function getWebSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function isWebSupabaseConfigured(): boolean {
  const { url, anonKey } = getWebSupabaseEnv();
  return Boolean(url && anonKey && url.startsWith("http"));
}
