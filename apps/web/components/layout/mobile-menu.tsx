"use client";

import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { SearchBar } from "./search-bar";
import { CategoryNav } from "./category-nav";
import { NavActions } from "./nav-actions";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="rounded-full p-2 text-gold transition-colors hover:text-gold-light md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 flex h-full w-[80vw] max-w-[360px] flex-col border-r border-border bg-background-soft p-6 shadow-lg md:hidden"
              role="dialog"
              aria-label="Mobile navigation"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-foreground-muted hover:text-gold"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Suspense fallback={<div className="mb-4 h-11 w-full rounded-full border border-border bg-background-elevated" />}>
                <SearchBar className="mb-4 w-full md:hidden" />
              </Suspense>
              <LocationSelector className="flex w-fit" />
              <div className="mt-4">
                <LanguageSwitcher variant="buttons" />
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <CategoryNav mobile onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-auto border-t border-border pt-6">
                <NavActions />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
