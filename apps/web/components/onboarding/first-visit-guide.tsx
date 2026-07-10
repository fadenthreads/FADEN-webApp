"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Menu, Search, Sparkles, Store, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@faden/ui";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

const STORAGE_KEY = "faden-first-visit-guide-v1";

const STEPS = [
  {
    icon: Menu,
    title: "Open the menu",
    body: "Tap the menu icon to set your city, browse categories, and switch language.",
  },
  {
    icon: MapPin,
    title: "Set your location",
    body: "Pick your city or pin on the map — we sort boutiques by distance and show nearby studios.",
  },
  {
    icon: Search,
    title: "Filter outfits",
    body: "Use Categories and Outfits in the bar below the header to narrow what you’re looking for.",
  },
  {
    icon: Store,
    title: "Explore boutiques",
    body: "Scroll to Featured Boutiques or use Explore Boutiques to view verified studios and portfolios.",
  },
  {
    icon: Sparkles,
    title: "Customize your outfit",
    body: "Start a customization request from the hero, bottom nav, or any boutique profile.",
  },
] as const;

interface FirstVisitGuideProps {
  ready?: boolean;
}

export function FirstVisitGuide({ ready = true }: FirstVisitGuideProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!ready || !mounted) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "done") return;
      const timer = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(timer);
    } catch {
      /* private browsing */
    }
  }, [ready, mounted]);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((current) => current + 1);
  }

  if (!mounted) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-navy/50 p-4 sm:items-center">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="first-visit-guide-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gold/30 bg-background-elevated shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 id="first-visit-guide-title" className="mt-1 font-display text-xl font-semibold text-navy">
                  Welcome to FADEN
                </h2>
              </div>
              <button
                type="button"
                onClick={finish}
                className="rounded-full p-1.5 text-foreground-muted hover:bg-navy/5 hover:text-navy"
                aria-label="Close guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy">{current.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{current.body}</p>

              <div className="mt-5 flex gap-1.5">
                {STEPS.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-gold" : "bg-navy/10"}`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border px-5 py-4">
              <Button type="button" variant="luxury-outline" className="flex-1" onClick={finish}>
                Skip
              </Button>
              <Button type="button" variant="luxury" className="flex-1" onClick={next}>
                {step >= STEPS.length - 1 ? "Get started" : "Next"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
