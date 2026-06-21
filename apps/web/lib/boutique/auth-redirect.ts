import type { SupabaseClient } from "@supabase/supabase-js";
import { getOwnerBoutique } from "@/lib/boutique/queries";

/** Verified owners use /register-boutique to modify details — do not redirect away. */
export async function resolveAuthRedirect(
  _supabase: SupabaseClient,
  _userId: string,
  nextPath: string,
): Promise<string> {
  return nextPath;
}

export async function hasVerifiedBoutique(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const boutique = await getOwnerBoutique(supabase, userId);
  return boutique?.status === "verified";
}
