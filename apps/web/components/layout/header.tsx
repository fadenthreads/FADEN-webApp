"use client";

import { Suspense } from "react";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { SearchBar } from "./search-bar";
import { NavActions } from "./nav-actions";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

function SearchBarFallback() {
  return <div className="hidden h-11 max-w-xl flex-1 rounded-full border border-border bg-background-elevated md:block" />;
}

function MobileSearchFallback() {
  return <div className="h-10 rounded-full border border-border bg-background-elevated" />;
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-container items-center gap-2 px-4 lg:gap-4 lg:px-12">
        <div className="relative z-50 shrink-0 md:hidden">
          <MobileMenu />
        </div>
        <Logo />
        <LocationSelector className="hidden md:flex" />
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar className="hidden md:flex" />
        </Suspense>
        <NavActions className="ml-auto flex shrink-0" />
        <LanguageSwitcher className="hidden shrink-0 md:inline-flex" />
      </div>
      <div className="border-t border-border/40 px-4 pb-3 pt-2 md:hidden">
        <Suspense fallback={<MobileSearchFallback />}>
          <SearchBar className="w-full" />
        </Suspense>
      </div>
    </header>
  );
}
