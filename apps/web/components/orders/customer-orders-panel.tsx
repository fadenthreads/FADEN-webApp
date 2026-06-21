import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import type { CustomerTrackedOrder } from "@/lib/customization/queries";
import { formatPostedAt } from "@/lib/datetime/format";
import {
  FULFILLMENT_STEPS,
  fulfillmentStepIndex,
  orderStatusHint,
  orderStatusLabel,
} from "@/lib/order/status";

interface CustomerOrdersPanelProps {
  orders: CustomerTrackedOrder[];
}

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function FulfillmentProgress({ status }: { status: CustomerTrackedOrder["status"] }) {
  const currentIndex = fulfillmentStepIndex(status);
  const visibleSteps = FULFILLMENT_STEPS.filter((step) => step !== "confirmed");

  return (
    <ol className="mt-4 flex flex-wrap gap-2">
      {visibleSteps.map((step) => {
        const done = currentIndex >= fulfillmentStepIndex(step);
        const active = status === step;
        return (
          <li
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              active
                ? "bg-gold/20 text-gold"
                : done
                  ? "bg-cherry/30 text-foreground"
                  : "bg-foreground/5 text-foreground-muted"
            }`}
          >
            {orderStatusLabel(step)}
          </li>
        );
      })}
    </ol>
  );
}

export function CustomerOrdersPanel({ orders }: CustomerOrdersPanelProps) {
  const active = orders.filter((order) => order.status !== "delivered");
  const completed = orders.filter((order) => order.status === "delivered");

  if (!orders.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Order tracking</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          After you pay, production and delivery updates will appear here.
        </p>
      </PremiumCard>
    );
  }

  function renderOrder(order: CustomerTrackedOrder) {
    const hint = orderStatusHint(order.status);

    return (
      <PremiumCard key={order.id} hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{order.outfit_type ?? "Custom order"}</p>
            <p className="mt-1 text-sm text-foreground-muted">
              {order.boutique_name ?? "Boutique"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gold">
              {formatAmount(order.total_amount, order.currency)}
            </p>
            <p className="mt-1 text-xs font-medium text-gold">{orderStatusLabel(order.status)}</p>
            <PostedAt value={order.created_at} prefix="Order placed" className="mt-1 text-xs text-foreground-muted/70" />
          </div>
        </div>

        {hint && <p className="mt-3 text-sm text-foreground-muted">{hint}</p>}

        <FulfillmentProgress status={order.status} />

        {order.events.length > 0 && (
          <ul className="mt-5 space-y-3 border-t border-gold/10 pt-4">
            {order.events.map((event) => (
              <li key={event.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                <div>
                  <p className="font-medium capitalize">{orderStatusLabel(event.status)}</p>
                  {event.note && (
                    <p className="mt-0.5 text-foreground-muted">{event.note}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted/70">
                    {formatPostedAt(event.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Order tracking</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Follow production and delivery for your paid orders.
        </p>
      </PremiumCard>

      {active.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">IN PROGRESS</p>
          {active.map(renderOrder)}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-foreground-muted">DELIVERED</p>
          {completed.map(renderOrder)}
        </div>
      )}
    </div>
  );
}
