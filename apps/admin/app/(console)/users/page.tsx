import { isSupabaseConfigured } from "@faden/database";
import type { Profile } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/users-table";

async function getUsers(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Profile[];
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">USERS</p>
      <h1 className="mt-2 font-display text-3xl font-bold">User Management</h1>
      <p className="mt-2 text-foreground-muted">
        Assign roles for customers, boutique owners, and platform admins.
      </p>
      <div className="mt-8">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
