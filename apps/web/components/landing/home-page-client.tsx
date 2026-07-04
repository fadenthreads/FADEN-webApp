"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { OpeningSequence } from "@/components/animations/opening-sequence";
import { ScissorsLoading } from "@/components/animations/scissors-loading";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedPreview } from "@/components/landing/featured-preview";
import { FeaturedClothing } from "@/components/landing/featured-clothing";
import { FeaturedMaterials } from "@/components/landing/featured-materials";
import { VisionStatement } from "@/components/landing/vision-statement";
import { parseAudienceCategory, type AudienceCategory } from "@/lib/landing/audience-categories";

type LoadPhase = "opening" | "scissors" | "main";

export function HomePageClient({ skipIntro = false, initialCategory = null }: { skipIntro?: boolean; initialCategory?: AudienceCategory | null }) {
  const searchParams = useSearchParams();
  const categoryFromUrl = parseAudienceCategory(searchParams.get("category")) ?? initialCategory;
  const [phase, setPhase] = useState<LoadPhase>(() => skipIntro ? "main" : "opening");

  useEffect(() => { if (!skipIntro) window.scrollTo(0, 0); }, [skipIntro]);

  useEffect(() => {
    if (phase !== "main") return;
    const syncFromHash = () => {
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
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [phase]);

  useEffect(() => {
    if (categoryFromUrl && phase === "main") {
      requestAnimationFrame(() => {
        document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [categoryFromUrl, phase]);

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
        {phase === "opening" && <OpeningSequence key="opening" onComplete={() => setPhase("scissors")} />}
        {phase === "scissors" && <ScissorsLoading key="scissors" onComplete={() => setPhase("main")} />}
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
