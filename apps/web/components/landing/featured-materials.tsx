"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Star, Store } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeUpTransition, scaleIn, staggerContainer } from "@/lib/motion-presets";
import { InfiniteMaterialsThread } from "@/components/landing/infinite-materials-thread";
import { DEMO_FEATURED_MATERIALS, DEMO_MATERIAL_SHOP } from "@/data/demo-featured-materials";
import type { FeaturedMaterialItem } from "@/lib/materials/featured-materials";

export function FeaturedMaterials() {
  const reducedMotion = useReducedMotion();
  const [materials, setMaterials] = useState<FeaturedMaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/materials/featured")
      .then((res) => res.json())
      .then((payload: { materials?: FeaturedMaterialItem[] }) => {
        if (cancelled) return;
        const live = payload.materials ?? [];
        if (live.length > 0) {
          setMaterials(live);
          setIsDemo(false);
        } else {
          setMaterials(DEMO_FEATURED_MATERIALS);
          setIsDemo(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMaterials(DEMO_FEATURED_MATERIALS);
          setIsDemo(true);
        }
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

          {isDemo && !loading && (
            <motion.article
              variants={fadeUp}
              transition={fadeUpTransition}
              className="premium-surface-3d mt-8 overflow-hidden rounded-2xl border border-gold/20"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy/80 via-navy to-navy-dark text-white shadow-md">
                    <Store className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                      Demo material shop
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-navy">{DEMO_MATERIAL_SHOP.name}</h3>
                    <p className="mt-1 text-sm text-gold">{DEMO_MATERIAL_SHOP.tagline}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground-muted">
                      <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                      {DEMO_MATERIAL_SHOP.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                    <span className="text-sm font-semibold text-navy">{DEMO_MATERIAL_SHOP.rating}</span>
                    <span className="text-xs text-foreground-muted">({DEMO_MATERIAL_SHOP.reviewCount} reviews)</span>
                  </div>
                  <p className="text-xs text-foreground-muted">Preview fabrics below — live listings replace this once suppliers join.</p>
                </div>
              </div>
            </motion.article>
          )}

          <motion.div variants={scaleIn} transition={fadeUpTransition}>
            {loading ? (
              <div className="-mx-4 mt-8 flex gap-4 overflow-hidden px-4">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={`material-skeleton-${index}`}
                    className="faden-shimmer aspect-[3/4] w-[180px] shrink-0 rounded-2xl border border-border bg-background-elevated md:w-[200px]"
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
