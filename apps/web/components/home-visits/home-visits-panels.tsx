"use client";

import Link from "next/link";
import { Button } from "@faden/ui";
import { Home } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import type { HomeMeasurementVisit } from "@/lib/home-visits/queries";
import { formatHomeVisitWhen } from "@/lib/home-visits/queries";

interface CustomerHomeVisitsPanelProps {
  visits: HomeMeasurementVisit[];
  embedded?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  requested: "Awaiting boutique confirmation",
  confirmed: "Confirmed — team will visit",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function CustomerHomeVisitsPanel({ visits, embedded }: CustomerHomeVisitsPanelProps) {
  if (visits.length === 0) {
    return (
      <PremiumCard hover={false}>
        <div className="flex items-start gap-3">
          <Home className="mt-0.5 h-5 w-5 text-gold" aria-hidden />
          <div>
            <p className="font-medium text-foreground">No home measurement visits</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Choose &quot;Home measurement visit&quot; when customizing an outfit to book a session with a boutique.
            </p>
            {!embedded && (
              <Button asChild variant="luxury-outline" className="mt-4">
                <Link href="/customize">Start customizing</Link>
              </Button>
            )}
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <PremiumCard key={visit.id} hover={false}>
          <p className="font-medium text-foreground">{visit.boutiqueName ?? "Boutique"}</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {formatHomeVisitWhen(
              visit.confirmedStart ?? visit.requestedStart,
              visit.confirmedEnd ?? visit.requestedEnd,
            )}
          </p>
          {visit.visitAddress && (
            <p className="mt-1 text-sm text-foreground-muted whitespace-pre-line">{visit.visitAddress}</p>
          )}
          {visit.visitLatitude != null && visit.visitLongitude != null && (
            <a
              href={`https://www.google.com/maps?q=${visit.visitLatitude},${visit.visitLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-gold hover:text-gold-light"
            >
              View on map
            </a>
          )}
          {visit.assignedStaffName && (
            <p className="mt-1 text-sm text-foreground">Assigned: {visit.assignedStaffName}</p>
          )}
          <p className="mt-2 text-xs capitalize text-gold/90">
            {STATUS_LABELS[visit.status] ?? visit.status}
          </p>
        </PremiumCard>
      ))}
    </div>
  );
}

interface OwnerHomeVisitsPanelProps {
  visits: HomeMeasurementVisit[];
}

export function OwnerHomeVisitsPanel({ visits }: OwnerHomeVisitsPanelProps) {
  const pending = visits.filter((v) => v.status === "requested");
  const upcoming = visits.filter((v) => v.status === "confirmed");

  if (visits.length === 0) {
    return (
      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.25em] text-gold">HOME VISITS</p>
        <h2 className="mt-2 font-display text-xl font-semibold">Home measurement sessions</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          When customers choose home measurement on a customization request, visits appear here for confirmation.
        </p>
        <Button asChild variant="luxury-outline" className="mt-4">
          <Link href="/dashboard?panel=customization">View customization requests</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.25em] text-gold">HOME VISITS</p>
      <h2 className="mt-2 font-display text-xl font-semibold">Home measurement sessions</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        {pending.length} awaiting confirmation · {upcoming.length} confirmed
      </p>
      <div className="mt-4 space-y-4">
        {visits.map((visit) => (
          <PremiumCard key={visit.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" hover={false}>
            <div>
              <p className="font-medium text-foreground">{visit.customerName ?? "Customer"}</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {formatHomeVisitWhen(visit.requestedStart, visit.requestedEnd)}
              </p>
              <p className="mt-1 text-xs capitalize text-foreground-muted">Status: {visit.status}</p>
            </div>
            {visit.customizationRequestId && (
              <Button asChild variant="luxury-outline" size="sm">
                <Link href={`/dashboard/requests/${visit.customizationRequestId}`}>Manage visit</Link>
              </Button>
            )}
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
