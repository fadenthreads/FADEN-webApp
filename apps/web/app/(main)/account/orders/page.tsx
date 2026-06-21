import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomerOrderHistoryPanel } from "@/components/orders/customer-order-history-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerOrderHistory } from "@/lib/orders/customer-order-history";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "My Orders — FADEN",
  description: "View and track your orders.",
};

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const { user, supabase } = await requireAccountUser("/account/orders");

  let orders: Awaited<ReturnType<typeof listCustomerOrderHistory>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      orders = await listCustomerOrderHistory(supabase, user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load orders";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Your orders"
        description="Full order history with tracking, payments, and reorder options."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <CustomerOrderHistoryPanel orders={orders} embedded />
    </div>
  );
}
