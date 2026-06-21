import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import {
  formatInr,
  paymentStatusLabel,
  summarizePaymentsForOwner,
  type PaymentSummary,
} from "@/lib/payment/queries";
import { orderStatusLabel } from "@/lib/order/status";

interface OwnerPaymentsPanelProps {
  payments: PaymentSummary[];
}

export function OwnerPaymentsPanel({ payments }: OwnerPaymentsPanelProps) {
  const { captured, pending, totalCaptured } = summarizePaymentsForOwner(payments);

  if (!payments.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Payments</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Payments appear here when customers pay for confirmed orders.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Payments</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-foreground-muted">Total received</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">
              {formatInr(totalCaptured)}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Completed</p>
            <p className="mt-1 font-display text-2xl font-semibold">{captured.length}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Pending</p>
            <p className="mt-1 font-display text-2xl font-semibold">{pending.length}</p>
          </div>
        </div>
      </PremiumCard>

      {payments.map((payment) => (
        <PremiumCard key={payment.id} hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{payment.outfit_type ?? "Custom order"}</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {payment.customer_name ?? "Customer"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gold">{formatInr(payment.amount)}</p>
              <p className="mt-1 text-xs capitalize text-foreground-muted">
                {paymentStatusLabel(payment.status)}
              </p>
              {payment.order_status && payment.order_status !== "confirmed" && (
                <p className="mt-1 text-xs font-medium text-gold">
                  {orderStatusLabel(payment.order_status)}
                </p>
              )}
            </div>
          </div>
          <PostedAt value={payment.created_at} className="mt-3 text-xs text-foreground-muted/70" />
          {payment.provider_payment_id && (
            <p className="mt-2 text-xs text-foreground-muted/70">
              Ref: {payment.provider_payment_id.slice(0, 20)}
              {payment.provider_payment_id.length > 20 ? "…" : ""}
            </p>
          )}
        </PremiumCard>
      ))}
    </div>
  );
}
