"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { submitReview } from "@/actions/reviews";
import type { ReviewableOrder } from "@/lib/review/queries";

interface CustomerReviewsPanelProps {
  reviewableOrders: ReviewableOrder[];
  embedded?: boolean;
}

export function CustomerReviewsPanel({ reviewableOrders, embedded = false }: CustomerReviewsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    reviewableOrders[0]?.id ?? null,
  );
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [bodies, setBodies] = useState<Record<string, string>>({});

  if (!reviewableOrders.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h3 className="font-display text-lg font-semibold text-gold">Reviews</h3>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          After your order is delivered, you can leave a review for the boutique here.
        </p>
      </PremiumCard>
    );
  }

  function handleSubmit(orderId: string) {
    const rating = ratings[orderId] ?? 5;
    setError(null);
    startTransition(async () => {
      const result = await submitReview({
        orderId,
        rating,
        body: bodies[orderId] ?? "",
      });
      if (!result.ok) {
        setError(result.error ?? "Could not submit review");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Reviews</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Share feedback on delivered orders — it helps other customers discover great boutiques.
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

      {reviewableOrders.map((order) => {
        const rating = ratings[order.id] ?? 5;
        const expanded = activeOrderId === order.id;

        return (
          <PremiumCard key={order.id} hover={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.outfit_type ?? "Custom order"}</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {order.boutique_name ?? "Boutique"}
                </p>
              </div>
              <Button
                type="button"
                variant="luxury-outline"
                size="sm"
                onClick={() => setActiveOrderId(expanded ? null : order.id)}
              >
                {expanded ? "Close" : "Write review"}
              </Button>
            </div>

            {expanded && (
              <div className="mt-4 space-y-4 border-t border-gold/10 pt-4">
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Rate ${value} stars`}
                        className="rounded p-1 transition-colors hover:bg-gold/10"
                        onClick={() =>
                          setRatings((current) => ({ ...current, [order.id]: value }))
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${
                            value <= rating ? "fill-gold text-gold" : "text-foreground-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor={`review-${order.id}`} className="text-sm font-medium">
                    Your review (optional)
                  </label>
                  <textarea
                    id={`review-${order.id}`}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="What did you love about the experience?"
                    value={bodies[order.id] ?? ""}
                    onChange={(event) =>
                      setBodies((current) => ({ ...current, [order.id]: event.target.value }))
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="luxury"
                  disabled={pending}
                  onClick={() => handleSubmit(order.id)}
                >
                  Submit review
                </Button>
              </div>
            )}
          </PremiumCard>
        );
      })}
    </div>
  );
}
