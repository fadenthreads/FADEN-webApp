/** Normalize Supabase / Auth API errors for UI display. */
export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const authError = error as { message?: string; msg?: string; error_description?: string };
  return (
    authError.message ||
    authError.msg ||
    authError.error_description ||
    "Authentication failed. Please try again."
  );
}
