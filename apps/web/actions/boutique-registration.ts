"use server";

import { revalidatePath } from "next/cache";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { registerBoutiqueForUser } from "@/lib/boutique/register-boutique";
import { getBoutiqueRegistrationWriteClient } from "@/lib/boutique/registration-client";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { formatSupabaseKeyError } from "@/lib/supabase/errors";

export async function submitBoutiqueRegistration(
  input: BoutiqueRegistrationInput,
): Promise<ActionResult<{ boutiqueId: string; slug: string }>> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured. Add credentials to .env.local." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { ok: false, error: formatSupabaseKeyError(authError.message) };
  }

  if (!user) {
    return { ok: false, error: "You must be signed in to register a boutique." };
  }

  const writeClient = getBoutiqueRegistrationWriteClient(supabase);
  const result = await registerBoutiqueForUser(writeClient, user.id, input);
  if (!result.ok && result.error) {
    return { ok: false, error: formatSupabaseKeyError(result.error) };
  }
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/register-boutique");
  }
  return result;
}
