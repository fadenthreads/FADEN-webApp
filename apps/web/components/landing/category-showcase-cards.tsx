"use client";

import Link from "next/link";
import { BookOpen, Shirt, Store, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { homeHref } from "@/lib/landing/home-nav";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion-presets";

const CARDS = [
  {
    id: "for-you",
    title: "For You",
    subtitle: "Styles that feel like you",
    href: "/#featured-clothing",
    icon: Shirt,
    gradient: "from-amber-100/80 via-rose-100/60 to-background-soft",
  },
  {
    id: "for-boutiques",
    title: "For Boutiques",
    subtitle: "Grow your boutique with us",
    href: homeHref({ hash: "featured-boutiques" }),
    icon: Store,
    gradient: "from-stone-200/80 via-amber-100/50 to-background-soft",
  },
  {
    id: "for-designers",
    title: "For Designers",
    subtitle: "Showcase. Connect. Create.",
    href: "/signup?next=/register-boutique&role=boutique_owner",
    icon: User,
    gradient: "from-slate-200/70 via-stone-100/60 to-background-soft",
  },
  {
    id: "journal",
    title: "Our Journal",
    subtitle: "Stories, style & inspiration",
    href: "/press",
    icon: BookOpen,
    gradient: "from-orange-100/60 via-amber-50/80 to-background-soft",
  },
] as const;

export function CategoryShowcaseCards() {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="category-showcase-heading" className="px-4 py-12 lg:px-12 lg:py-16">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto max-w-container"
      >
        <motion.p
          id="category-showcase-heading"
          variants={fadeUp}
          transition={fadeUpTransition}
          className="text-center text-xs font-semibold tracking-[0.3em] text-gold"
        >
          IT ALL STARTS WITH A THREAD +
        </motion.p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.id} variants={fadeUp} transition={fadeUpTransition}>
                <Link
                  href={card.href}
                  className="group block overflow-hidden rounded-xl border border-border bg-background-elevated shadow-sm transition-all hover:border-gold/40 hover:shadow-md"
                >
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${card.gradient}`}>
                    <div className="absolute inset-0 bg-[url('/hero-boutique.png')] bg-cover bg-center opacity-20 mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold shadow-md transition-transform group-hover:scale-105">
                        <Icon className="h-6 w-6" strokeWidth={1.25} aria-hidden />
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border/60 bg-background-elevated/95 px-4 py-4 backdrop-blur-sm">
                    <p className="font-display text-lg font-semibold text-navy">{card.title}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{card.subtitle}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
