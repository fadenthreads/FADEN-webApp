"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@faden/ui";
import { FADEN_UPI, buildUpiDeepLink } from "@/lib/payment/upi";
import { formatInr } from "@/lib/payment/queries";
import { paymentPhaseLabel } from "@/lib/payment/split-payment";
import type { PaymentPhase } from "@/lib/payment/split-payment";

interface UpiPaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  paymentId: string;
  phase: PaymentPhase;
  outfitLabel?: string | null;
  onConfirmed: () => void;
}

export function UpiPaymentModal({
  open,
  onClose,
  amount,
  paymentId,
  phase,
  outfitLabel,
  onConfirmed,
}: UpiPaymentModalProps) {
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const upiLink = buildUpiDeepLink(amount, `FADEN ${paymentPhaseLabel(phase)}`);

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(FADEN_UPI.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/upi-confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, utr: utr.trim() }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not confirm payment");
        return;
      }

      setUtr("");
      onConfirmed();
      onClose();
    } catch {
      setError("Could not confirm payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close payment"
        className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upi-payment-title"
        className="relative max-h-[min(94vh,760px)] w-full max-w-md overflow-y-auto rounded-t-[20px] border border-border/60 bg-background-elevated shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">Pay with UPI</p>
            <h2 id="upi-payment-title" className="mt-1 font-display text-xl font-semibold text-navy">
              {formatInr(amount)}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {outfitLabel ?? "Custom order"} · {paymentPhaseLabel(phase)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-navy/5 hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#1a1a1a] p-4">
            <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-xl bg-white">
              <Image
                src={FADEN_UPI.qrImagePath}
                alt="Scan to pay with UPI"
                fill
                className="object-contain"
                sizes="260px"
                priority
              />
            </div>
            <p className="mt-4 text-center text-sm font-medium text-white">{FADEN_UPI.payeeName}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-xs text-white/80">
                UPI ID: <span className="font-medium text-white">{FADEN_UPI.upiId}</span>
              </p>
              <button
                type="button"
                onClick={() => void copyUpiId()}
                className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Copy UPI ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {copied && <p className="mt-1 text-center text-xs text-gold">UPI ID copied</p>}
            <p className="mt-2 text-center text-[11px] text-white/60">{FADEN_UPI.bankName}</p>
          </div>

          <p className="mt-4 text-center text-sm text-foreground-muted">
            Scan the QR code or open your UPI app, pay <strong className="text-navy">{formatInr(amount)}</strong>,
            then enter the transaction reference below.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="luxury-outline" className="flex-1">
              <a href={upiLink}>Open UPI app</a>
            </Button>
            <Button type="button" variant="ghost" className="flex-1 text-navy" onClick={() => void copyUpiId()}>
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copy UPI ID
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border/60 pt-5">
            <label className="block space-y-1.5">
              <span className="faden-label">UPI transaction reference (UTR)</span>
              <input
                className="faden-field"
                value={utr}
                onChange={(event) => setUtr(event.target.value)}
                placeholder="12-digit UTR from your payment app"
                required
                minLength={8}
                maxLength={50}
                autoComplete="off"
              />
              <span className="faden-hint">Find this in Google Pay, PhonePe, or your bank app after paying.</span>
            </label>

            {error && (
              <p className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
                {error}
              </p>
            )}

            <Button type="submit" variant="luxury" className="w-full" disabled={submitting || !utr.trim()}>
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              {submitting ? "Confirming…" : "I have paid — confirm payment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
