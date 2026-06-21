"use client";

import Link from "next/link";
import { Star, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@faden/ui";
import type { BoutiqueDesign, BoutiqueProfileData, BoutiqueReview } from "@/data/boutique-profiles";
import { getReviewsForDesign } from "@/data/boutique-profiles";
import { DressImage } from "@/components/boutique/dress-image";
import { DressSpecificationsPanel } from "@/components/boutique/dress-specifications-panel";

interface DressDetailViewProps {
  profile: BoutiqueProfileData;
  design: BoutiqueDesign;
  backHref: string;
}

function ReviewCard({ review }: { review: BoutiqueReview }) {
  return (
    <article className="rounded-xl border border-border bg-background-elevated p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{review.name}</p>
        <span className="flex items-center gap-1 text-sm text-gold">
          <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
          {review.rating}
        </span>
      </div>
      <p className="mt-1 text-xs text-foreground-muted">{review.outfit}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">&ldquo;{review.text}&rdquo;</p>
    </article>
  );
}

export function DressDetailView({ profile, design, backHref }: DressDetailViewProps) {
  const reviews = getReviewsForDesign(profile, design);

  return (
    <div className="px-4 pb-section-gap pt-8 lg:px-12">
      <div className="mx-auto max-w-container">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-gold">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to gallery
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="aspect-[4/5]">
              <DressImage design={design} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {design.outfitLabel ?? "Custom wear"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">{design.title}</h1>
            <div className="mt-3 flex items-center gap-1 text-gold">
              <Star className="h-4 w-4 fill-gold" aria-hidden />
              <span className="font-medium">{design.rating}</span>
              <span className="text-sm text-foreground-muted">· {design.customerName}</span>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Material</dt>
                <dd className="text-right font-medium">{design.material}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Price</dt>
                <dd className="font-medium text-gold">{design.price}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Fitting</dt>
                <dd>{design.fitting}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Production time</dt>
                <dd className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gold" aria-hidden />
                  {design.turnaround}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <DressSpecificationsPanel
                design={design}
                boutiqueSlug={profile.slug}
                boutiqueName={profile.name}
              />
            </div>

            <div className="mt-4">
              <Button asChild variant="luxury-outline">
                <Link href={`/boutique/${profile.slug}`}>View boutique profile</Link>
              </Button>
            </div>
          </div>
        </div>

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-2xl font-semibold">Customer reviews</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Feedback from clients who ordered similar {design.outfitLabel?.toLowerCase() ?? "outfits"} from{" "}
            {profile.name}.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
