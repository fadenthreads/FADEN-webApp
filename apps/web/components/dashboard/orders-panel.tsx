"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import { updateOrderStatus } from "@/actions/orders";
import type { OrderSummary } from "@/lib/customization/queries";
import { orderStatusLabel } from "@/lib/order/status";

interface OrdersPanelProps {
  orders: OrderSummary[];
}

const STATUS_ACTIONS: Record<string, { label: string; next: "in_progress" | "shipped" }[]> = {
  in_progress: [{ label: "Mark ready for delivery", next: "shipped" }],
};

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "Quote pending";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrdersPanel({ orders }: OrdersPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusUpdate(orderId: string, status: "in_progress" | "shipped") {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status });
      if (!result.ok) {
        setError(result.error ?? "Update failed");
        return;
      }
      router.refresh();
    });
  }

  if (!orders.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Orders</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Orders appear when customers submit customization requests directly to your boutique.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Orders</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}
      </PremiumCard>

      {orders.map((order) => {
        const actions = STATUS_ACTIONS[order.status] ?? [];
        return (
          <PremiumCard key={order.id} hover={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {order.outfit_type ?? "Custom order"}
                </p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {order.customer_name || order.customer_email || "Customer"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gold">
                  {formatAmount(order.total_amount, order.currency)}
                </p>
                <p className="mt-1 text-xs font-medium text-foreground-muted">
                  {orderStatusLabel(order.status)}
                </p>
              </div>
            </div>
            <PostedAt value={order.created_at} className="mt-3 text-xs text-foreground-muted" />
            {order.status === "shipped" && (
              <p className="mt-3 text-xs text-foreground-muted">
                Awaiting customer balance payment — delivery completes automatically after they pay.
              </p>
            )}
            {actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    type="button"
                    variant="luxury-outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleStatusUpdate(order.id, action.next)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </PremiumCard>
        );
      })}
    </div>
  );
}
