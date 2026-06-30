"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@faden/ui";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { Store, Sparkles, Shirt } from "lucide-react";

const OPTIONS = [
  {
    title: "Customize Outfit",
    description: "Describe your dream outfit and get matched with verified boutiques.",
    icon: Shirt,
    href: "/customize",
  },
  {
    title: "Explore Boutiques",
    description: "Browse portfolios, ratings, and trusted studios before you customize.",
    icon: Sparkles,
    action: "explore" as const,
  },
  {
    title: "Register Boutique",
    description: "Showcase your work and attract new customers on India's fashion platform.",
    icon: Store,
    href: "/signup?next=/register-boutique",
  },
];

interface CTAGateProps {
  onExplore: () => void;
}

export function CTAGate({ onExplore }: CTAGateProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLElement>(null);
  useBodyScrollLock(true);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, []);

  return (
    <motion.section
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-background [-webkit-overflow-scrolling:touch]"
      aria-label="Choose how to continue"
    >
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-container flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center sm:mb-12">
          <p className="font-display text-sm tracking-[0.25em] text-gold">— WELCOME TO FADEN —</p>
          <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
            Where would you like to begin?
          </h1>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {OPTIONS.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.5 }}
              className="group rounded-xl border border-border bg-background-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-burgundy/30 text-gold">
                <opt.icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold md:text-2xl">{opt.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                {opt.description}
              </p>
              {opt.action === "explore" ? (
                <Button variant="luxury-outline" className="mt-8 w-full" onClick={onExplore}>
                  Browse boutiques
                </Button>
              ) : (
                <Button asChild variant="luxury" className="mt-8 w-full">
                  <Link href={opt.href!}>Get Started</Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
