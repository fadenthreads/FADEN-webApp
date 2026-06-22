"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { decideQuotation } from "@/actions/quotations";
import { QuotationCard } from "@/components/quotations/quotation-card";
import {
  isQuotationExpired,
  latestQuotationsByOrder,
  type QuotationSummary,
} from "@/lib/quotation/queries";

interface CustomerQuotationsPanelProps {
  quotations: QuotationSummary[];
  embedded?: boolean;
}

export function CustomerQuotationsPanel({ quotations, embedded = false }: CustomerQuotationsPanelProps) {
  const router = useRouter();
  const pending = latestQuotationsByOrder(quotations).filter((q) => q.order_status === "quoted");
  const history = quotations.filter((q) => q.order_status !== "quoted");
  const [pendingAction, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [actedIds, setActedIds] = useState<Set<string>>(new Set());

  function handleDecision(quotationId: string, decision: "accepted" | "declined") {
    setError(null);
    startTransition(async () => {
      const result = await decideQuotation({ quotationId, decision });
      if (!result.ok) {
        setError(result.error ?? "Action failed");
        return;
      }
      setActedIds((prev) => new Set(prev).add(quotationId));
      router.refresh();
    });
  }

  if (!quotations.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h3 className="font-display text-lg font-semibold text-gold">Quotations</h3>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          Quotations appear here when a boutique sends you a price breakdown for your order.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Quotations</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Review price breakdowns from boutiques. Accept to pay advance (up to 40%) and start
            production — balance is due before delivery.
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

      {pending.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">AWAITING YOUR RESPONSE</p>
          {pending.map((quote) => {
            if (actedIds.has(quote.id)) return null;
            const expired = isQuotationExpired(quote.valid_until);
            return (
              <QuotationCard
                key={quote.id}
                quotation={quote}
                mode="customer"
                footer={
                  expired ? (
                    <p className="text-sm text-red-accent">This quotation has expired. Message the boutique for a new quote.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="luxury"
                        disabled={pendingAction}
                        onClick={() => handleDecision(quote.id, "accepted")}
                      >
                        Accept quotation
                      </Button>
                      <Button
                        type="button"
                        variant="luxury-outline"
                        disabled={pendingAction}
                        onClick={() => handleDecision(quote.id, "declined")}
                      >
                        Decline
                      </Button>
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-foreground-muted">HISTORY</p>
          {history.map((quote) => (
            <QuotationCard key={quote.id} quotation={quote} mode="customer" />
          ))}
        </div>
      )}

      {pending.length === 0 && history.length === 0 && (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">No quotations yet.</p>
        </PremiumCard>
      )}
    </div>
  );
}
