import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/** Prefer service-role writes after the caller has verified the authenticated owner. */
export function getBoutiqueRegistrationWriteClient(sessionClient: SupabaseClient): SupabaseClient {
  return createAdminClient() ?? sessionClient;
}
