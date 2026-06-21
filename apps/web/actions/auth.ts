"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@faden/database";
import { createClient } from "@/lib/supabase/server";

/** Server-side sign out — prefer client signOut for interactive UI. */
export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
