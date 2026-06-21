"use client";

import Link from "next/link";
import { Button } from "@faden/ui";

interface CustomizeMatchSelectBarProps {
  boutiqueName: string;
  boutiqueSlug: string;
}

export function CustomizeMatchSelectBar({
  boutiqueName,
  boutiqueSlug,
}: CustomizeMatchSelectBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-background/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground-muted">
          Reviewing <span className="font-medium text-foreground">{boutiqueName}</span> for your
          custom request
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="luxury-outline" size="sm">
            <Link href="/customize/matches">← Back to matches</Link>
          </Button>
          <Button asChild variant="luxury" size="sm">
            <Link href={`/customize/matches?selected=${encodeURIComponent(boutiqueSlug)}`}>
              Choose {boutiqueName}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
