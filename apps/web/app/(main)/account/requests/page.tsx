import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomizationRequestsPanel } from "@/components/dashboard/customization-requests-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerCustomizationRequests } from "@/lib/customization/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "My Requests — FADEN",
  description: "View your customization requests.",
};

export const dynamic = "force-dynamic";

export default async function AccountRequestsPage() {
  const { user, supabase } = await requireAccountUser("/account/requests");

  let requests: Awaited<ReturnType<typeof listCustomerCustomizationRequests>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      requests = await listCustomerCustomizationRequests(supabase, user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load requests";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="My customization requests"
        description="Every outfit request you send to a boutique. Message the boutique or check quotations from here."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <CustomizationRequestsPanel requests={requests} mode="customer" embedded />
    </div>
  );
}
