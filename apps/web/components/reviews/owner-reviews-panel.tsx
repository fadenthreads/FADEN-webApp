import { Star } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import type { ReviewRecord } from "@/lib/review/queries";
import { computeReviewStats } from "@/lib/review/queries";

interface OwnerReviewsPanelProps {
  reviews: ReviewRecord[];
}

export function OwnerReviewsPanel({ reviews }: OwnerReviewsPanelProps) {
  const stats = computeReviewStats(reviews);

  if (!reviews.length) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Reviews</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Customer reviews appear here after delivered orders. Encourage happy clients to share
          feedback from their account.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Reviews</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-foreground-muted">Average rating</p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold text-gold">
              <Star className="h-5 w-5 fill-gold" aria-hidden />
              {stats.averageRating.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Total reviews</p>
            <p className="mt-1 font-display text-2xl font-semibold">{stats.reviewCount}</p>
          </div>
        </div>
      </PremiumCard>

      {reviews.map((review) => (
        <PremiumCard key={review.id} hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                {review.customer_name ?? "Customer"}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">
                {review.outfit_type ?? "Custom order"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gold">
              <Star className="h-4 w-4 fill-gold" aria-hidden />
              {review.rating}
            </div>
          </div>
          {review.body && (
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              &ldquo;{review.body}&rdquo;
            </p>
          )}
          <PostedAt value={review.created_at} className="mt-3 text-xs text-foreground-muted/70" />
        </PremiumCard>
      ))}
    </div>
  );
}
