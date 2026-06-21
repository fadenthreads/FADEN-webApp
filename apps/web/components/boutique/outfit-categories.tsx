"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const GRADIENTS = [
  "from-burgundy/50 via-rose-900/30 to-background-soft",
  "from-amber-900/40 via-burgundy/30 to-background-soft",
  "from-purple-900/40 via-burgundy/20 to-background-soft",
  "from-indigo-900/30 via-burgundy/30 to-background-soft",
  "from-orange-900/40 via-red-900/20 to-background-soft",
];

interface OutfitCategoriesProps {
  slug: string;
  categories: string[];
}

export function OutfitCategories({ slug, categories }: OutfitCategoriesProps) {
  return (
    <section className="py-section-gap" aria-labelledby="outfit-categories-heading">
      <h2 id="outfit-categories-heading" className="font-display text-2xl font-semibold">
        What They Make
      </h2>
      <p className="mt-2 text-foreground-muted">
        Tap an outfit type to browse their work — connected by thread for easy discovery.
      </p>

      <div className="relative mt-8 flex flex-wrap items-center gap-0">
        {categories.map((cat, i) => (
          <div key={cat} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/boutique/${slug}/outfit/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex w-[120px] flex-col items-center gap-3 md:w-[140px]"
              >
                <div
                  className={`flex h-[120px] w-full items-center justify-center rounded-lg border border-border bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} transition-all group-hover:border-gold/40 group-hover:shadow-gold md:h-[140px]`}
                >
                  <span className="font-display text-sm font-medium text-foreground/90">{cat}</span>
                </div>
              </Link>
            </motion.div>
            {i < categories.length - 1 && (
              <svg width="32" height="8" viewBox="0 0 32 8" className="mx-1 shrink-0 text-gold/40" aria-hidden>
                <path d="M0 4 Q 8 1, 16 4 T 32 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
