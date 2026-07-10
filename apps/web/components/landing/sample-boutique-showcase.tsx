"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@faden/ui";
import { SAMPLE_BOUTIQUE } from "@/data/sample-boutique";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

export function SampleBoutiqueShowcase() {
  const reducedMotion = useReducedMotion();
  const boutique = SAMPLE_BOUTIQUE;
  const cover = boutique.media[0]?.url ?? "/hero-background.png";

  return (
    <section id="sample-boutique" className="scroll-mt-[160px] border-t border-navy/8 px-4 py-10 md:py-12 lg:px-12">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto max-w-container"
      >
        <motion.div variants={fadeUp} transition={fadeUpTransition} className="text-center">
          <p className="text-xs font-semibold tracking-[0.32em] text-gold">SAMPLE BOUTIQUE</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-navy md:text-3xl">
            See How a Studio Looks on FADEN
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted">
            A preview of how verified boutiques appear — portfolio, reviews, location, and direct connect.
          </p>
        </motion.div>

        <motion.article
          variants={fadeUp}
          transition={fadeUpTransition}
          className="premium-surface-3d mt-8 overflow-hidden rounded-2xl md:mt-10"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] min-h-[260px] md:aspect-auto md:min-h-[380px]">
              <Image src={cover} alt={`${boutique.name} portfolio`} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Demo preview
              </span>
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                <span className="text-sm font-semibold text-navy">{boutique.rating}</span>
                <span className="text-xs text-foreground-muted">({boutique.reviewCount} reviews)</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-navy">{boutique.name}</h3>
              <p className="mt-1 text-sm text-gold">{boutique.tagline}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                {boutique.location}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">{boutique.experienceSummary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {boutique.specialties.map((item) => (
                  <span key={item} className="rounded-full border border-navy/15 bg-navy/5 px-3 py-1 text-xs font-medium text-navy">
                    {item}
                  </span>
                ))}
              </div>

              <blockquote className="mt-5 rounded-xl border border-gold/25 bg-gold/5 p-4">
                <p className="text-sm italic leading-relaxed text-navy/80">&ldquo;{boutique.highlightReview.text}&rdquo;</p>
                <footer className="mt-2 text-xs text-foreground-muted">
                  — {boutique.highlightReview.name} · {boutique.highlightReview.rating}/5
                </footer>
              </blockquote>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="luxury" className="w-full sm:w-auto">
                  <Link href="/customize?boutique=sample-studio">
                    Customize with this studio
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="luxury-outline" className="w-full sm:w-auto">
                  <Link href="/signup">Sign up to connect</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
