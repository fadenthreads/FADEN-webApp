"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Sparkles, Store } from "lucide-react";
import { cn } from "@faden/utils";
import { useSavedItems } from "@/components/saved-items/saved-items-context";

interface NavItemDef {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  activePaths?: string[];
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "home", icon: Home, label: "Home", href: "/", activePaths: ["/"] },
  { id: "boutiques", icon: Store, label: "Boutiques", href: "/#featured-boutiques", activePaths: ["/boutique"] },
  { id: "customize", icon: Sparkles, label: "Customize", href: "/customize", activePaths: ["/customize"] },
  { id: "cart", icon: ShoppingBag, label: "Bag", href: "/cart", activePaths: ["/cart"] },
];

function isActive(pathname: string, item: NavItemDef): boolean {
  if (item.id === "home") return pathname === "/";
  return (item.activePaths ?? [item.href]).some((p) => pathname.startsWith(p));
}

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-accent px-1 text-[9px] font-semibold text-white">
      {count}
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useSavedItems();

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 -translate-x-1/2">
      <nav aria-label="Quick navigation" className="flex items-center rounded-full border border-border bg-background/95 shadow-xl backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 px-5 py-3 transition-all",
                "first:rounded-l-full last:rounded-r-full",
                active ? "text-gold" : "text-foreground-muted hover:text-navy",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.id === "cart" && <CartBadge count={cart.length} />}
              </div>
              <span className={cn("text-[10px] font-medium leading-none", active ? "text-gold" : "text-foreground-muted")}>
                {item.label}
              </span>
              {active && <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
