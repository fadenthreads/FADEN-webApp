"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { Scissors } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import type { AlterationRequestSummary } from "@/lib/alterations/queries";
import { formatPostedAt } from "@/lib/datetime/format";

interface CustomerAlterationsPanelProps {
  requests: AlterationRequestSummary[];
  embedded?: boolean;
}

export function CustomerAlterationsPanel({ requests, embedded }: CustomerAlterationsPanelProps) {
  const t = useTranslations("AlterationsPanel.customer");
  const tc = useTranslations("Common");

  if (requests.length === 0) {
    return (
      <PremiumCard hover={false}>
        <div className="flex items-start gap-3">
          <Scissors className="mt-0.5 h-5 w-5 text-gold" aria-hidden />
          <div>
            <p className="font-medium text-foreground">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{t("emptyBody")}</p>
            {!embedded && (
              <Button asChild variant="luxury-outline" className="mt-4">
                <Link href="/alterations">{t("bookAlteration")}</Link>
              </Button>
            )}
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const statusLabel =
          t(`status.${request.status}` as "status.requested") || request.status;

        return (
          <PremiumCard key={request.id} hover={false}>
            <p className="font-medium text-foreground">{request.boutiqueName ?? tc("boutique")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{request.alterationType}</p>
            <p className="mt-2 text-xs capitalize text-gold/90">{statusLabel}</p>
            <p className="mt-1 text-xs text-foreground-muted">
              {t("requested", { date: formatPostedAt(request.createdAt) })}
              {request.urgencyHours <= 2 ? ` · ${t("urgent")}` : ""}
            </p>
            {request.boutiqueSlug && (
              <Link
                href={`/boutique/${request.boutiqueSlug}`}
                className="mt-3 inline-block text-sm text-gold hover:text-gold-light"
              >
                {tc("viewBoutique")}
              </Link>
            )}
          </PremiumCard>
        );
      })}
    </div>
  );
}
