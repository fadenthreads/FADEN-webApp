"use client";

import Link from "next/link";
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
      className="faden-section-neat scroll-mt-[200px] border-t px-4 py-10 md:scroll-mt-[160px] md:py-section-gap lg:px-12"
    >
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mx-auto max-w-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <motion.h2
                id="featured-materials-heading"
                variants={fadeUp}
                transition={fadeUpTransition}
                className="font-display text-2xl font-semibold text-navy md:text-3xl"
              >
                Featured Materials
              </motion.h2>
              <motion.p
                variants={fadeUp}
                transition={fadeUpTransition}
                className="mt-2 max-w-2xl text-foreground-muted"
              >
                Shop premium fabrics from verified suppliers — add to cart or buy directly, then customize with
                your chosen material.
              </motion.p>
            </div>
            <motion.p variants={fadeUp} transition={fadeUpTransition} className="text-sm text-foreground-muted">
              Sell materials?{" "}
              <Link
                href="/signup?next=/register-material-business"
                className="font-medium text-gold hover:text-gold-light"
              >
                Register your material business
              </Link>
            </motion.p>
          </div>

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
                Featured materials from verified suppliers will appear here as fabric listings are added.{" "}
                <Link href="/register-material-business" className="text-gold hover:text-gold-light">
                  List your materials
                </Link>
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
