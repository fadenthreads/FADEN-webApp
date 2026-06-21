"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AudienceCategory } from "@faden/validators";
import type { BoutiqueDesign, BoutiqueProfileData, CreativePiece } from "@/data/boutique-profiles";
import { getDesignsByCategory } from "@/data/boutique-profiles";
import { findDefaultOwnerCategoryId } from "@/lib/boutique/owner-preview-profile";
import { resolveBoutiqueAudiences } from "@/lib/boutique/audiences";
import {
  filterCategoriesByAudience,
  filterDesignsByAudience,
} from "@/lib/boutique/profile-audience";
import { parseAudienceCategory } from "@/lib/landing/audience-categories";
import { BoutiqueProfileHeader } from "./boutique-profile-header";
import { BoutiqueAudienceNav } from "./boutique-audience-nav";
import { CategoryThread } from "./category-thread";
import { CategoryGallery } from "./category-gallery";
import { LatestDesigns } from "./latest-designs";
import { CreativeDispatch } from "./creative-dispatch";
import { BoutiqueReviews } from "./boutique-reviews";
import { CustomizationBar } from "./customization-bar";
import { CustomizeMatchSelectBar } from "@/components/customize/customize-match-select-bar";

interface BoutiqueProfileProps {
  profile: BoutiqueProfileData;
  fromMatches?: boolean;
  initialAudience?: AudienceCategory | null;
  ownerMode?: boolean;
  onEditDesign?: (design: BoutiqueDesign) => void;
  onDeleteDesign?: (designId: string) => void;
  onAddDesign?: (options?: { categoryId?: string; categoryLabel?: string }) => void;
  onAddWhatTheyMake?: () => void;
  onAddCreativePiece?: () => void;
  onEditCreativePiece?: (piece: CreativePiece) => void;
  onDeleteCreativePiece?: (pieceId: string) => void;
}

