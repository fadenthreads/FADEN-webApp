"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BoutiqueGrid } from "@/components/discovery/boutique-grid";
import { ClothingSearchGrid } from "@/components/discovery/clothing-search-grid";
import { BoutiqueDiscoveryFilters } from "@/components/discovery/boutique-discovery-filters";
import { CustomizeOutfitCta } from "@/components/discovery/customize-outfit-cta";
import type { BoutiqueData } from "@/data/boutiques";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import { buildBoutiqueDiscoveryParams } from "@/lib/boutique/discovery-params";
import type { FeaturedDesignItem } from "@/lib/boutique/featured-designs";
import { listFeaturedDesignsFromMock } from "@/lib/boutique/featured-designs";
import { listClothingByQuerySync } from "@/lib/boutique/clothing-search";
import {
  getDefaultCustomerLocation,
  getStoredCustomerLocation,
} from "@/lib/location/customer-location";
import {
  parseSearchMaxDistance,
  parseSearchMinRating,
  parseSearchSort,
  parseSearchView,
  searchHref,
  sortBoutiquesWithDistance,
  type SearchSort,
} from "@/lib/boutique/search-nav";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";
import { parseAudienceCategory, outfitTypeNavHref, clothingSearchHref } from "@/lib/landing/audience-categories";

interface BoutiqueSearchPageProps {
  initialQuery?: string;
  initialAudience?: import("@faden/validators").AudienceCategory | null;
  initialMinRating?: number | null;
  initialMaxDistanceKm?: number | null;
  initialSort?: SearchSort;
}

