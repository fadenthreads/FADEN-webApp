"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { CategoryNav } from "./category-nav";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useUser } from "@/hooks/use-user";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { homeHref } from "@/lib/landing/home-nav";

const PRIMARY_LINKS = [
  { href: homeHref(), label: "Home" },
  { href: `${homeHref()}#featured-boutiques`, label: "Boutiques" },
  { href: `${homeHref()}#how-it-works`, label: "How It Works" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

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
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy">{displayName}</p>
        <Link
          href="/account"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-navy/80 transition-colors hover:bg-gold/10 hover:text-navy"
        >
          <User className="h-4 w-4 text-gold" />
          My Account
        </Link>
        {(profile?.role === "boutique_owner" || profile?.role === "admin") && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-navy/80 transition-colors hover:bg-gold/10 hover:text-navy"
          >
            Dashboard
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-navy/80 transition-colors hover:bg-navy/5 hover:text-navy disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Link
        href="/login"
        className="flex h-11 items-center justify-center rounded-full border border-gold/50 bg-transparent text-sm font-semibold text-navy transition-colors hover:border-gold hover:bg-gold/10"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="flex h-11 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
      >
        Sign Up
      </Link>
    </div>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  return (
    <>
      <button
        type="button"
        className="relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/20 bg-gold/15 text-navy shadow-sm transition-colors hover:border-navy/35 hover:bg-gold/25"
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
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-navy/60"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 z-[60] flex h-[100dvh] w-[min(88vw,360px)] flex-col bg-background shadow-2xl md:w-[380px]"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-navy/10 bg-background-elevated px-5 py-4">
                <Logo compact />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-gold/15"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="space-y-5 px-5 py-5">
                  <nav aria-label="Primary" className="space-y-1 border-b border-navy/10 pb-5">
                    {PRIMARY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy/85 transition-colors hover:bg-gold/10 hover:text-navy"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <Suspense fallback={<div className="h-28 animate-pulse rounded-xl bg-background-soft" />}>
                    <LocationSelector variant="drawer" />
                  </Suspense>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy">Language</p>
                    <LanguageSwitcher variant="buttons" className="gap-2" />
                  </div>

                  <div className="border-t border-navy/10 pt-5">
                    <CategoryNav mobile onNavigate={() => setOpen(false)} />
                  </div>

                  <NotificationBell />
                </div>
              </div>

              <div className="shrink-0 border-t border-navy/10 bg-background-soft/80 px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 md:pb-4">
                <DrawerAuth />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
