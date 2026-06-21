"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@faden/utils";
import { LayoutDashboard, Store, Users, FilePenLine, Building2, UserCircle, ShoppingBag } from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/all-boutiques", label: "All Boutiques", icon: Building2 },
  { href: "/customers", label: "Customers", icon: UserCircle },
  { href: "/boutiques", label: "Boutique Verification", icon: Store },
  { href: "/modifications", label: "Profile Modifications", icon: FilePenLine },
  { href: "/users", label: "User Management", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background-soft lg:block">
        <div className="border-b border-border px-6 py-5">
          <Link href="/" className="font-display text-xl font-bold tracking-[0.12em] faden-logo-gradient">
            FADEN
          </Link>
          <p className="mt-1 text-xs tracking-[0.2em] text-foreground-muted">ADMIN CONSOLE</p>
        </div>
        <nav className="space-y-1 p-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-burgundy-light text-gold-light"
                    : "text-foreground-muted hover:bg-accent-50 hover:text-gold",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-background/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <span className="font-display text-lg font-bold faden-logo-gradient">FADEN Admin</span>
            </div>
            <nav className="flex gap-2 lg:hidden">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs",
                    pathname === href || (href !== "/" && pathname.startsWith(href))
                      ? "bg-burgundy-light text-gold-light"
                      : "text-foreground-muted",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-foreground-muted transition-colors hover:text-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