export function BoutiqueSearchPage({
  initialQuery = "",
  initialAudience = null,
  initialMinRating = null,
  initialMaxDistanceKm = null,
  initialSort = "best-match",
}: BoutiqueSearchPageProps) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const discovery = useDiscoveryOptional();

  const query = searchParams.get("q") ?? initialQuery;
  const audience =
    parseAudienceCategory(searchParams.get("audience") ?? undefined) ?? initialAudience;
  const view = parseSearchView(searchParams.get("view") ?? undefined);
  const isClothingView = view === "clothing";
  const minRating = parseSearchMinRating(searchParams.get("minRating") ?? undefined) ?? initialMinRating;
  const maxDistanceKm =
    parseSearchMaxDistance(searchParams.get("maxDistance") ?? undefined) ?? initialMaxDistanceKm;
  const sort = parseSearchSort(searchParams.get("sort") ?? undefined) ?? initialSort;

  const customerLocation = discovery?.customerLocation ?? getDefaultCustomerLocation();

  const [boutiques, setBoutiques] = useState<BoutiqueData[]>(() =>
    getBoutiquesForDiscovery({
      locationLabel: customerLocation.label,
      query,
      audience: audience ?? undefined,
      minRating,
      customerLat: customerLocation.lat,
      customerLng: customerLocation.lng,
      maxDistanceKm,
    }),
  );
  const [clothing, setClothing] = useState<FeaturedDesignItem[]>(() =>
    listClothingByQuerySync(query, audience),
  );
  const [loading, setLoading] = useState(true);

  const sortedBoutiques = useMemo(
    () => sortBoutiquesWithDistance(boutiques, sort),
    [boutiques, sort],
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (isClothingView) {
      const params = new URLSearchParams();
      if (audience) params.set("audience", audience);
      if (query.trim()) params.set("q", query.trim());

      fetch(`/api/portfolio/featured?${params}`)
        .then((res) => res.json())
        .then((data: { designs?: FeaturedDesignItem[] }) => {
          if (mounted && data.designs) setClothing(data.designs);
        })
        .catch(() => {
          if (mounted) setClothing(listClothingByQuerySync(query, audience));
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });

      return () => {
        mounted = false;
      };
    }

    const location = discovery?.customerLocation ?? getStoredCustomerLocation();
    const params = buildBoutiqueDiscoveryParams({
      location,
      query,
      audience,
      minRating,
      maxDistanceKm,
    });

    fetch(`/api/boutiques?${params}`)
      .then((res) => res.json())
      .then((data: { boutiques?: BoutiqueData[] }) => {
        if (mounted && data.boutiques) setBoutiques(data.boutiques);
      })
      .catch(() => {
        /* keep mock fallback */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [discovery?.customerLocation, query, audience, minRating, maxDistanceKm, isClothingView]);

  const updateSearchParams = useCallback(
    (next: { minRating?: number | null; maxDistanceKm?: number | null; sort?: SearchSort }) => {
      router.replace(
        searchHref({
          q: query,
          audience,
          view: isClothingView ? "clothing" : "boutiques",
          minRating: next.minRating !== undefined ? next.minRating : minRating,
          maxDistanceKm: next.maxDistanceKm !== undefined ? next.maxDistanceKm : maxDistanceKm,
          sort: next.sort !== undefined ? next.sort : sort,
        }),
        { scroll: false },
      );
    },
    [query, audience, minRating, maxDistanceKm, sort, router, isClothingView],
  );

  if (!query.trim()) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 text-center lg:px-12">
        <h1 className="font-display text-3xl font-semibold">Search</h1>
        <p className="mt-3 text-foreground-muted">
          Use the search bar above to find boutiques or clothing by outfit type, fabric, or name.
        </p>
      </div>
    );
  }

  const alternateHref = isClothingView
    ? outfitTypeNavHref(query, audience)
    : clothingSearchHref(query, audience);

  return (
    <section className="px-4 pb-32 pt-8 lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        animate="visible"
        className="mx-auto max-w-container"
      >
        <motion.div variants={fadeUp} transition={fadeUpTransition} className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">SEARCH</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            {isClothingView ? "Clothing results" : "Boutique results"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {isClothingView
              ? `Outfits matching “${query.trim()}” from verified boutiques.`
              : `Boutiques matching “${query.trim()}” near ${customerLocation.label}.`}
          </p>
          {!loading && (
            <p className="mt-2 text-xs tracking-wider text-gold/80">
              {isClothingView
                ? `${clothing.length} outfit${clothing.length === 1 ? "" : "s"} found`
                : `${boutiques.length} boutique${boutiques.length === 1 ? "" : "s"} found`}
            </p>
          )}
        </motion.div>

        <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-5 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-background-elevated p-1">
            <Link
              href={outfitTypeNavHref(query, audience)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                !isClothingView ? "bg-gold text-navy" : "text-foreground-muted hover:text-navy"
              }`}
            >
              Boutiques
            </Link>
            <Link
              href={clothingSearchHref(query, audience)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isClothingView ? "bg-gold text-navy" : "text-foreground-muted hover:text-navy"
              }`}
            >
              Clothing
            </Link>
          </div>
        </motion.div>

        {!isClothingView && (
          <motion.div variants={fadeUp} transition={fadeUpTransition} className="mt-6">
            <BoutiqueDiscoveryFilters
              minRating={minRating}
              maxDistanceKm={maxDistanceKm}
              sort={sort}
              onApply={(filters) => updateSearchParams(filters)}
            />
          </motion.div>
        )}

        <motion.div variants={fadeUp} transition={fadeUpTransition}>
          {loading ? (
            <p className="mt-10 text-center text-sm text-foreground-muted">
              {isClothingView ? "Loading outfits…" : "Loading boutiques…"}
            </p>
          ) : isClothingView ? (
            <ClothingSearchGrid designs={clothing.length ? clothing : listFeaturedDesignsFromMock(48, audience).filter((d) => d.title.toLowerCase().includes(query.toLowerCase()))} />
          ) : sortedBoutiques.length === 0 ? (
            <p className="mt-10 text-center text-sm text-foreground-muted">
              No boutiques match your filters. Try a different search, widen the distance, or{" "}
              <Link href={alternateHref} className="text-gold underline">
                browse clothing
              </Link>
              .
            </p>
          ) : (
            <BoutiqueGrid boutiques={sortedBoutiques} />
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={fadeUpTransition}
          className="mt-10 flex flex-col items-center gap-4 pb-4"
        >
          <CustomizeOutfitCta />
        </motion.div>
      </motion.div>
    </section>
  );
}
