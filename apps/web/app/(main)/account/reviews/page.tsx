import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomerReviewsPanel } from "@/components/reviews/customer-reviews-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerReviewableOrders } from "@/lib/review/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Reviews — FADEN",
  description: "Review your delivered orders.",
};

export const dynamic = "force-dynamic";

export default async function AccountReviewsPage() {
  const { user, supabase } = await requireAccountUser("/account/reviews");

  let reviewableOrders: Awaited<ReturnType<typeof listCustomerReviewableOrders>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      reviewableOrders = await listCustomerReviewableOrders(supabase, user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load reviews";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Reviews"
        description="Share feedback on delivered orders to help other customers discover great boutiques."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <CustomerReviewsPanel reviewableOrders={reviewableOrders} embedded />
    </div>
  );
}
