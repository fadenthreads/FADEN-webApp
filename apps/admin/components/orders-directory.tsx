"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminOrderListItem, AdminOrderStats } from "@faden/database";
import { formatAdminOrderRef } from "@faden/database";
import type { OrderStatus } from "@faden/types";
import { formatDateTime, formatMoney, orderPaidLabel, orderStatusLabel, paymentBadgeClass } from "@/lib/order-labels";

interface OrdersDirectoryProps {
  orders: AdminOrderListItem[];
  stats: AdminOrderStats | null;
}

const STATUS_FILTERS: Array<{ id: "all" | OrderStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "quoted", label: "Quoted" },
  { id: "confirmed", label: "Awaiting payment" },
  { id: "in_progress", label: "In production" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    case "cancelled":
      return "border-red-accent/40 bg-red-accent/10 text-red-accent";
    case "shipped":
      return "border-sky-500/40 bg-sky-500/10 text-sky-400";
    case "in_progress":
      return "border-gold/40 bg-gold/10 text-gold";
    case "confirmed":
      return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    default:
      return "border-border bg-background-soft text-foreground-muted";
  }
}

export function OrdersDirectory({ orders, stats }: OrdersDirectoryProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter((order) => order.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((order) => {
      const haystack = [
        formatAdminOrderRef(order.id),
        order.customerName,
        order.customerEmail,
        order.boutiqueName,
        order.outfitType,
        order.occasion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, query, statusFilter]);

  if (!orders.length) {
    return (
      <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
        No orders yet. Orders appear when customers submit customization requests to boutiques.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total orders", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Delivered", value: stats.completed },
            { label: "Cancelled", value: stats.cancelled },
            { label: "Awaiting payment", value: stats.pendingPayment },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-background-elevated px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-foreground-muted">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-gold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-foreground-muted">
          {filtered.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order ref, customer, boutique, outfit…"
          className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === filter.id
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-border text-foreground-muted hover:border-gold/30 hover:text-gold"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-background-soft text-left text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Boutique</th>
              <th className="px-4 py-3 font-medium">Outfit</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const payment = orderPaidLabel({
                isPaid: order.isPaid,
                paidAmount: order.paidAmount,
                totalAmount: order.totalAmount,
                currency: order.currency,
                paymentStatus: order.paymentStatus,
              });

              return (
              <tr key={order.id} className="border-t border-border/60 align-top hover:bg-background-soft/50">
                <td className="px-4 py-4">
                  <Link href={`/orders/${order.id}`} className="font-medium text-gold hover:underline">
                    {formatAdminOrderRef(order.id)}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{order.customerName || "—"}</p>
                  <p className="mt-1 text-xs text-foreground-muted">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="mt-1 text-xs text-foreground-muted">{order.customerPhone}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{order.boutiqueName}</p>
                  {order.boutiqueOwnerName && (
                    <p className="mt-1 text-xs text-foreground-muted">{order.boutiqueOwnerName}</p>
                  )}
                </td>
                <td className="px-4 py-4 text-foreground-muted">
                  <p>{order.outfitType || "Custom"}</p>
                  {order.occasion && <p className="mt-1 text-xs">{order.occasion}</p>}
                </td>
                <td className="px-4 py-4 font-medium text-foreground">
                  {formatMoney(order.totalAmount, order.currency)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${paymentBadgeClass(order.isPaid, order.paymentStatus)}`}
                  >
                    {payment.label}
                  </span>
                  <p className="mt-1 text-xs text-foreground-muted">{payment.detail}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-foreground-muted">{formatDateTime(order.createdAt)}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {!filtered.length && (
        <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
          No orders match your filters.
        </div>
      )}
    </div>
  );
}
