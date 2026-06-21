import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomerQuotationsPanel } from "@/components/quotations/customer-quotations-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerQuotations } from "@/lib/quotation/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Quotations — FADEN",
  description: "Review quotations from boutiques.",
};

export const dynamic = "force-dynamic";

export default async function AccountQuotationsPage() {
  const { user, supabase } = await requireAccountUser("/account/quotations");

  let quotations: Awaited<ReturnType<typeof listCustomerQuotations>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      quotations = await listCustomerQuotations(supabase, user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load quotations";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Quotations"
        description="Review price breakdowns from boutiques and accept to proceed to payment."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <CustomerQuotationsPanel quotations={quotations} embedded />
    </div>
  );
}
