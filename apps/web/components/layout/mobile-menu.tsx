"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { CategoryNav } from "./category-nav";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useUser } from "@/hooks/use-user";

function DrawerAuth() {
  const { user, profile } = useUser();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/auth/signout", { method: "POST", credentials: "include" });
    window.location.assign("/");
  }

  if (user) {
    const displayName = profile?.full_name || user.user_metadata?.full_name || "Account";
    return (
      <div className="space-y-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {displayName}
        </p>
        <Link href="/account" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold">
          <User className="h-4 w-4" />
          My Account
        </Link>
        {(profile?.role === "boutique_owner" || profile?.role === "admin") && (
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold">
            Dashboard
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-red-accent/10 hover:text-red-accent disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link href="/login" className="flex h-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-red-accent text-sm font-semibold text-white shadow-gold">
        Sign In
      </Link>
      <Link href="/signup" className="flex h-10 items-center justify-center rounded-full border border-gold/50 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10">
        Sign Up
      </Link>
    </div>
  );
}

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
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-[60] flex h-full w-[80vw] max-w-[360px] flex-col overflow-y-auto border-r border-border bg-background-soft shadow-lg md:hidden"
              role="dialog"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between p-6 pb-4">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-foreground-muted hover:text-gold" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 border-t border-border px-6 py-4">
                <Suspense fallback={null}>
                  <LocationSelector className="flex w-fit" />
                </Suspense>
                <LanguageSwitcher variant="buttons" />
              </div>
              <div className="flex-1 border-t border-border px-6 py-4">
                <CategoryNav mobile onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-border px-6 pb-24 pt-5">
                <DrawerAuth />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
