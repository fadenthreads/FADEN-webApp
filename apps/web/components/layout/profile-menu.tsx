"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, LogOut, Package, User } from "lucide-react";
import { cn } from "@faden/utils";
import { getUserInitial, useUser } from "@/hooks/use-user";

interface ProfileMenuProps {
  className?: string;
}

const guestLinks = (
  <>
    <Link
      href="/signup"
      className="shrink-0 rounded-full border border-gold/50 px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
    >
      Sign Up
    </Link>
    <Link
      href="/login"
      className="flex h-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-red-accent px-3 text-sm font-semibold text-white shadow-gold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      Sign In
    </Link>
  </>
);

export function ProfileMenu({ className }: ProfileMenuProps) {
  const { user, profile } = useUser();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/auth/signout", { method: "POST", credentials: "include" });
    window.location.assign("/");
  }

  if (!user) {
    return <div className={cn("flex shrink-0 items-center gap-2", className)}>{guestLinks}</div>;
  }

  const initial = getUserInitial(user, profile);
  const displayName = profile?.full_name || user.user_metadata?.full_name || "Account";
  const email = user.email ?? profile?.email ?? "";

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-red-accent text-sm font-semibold text-white shadow-gold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={`Account menu for ${displayName}`}
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-background-elevated p-4 shadow-xl">
            <p className="font-display text-sm font-semibold text-gold">{displayName}</p>
            <p className="mt-1 truncate text-xs text-foreground-muted">{email}</p>
            {profile?.role && (
              <p className="mt-2 inline-block rounded-full bg-cherry/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold-light">
                {profile.role.replace("_", " ")}
              </p>
            )}
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold"
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/account/requests"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold"
              >
                <ClipboardList className="h-4 w-4" />
                My Requests
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
              {(profile?.role === "boutique_owner" || profile?.role === "admin") && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground-muted transition-colors hover:bg-cherry/20 hover:text-gold"
                >
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
          </div>
        </>
      )}
    </div>
  );
}
