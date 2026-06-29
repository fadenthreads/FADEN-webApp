import { notFound } from "next/navigation";
import { DressDetailView } from "@/components/boutique/dress-detail-view";
import { getPortfolioItemById, resolveBoutiqueProfile } from "@/lib/boutique/queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getBoutiqueProfile, getDesignById } from "@/data/boutique-profiles";

export const dynamic = "force-dynamic";

export default async function DressDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; dressId: string }>;
  searchParams: Promise<{ outfit?: string }>;
}) {
  const { slug, dressId } = await params;
  const { outfit } = await searchParams;

  let profile = null;
  let design = null;

  if (isWebSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [resolvedProfile, dbDesign] = await Promise.all([
        resolveBoutiqueProfile(supabase, slug),
        getPortfolioItemById(supabase, dressId),
      ]);
      profile = resolvedProfile;
      design = dbDesign;
    } catch {
      profile = getBoutiqueProfile(slug) ?? null;
    }
  } else {
    profile = getBoutiqueProfile(slug) ?? null;
  }

  if (!profile) notFound();

  if (!design) {
    design = getDesignById(profile, dressId) ?? null;
  }

  if (!design) notFound();

  const backHref = outfit ? `/boutique/${slug}/outfit/${outfit}` : `/boutique/${slug}`;

  return (
    <>
      <DressDetailView profile={profile} design={design} backHref={backHref} />
    </>
  );
}
