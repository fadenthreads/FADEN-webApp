import { PremiumCard } from "@/components/ui/premium-card";
import type { OwnerAnalyticsSnapshot } from "@/lib/dashboard/owner-insights";
import { formatOwnerCurrency } from "@/lib/dashboard/owner-insights";

interface AnalyticsPanelProps {
  analytics: OwnerAnalyticsSnapshot;
}

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const hasActivity =
    analytics.inquiries > 0 ||
    analytics.ordersWon > 0 ||
    analytics.totalRevenue > 0;

  if (!hasActivity) {
    return (
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Analytics</h3>
        <p className="mt-4 text-sm text-foreground-muted">
          Profile views, inquiries, conversion rates, and revenue will appear here as customers
          discover your boutique and place orders.
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Analytics</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-foreground-muted">Inquiries</p>
            <p className="mt-1 font-display text-2xl font-semibold">{analytics.inquiries}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Unique customers</p>
            <p className="mt-1 font-display text-2xl font-semibold">{analytics.uniqueCustomers}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Conversion rate</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">
              {analytics.conversionRate != null ? `${analytics.conversionRate}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Total revenue</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">
              {formatOwnerCurrency(analytics.totalRevenue)}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-foreground-muted/70">{analytics.profileViewsNote}</p>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h4 className="font-semibold text-gold">Orders won / lost</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-foreground-muted">Won / active</p>
            <p className="mt-1 font-display text-xl font-semibold">{analytics.ordersWon}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">In pipeline</p>
            <p className="mt-1 font-display text-xl font-semibold">{analytics.ordersActive}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Lost (cancelled)</p>
            <p className="mt-1 font-display text-xl font-semibold">{analytics.ordersLost}</p>
          </div>
        </div>
      </PremiumCard>

      {analytics.monthlyRevenue.length > 0 && (
        <PremiumCard hover={false}>
          <h4 className="font-semibold text-gold">Monthly revenue</h4>
          <ul className="mt-4 space-y-2">
            {analytics.monthlyRevenue.map((entry) => (
              <li
                key={entry.month}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground-muted">{entry.month}</span>
                <span className="font-medium text-gold">{formatOwnerCurrency(entry.amount)}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}

      {analytics.topCategories.length > 0 && (
        <PremiumCard hover={false}>
          <h4 className="font-semibold text-gold">Top categories</h4>
          <ul className="mt-4 space-y-2">
            {analytics.topCategories.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground-muted">{entry.label}</span>
                <span className="font-medium">{entry.count}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}
    </div>
  );
}
