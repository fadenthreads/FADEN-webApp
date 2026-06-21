import { PremiumCard } from "@/components/ui/premium-card";
import { AccountOverviewHub } from "@/components/account/account-overview-hub";
import { loadAccountNavCounts } from "@/lib/account/load-account-nav-counts";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "My Account — FADEN",
  description: "Your FADEN account overview.",
};

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const { user, profile, supabase } = await requireAccountUser("/account");

  let ownerBoutique = null;
  let counts = {
    requests: 0,
    orders: 0,
    quotations: 0,
    payments: 0,
    appointments: 0,
    messages: 0,
    reviews: 0,
  };

  if (isWebSupabaseConfigured()) {
    try {
      ownerBoutique = await getOwnerBoutique(supabase, user.id);
      counts = await loadAccountNavCounts(supabase, user.id);
    } catch {
      ownerBoutique = null;
    }
  }

  const fullName =
    profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "—";
  const role = profile?.role ?? "customer";
  const email = user.email ?? profile?.email ?? "—";

  return (
    <AccountOverviewHub
      fullName={fullName}
      email={email}
      role={role}
      phone={profile?.phone}
      counts={counts}
      ownerBoutique={Boolean(ownerBoutique)}
      showBoutiqueDashboard={role === "boutique_owner" || role === "admin"}
      showRegisterBoutique={role === "boutique_owner" && !ownerBoutique}
    />
  );
}
