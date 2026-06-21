import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Payment writes run on the service-role client when available (recommended for API routes).
 * Falls back to the user's session client — requires 006_phase5_payments_rls.sql applied.
 */
export function getPaymentWriteClient(sessionClient: SupabaseClient): SupabaseClient {
  return createAdminClient() ?? sessionClient;
}
