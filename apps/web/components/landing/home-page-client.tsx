"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { OpeningSequence } from "@/components/animations/opening-sequence";
import { ScissorsLoading } from "@/components/animations/scissors-loading";
import { CTAGate } from "@/components/landing/cta-gate";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedPreview } from "@/components/landing/featured-preview";
import { CoreAim } from "@/components/landing/core-aim";
import { ProblemsWeSolve } from "@/components/landing/problems-we-solve";
import { VisionStatement } from "@/components/landing/vision-statement";
import {
  parseAudienceCategory,
  type AudienceCategory,
} from "@/lib/landing/audience-categories";

type LoadPhase = "opening" | "scissors" | "cta" | "main";

interface HomePageClientProps {
  skipIntro?: boolean;
  initialCategory?: AudienceCategory | null;
}

export function HomePageClient({ skipIntro = false, initialCategory = null }: HomePageClientProps) {
  const searchParams = useSearchParams();
  const categoryFromUrl = parseAudienceCategory(searchParams.get("category")) ?? initialCategory;

  const [phase, setPhase] = useState<LoadPhase>(() => {
    if (skipIntro) return "main";
    return "opening";
  });
  const [showAllBoutiques, setShowAllBoutiques] = useState(skipIntro);

  useEffect(() => {
    if (!skipIntro) {
      window.scrollTo(0, 0);
    }
  }, [skipIntro]);

  useEffect(() => {
    if (phase !== "main") return;

    const syncFromHash = () => {
      if (window.location.hash === "#featured-boutiques") {
        setShowAllBoutiques(true);
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
      setShowAllBoutiques(true);
      requestAnimationFrame(() => {
        document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [categoryFromUrl, phase]);

  const handleExploreBoutiques = useCallback(() => {
    setShowAllBoutiques(true);
    requestAnimationFrame(() => {
      document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleEnterMain = useCallback(() => {
    setPhase("main");
    setShowAllBoutiques(true);
  }, []);

  const handleOpeningComplete = useCallback(() => {
    setPhase("scissors");
  }, []);

  const handleScissorsComplete = useCallback(() => {
    setPhase("cta");
  }, []);

  return (
    <>
      <AnimatePresence>
        {phase === "opening" && (
          <OpeningSequence key="opening" onComplete={handleOpeningComplete} />
        )}
        {phase === "scissors" && (
          <ScissorsLoading key="scissors" onComplete={handleScissorsComplete} />
        )}
      </AnimatePresence>

      {phase === "cta" && <CTAGate onExplore={handleEnterMain} />}

      {phase === "main" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroSection onExploreBoutiques={handleExploreBoutiques} />
          <FeaturedPreview audienceCategory={categoryFromUrl} />
          <CoreAim />
          <ProblemsWeSolve />
          <VisionStatement />
        </motion.div>
      )}
    </>
  );
}
