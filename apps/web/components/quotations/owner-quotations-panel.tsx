"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { createQuotation } from "@/actions/quotations";
import { QuotationCard } from "@/components/quotations/quotation-card";
import type { OrderSummary } from "@/lib/customization/queries";
import type { QuotationSummary } from "@/lib/quotation/queries";
import { formatPostedAt } from "@/lib/datetime/format";
import { formatInr } from "@/lib/quotation/queries";

interface LineItemDraft {
  label: string;
  quantity: string;
  unitPrice: string;
}

interface OwnerQuotationsPanelProps {
  orders: OrderSummary[];
  quotations: QuotationSummary[];
}

const DEFAULT_LINE: LineItemDraft = { label: "", quantity: "1", unitPrice: "" };

const SUGGESTED_ITEMS = ["Fabric", "Tailoring", "Embroidery", "Delivery"];

interface CustomerOption {
  id: string;
  name: string | null;
  email: string | null;
}

function customerLabel(customer: CustomerOption) {
  if (customer.name && customer.email) return `${customer.name} (${customer.email})`;
  return customer.name || customer.email || `Customer ${customer.id.slice(0, 8)}`;
}

function orderLabel(order: OrderSummary) {
  const outfit = order.outfit_type ?? "Custom outfit";
  return `${outfit} — ${formatPostedAt(order.created_at)} (${order.status})`;
}

function buildCustomerOptions(orders: OrderSummary[]): CustomerOption[] {
  const byId = new Map<string, CustomerOption>();
  for (const order of orders) {
    if (!byId.has(order.customer_id)) {
      byId.set(order.customer_id, {
        id: order.customer_id,
        name: order.customer_name ?? null,
        email: order.customer_email ?? null,
      });
    }
  }
  return [...byId.values()].sort((a, b) =>
    customerLabel(a).localeCompare(customerLabel(b)),
  );
}

export function OwnerQuotationsPanel({ orders, quotations }: OwnerQuotationsPanelProps) {
  const router = useRouter();
  const quotableOrders = useMemo(
    () => orders.filter((o) => o.status === "draft" || o.status === "quoted"),
    [orders],
  );
  const customers = useMemo(() => buildCustomerOptions(quotableOrders), [quotableOrders]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? "");
  const ordersForCustomer = useMemo(
    () => quotableOrders.filter((order) => order.customer_id === selectedCustomerId),
    [quotableOrders, selectedCustomerId],
  );
  const [selectedOrderId, setSelectedOrderId] = useState(ordersForCustomer[0]?.id ?? "");

  useEffect(() => {
    if (!customers.some((customer) => customer.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0]?.id ?? "");
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (!ordersForCustomer.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(ordersForCustomer[0]?.id ?? "");
    }
  }, [ordersForCustomer, selectedOrderId]);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { label: "Fabric", quantity: "1", unitPrice: "" },
    { label: "Tailoring", quantity: "1", unitPrice: "" },
  ]);
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const total = subtotal + (Number(tax) || 0);

  function updateLine(index: number, patch: Partial<LineItemDraft>) {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addLine(label = "") {
    setLineItems((prev) => [...prev, { ...DEFAULT_LINE, label }]);
  }

  function removeLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!selectedCustomerId) {
      setError("Select a customer to quote.");
      return;
    }

    if (!selectedOrderId) {
      setError("Select an order for this customer.");
      return;
    }

    startTransition(async () => {
      const result = await createQuotation({
        orderId: selectedOrderId,
        lineItems: lineItems.map((item) => ({
          label: item.label,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        tax: Number(tax) || 0,
        notes,
        validUntilDays: 7,
      });

      if (!result.ok) {
        setError(result.error ?? "Failed to send quotation");
        return;
      }

      setSuccess("Quotation sent to customer.");
      setNotes("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Send Quotation</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Build a line-item quote for a pending order. The customer will see it on their account.
        </p>

        {error && (
          <p className="mt-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            {success}
          </p>
        )}

        {!quotableOrders.length ? (
          <p className="mt-4 text-sm text-foreground-muted">
            No orders ready for quotation. Orders appear when customers customize with your boutique.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="text-foreground-muted">Customer</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customerLabel(customer)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-foreground-muted">Order</span>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                disabled={!ordersForCustomer.length}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40 disabled:opacity-50"
              >
                {ordersForCustomer.map((order) => (
                  <option key={order.id} value={order.id}>
                    {orderLabel(order)}
                  </option>
                ))}
              </select>
              {ordersForCustomer.length > 1 && (
                <p className="mt-1 text-xs text-foreground-muted">
                  This customer has {ordersForCustomer.length} open orders — pick the one you are quoting.
                </p>
              )}
            </label>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-gold">LINE ITEMS</p>
              {lineItems.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_80px_100px_auto]">
                  <input
                    value={item.label}
                    onChange={(e) => updateLine(index, { label: e.target.value })}
                    placeholder="Item label"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLine(index, { quantity: e.target.value })}
                    placeholder="Qty"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
                    placeholder="₹ Price"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
                  />
                  <Button
                    type="button"
                    variant="luxury-outline"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={lineItems.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="luxury-outline" size="sm" onClick={() => addLine()}>
                  + Add line
                </Button>
                {SUGGESTED_ITEMS.map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => addLine(label)}
                  >
                    + {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-foreground-muted">Tax (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
                />
              </label>
              <div className="flex items-end">
                <p className="text-sm text-foreground-muted">
                  Total: <span className="font-semibold text-gold">{formatInr(total)}</span>
                </p>
              </div>
            </div>

            <label className="block text-sm">
              <span className="text-foreground-muted">Notes for customer (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
                placeholder="Delivery timeline, fabric details, payment terms…"
              />
            </label>

            <Button type="button" variant="luxury" disabled={pending} onClick={handleSubmit}>
              {pending ? "Sending…" : "Send quotation"}
            </Button>
          </div>
        )}
      </PremiumCard>

      {quotations.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-gold">Sent quotations</h3>
          {quotations.map((quote) => (
            <QuotationCard key={quote.id} quotation={quote} mode="owner" />
          ))}
        </div>
      )}
    </div>
  );
}
