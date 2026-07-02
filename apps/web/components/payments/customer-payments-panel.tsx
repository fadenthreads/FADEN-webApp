"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import { UpiPaymentModal } from "@/components/payments/upi-payment-modal";
import {
  formatInr,
  paymentStatusLabel,
  type PayableOrder,
  type PaymentSummary,
} from "@/lib/payment/queries";
import { paymentPhaseLabel } from "@/lib/payment/split-payment";
import { isUpiPaymentEnabled } from "@/lib/payment/upi";
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

interface UpiCheckoutState {
  paymentId: string;
  amount: number;
  phase: PayableOrder["payment_phase"];
  outfitLabel: string | null;
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
  const [upiCheckout, setUpiCheckout] = useState<UpiCheckoutState | null>(null);

  const upiEnabled = isUpiPaymentEnabled();

  async function createPaymentOrder(order: PayableOrder) {
    const createRes = await fetch("/api/payments/create-order", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, phase: order.payment_phase }),
    });
    const createPayload = (await createRes.json()) as {
      ok?: boolean;
      error?: string;
      paymentId?: string;
      amount?: number;
      mock?: boolean;
      keyId?: string;
      razorpayOrderId?: string | null;
      phase?: PayableOrder["payment_phase"];
    };

    if (!createRes.ok || !createPayload.ok || !createPayload.paymentId) {
      throw new Error(createPayload.error ?? "Could not start payment");
    }

    return createPayload;
  }

  async function handlePayWithUpi(order: PayableOrder) {
    setError(null);
    setPayingOrderId(order.id);

    try {
      const createPayload = await createPaymentOrder(order);
      setUpiCheckout({
        paymentId: createPayload.paymentId!,
        amount: createPayload.amount ?? order.due_amount,
        phase: createPayload.phase ?? order.payment_phase,
        outfitLabel: order.outfit_type,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayingOrderId(null);
    }
  }

  async function handlePayWithRazorpay(order: PayableOrder) {
    setError(null);
    setPayingOrderId(order.id);

    try {
      const createPayload = await createPaymentOrder(order);

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

      const paymentId = createPayload.paymentId!;
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
            {upiEnabled
              ? "Pay via UPI (Google Pay, PhonePe, or any UPI app). Scan the QR code, pay the amount shown, then enter your transaction reference."
              : razorpayEnabled
                ? "Pay up to 40% advance after accepting a quotation. The remaining balance is due before delivery."
                : "Configure UPI or Razorpay for live payments."}
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
            <PremiumCard key={`${order.id}-${order.payment_phase}`} hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{order.outfit_type ?? "Custom order"}</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {order.boutique_name ?? "Boutique"}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gold">
                    {paymentPhaseLabel(order.payment_phase)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gold">{formatInr(order.due_amount)}</p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    of {formatInr(order.total_amount)} total
                  </p>
                </div>
              </div>
              {order.payment_phase === "deposit" && order.advance_percent > 0 && (
                <p className="mt-3 text-xs text-foreground-muted">
                  {order.advance_percent}% advance to start production. Balance due before delivery.
                </p>
              )}
              {order.payment_phase === "balance" && (
                <p className="mt-3 text-xs text-foreground-muted">
                  Your order is ready for delivery. Pay the remaining balance to complete delivery.
                </p>
              )}
              <PostedAt value={order.created_at} prefix="Quoted" className="mt-3 text-xs text-foreground-muted/70" />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {upiEnabled && (
                  <Button
                    type="button"
                    variant="luxury"
                    className="sm:flex-1"
                    disabled={pending || payingOrderId === order.id}
                    onClick={() => void handlePayWithUpi(order)}
                  >
                    {payingOrderId === order.id
                      ? "Loading…"
                      : order.payment_phase === "deposit"
                        ? "Pay advance with UPI"
                        : "Pay balance with UPI"}
                  </Button>
                )}
                {razorpayEnabled && (
                  <Button
                    type="button"
                    variant={upiEnabled ? "luxury-outline" : "luxury"}
                    className="sm:flex-1"
                    disabled={pending || payingOrderId === order.id}
                    onClick={() => void handlePayWithRazorpay(order)}
                  >
                    Pay with card / Razorpay
                  </Button>
                )}
                {!upiEnabled && !razorpayEnabled && (
                  <Button
                    type="button"
                    variant="luxury"
                    disabled={pending || payingOrderId === order.id}
                    onClick={() => void handlePayWithRazorpay(order)}
                  >
                    {payingOrderId === order.id ? "Processing…" : "Simulate payment"}
                  </Button>
                )}
              </div>
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
                    {payment.payment_phase
                      ? paymentPhaseLabel(payment.payment_phase)
                      : paymentStatusLabel(payment.status)}
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

      {upiCheckout && (
        <UpiPaymentModal
          open
          amount={upiCheckout.amount}
          paymentId={upiCheckout.paymentId}
          phase={upiCheckout.phase}
          outfitLabel={upiCheckout.outfitLabel}
          onClose={() => setUpiCheckout(null)}
          onConfirmed={() => router.refresh()}
        />
      )}
    </div>
  );
}
