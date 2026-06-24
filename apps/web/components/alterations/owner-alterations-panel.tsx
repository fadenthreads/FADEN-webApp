"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { Clock, Home, Scissors } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { updateAlterationStatus } from "@/actions/alterations";
import type { AlterationRequestSummary } from "@/lib/alterations/queries";
import { formatPostedAt } from "@/lib/datetime/format";

interface OwnerAlterationsPanelProps {
  requests: AlterationRequestSummary[];
  boutiqueId: string;
}

function AlterationPhotos({ urls }: { urls: string[] }) {
  if (!urls.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {urls.slice(0, 4).map((url, index) => (
        <a
          key={`${url.slice(0, 24)}-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-16 w-16 overflow-hidden rounded-lg border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </a>
      ))}
    </div>
  );
}

function AlterationRequestCard({
  request,
  boutiqueId,
}: {
  request: AlterationRequestSummary;
  boutiqueId: string;
}) {
  const router = useRouter();
  const t = useTranslations("AlterationsPanel.owner");
  const tc = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setStatus(status: "in_progress" | "completed" | "cancelled") {
    startTransition(async () => {
      setError(null);
      const result = await updateAlterationStatus({
        requestId: request.id,
        boutiqueId,
        status,
      });

      if (!result.ok) {
        setError(result.error ?? t("updateFailed"));
        return;
      }

      router.refresh();
    });
  }

  const urgencyKey = String(request.urgencyHours) as "2" | "4" | "8" | "24" | "48";
  const urgencyLabel =
    urgencyKey in { "2": 1, "4": 1, "8": 1, "24": 1, "48": 1 }
      ? t(`urgency.${urgencyKey}`)
      : t("urgency.hours", { hours: request.urgencyHours });
  const isActive = request.status === "assigned" || request.status === "in_progress";
  const statusLabel =
    t(`status.${request.status}` as "status.requested") || request.status;

  return (
    <PremiumCard hover={false} className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{request.customerName ?? tc("customer")}</p>
          {request.customerEmail && (
            <p className="text-xs text-foreground-muted">{request.customerEmail}</p>
          )}
        </div>
        <span className="rounded-full bg-cherry/30 px-2.5 py-1 text-xs capitalize text-gold-light">
          {statusLabel}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{request.alterationType}</p>

      <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-gold" aria-hidden />
          {urgencyLabel}
        </span>
        {request.homeServiceOk && (
          <span className="inline-flex items-center gap-1">
            <Home className="h-3.5 w-3.5 text-gold" aria-hidden />
            {t("homeServiceOk")}
          </span>
        )}
        <span>{t("submitted", { date: formatPostedAt(request.createdAt) })}</span>
      </div>

      {request.homeServiceOk && request.homeAddress && (
        <p className="text-sm text-foreground-muted whitespace-pre-line">{request.homeAddress}</p>
      )}

      {request.notes && (
        <p className="rounded-lg border border-border bg-background-soft px-3 py-2 text-sm text-foreground-muted">
          {request.notes}
        </p>
      )}

      <AlterationPhotos urls={request.photoUrls} />

      {error && (
        <p className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      {isActive && (
        <div className="flex flex-wrap gap-2 pt-1">
          {request.status === "assigned" && (
            <Button
              type="button"
              variant="luxury"
              size="sm"
              disabled={pending}
              onClick={() => setStatus("in_progress")}
            >
              {t("startAlteration")}
            </Button>
          )}
          {request.status === "in_progress" && (
            <Button
              type="button"
              variant="luxury"
              size="sm"
              disabled={pending}
              onClick={() => setStatus("completed")}
            >
              {t("markComplete")}
            </Button>
          )}
          <Button
            type="button"
            variant="luxury-outline"
            size="sm"
            disabled={pending}
            onClick={() => setStatus("cancelled")}
          >
            {tc("cancel")}
          </Button>
        </div>
      )}
    </PremiumCard>
  );
}

export function OwnerAlterationsPanel({ requests, boutiqueId }: OwnerAlterationsPanelProps) {
  const t = useTranslations("AlterationsPanel.owner");
  const active = requests.filter((r) => r.status === "assigned" || r.status === "in_progress");
  const completed = requests.filter((r) => r.status === "completed" || r.status === "cancelled");

  if (requests.length === 0) {
    return (
      <PremiumCard hover={false}>
        <div className="flex items-start gap-3">
          <Scissors className="mt-0.5 h-5 w-5 text-gold" aria-hidden />
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-gold">{t("eyebrow")}</p>
            <h2 className="mt-2 font-display text-xl font-semibold">{t("title")}</h2>
            <p className="mt-2 text-sm text-foreground-muted">{t("emptyBody")}</p>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.25em] text-gold">{t("eyebrow")}</p>
        <h2 className="mt-2 font-display text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          {t("activeCount", { active: active.length, closed: completed.length })}
        </p>
      </div>

      {active.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gold">{t("active")}</h3>
          {active.map((request) => (
            <AlterationRequestCard key={request.id} request={request} boutiqueId={boutiqueId} />
          ))}
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground-muted">{t("history")}</h3>
          {completed.map((request) => (
            <AlterationRequestCard key={request.id} request={request} boutiqueId={boutiqueId} />
          ))}
        </section>
      )}
    </div>
  );
}
