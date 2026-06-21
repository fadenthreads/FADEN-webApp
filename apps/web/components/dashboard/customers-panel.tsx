"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import type { OwnerCustomerRecord } from "@/lib/dashboard/owner-insights";
import { formatOwnerCurrency } from "@/lib/dashboard/owner-insights";
import { orderStatusLabel } from "@/lib/order/status";

interface CustomersPanelProps {
  customers: OwnerCustomerRecord[];
}

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "Quote pending";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CustomerCard({ customer }: { customer: OwnerCustomerRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PremiumCard hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{customer.name ?? "Customer"}</p>
            {customer.isRepeat && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Repeat customer
              </span>
            )}
          </div>
          {customer.email && (
            <p className="mt-1 text-sm text-foreground-muted">{customer.email}</p>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold text-gold">{customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}</p>
          {customer.totalSpend > 0 && (
            <p className="mt-1 text-foreground-muted">{formatOwnerCurrency(customer.totalSpend)} spent</p>
          )}
        </div>
      </div>

      {customer.outfitTypes.length > 0 && (
        <p className="mt-3 text-sm text-foreground-muted">
          Outfits: {customer.outfitTypes.join(", ")}
        </p>
      )}

      {customer.measurementSummary && (
        <div className="mt-3 rounded-lg bg-background/40 p-3">
          <p className="text-xs font-semibold tracking-wide text-gold">MEASUREMENTS</p>
          <p className="mt-1 text-sm text-foreground-muted">{customer.measurementSummary}</p>
        </div>
      )}

      {customer.preferences.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold tracking-wide text-gold">SAVED PREFERENCES</p>
          <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
            {customer.preferences.map((pref) => (
              <li key={pref}>• {pref}</li>
            ))}
          </ul>
        </div>
      )}

      {customer.orders.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold-light"
          >
            Order history ({customer.orders.length})
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expanded && (
            <ul className="mt-3 space-y-2 border-t border-gold/10 pt-3">
              {customer.orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium">{order.outfitType ?? "Custom order"}</p>
                    <p className="mt-0.5 capitalize text-foreground-muted">
                      {orderStatusLabel(order.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatAmount(order.amount, order.currency)}</p>
                    <PostedAt value={order.createdAt} className="mt-1 text-xs text-foreground-muted/70" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {customer.lastActivityAt && (
        <PostedAt
          value={customer.lastActivityAt}
          className="mt-3 text-xs text-foreground-muted/70"
          prefix="Last activity"
        />
      )}
    </PremiumCard>
  );
}

export function CustomersPanel({ customers }: CustomersPanelProps) {
  const repeatCount = customers.filter((customer) => customer.isRepeat).length;

  if (!customers.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Customer Management</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Customer profiles appear here when someone submits a customization request or places an order
          with your boutique.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Customer Management</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-foreground-muted">Total customers</p>
            <p className="mt-1 font-display text-2xl font-semibold">{customers.length}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Repeat customers</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">{repeatCount}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">With measurements</p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {customers.filter((customer) => customer.measurementSummary).length}
            </p>
          </div>
        </div>
      </PremiumCard>

      {customers.map((customer) => (
        <CustomerCard key={customer.customerId} customer={customer} />
      ))}
    </div>
  );
}
