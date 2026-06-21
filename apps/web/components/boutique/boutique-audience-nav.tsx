"use client";

import type { AudienceCategory } from "@faden/validators";
import { cn } from "@faden/utils";
import { AUDIENCE_LABELS } from "@/lib/boutique/audiences";

interface BoutiqueAudienceNavProps {
  audiences: AudienceCategory[];
  active: AudienceCategory;
  onSelect: (audience: AudienceCategory) => void;
}

export function BoutiqueAudienceNav({ audiences, active, onSelect }: BoutiqueAudienceNavProps) {
  if (audiences.length <= 1) return null;

  return (
    <nav aria-label="Shop by category" className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Shop for
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {audiences.map((audience) => (
          <button
            key={audience}
            type="button"
            onClick={() => onSelect(audience)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === audience
                ? "border-gold bg-gold/15 text-gold"
                : "border-border bg-background-elevated text-foreground-muted hover:border-gold/40 hover:text-gold",
            )}
          >
            {AUDIENCE_LABELS[audience]}
          </button>
        ))}
      </div>
    </nav>
  );
}
