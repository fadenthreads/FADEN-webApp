import { createAdminClient } from "@/lib/supabase/admin";

const NEW_ACCOUNT_WINDOW_MS = 5 * 60 * 1000;

/** Apply boutique_owner role after OAuth signup when user chose that path. */
export async function applyOAuthSignupRole(
  userId: string,
  role: "boutique_owner",
): Promise<void> {
  if (role !== "boutique_owner") return;

  const admin = createAdminClient();
  if (!admin) return;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "customer") {
    return;
  }

  const { data: authData, error: authError } = await admin.auth.admin.getUserById(userId);
  if (authError || !authData.user) {
    return;
  }

  const createdAt = new Date(authData.user.created_at).getTime();
  if (Number.isNaN(createdAt) || Date.now() - createdAt > NEW_ACCOUNT_WINDOW_MS) {
    return;
  }

  const existingMetadata = authData.user.user_metadata ?? {};

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMetadata,
      role: "boutique_owner",
    },
  });

  await admin
    .from("profiles")
    .update({ role: "boutique_owner" })
    .eq("id", userId)
    .eq("role", "customer");
}
