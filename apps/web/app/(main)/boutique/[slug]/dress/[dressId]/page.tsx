import { notFound } from "next/navigation";
import { DressDetailView } from "@/components/boutique/dress-detail-view";
import { getPortfolioItemById, resolveBoutiqueProfile } from "@/lib/boutique/queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

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

  if (!isWebSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const [profile, design] = await Promise.all([
    resolveBoutiqueProfile(supabase, slug),
    getPortfolioItemById(supabase, dressId),
  ]);

  if (!profile || !design) notFound();

  const backHref = outfit ? `/boutique/${slug}/outfit/${outfit}` : `/boutique/${slug}`;

  return <DressDetailView profile={profile} design={design} backHref={backHref} />;
}
