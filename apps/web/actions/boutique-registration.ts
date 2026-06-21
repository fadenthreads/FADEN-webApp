"use server";

import { revalidatePath } from "next/cache";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { registerBoutiqueForUser } from "@/lib/boutique/register-boutique";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";

export async function submitBoutiqueRegistration(
  input: BoutiqueRegistrationInput,
): Promise<ActionResult<{ boutiqueId: string; slug: string }>> {
  if (!isWebSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured. Add credentials to .env.local." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to register a boutique." };
  }

  const result = await registerBoutiqueForUser(supabase, user.id, input);
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/register-boutique");
  }
  return result;
}
