"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { connectBoutiqueToRequest } from "@/actions/connect-boutique";
import type { CustomizationRequestSummary } from "@/lib/customization/queries";

interface BoutiqueMatchesPanelProps {
  requests: CustomizationRequestSummary[];
}

export function BoutiqueMatchesPanel({ requests }: BoutiqueMatchesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [connectingKey, setConnectingKey] = useState<string | null>(null);

  const unmatched = requests.filter(
    (request) => !request.boutique_id && request.matched_boutiques?.length,
  );

  if (!unmatched.length) return null;

  function handleConnect(requestId: string, boutiqueSlug: string) {
    setError(null);
    setConnectingKey(`${requestId}:${boutiqueSlug}`);
    startTransition(async () => {
      const result = await connectBoutiqueToRequest({ requestId, boutiqueSlug });
      setConnectingKey(null);
      if (!result.ok) {
        setError(result.error ?? "Could not connect boutique");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Suggested boutiques</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          We matched your open requests with verified boutiques. Connect with one to start quoting
          and messaging.
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}
      </PremiumCard>

      {unmatched.map((request) => (
        <PremiumCard key={request.id} hover={false}>
          <p className="font-medium">{request.outfit_type ?? "Custom request"}</p>
          {request.occasion && (
            <p className="mt-1 text-sm text-foreground-muted">Occasion: {request.occasion}</p>
          )}

          <div className="mt-4 space-y-3">
            {request.matched_boutiques?.map((match) => {
              const key = `${request.id}:${match.slug}`;
              return (
                <div
                  key={match.slug}
                  className="rounded-lg border border-gold/15 bg-background-elevated/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{match.name}</p>
                      <p className="mt-1 text-xs text-gold">Match score {match.score}%</p>
                    </div>
                    <Button asChild variant="luxury-outline" size="sm">
                      <Link href={`/boutique/${match.slug}`}>View profile</Link>
                    </Button>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-foreground-muted">
                    {match.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="luxury"
                    size="sm"
                    className="mt-4"
                    disabled={pending}
                    onClick={() => handleConnect(request.id, match.slug)}
                  >
                    {connectingKey === key ? "Connecting…" : `Connect with ${match.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
