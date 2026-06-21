import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomerPaymentsPanel } from "@/components/payments/customer-payments-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerPayableOrders, listCustomerPayments } from "@/lib/payment/queries";
import { isRazorpayConfigured } from "@/lib/payment/razorpay";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Payments — FADEN",
  description: "Pay for your confirmed orders.",
};

export const dynamic = "force-dynamic";

export default async function AccountPaymentsPage() {
  const { user, supabase } = await requireAccountUser("/account/payments");

  let payableOrders: Awaited<ReturnType<typeof listCustomerPayableOrders>> = [];
  let payments: Awaited<ReturnType<typeof listCustomerPayments>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      payableOrders = await listCustomerPayableOrders(supabase, user.id);
      payments = await listCustomerPayments(supabase, user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load payments";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Payments"
        description="Pay securely after accepting a quotation. View your payment history here."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <CustomerPaymentsPanel
        payableOrders={payableOrders}
        payments={payments}
        razorpayEnabled={isRazorpayConfigured()}
        embedded
      />
    </div>
  );
}
