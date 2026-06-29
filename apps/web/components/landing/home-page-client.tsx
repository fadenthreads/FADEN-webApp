"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { OpeningSequence } from "@/components/animations/opening-sequence";
import { ScissorsLoading } from "@/components/animations/scissors-loading";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedPreview } from "@/components/landing/featured-preview";
import { FeaturedClothing } from "@/components/landing/featured-clothing";
import { CoreAim } from "@/components/landing/core-aim";
import { ProblemsWeSolve } from "@/components/landing/problems-we-solve";
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
      if (window.location.hash === "#featured-boutiques") {
        requestAnimationFrame(() => {
          document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <>
      <AnimatePresence>
        {phase === "opening" && <OpeningSequence key="opening" onComplete={() => setPhase("scissors")} />}
        {phase === "scissors" && <ScissorsLoading key="scissors" onComplete={() => setPhase("main")} />}
      </AnimatePresence>

      {phase === "main" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <HeroSection onExploreBoutiques={handleExploreBoutiques} />
          <FeaturedPreview audienceCategory={categoryFromUrl} />
          <FeaturedClothing audienceCategory={categoryFromUrl} />
          <CoreAim />
          <ProblemsWeSolve />
          <VisionStatement />
        </motion.div>
      )}
    </>
  );
}
