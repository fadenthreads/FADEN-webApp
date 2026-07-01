import Link from "next/link";
import { notFound } from "next/navigation";
import { OutfitGalleryGrid } from "@/components/boutique/outfit-gallery-grid";
import { resolveBoutiqueProfile } from "@/lib/boutique/queries";
import { findCategoryByOutfitSlug } from "@/lib/boutique/portfolio";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { getDesignsByCategory } from "@/data/boutique-profiles";

export const dynamic = "force-dynamic";

interface OutfitGalleryPageProps {
  params: Promise<{ slug: string; outfit: string }>;
}

export default async function OutfitGalleryPage({ params }: OutfitGalleryPageProps) {
  const { slug, outfit } = await params;

  let profile = null;
  if (isWebSupabaseConfigured()) {
    const supabase = await createClient();
    profile = await resolveBoutiqueProfile(supabase, slug);
  }

  if (!profile) notFound();

  const category = findCategoryByOutfitSlug(profile.categories, outfit);
  if (!category) notFound();

  const designs = getDesignsByCategory(profile, category.id);

  return (
    <div className="px-4 pb-section-gap pt-8 lg:px-12">
      <div className="mx-auto max-w-container">
        <nav className="text-sm text-foreground-muted">
          <Link href={`/boutique/${slug}`} className="hover:text-gold">
            ← Back to {profile.name}
          </Link>
        </nav>
        <h1 className="mt-4 font-display text-3xl font-bold">{category.label} Collection</h1>
        <p className="mt-2 text-foreground-muted">
          Browse past {category.label.toLowerCase()} work from {profile.name}. Open any outfit for
          description, reviews, and customize reference.
        </p>

        <OutfitGalleryGrid
          boutiqueSlug={slug}
          categoryLabel={category.label}
          designs={designs}
          outfitSlug={category.id}
        />
      </div>
    </div>
  );
}
