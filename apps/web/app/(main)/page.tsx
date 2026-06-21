import { Suspense } from "react";
import { HomePageClient } from "@/components/landing/home-page-client";
import { shouldSkipHomeIntro } from "@/lib/landing/home-nav";
import { parseAudienceCategory } from "@/lib/landing/audience-categories";

interface HomePageProps {
  searchParams: Promise<{ home?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const skipIntro = shouldSkipHomeIntro(params);
  const initialCategory = parseAudienceCategory(params.category);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" aria-hidden />}>
      <HomePageClient skipIntro={skipIntro} initialCategory={initialCategory} />
    </Suspense>
  );
}
