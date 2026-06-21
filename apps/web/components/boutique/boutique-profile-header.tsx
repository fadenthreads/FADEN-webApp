"use client";

import { Star } from "lucide-react";
import type { BoutiqueProfileData } from "@/data/boutique-profiles";
import { savedBoutiqueItem } from "@/lib/saved-items/build-item";
import { SaveItemActions } from "@/components/saved-items/save-item-actions";
import {
  BoutiqueAvailabilityBadge,
  BoutiqueAvailabilityNotice,
} from "@/components/boutique/boutique-availability-badge";

interface BoutiqueProfileHeaderProps {
  profile: BoutiqueProfileData;
}

export function BoutiqueProfileHeader({ profile }: BoutiqueProfileHeaderProps) {
  return (
    <header className="border-b border-border pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold md:text-4xl">{profile.name}</h1>
            <BoutiqueAvailabilityBadge availability={profile.availability} />
          </div>
          <h2 className="mt-2 text-lg font-medium text-gold">by {profile.owner}</h2>
          <p className="mt-2 text-sm text-foreground-muted">{profile.location}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-muted">
            {profile.experienceSummary}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-background-elevated px-4 py-2 text-gold">
          <Star className="h-4 w-4 fill-gold" aria-hidden />
          <span className="font-semibold">{profile.rating}</span>
        </span>
      </div>

      <BoutiqueAvailabilityNotice
        availability={profile.availability}
        message={profile.availabilityMessage}
        className="mt-6"
      />

      <div className="mt-6">
        <SaveItemActions item={savedBoutiqueItem(profile)} />
      </div>
    </header>
  );
}
