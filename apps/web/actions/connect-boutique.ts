"use server";

import { revalidatePath } from "next/cache";
import { connectBoutiqueSchema } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { connectRequestToBoutique } from "@/lib/customization/submit-customization";
import { createClient } from "@/lib/supabase/server";

export async function connectBoutiqueToRequest(input: unknown): Promise<ActionResult> {
  try {
    const parsed = connectBoutiqueSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const result = await connectRequestToBoutique(
      supabase,
      user.id,
      parsed.data.requestId,
      parsed.data.boutiqueSlug,
    );

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath("/account");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
