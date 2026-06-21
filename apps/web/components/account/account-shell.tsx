"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@faden/utils";
import {
  ACCOUNT_NAV_ITEMS,
  isAccountNavActive,
  type AccountNavCounts,
} from "@/lib/account/account-nav";

interface AccountShellProps {
  children: React.ReactNode;
  counts?: AccountNavCounts;
  displayName: string;
  email: string;
}

export function AccountShell({ children, counts, displayName, email }: AccountShellProps) {
  const pathname = usePathname();

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">YOUR ACCOUNT</p>
          <h1 className="mt-2 font-display text-2xl font-bold">{displayName}</h1>
          <p className="mt-1 truncate text-sm text-foreground-muted">{email}</p>

          <nav className="mt-6" aria-label="Account sections">
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const active = isAccountNavActive(pathname, item.href);
                const Icon = item.icon;
                const count =
                  item.countKey && counts ? counts[item.countKey] : undefined;

                return (
                  <li key={item.id} className="shrink-0 lg:shrink">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-w-[140px] items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors lg:min-w-0 lg:w-full",
                        active
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border bg-background-elevated text-foreground-muted hover:border-gold/30 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {count != null && count > 0 && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            active ? "bg-gold/20 text-gold" : "bg-foreground/10 text-foreground-muted",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
