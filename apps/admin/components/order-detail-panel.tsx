"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminOrderDetail } from "@faden/database";
import { formatAdminOrderRef } from "@faden/database";
import type { OrderStatus } from "@faden/types";
import { adminAddOrderNote, adminCancelOrder, adminUpdateOrderStatus } from "@/actions/orders";
import {
  ALL_ORDER_STATUSES,
  formatDateTime,
  formatMoney,
  orderPaidLabel,
  orderStatusLabel,
  paymentBadgeClass,
  paymentStatusLabel,
} from "@/lib/order-labels";

interface OrderDetailPanelProps {
  order: AdminOrderDetail;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);
  const [statusNote, setStatusNote] = useState("");
  const [adminNote, setAdminNote] = useState("");

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed");
        return;
      }
      setStatusNote("");
      setAdminNote("");
      router.refresh();
    });
  }

  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:3000";
  const paymentSummary = orderPaidLabel({
    isPaid: order.isPaid,
    paidAmount: order.paidAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentStatus: order.payment?.status ?? null,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/orders" className="text-sm text-gold hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold">{formatAdminOrderRef(order.id)}</h1>
          <p className="mt-2 text-foreground-muted">{orderStatusLabel(order.status)}</p>
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${paymentBadgeClass(order.isPaid, order.payment?.status)}`}
            >
              {paymentSummary.label}
            </span>
            <p className="mt-1 text-xs text-foreground-muted">{paymentSummary.detail}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Order total</p>
          <p className="font-display text-2xl font-semibold text-gold">
            {formatMoney(order.totalAmount, order.currency)}
          </p>
          {order.isPaid && order.paidAmount != null && (
            <p className="mt-1 text-sm font-medium text-emerald-400">
              Paid {formatMoney(order.paidAmount, order.currency)}
            </p>
          )}
          {!order.isPaid && order.totalAmount != null && (
            <p className="mt-1 text-sm text-foreground-muted">
              Outstanding {formatMoney(order.totalAmount, order.currency)}
            </p>
          )}
          <p className="mt-1 text-xs text-foreground-muted">Created {formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-4 py-3 text-sm text-red-accent">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-gold">Customer</h2>
          <dl className="mt-4">
            <InfoRow label="Name" value={order.customer.name} />
            <InfoRow label="Email" value={order.customer.email} />
            <InfoRow label="Phone" value={order.customer.phone} />
            <InfoRow label="Location" value={order.customer.locationLabel} />
          </dl>
          <Link
            href={`/customers`}
            className="mt-4 inline-block text-xs font-medium text-gold hover:underline"
          >
            View all customers
          </Link>
        </section>

        <section className="rounded-xl border border-border bg-background-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-gold">Boutique</h2>
          <dl className="mt-4">
            <InfoRow label="Name" value={order.boutique.name} />
            <InfoRow label="Owner" value={order.boutique.ownerName} />
            <InfoRow label="Phone" value={order.boutique.phone} />
            <InfoRow label="Email" value={order.boutique.email} />
            <InfoRow label="Address" value={order.boutique.address} />
            <InfoRow label="Status" value={order.boutique.status} />
          </dl>
          {order.boutique.slug && (
            <a
              href={`${webAppUrl}/boutique/${order.boutique.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs font-medium text-gold hover:underline"
            >
              View boutique on FADEN →
            </a>
          )}
        </section>
      </div>

      {order.request && (
        <section className="rounded-xl border border-border bg-background-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-gold">Customization request</h2>
          <dl className="mt-4 grid gap-0 sm:grid-cols-2">
            <InfoRow label="Outfit" value={order.request.outfitType} />
            <InfoRow label="Audience" value={order.request.outfitAudience} />
            <InfoRow label="Occasion" value={order.request.occasion} />
            <InfoRow label="Delivery date" value={order.request.deliveryDate} />
            <InfoRow label="Measurements" value={order.request.measurementMode} />
            <InfoRow label="Fabric" value={order.request.fabricSource} />
            <InfoRow label="Request status" value={order.request.status} />
          </dl>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {order.quotation && (
          <section className="rounded-xl border border-border bg-background-elevated p-5">
            <h2 className="font-display text-lg font-semibold text-gold">Quotation</h2>
            <dl className="mt-4">
              <InfoRow label="Subtotal" value={formatMoney(order.quotation.subtotal, order.currency)} />
              <InfoRow label="Tax" value={formatMoney(order.quotation.tax, order.currency)} />
              <InfoRow label="Total" value={formatMoney(order.quotation.total, order.currency)} />
              <InfoRow
                label="Valid until"
                value={order.quotation.validUntil ? formatDateTime(order.quotation.validUntil) : null}
              />
              <InfoRow label="Notes" value={order.quotation.notes} />
            </dl>
          </section>
        )}

        {order.payment && (
          <section className="rounded-xl border border-border bg-background-elevated p-5">
            <h2 className="font-display text-lg font-semibold text-gold">Payment</h2>
            <dl className="mt-4">
              <InfoRow
                label="Paid"
                value={order.isPaid ? `Yes — ${formatMoney(order.paidAmount, order.currency)}` : "No"}
              />
              <InfoRow label="Amount" value={formatMoney(order.payment.amount, order.payment.currency)} />
              <InfoRow label="Status" value={paymentStatusLabel(order.payment.status)} />
              <InfoRow label="Provider" value={order.payment.provider} />
              <InfoRow label="Reference" value={order.payment.providerPaymentId} />
              <InfoRow label="Recorded at" value={formatDateTime(order.payment.createdAt)} />
            </dl>
          </section>
        )}

        {!order.payment && (
          <section className="rounded-xl border border-border bg-background-elevated p-5">
            <h2 className="font-display text-lg font-semibold text-gold">Payment</h2>
            <p className="mt-4 text-sm text-foreground-muted">
              Not paid yet
              {order.totalAmount != null
                ? ` — ${formatMoney(order.totalAmount, order.currency)} outstanding`
                : ""}
              .
            </p>
          </section>
        )}
      </div>

      <section className="rounded-xl border border-border bg-background-elevated p-5">
        <h2 className="font-display text-lg font-semibold text-gold">Order timeline</h2>
        {order.events.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-muted">No events recorded yet.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {order.events.map((event) => (
              <li key={event.id} className="border-l-2 border-gold/30 pl-4">
                <p className="text-sm font-medium text-foreground">{orderStatusLabel(event.status)}</p>
                {event.note && <p className="mt-1 text-sm text-foreground-muted">{event.note}</p>}
                <p className="mt-1 text-xs text-foreground-muted">
                  {formatDateTime(event.createdAt)}
                  {event.createdByName ? ` · ${event.createdByName}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
        {order.hasReview && (
          <p className="mt-4 text-sm text-emerald-400">Customer left a review for this order.</p>
        )}
      </section>

      <section className="rounded-xl border border-gold/25 bg-gold/5 p-5">
        <h2 className="font-display text-lg font-semibold text-gold">Admin actions</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Override order status, cancel disputes, or leave internal notes — similar to marketplace admin tools.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Update status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
            >
              {ALL_ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabel(status)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Optional note for timeline"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
            />
            <button
              type="button"
              disabled={pending || nextStatus === order.status}
              onClick={() =>
                runAction(() =>
                  adminUpdateOrderStatus({
                    orderId: order.id,
                    status: nextStatus,
                    note: statusNote || undefined,
                  }),
                )
              }
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Update status
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Add admin note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Internal note visible on order timeline"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
            />
            <button
              type="button"
              disabled={pending || !adminNote.trim()}
              onClick={() =>
                runAction(() => adminAddOrderNote({ orderId: order.id, note: adminNote.trim() }))
              }
              className="rounded-lg border border-gold/40 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
            >
              Add note
            </button>
          </div>
        </div>

        {order.status !== "cancelled" && order.status !== "delivered" && (
          <div className="mt-6 border-t border-border/60 pt-6">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Cancel this order? This will update the linked request.")) return;
                runAction(() => adminCancelOrder({ orderId: order.id }));
              }}
              className="rounded-lg border border-red-accent/40 px-4 py-2 text-sm font-medium text-red-accent transition-colors hover:bg-red-accent/10 disabled:opacity-50"
            >
              Cancel order
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
