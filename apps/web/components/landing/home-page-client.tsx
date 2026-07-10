"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SimpleSplash } from "@/components/animations/simple-splash";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedPreview } from "@/components/landing/featured-preview";
import { FeaturedClothing } from "@/components/landing/featured-clothing";
import { FeaturedMaterials } from "@/components/landing/featured-materials";
import { VisionStatement } from "@/components/landing/vision-statement";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { parseAudienceCategory, type AudienceCategory } from "@/lib/landing/audience-categories";

type LoadPhase = "splash" | "main";

export function HomePageClient({ skipIntro = false, initialCategory = null }: { skipIntro?: boolean; initialCategory?: AudienceCategory | null }) {
  const searchParams = useSearchParams();
  const categoryFromUrl = parseAudienceCategory(searchParams.get("category")) ?? initialCategory;
  const [phase, setPhase] = useState<LoadPhase>(() => (skipIntro ? "main" : "splash"));

  useBodyScrollLock(phase === "splash");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (phase !== "main") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const hash = window.location.hash.replace("#", "");
    const targetId =
      hash === "featured-boutiques" || hash === "featured-clothing" || hash === "featured-materials"
        ? hash
        : null;

    if (targetId) {
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    if (categoryFromUrl && skipIntro) {
      requestAnimationFrame(() => {
        document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [phase, categoryFromUrl, skipIntro]);

  useEffect(() => {
    if (phase !== "main") return;

    function syncFromHash() {
      const hash = window.location.hash.replace("#", "");
      const targetId =
        hash === "featured-boutiques" || hash === "featured-clothing" || hash === "featured-materials"
          ? hash
          : null;
      if (targetId) {
        requestAnimationFrame(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [phase]);

  const handleExploreBoutiques = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleExploreClothing = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("featured-clothing")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleExploreMaterials = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("featured-materials")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "splash" && <SimpleSplash key="splash" onComplete={() => setPhase("main")} />}
      </AnimatePresence>

      {phase === "main" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="faden-home-page min-h-screen"
        >
          <HeroSection
            onExploreBoutiques={handleExploreBoutiques}
            onExploreClothing={handleExploreClothing}
            onExploreMaterials={handleExploreMaterials}
          />
          <FeaturedPreview audienceCategory={categoryFromUrl} />
          <FeaturedClothing audienceCategory={categoryFromUrl} />
          <FeaturedMaterials />
          <VisionStatement />
        </motion.div>
      )}
    </>
  );
}
