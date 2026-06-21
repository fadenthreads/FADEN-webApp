"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@faden/ui";

const OPTIONS = [
  {
    title: "Customize Outfit",
    emoji: "✨",
    description: "Describe your outfit and get matched with verified boutiques.",
    href: "/customize",
  },
  {
    title: "Explore Boutiques",
    emoji: "👗",
    description: "Browse trusted studios, portfolios, and customer reviews.",
    href: "/#featured-boutiques",
  },
  {
    title: "Register Boutique",
    emoji: "🏪",
    description:
      "Showcase your work and attract new customers on India's fashion platform.",
    href: "/signup?next=/register-boutique",
  },
];

export function CTAOptions() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="px-4 py-section-gap">
      <div className="mx-auto grid max-w-container gap-8 md:grid-cols-3">
        {OPTIONS.map((opt, i) => (
          <motion.div
            key={opt.title}
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="rounded-lg border border-border-light bg-background-soft p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-5xl" aria-hidden>
              {opt.emoji}
            </span>
            <h2 className="mt-4 text-2xl font-semibold">{opt.title}</h2>
            <p className="mt-2 text-foreground-muted">{opt.description}</p>
            <Button asChild className="mt-6">
              <Link href={opt.href}>Get Started</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
