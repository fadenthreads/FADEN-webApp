"use client";

import { useState, useTransition } from "react";
import type { AdminModificationRequest } from "@faden/database";
import { decideBoutiqueModification } from "@/actions/admin";
import { BoutiqueDetailsView } from "@/components/boutique-details-view";
import { BoutiqueChangesView } from "@/components/boutique-changes-view";

interface PendingModificationsProps {
  requests: AdminModificationRequest[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PendingModifications({ requests }: PendingModificationsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDecision(requestId: string, decision: "approved" | "rejected" | "needs_info") {
    setMessage(null);
    startTransition(async () => {
      const result = await decideBoutiqueModification({ requestId, decision });
      setMessage(result.ok ? "Updated successfully." : (result.error ?? "Update failed"));
    });
  }

  if (!requests.length) {
    return (
      <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
        No boutique modification requests pending review.
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
      {requests.map((request) => (
        <article
          key={request.id}
          className="rounded-xl border border-border bg-background-elevated p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-gold">
                {request.boutique.name}
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                {request.boutique.owner_name} · {request.boutique.phone ?? "—"} ·{" "}
                {request.boutique.email ?? "—"}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">Slug: {request.boutique.slug}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-foreground-muted">
                Submitted {formatDate(request.submitted_at)}
              </p>
              {request.owner_notes && (
                <p className="mt-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground-muted">
                  Owner note: {request.owner_notes}
                </p>
              )}

              <BoutiqueChangesView
                current={request.currentDetails}
                proposed={request.payload}
              />

              <BoutiqueDetailsView
                details={request.currentDetails}
                summaryLabel="View current live profile"
              />
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gold hover:text-gold-light">
                  View full proposed profile
                </summary>
                <div className="mt-4 rounded-lg border border-border/60 bg-background p-4">
                  <BoutiqueDetailsView details={request.payload} collapsible={false} />
                </div>
              </details>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(request.id, "approved")}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Approve changes
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(request.id, "needs_info")}
                className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-accent-50 disabled:opacity-50"
              >
                Needs Info
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDecision(request.id, "rejected")}
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
