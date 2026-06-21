"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { updateBoutiqueListingSettings } from "@/actions/boutique-listings";
import { BoutiqueAvailabilityBadge } from "@/components/boutique/boutique-availability-badge";
import type { OwnerListingSettings } from "@/lib/dashboard/boutique-listings";

interface OwnerAvailabilityControlProps {
  listing: OwnerListingSettings;
  compact?: boolean;
}

export function OwnerAvailabilityControl({ listing, compact = false }: OwnerAvailabilityControlProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState(listing.availability);
  const [message, setMessage] = useState(listing.pauseReason ?? "");

  useEffect(() => {
    setAvailability(listing.availability);
    setMessage(listing.pauseReason ?? "");
  }, [listing.availability, listing.pauseReason]);

  function save(nextAvailability: "open" | "closed", nextMessage?: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateBoutiqueListingSettings({
        boutiqueId: listing.boutiqueId,
        availability: nextAvailability,
        pauseReason: nextAvailability === "closed" ? nextMessage ?? message : undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not update availability");
        return;
      }
      setAvailability(nextAvailability);
      router.refresh();
    });
  }

  if (!compact) return null;

  return (
    <PremiumCard hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-gold">CUSTOMER AVAILABILITY</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Shown on your public boutique profile
          </p>
        </div>
        <BoutiqueAvailabilityBadge availability={availability} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={availability === "open" ? "luxury" : "luxury-outline"}
          disabled={pending || availability === "open"}
          onClick={() => save("open")}
        >
          Mark available
        </Button>
        <Button
          type="button"
          size="sm"
          variant={availability === "closed" ? "luxury" : "luxury-outline"}
          disabled={pending || availability === "closed"}
          onClick={() => save("closed", message)}
        >
          Mark unavailable
        </Button>
      </div>
      {availability === "closed" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Optional note for customers"
            className="min-w-0 flex-1 rounded-lg border border-gold/20 bg-background/50 px-3 py-2 text-sm"
          />
          <Button type="button" size="sm" variant="luxury-outline" disabled={pending} onClick={() => save("closed", message)}>
            Save note
          </Button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </PremiumCard>
  );
}
