"use client";

import { Suspense } from "react";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { SearchBar } from "./search-bar";
import { NavActions } from "./nav-actions";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { FeaturedBoutiquesToggle } from "@/components/discovery/featured-boutiques-toggle";

function SearchBarFallback() {
  return <div className="hidden h-11 max-w-xl flex-1 rounded-full border border-border bg-background-elevated md:block" />;
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-container items-center gap-2 px-4 lg:gap-4 lg:px-12">
        <MobileMenu />
        <Logo />
        <LocationSelector />
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar className="hidden md:flex" />
        </Suspense>
        <FeaturedBoutiquesToggle className="md:hidden" />
        <LanguageSwitcher className="hidden shrink-0 md:inline-flex" />
        <NavActions className="ml-auto hidden shrink-0 md:flex" />
      </div>
    </header>
  );
}
