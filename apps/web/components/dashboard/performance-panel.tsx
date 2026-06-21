import { PremiumCard } from "@/components/ui/premium-card";
import type { OwnerPerformanceSnapshot } from "@/lib/dashboard/owner-insights";

interface PerformancePanelProps {
  performance: OwnerPerformanceSnapshot;
}

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  return (
    <div className="rounded-lg border border-gold/15 bg-background/30 p-4">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-gold">
        {score != null ? `${score}` : "—"}
      </p>
      {score != null && <p className="text-xs text-foreground-muted/70">out of 100</p>}
    </div>
  );
}

export function PerformancePanel({ performance }: PerformancePanelProps) {
  const metrics = [
    {
      title: "On-time delivery",
      score: performance.onTimeDeliveryScore,
      detail: performance.onTimeDeliveryLabel,
    },
    {
      title: "Customer satisfaction",
      score: performance.satisfactionScore,
      detail: performance.satisfactionLabel,
    },
    {
      title: "Response time",
      score:
        performance.responseTimeHours != null
          ? Math.max(0, Math.min(100, Math.round(100 - performance.responseTimeHours * 4)))
          : null,
      detail: performance.responseTimeLabel,
    },
    {
      title: "Repeat customers",
      score: performance.repeatCustomerRate,
      detail: performance.repeatCustomerLabel,
    },
  ];

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Performance Score</h3>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-xs text-foreground-muted">Overall score</p>
            <p className="mt-1 font-display text-4xl font-bold text-gold">
              {performance.overallScore != null ? performance.overallScore : "—"}
            </p>
          </div>
          {performance.overallScore != null && (
            <p className="text-sm text-foreground-muted">Composite of delivery, reviews, response, and retention</p>
          )}
        </div>
        {performance.overallScore == null && (
          <p className="mt-4 text-sm text-foreground-muted">
            Complete a few orders, respond to messages, and collect reviews to build your performance score.
          </p>
        )}
      </PremiumCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <PremiumCard key={metric.title} hover={false}>
            <ScoreRing score={metric.score} label={metric.title} />
            <p className="mt-3 text-sm text-foreground-muted">{metric.detail}</p>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
