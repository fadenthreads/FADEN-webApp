import { Suspense } from "react";
import type { Metadata } from "next";
import { BoutiqueSearchPage } from "@/components/discovery/boutique-search-page";
import { parseAudienceCategory } from "@/lib/landing/audience-categories";
import { parseSearchMinRating, parseSearchMaxDistance, parseSearchSort } from "@/lib/boutique/search-nav";

export const metadata: Metadata = {
  title: "Search Boutiques — FADEN",
  description: "Find verified boutiques by outfit type, fabric, or boutique name.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; audience?: string; minRating?: string; maxDistance?: string; sort?: string }>;
}

function SearchPageFallback() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 text-center lg:px-12">
      <p className="text-sm text-foreground-muted">Loading search…</p>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<SearchPageFallback />}>
      <BoutiqueSearchPage
        initialQuery={params.q ?? ""}
        initialAudience={parseAudienceCategory(params.audience)}
        initialMinRating={parseSearchMinRating(params.minRating)}
        initialMaxDistanceKm={parseSearchMaxDistance(params.maxDistance)}
        initialSort={parseSearchSort(params.sort)}
      />
    </Suspense>
  );
}
