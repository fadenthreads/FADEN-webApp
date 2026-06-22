/** User-facing message when Supabase rejects the project API key. */
export function formatSupabaseKeyError(message: string): string {
  if (!/invalid api key/i.test(message)) return message;

  return (
    "Supabase API key is invalid. In apps/web/.env.local (or Vercel env vars), set " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY to your Supabase publishable key (sb_publishable_…) or legacy anon JWT " +
    "from Dashboard → Settings → API. Ensure NEXT_PUBLIC_SUPABASE_URL matches the same project, then restart the dev server."
  );
}
