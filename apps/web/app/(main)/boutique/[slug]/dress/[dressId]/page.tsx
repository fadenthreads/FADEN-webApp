import { notFound } from "next/navigation";
import { DressDetailView } from "@/components/boutique/dress-detail-view";
import { resolveBoutiqueProfile } from "@/lib/boutique/queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getBoutiqueProfile, getDesignById } from "@/data/boutique-profiles";

export const dynamic = "force-dynamic";

interface DressDetailPageProps {
  params: Promise<{ slug: string; dressId: string }>;
  searchParams: Promise<{ outfit?: string }>;
}

export default async function DressDetailPage({ params, searchParams }: DressDetailPageProps) {
  const { slug, dressId } = await params;
  const { outfit } = await searchParams;

  let profile = null;
  if (isWebSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      profile = await resolveBoutiqueProfile(supabase, slug);
    } catch {
      profile = getBoutiqueProfile(slug) ?? null;
    }
  } else {
    profile = getBoutiqueProfile(slug) ?? null;
  }

  if (!profile) notFound();

  const design = getDesignById(profile, dressId);
  if (!design) notFound();

  const backHref = outfit
    ? `/boutique/${slug}/outfit/${outfit}`
    : `/boutique/${slug}`;

  return (
    <>
      <DressDetailView profile={profile} design={design} backHref={backHref} />
    </>
  );
}
