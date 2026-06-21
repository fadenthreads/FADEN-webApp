"use client";

import { useState, useTransition } from "react";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { BoutiqueWithVerification } from "@faden/types";
import { decideBoutiqueVerification } from "@/actions/admin";
import { BoutiqueDetailsView } from "@/components/boutique-details-view";

export interface PendingBoutiqueReview extends BoutiqueWithVerification {
  details: BoutiqueRegistrationInput;
}

interface PendingBoutiquesProps {
  boutiques: PendingBoutiqueReview[];
}

export function PendingBoutiques({ boutiques }: PendingBoutiquesProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDecision(boutiqueId: string, decision: "approved" | "rejected" | "needs_info") {
    setMessage(null);
    startTransition(async () => {
      const result = await decideBoutiqueVerification({ boutiqueId, decision });
      setMessage(result.ok ? "Updated successfully." : (result.error ?? "Update failed"));
    });
  }

  if (!boutiques.length) {
    return (
      <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
        No boutiques pending verification.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg border border-gold/30 bg-accent-50 px-3 py-2 text-sm text-gold-light">
          {message}
        </p>
      )}
      {boutiques.map((b) => (
        <article
          key={b.id}
          className="rounded-xl border border-border bg-background-elevated p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-gold">{b.name}</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Slug: {b.slug} · Status: {b.status.replace(/_/g, " ")}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-foreground-muted">
                Submitted{" "}
                {b.verification?.submitted_at
                  ? new Date(b.verification.submitted_at).toLocaleString("en-IN")
                  : "—"}
              </p>
              {b.verification?.trust_media_urls && (
                <p className="mt-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground-muted">
                  Trust media submitted with registration.
                </p>
              )}
              <BoutiqueDetailsView details={b.details} defaultOpen />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(b.id, "approved")}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(b.id, "needs_info")}
                className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-accent-50 disabled:opacity-50"
              >
                Needs Info
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(b.id, "rejected")}
                className="rounded-lg border border-red-accent/50 px-4 py-2 text-sm text-red-accent transition-colors hover:bg-red-accent/10 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
