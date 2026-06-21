"use client";

import { useMemo, useState } from "react";
import type { AdminCustomerRecord } from "@faden/database";

interface AllCustomersDirectoryProps {
  customers: AdminCustomerRecord[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AllCustomersDirectory({ customers }: AllCustomersDirectoryProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) => {
      const haystack = [
        customer.fullName,
        customer.email,
        customer.phone,
        customer.locationLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, query]);

  const totals = useMemo(
    () => ({
      customizations: customers.reduce((sum, c) => sum + c.customizationCount, 0),
      orders: customers.reduce((sum, c) => sum + c.orderCount, 0),
      conversations: customers.reduce((sum, c) => sum + c.conversationCount, 0),
    }),
    [customers],
  );

  if (!customers.length) {
    return (
      <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
        No customers registered yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background-elevated px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Customers</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gold">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background-elevated px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Customization requests</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gold">{totals.customizations}</p>
        </div>
        <div className="rounded-xl border border-border bg-background-elevated px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Orders</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gold">{totals.orders}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-foreground-muted">
          {filtered.length} of {customers.length} customer{customers.length === 1 ? "" : "s"}
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone, location…"
          className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-background-soft text-left text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-t border-border/60 align-top">
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{customer.fullName || "—"}</p>
                  <p className="mt-1 text-xs text-foreground-muted">{customer.email}</p>
                  {customer.locationLabel && (
                    <p className="mt-1 text-xs text-foreground-muted">{customer.locationLabel}</p>
                  )}
                </td>
                <td className="px-4 py-4 text-foreground-muted">
                  <p>{customer.phone || "—"}</p>
                </td>
                <td className="px-4 py-4">
                  <dl className="grid gap-1 text-xs text-foreground-muted">
                    <div className="flex justify-between gap-4">
                      <dt>Customizations</dt>
                      <dd className="font-medium text-foreground">{customer.customizationCount}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Orders</dt>
                      <dd className="font-medium text-foreground">{customer.orderCount}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Conversations</dt>
                      <dd className="font-medium text-foreground">{customer.conversationCount}</dd>
                    </div>
                  </dl>
                </td>
                <td className="px-4 py-4 text-foreground-muted">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!filtered.length && (
        <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
          No customers match your search.
        </div>
      )}
    </div>
  );
}
