import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { ACCOUNT_NAV_ITEMS, type AccountNavCounts } from "@/lib/account/account-nav";

interface AccountOverviewHubProps {
  fullName: string;
  email: string;
  role: string;
  phone?: string | null;
  counts: AccountNavCounts;
  ownerBoutique: boolean;
  showBoutiqueDashboard: boolean;
  showRegisterBoutique: boolean;
}

export function AccountOverviewHub({
  fullName,
  email,
  role,
  phone,
  counts,
  ownerBoutique,
  showBoutiqueDashboard,
  showRegisterBoutique,
}: AccountOverviewHubProps) {
  const sectionItems = ACCOUNT_NAV_ITEMS.filter((item) => item.id !== "overview");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-gold">Overview</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Manage requests, orders, payments, and messages from dedicated pages.
        </p>
      </div>

      <PremiumCard className="space-y-5" hover={false}>
        <div>
          <p className="faden-label">Full name</p>
          <p className="mt-1 text-foreground">{fullName}</p>
        </div>
        <div>
          <p className="faden-label">Email</p>
          <p className="mt-1 text-foreground">{email}</p>
        </div>
        <div>
          <p className="faden-label">Role</p>
          <p className="mt-1 capitalize text-foreground">{role.replace("_", " ")}</p>
        </div>
        {phone && (
          <div>
            <p className="faden-label">Phone</p>
            <p className="mt-1 text-foreground">{phone}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="luxury">
            <Link href="/customize">New customization request</Link>
          </Button>
          {showBoutiqueDashboard && (
            <Button asChild variant="luxury-outline">
              <Link href="/dashboard">Boutique Dashboard</Link>
            </Button>
          )}
          {ownerBoutique && (
            <Button asChild variant="luxury-outline">
              <Link href="/register-boutique?mode=modify">Modify Boutique</Link>
            </Button>
          )}
          {showRegisterBoutique && (
            <Button asChild variant="luxury-outline">
              <Link href="/register-boutique">Register Boutique</Link>
            </Button>
          )}
        </div>
      </PremiumCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {sectionItems.map((item) => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : 0;

          return (
            <Link key={item.id} href={item.href} className="group block">
              <PremiumCard
                className="h-full transition-colors group-hover:border-gold/40"
                hover={false}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
                    <Icon className="h-5 w-5 text-gold" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{item.label}</p>
                      {count > 0 && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                          {count}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{item.description}</p>
                    <p className="mt-3 text-xs font-medium text-gold group-hover:text-gold-light">
                      Open →
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
