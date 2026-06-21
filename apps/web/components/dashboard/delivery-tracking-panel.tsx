import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import type { OrderSummary } from "@/lib/customization/queries";
import { orderStatusLabel } from "@/lib/order/status";

interface DeliveryTrackingPanelProps {
  orders: OrderSummary[];
}

const TRACKED_STATUSES = new Set(["in_progress", "shipped", "delivered"]);

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "Quote pending";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DeliveryTrackingPanel({ orders }: DeliveryTrackingPanelProps) {
  const tracked = orders.filter((order) => TRACKED_STATUSES.has(order.status));
  const inProduction = tracked.filter((order) => order.status === "in_progress");
  const inTransit = tracked.filter((order) => order.status === "shipped");
  const delivered = tracked.filter((order) => order.status === "delivered");

  if (!tracked.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Delivery tracking</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Orders appear here after the customer pays and production begins.
        </p>
      </PremiumCard>
    );
  }

  function renderSection(title: string, items: OrderSummary[]) {
    if (!items.length) return null;
    return (
      <div className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold">{title}</p>
        {items.map((order) => (
          <PremiumCard key={order.id} hover={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.outfit_type ?? "Custom order"}</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {order.customer_name || order.customer_email || "Customer"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gold">
                  {formatAmount(order.total_amount, order.currency)}
                </p>
                <p className="mt-1 text-xs font-medium capitalize text-foreground-muted">
                  {orderStatusLabel(order.status)}
                </p>
              </div>
            </div>
            <PostedAt value={order.created_at} prefix="Order placed" className="mt-3 text-xs text-foreground-muted/70" />
          </PremiumCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Delivery tracking</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-foreground-muted">In production</p>
            <p className="mt-1 font-display text-2xl font-semibold">{inProduction.length}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">In transit</p>
            <p className="mt-1 font-display text-2xl font-semibold">{inTransit.length}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Delivered</p>
            <p className="mt-1 font-display text-2xl font-semibold">{delivered.length}</p>
          </div>
        </div>
      </PremiumCard>

      {renderSection("IN PRODUCTION", inProduction)}
      {renderSection("IN TRANSIT", inTransit)}
      {renderSection("DELIVERED", delivered)}
    </div>
  );
}
