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

  return formatAuthErrorMessage(message);
}

export function formatAuthErrorMessage(message: string): string {
  if (/invalid api key/i.test(message)) {
    return (
      "Supabase API key is invalid. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "in apps/web/.env.local (or Vercel env vars), then restart the dev server."
    );
  }

  if (/already registered|user already registered|email.*already.*(exists|registered|in use)/i.test(message)) {
    return "An account with this exact email already exists. Sign in or use a different email.";
  }

  if (/invalid login credentials|invalid email or password/i.test(message)) {
    return "Invalid email or password. Check your credentials and try again.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email before signing in.";
  }

  return message;
}
