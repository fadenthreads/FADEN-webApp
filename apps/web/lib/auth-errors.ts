/** Normalize Supabase / Auth API errors for UI display. */
export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const authError = error as { message?: string; msg?: string; error_description?: string };
  const message =
    authError.message ||
    authError.msg ||
    authError.error_description ||
    "Authentication failed. Please try again.";

  if (/invalid api key/i.test(message)) {
    return (
      "Supabase API key is invalid. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "in apps/web/.env.local (or Vercel env vars), then restart the dev server."
    );
  }

  return message;
}