export function BoutiqueProfile({
  profile,
  fromMatches = false,
  initialAudience = null,
  ownerMode = false,
  onEditDesign,
  onDeleteDesign,
  onAddDesign,
  onAddWhatTheyMake,
  onAddCreativePiece,
  onEditCreativePiece,
  onDeleteCreativePiece,
}: BoutiqueProfileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const servedAudiences = useMemo(() => resolveBoutiqueAudiences(profile), [profile]);

  const audienceFromUrl = parseAudienceCategory(searchParams.get("audience"));
  const defaultAudience =
    (audienceFromUrl && servedAudiences.includes(audienceFromUrl) ? audienceFromUrl : null) ??
    (initialAudience && servedAudiences.includes(initialAudience) ? initialAudience : null) ??
    servedAudiences[0] ??
    "women";

  const [activeAudience, setActiveAudience] = useState<AudienceCategory>(defaultAudience);

  const allPortfolioDesigns = useMemo(
    () => profile.portfolioDesigns ?? [],
    [profile.portfolioDesigns],
  );

  const categoriesForView = useMemo(
    () => (ownerMode ? profile.categories : filterCategoriesByAudience(profile.categories, activeAudience)),
    [ownerMode, profile.categories, activeAudience],
  );

  const designsForList = useMemo(
    () =>
      ownerMode
        ? allPortfolioDesigns
        : filterDesignsByAudience(profile.latestDesigns, profile.categories, activeAudience),
    [ownerMode, allPortfolioDesigns, profile.latestDesigns, profile.categories, activeAudience],
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(() =>
    ownerMode
      ? findDefaultOwnerCategoryId(profile.categories, allPortfolioDesigns)
      : filterCategoriesByAudience(profile.categories, defaultAudience)[0]?.id ?? null,
  );

  useEffect(() => {
    if (!categoriesForView.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(
        ownerMode
          ? findDefaultOwnerCategoryId(categoriesForView, allPortfolioDesigns)
          : categoriesForView[0]?.id ?? null,
      );
    }
  }, [ownerMode, categoriesForView, allPortfolioDesigns, activeCategoryId]);

  const activeCategory = categoriesForView.find((category) => category.id === activeCategoryId);
  const categoryDesigns = activeCategoryId
    ? getDesignsByCategory(profile, activeCategoryId)
    : [];

  const handleAudienceChange = useCallback(
    (audience: AudienceCategory) => {
      if (ownerMode) return;
      setActiveAudience(audience);
      const nextCategories = filterCategoriesByAudience(profile.categories, audience);
      setActiveCategoryId(nextCategories[0]?.id ?? null);

      const params = new URLSearchParams(searchParams.toString());
      params.set("audience", audience);
      router.replace(`/boutique/${profile.slug}?${params.toString()}`, { scroll: false });
    },
    [ownerMode, profile.categories, profile.slug, router, searchParams],
  );

  const hasOutfits = allPortfolioDesigns.length > 0;
  const showCollectionUi = categoriesForView.length > 0 || (ownerMode && hasOutfits);

  return (
    <>
      <div className={`px-4 pt-8 lg:px-12 ${fromMatches ? "pb-36" : "pb-28"}`}>
        <div className="mx-auto max-w-container">
          <BoutiqueProfileHeader profile={profile} />

          {!ownerMode && (
            <BoutiqueAudienceNav
              audiences={servedAudiences}
              active={activeAudience}
              onSelect={handleAudienceChange}
            />
          )}

          {ownerMode && (
            <p className="mt-4 rounded-lg border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-foreground-muted">
              Editing mode — all your uploaded outfits are listed below. Use{" "}
              <span className="font-medium text-gold">Edit</span> on any piece, or pick a collection
              to add outfits to that category.
            </p>
          )}

          {showCollectionUi ? (
            <>
              {categoriesForView.length > 0 && (
                <CategoryThread
                  categories={categoriesForView}
                  activeCategoryId={activeCategoryId}
                  boutiqueSlug={profile.slug}
                  audience={ownerMode ? null : activeAudience}
                  onSelect={setActiveCategoryId}
                  ownerMode={ownerMode}
                  onAddWhatTheyMake={onAddWhatTheyMake}
                  designCounts={
                    ownerMode
                      ? Object.fromEntries(
                          categoriesForView.map((category) => [
                            category.id,
                            allPortfolioDesigns.filter((design) => design.categoryId === category.id)
                              .length,
                          ]),
                        )
                      : undefined
                  }
                />
              )}

              {activeCategory && (
                <CategoryGallery
                  categoryLabel={activeCategory.label}
                  categoryId={activeCategory.id}
                  designs={categoryDesigns}
                  boutiqueSlug={profile.slug}
                  boutiqueName={profile.name}
                  ownerMode={ownerMode}
                  onEditDesign={onEditDesign}
                  onDeleteDesign={onDeleteDesign}
                  onAddOutfit={
                    onAddDesign
                      ? (categoryId, categoryLabel) => onAddDesign({ categoryId, categoryLabel })
                      : undefined
                  }
                />
              )}

              <LatestDesigns
                boutiqueName={profile.name}
                boutiqueSlug={profile.slug}
                designs={designsForList}
                ownerMode={ownerMode}
                onEditDesign={onEditDesign}
                onDeleteDesign={onDeleteDesign}
              />
            </>
          ) : ownerMode ? (
            <div className="mt-8 rounded-xl border border-dashed border-gold/30 p-8 text-center">
              <p className="text-sm text-foreground-muted">
                {hasOutfits
                  ? "Add a collection under What They Make to organize your outfits for customers."
                  : "No outfits uploaded yet. Add a collection, then add your first outfit."}
              </p>
              {onAddWhatTheyMake && (
                <button
                  type="button"
                  onClick={onAddWhatTheyMake}
                  className="mt-4 text-sm font-medium text-gold hover:text-gold-light"
                >
                  Add what they make →
                </button>
              )}
            </div>
          ) : (
            <p className="mt-8 text-sm text-foreground-muted">
              No {activeAudience === "kids" ? "kids" : `${activeAudience}'s`} outfit categories listed
              for this boutique yet.
            </p>
          )}

          <CreativeDispatch
            pieces={profile.creativeDispatch}
            ownerMode={ownerMode}
            onAddPiece={onAddCreativePiece}
            onEditPiece={onEditCreativePiece}
            onDeletePiece={onDeleteCreativePiece}
          />

          {!ownerMode && <BoutiqueReviews boutiqueName={profile.name} reviews={profile.reviews} />}
        </div>
      </div>

      {!ownerMode && (
        fromMatches ? (
          <CustomizeMatchSelectBar boutiqueName={profile.name} boutiqueSlug={profile.slug} />
        ) : (
          <CustomizationBar
            boutiqueName={profile.name}
            boutiqueSlug={profile.slug}
            availability={profile.availability}
          />
        )
      )}
    </>
  );
}
