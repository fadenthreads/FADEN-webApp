import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BoutiqueProfile } from "@/components/boutique/boutique-profile";
import { resolveBoutiqueProfile } from "@/lib/boutique/queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

interface BoutiquePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; audience?: string }>;
}

export default async function BoutiquePage({ params, searchParams }: BoutiquePageProps) {
  const { slug } = await params;
  const { from, audience } = await searchParams;
  const fromMatches = from === "matches";

  let profile = null;

  if (isWebSupabaseConfigured()) {
    const supabase = await createClient();
    profile = await resolveBoutiqueProfile(supabase, slug);
  }

  if (!profile) notFound();

  const initialAudience =
    audience === "women" || audience === "men" || audience === "kids" ? audience : null;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container px-4 py-16 text-center lg:px-12">
          <p className="text-sm text-foreground-muted">Loading boutique…</p>
        </div>
      }
    >
      <BoutiqueProfile
        profile={profile}
        fromMatches={fromMatches}
        initialAudience={initialAudience}
      />
    </Suspense>
  );
}
