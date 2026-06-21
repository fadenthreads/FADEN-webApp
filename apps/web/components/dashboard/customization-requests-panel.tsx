"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import { Button } from "@faden/ui";
import { updateCustomizationStatus } from "@/actions/operations";
import type { CustomizationRequestSummary } from "@/lib/customization/queries";
import { formatDateOnly } from "@/lib/datetime/format";
import { labelOutfitAudience } from "@/lib/customization/format-request-detail";

interface CustomizationRequestsPanelProps {
  requests: CustomizationRequestSummary[];
  mode: "owner" | "customer";
  embedded?: boolean;
}

const STATUS_OPTIONS = [
  { value: "quoted", label: "Mark quoted" },
  { value: "accepted", label: "Mark accepted" },
  { value: "in_production", label: "In production" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function CustomizationRequestsPanel({ requests, mode, embedded = false }: CustomizationRequestsPanelProps) {
  const [items, setItems] = useState(requests);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(requests);
  }, [requests]);

  function customerStatusLabel(status: string) {
    switch (status) {
      case "submitted":
        return "Sent to boutique";
      case "quoted":
        return "Quotation in progress";
      case "accepted":
        return "Accepted";
      case "in_production":
        return "In production";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.replace(/_/g, " ");
    }
  }

  function handleStatusUpdate(requestId: string, status: (typeof STATUS_OPTIONS)[number]["value"]) {
    setError(null);
    startTransition(async () => {
      const result = await updateCustomizationStatus({ requestId, status });
      if (!result.ok) {
        setError(result.error ?? "Update failed");
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === requestId ? { ...item, status } : item)),
      );
    });
  }

  if (!items.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h2 className="font-display text-xl font-semibold text-gold">My customization requests</h2>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          {mode === "owner"
            ? "No customer requests yet. Verified boutiques receive requests when customers customize with your studio selected."
            : "You haven't submitted any customization requests yet. Complete the customize wizard and pick a boutique to send your first request."}
        </p>
        {mode === "customer" && (
          <Button asChild variant="luxury" className="mt-4">
            <Link href="/customize">Start customizing</Link>
          </Button>
        )}
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <PremiumCard hover={false}>
          <h2 className="font-display text-xl font-semibold text-gold">
            {mode === "customer" ? "My customization requests" : "Customization Requests"}
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {mode === "customer"
              ? "Every outfit request you send to a boutique appears here with status and boutique details."
              : `${items.length} request${items.length === 1 ? "" : "s"}`}
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

      {items.map((request) => (
        <PremiumCard key={request.id} hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{request.outfit_type ?? "Custom outfit"}</p>
              {request.outfit_audience && (
                <p className="mt-1 text-xs font-medium text-gold">
                  For: {labelOutfitAudience(request.outfit_audience)}
                </p>
              )}
              {request.occasion && (
                <p className="mt-1 text-sm text-foreground-muted">Occasion: {request.occasion}</p>
              )}
              <p className="mt-2 text-xs capitalize text-gold/80">
                Status: {mode === "customer" ? customerStatusLabel(request.status) : request.status.replace(/_/g, " ")}
              </p>
            </div>
            <PostedAt value={request.created_at} prefix="Submitted" />
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-foreground-muted sm:grid-cols-2">
            {mode === "owner" ? (
              <>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted/70">Customer</dt>
                  <dd>{request.customer_name || request.customer_email || "Customer"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted/70">Delivery</dt>
                  <dd>{formatDateOnly(request.delivery_date)}</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted/70">Boutique</dt>
                  <dd>
                    {request.boutique_name ? (
                      request.boutique_slug ? (
                        <Link href={`/boutique/${request.boutique_slug}`} className="text-gold hover:text-gold-light">
                          {request.boutique_name}
                        </Link>
                      ) : (
                        request.boutique_name
                      )
                    ) : (
                      "Matching in progress"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted/70">Delivery</dt>
                  <dd>{formatDateOnly(request.delivery_date)}</dd>
                </div>
              </>
            )}
          </dl>

          {mode === "customer" && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button asChild variant="luxury" size="sm">
                <Link href={`/account/requests/${request.id}`}>View full request</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="sm">
                <Link href="/account/messages">Message boutique</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="sm">
                <Link href="/account/quotations">View quotations</Link>
              </Button>
              <Button asChild variant="luxury-outline" size="sm">
                <Link href="/account/orders">View orders</Link>
              </Button>
            </div>
          )}

          {mode === "owner" && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button asChild variant="luxury" size="sm">
                <Link href={`/dashboard/requests/${request.id}`}>View full request</Link>
              </Button>
              {request.measurement_mode === "video" && (
                <Button asChild variant="luxury-outline" size="sm">
                  <Link href={`/dashboard/requests/${request.id}/schedule-video`}>
                    Schedule video
                  </Link>
                </Button>
              )}
              {request.status === "submitted" &&
                STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="luxury-outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleStatusUpdate(request.id, option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
            </div>
          )}
        </PremiumCard>
      ))}
    </div>
  );
}
