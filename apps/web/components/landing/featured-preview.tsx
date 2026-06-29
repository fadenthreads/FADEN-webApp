"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { InfiniteBoutiqueThread } from "@/components/discovery/infinite-boutique-thread";
import { CustomizeOutfitCta } from "@/components/discovery/customize-outfit-cta";
import type { BoutiqueData } from "@/data/boutiques";
import { getBoutiquesForDiscovery } from "@/data/discovery-filters";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import { buildBoutiqueDiscoveryParams } from "@/lib/boutique/discovery-params";
import {
  FEATURED_MIN_COUNT,
  FEATURED_NEAR_DISTANCE_KM,
  FEATURED_TOP_COUNT,
  pickFeaturedBoutiques,
} from "@/lib/boutique/featured-boutiques";
import {
  getDefaultCustomerLocation,
  getStoredCustomerLocation,
} from "@/lib/location/customer-location";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";
import type { AudienceCategory } from "@/lib/landing/audience-categories";

interface FeaturedPreviewProps {
  audienceCategory?: AudienceCategory | null;
}

const AUDIENCE_LABEL_KEYS: Record<AudienceCategory, "women" | "men" | "kids"> = {
  women: "women",
  men: "men",
  kids: "kids",
};

export function FeaturedPreview({ audienceCategory = null }: FeaturedPreviewProps) {
  const t = useTranslations("Home");
  const tNav = useTranslations("CategoryNav");
  const reducedMotion = useReducedMotion();
  const discovery = useDiscoveryOptional();
  const customerLocation = discovery?.customerLocation ?? getDefaultCustomerLocation();

  const [boutiques, setBoutiques] = useState<BoutiqueData[]>(() =>
    pickFeaturedBoutiques(
      getBoutiquesForDiscovery({
        locationLabel: customerLocation.label,
        customerLat: customerLocation.lat,
        customerLng: customerLocation.lng,
        audience: audienceCategory ?? undefined,
      }),
      { audience: audienceCategory },
    ),
  );
  const [loading, setLoading] = useState(true);

  const featuredBoutiques = useMemo(
    () => pickFeaturedBoutiques(boutiques, { audience: audienceCategory }),
    [boutiques, audienceCategory],
  );

  const audienceLabel = audienceCategory ? tNav(AUDIENCE_LABEL_KEYS[audienceCategory]) : null;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const location = discovery?.customerLocation ?? getStoredCustomerLocation();
    const params = buildBoutiqueDiscoveryParams({
      location,
      audience: audienceCategory,
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
  }, [discovery?.customerLocation, audienceCategory]);

  return (
    <section id="featured-boutiques" className="faden-section-neat scroll-mt-[180px] border-t px-4 pb-16 pt-10 md:scroll-mt-[120px] lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto max-w-container"
      >
        <motion.div variants={fadeUp} transition={fadeUpTransition} className="text-center">
          <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
            {audienceLabel ? t("audienceBoutiques", { audience: audienceLabel }) : t("featuredBoutiques")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {audienceLabel
              ? `Top-rated ${audienceLabel.toLowerCase()} boutiques within ${FEATURED_NEAR_DISTANCE_KM} km of ${customerLocation.label}.`
              : `Up to ${FEATURED_TOP_COUNT} highest-rated boutiques near ${customerLocation.label} (at least ${FEATURED_MIN_COUNT} when available).`}
          </p>
          {!loading && featuredBoutiques.length > 0 && (
            <p className="mt-2 text-xs tracking-wider text-gold/80">
              {t("boutiquesNearYou", { count: featuredBoutiques.length })}
            </p>
          )}
        </motion.div>

        <motion.div variants={fadeUp} transition={fadeUpTransition}>
          {!loading && featuredBoutiques.length === 0 ? (
            <p className="mt-8 text-center text-sm text-foreground-muted">
              {audienceLabel
                ? `No top-rated ${audienceLabel.toLowerCase()} boutiques within ${FEATURED_NEAR_DISTANCE_KM} km of ${customerLocation.label} yet. Try All or another category.`
                : `No top-rated boutiques within ${FEATURED_NEAR_DISTANCE_KM} km of ${customerLocation.label} yet. Try updating your location.`}
            </p>
          ) : (
            <InfiniteBoutiqueThread boutiques={featuredBoutiques} />
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={fadeUpTransition}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <CustomizeOutfitCta />
          <p className="max-w-md text-center text-sm leading-relaxed text-foreground-muted">
            Set your location on the map in the header to see accurate distances and nearest boutiques.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
