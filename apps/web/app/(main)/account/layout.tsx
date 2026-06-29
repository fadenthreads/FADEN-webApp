export const dynamic = "force-dynamic";

import { AccountShell } from "@/components/account/account-shell";
import { loadAccountNavCounts } from "@/lib/account/load-account-nav-counts";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { AccountNavCounts } from "@/lib/account/account-nav";

const EMPTY_COUNTS: AccountNavCounts = {
  requests: 0, orders: 0, quotations: 0, payments: 0,
  appointments: 0, messages: 0, reviews: 0,
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, supabase } = await requireAccountUser();

  let counts = EMPTY_COUNTS;
  if (isWebSupabaseConfigured()) {
    try {
      counts = await loadAccountNavCounts(supabase, user.id);
    } catch {
      counts = EMPTY_COUNTS;
    }
  }

  const displayName =
    profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "My Account";
  const email = user.email ?? profile?.email ?? "";

  return (
    <AccountShell counts={counts} displayName={displayName} email={email}>
      {children}
    </AccountShell>
  );
}
