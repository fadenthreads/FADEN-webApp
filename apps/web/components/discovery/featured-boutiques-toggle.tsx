"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@faden/utils";
import { homeHref } from "@/lib/landing/home-nav";

interface FeaturedBoutiquesToggleProps {
  className?: string;
  onClick?: () => void;
}

export function FeaturedBoutiquesToggle({ className, onClick }: FeaturedBoutiquesToggleProps) {
  const baseClass = cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-burgundy/20 px-3 py-2 text-xs font-medium tracking-wide text-gold transition-all hover:border-gold hover:bg-burgundy/40 hover:text-gold-light",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Featured
      </button>
    );
  }

  return (
    <Link href={homeHref({ hash: "featured-boutiques" })} className={baseClass}>
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      Featured
    </Link>
  );
}
