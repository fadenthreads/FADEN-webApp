"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import {
  formatInr,
  paymentStatusLabel,
  type PayableOrder,
  type PaymentSummary,
} from "@/lib/payment/queries";
import { orderStatusLabel } from "@/lib/order/status";

interface CustomerPaymentsPanelProps {
  payableOrders: PayableOrder[];
  payments: PaymentSummary[];
  razorpayEnabled: boolean;
  embedded?: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export function CustomerPaymentsPanel({
  payableOrders,
  payments,
  razorpayEnabled,
  embedded = false,
}: CustomerPaymentsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  async function handlePay(orderId: string) {
    setError(null);
    setPayingOrderId(orderId);

    try {
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const createPayload = (await createRes.json()) as {
        ok?: boolean;
        error?: string;
        paymentId?: string;
        amount?: number;
        mock?: boolean;
        keyId?: string;
        razorpayOrderId?: string | null;
      };

      if (!createRes.ok || !createPayload.ok || !createPayload.paymentId) {
        setError(createPayload.error ?? "Could not start payment");
        return;
      }

      if (createPayload.mock) {
        startTransition(async () => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: createPayload.paymentId, mock: true }),
          });
          const verifyPayload = (await verifyRes.json()) as { ok?: boolean; error?: string };
          if (!verifyRes.ok || !verifyPayload.ok) {
            setError(verifyPayload.error ?? "Payment failed");
            return;
          }
          router.refresh();
        });
        return;
      }

      await loadRazorpayScript();

      const paymentId = createPayload.paymentId;
      const amount = createPayload.amount ?? 0;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: createPayload.keyId,
          amount: Math.round(amount * 100),
          currency: "INR",
          name: "FADEN",
          description: "Custom outfit order",
          order_id: createPayload.razorpayOrderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyPayload = (await verifyRes.json()) as { ok?: boolean; error?: string };
              if (!verifyRes.ok || !verifyPayload.ok) {
                reject(new Error(verifyPayload.error ?? "Verification failed"));
                return;
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          theme: { color: "#722F37" },
        });
        rzp.open();
      });

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message !== "Payment cancelled") setError(message);
    } finally {
      setPayingOrderId(null);
    }
  }

  const captured = payments.filter((p) => p.status === "captured");

  if (!payableOrders.length && !captured.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h3 className="font-display text-lg font-semibold text-gold">Payments</h3>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          After you accept a quotation, your payment options will appear here.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Payments</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {razorpayEnabled
              ? "Pay securely via Razorpay after accepting a quotation."
              : "Development mode — use simulated payment (configure Razorpay keys for live checkout)."}
          </p>
          {error && (
            <p className="mt-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
              {error}
            </p>
          )}
        </PremiumCard>
      )}
      {embedded && error && (
        <p className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      {payableOrders.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">AWAITING PAYMENT</p>
          {payableOrders.map((order) => (
            <PremiumCard key={order.id} hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{order.outfit_type ?? "Custom order"}</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {order.boutique_name ?? "Boutique"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gold">{formatInr(order.total_amount)}</p>
              </div>
              <PostedAt value={order.created_at} prefix="Quoted" className="mt-3 text-xs text-foreground-muted/70" />
              <Button
                type="button"
                variant="luxury"
                className="mt-4"
                disabled={pending || payingOrderId === order.id}
                onClick={() => handlePay(order.id)}
              >
                {payingOrderId === order.id
                  ? "Processing…"
                  : razorpayEnabled
                    ? "Pay with Razorpay"
                    : "Simulate payment"}
              </Button>
            </PremiumCard>
          ))}
        </div>
      )}

      {captured.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-foreground-muted">PAID</p>
          {captured.map((payment) => (
            <PremiumCard key={payment.id} hover={false}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium">{payment.outfit_type ?? "Custom order"}</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {payment.boutique_name ?? "Boutique"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold">{formatInr(payment.amount)}</p>
                  <p className="mt-1 text-xs capitalize text-foreground-muted">
                    {paymentStatusLabel(payment.status)}
                  </p>
                  <PostedAt value={payment.created_at} prefix="Paid" className="mt-1 text-xs text-foreground-muted/70" />
                  {payment.order_status && payment.order_status !== "confirmed" && (
                    <p className="mt-1 text-xs font-medium text-gold">
                      {orderStatusLabel(payment.order_status)}
                    </p>
                  )}
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
}
