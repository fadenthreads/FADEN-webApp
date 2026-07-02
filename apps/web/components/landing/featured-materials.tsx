"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";
import { InfiniteMaterialsThread } from "@/components/landing/infinite-materials-thread";
import type { FeaturedMaterialItem } from "@/lib/materials/featured-materials";

export function FeaturedMaterials() {
  const reducedMotion = useReducedMotion();
  const [materials, setMaterials] = useState<FeaturedMaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/materials/featured")
      .then((res) => res.json())
      .then((payload: { materials?: FeaturedMaterialItem[] }) => {
        if (!cancelled) setMaterials(payload.materials ?? []);
      })
      .catch(() => {
        if (!cancelled) setMaterials([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="featured-materials"
      aria-labelledby="featured-materials-heading"
      className="faden-section-neat scroll-mt-[200px] border-t px-4 py-section-gap md:scroll-mt-[160px] lg:px-12"
    >
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mx-auto max-w-container">
          <motion.h2
            id="featured-materials-heading"
            variants={fadeUp}
            transition={fadeUpTransition}
            className="font-display text-2xl font-semibold text-navy md:text-3xl"
          >
            Featured Materials
          </motion.h2>
          <motion.p variants={fadeUp} transition={fadeUpTransition} className="mt-2 max-w-2xl text-foreground-muted">
            Shop premium fabrics from verified boutiques — tap a swatch to read the full description and customize
            with your chosen material.
          </motion.p>

          <motion.div variants={fadeUp} transition={fadeUpTransition}>
            {loading ? (
              <div className="-mx-4 mt-8 flex gap-4 overflow-hidden px-4">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={`material-skeleton-${index}`}
                    className="aspect-[3/4] w-[180px] shrink-0 animate-pulse rounded-2xl border border-border bg-background-elevated md:w-[200px]"
                  />
                ))}
              </div>
            ) : materials.length === 0 ? (
              <p className="mt-8 text-center text-sm leading-relaxed text-foreground-muted">
                Featured materials from verified boutiques will appear here as fabric listings are added.
              </p>
            ) : (
              <InfiniteMaterialsThread materials={materials} />
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
