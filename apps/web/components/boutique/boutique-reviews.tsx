"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { BoutiqueReview } from "@/data/boutique-profiles";

interface BoutiqueReviewsProps {
  boutiqueName: string;
  reviews: BoutiqueReview[];
}

export function BoutiqueReviews({ boutiqueName, reviews }: BoutiqueReviewsProps) {
  return (
    <section className="border-t border-border py-section-gap" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-display text-2xl font-semibold">
        Customer Reviews
      </h2>
      <p className="mt-2 text-foreground-muted">
        What customers say about {boutiqueName} — with optional photos of their outfits.
      </p>

      <div className="mt-8 space-y-4">
        {reviews.length ? (
          reviews.map((r, i) => (
          <motion.blockquote
            key={r.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="overflow-hidden rounded-xl border border-border bg-background-elevated"
          >
            <div className="flex flex-col sm:flex-row">
              {r.photoGradient && (
                <div
                  className={`h-32 w-full shrink-0 bg-gradient-to-br sm:h-auto sm:w-36 ${r.photoGradient}`}
                  aria-label={`Photo of ${r.outfit}`}
                />
              )}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between gap-4">
                  <cite className="not-italic font-semibold">{r.name}</cite>
                  <span className="flex items-center gap-1 text-sm text-gold">
                    <Star className="h-4 w-4 fill-gold" aria-hidden />
                    {r.rating}
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="mt-3 text-xs text-gold/80">Outfit: {r.outfit}</p>
              </div>
            </div>
          </motion.blockquote>
        ))
        ) : (
          <p className="text-sm text-foreground-muted">
            No customer reviews yet — be the first to order and share your experience.
          </p>
        )}
      </div>
    </section>
  );
}
