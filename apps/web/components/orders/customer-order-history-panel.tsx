"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@faden/ui";
import { cn } from "@faden/utils";
import { PremiumCard } from "@/components/ui/premium-card";
import { formatDateOnly, formatPostedAt } from "@/lib/datetime/format";
import {
  FULFILLMENT_STEPS,
  fulfillmentStepIndex,
  orderStatusHint,
  orderStatusLabel,
} from "@/lib/order/status";
import {
  filterOrderHistory,
  formatOrderRef,
  isOrderPayable,
  isOrderReviewable,
  orderHistoryCounts,
  type CustomerOrderHistoryItem,
  type OrderHistoryFilter,
} from "@/lib/orders/customer-order-history";

interface CustomerOrderHistoryPanelProps {
  orders: CustomerOrderHistoryItem[];
  embedded?: boolean;
}

const FILTER_TABS: { id: OrderHistoryFilter; label: string }[] = [
  { id: "all", label: "All orders" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "Price on quotation";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadgeClass(status: CustomerOrderHistoryItem["status"]): string {
  switch (status) {
    case "delivered":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-200";
    case "confirmed":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "quoted":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "draft":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "in_progress":
    case "shipped":
      return "border-gold/30 bg-navy/10 text-navy font-medium";
    default:
      return "border-border bg-background-elevated text-foreground-muted";
  }
}

function FulfillmentProgress({ status }: { status: CustomerOrderHistoryItem["status"] }) {
  if (!["confirmed", "in_progress", "shipped", "delivered"].includes(status)) return null;

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
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              active
                ? "bg-gold/20 text-gold"
                : done
                  ? "bg-cherry/30 text-foreground"
                  : "bg-foreground/5 text-foreground-muted",
            )}
          >
            {orderStatusLabel(step)}
          </li>
        );
      })}
    </ol>
  );
}

function OrderTimeline({ events }: { events: CustomerOrderHistoryItem["events"] }) {
  if (!events.length) return null;

  return (
    <ul className="mt-4 space-y-3 border-t border-border pt-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
          <div>
            <p className="font-medium">{orderStatusLabel(event.status)}</p>
            {event.note && <p className="mt-0.5 text-foreground-muted">{event.note}</p>}
            <p className="mt-1 text-xs text-foreground-muted/70">{formatPostedAt(event.created_at)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderActions({ order }: { order: CustomerOrderHistoryItem }) {
  const actions: { label: string; href: string; variant: "luxury" | "luxury-outline" }[] = [];

  if (order.status === "quoted") {
    actions.push({ label: "View quotation", href: "/account/quotations", variant: "luxury" });
  }
  if (order.status === "draft") {
    actions.push({ label: "View request", href: "/account/requests", variant: "luxury-outline" });
  }
  if (isOrderPayable(order)) {
    actions.push({ label: "Pay now", href: "/account/payments", variant: "luxury" });
  }
  if (isOrderReviewable(order)) {
    actions.push({ label: "Write review", href: "/account/reviews", variant: "luxury-outline" });
  }
  if (order.boutique_slug) {
    actions.push({
      label: "Order again",
      href: `/customize?boutique=${encodeURIComponent(order.boutique_slug)}`,
      variant: "luxury-outline",
    });
  }
  actions.push({ label: "Message boutique", href: "/account/messages", variant: "luxury-outline" });

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
      {actions.map((action) => (
        <Button key={action.label} asChild variant={action.variant} size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ))}
    </div>
  );
}

function OrderHistoryCard({ order }: { order: CustomerOrderHistoryItem }) {
  const [expanded, setExpanded] = useState(
    ["in_progress", "shipped"].includes(order.status) || order.events.length > 0,
  );
  const hint = orderStatusHint(order.status);
  const showTracking = ["in_progress", "shipped", "delivered"].includes(order.status);

  return (
    <PremiumCard hover={false} className="overflow-hidden p-0">
      <div className="border-b border-border bg-background-elevated/50 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
            <span className="font-mono font-medium text-foreground">{formatOrderRef(order.id)}</span>
            <span aria-hidden>·</span>
            <span>Placed {formatPostedAt(order.created_at)}</span>
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
              statusBadgeClass(order.status),
            )}
          >
            {orderStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
            <Package className="h-6 w-6 text-gold" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{order.outfit_type ?? "Custom outfit"}</p>
            <p className="mt-0.5 text-sm text-foreground-muted">
              {order.boutique_name ?? "Boutique"}
            </p>
            {order.occasion && (
              <p className="mt-1 text-xs text-foreground-muted">Occasion: {order.occasion}</p>
            )}
            {order.delivery_date && (
              <p className="mt-1 text-xs text-foreground-muted">
                Delivery by {formatDateOnly(order.delivery_date)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gold">
              {formatAmount(order.total_amount, order.currency)}
            </p>
            {order.payment_status === "captured" && (
              <p className="mt-1 text-xs text-emerald-300/80">Paid</p>
            )}
            {isOrderPayable(order) && (
              <p className="mt-1 text-xs text-sky-300/80">Payment pending</p>
            )}
          </div>
        </div>

        {hint && <p className="mt-3 text-sm text-foreground-muted">{hint}</p>}

        {showTracking && <FulfillmentProgress status={order.status} />}

        {order.events.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-4 flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light"
          >
            {expanded ? (
              <>
                Hide updates <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                View {order.events.length} update{order.events.length === 1 ? "" : "s"}{" "}
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}

        {expanded && <OrderTimeline events={order.events} />}

        <OrderActions order={order} />
      </div>
    </PremiumCard>
  );
}

export function CustomerOrderHistoryPanel({ orders, embedded = false }: CustomerOrderHistoryPanelProps) {
  const [filter, setFilter] = useState<OrderHistoryFilter>("all");
  const counts = useMemo(() => orderHistoryCounts(orders), [orders]);
  const filtered = useMemo(() => filterOrderHistory(orders, filter), [orders, filter]);

  if (!orders.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h2 className="font-display text-xl font-semibold text-gold">Your orders</h2>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          When you accept a quotation and pay, your orders will appear here — just like your order
          history on other shopping apps.
        </p>
        <Button asChild variant="luxury" className="mt-4">
          <Link href="/customize">Start a customization</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4" id={embedded ? undefined : "orders"}>
      {!embedded && (
        <PremiumCard hover={false}>
          <h2 className="font-display text-xl font-semibold text-gold">Your orders</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Full order history — track active orders, revisit deliveries, and reorder from boutiques
            you love.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => {
              const count = counts[tab.id];
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-navy bg-navy/10 text-navy font-medium"
                      : "border-border bg-background-soft text-foreground-muted hover:border-gold/40",
                  )}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </PremiumCard>
      )}

      {embedded && (
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const count = counts[tab.id];
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-navy bg-navy/10 text-navy font-medium"
                    : "border-border bg-background-soft text-foreground-muted hover:border-gold/40",
                )}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">
            No orders in this category. Try another filter or start a new customization.
          </p>
        </PremiumCard>
      ) : (
        filtered.map((order) => <OrderHistoryCard key={order.id} order={order} />)
      )}
    </div>
  );
}
