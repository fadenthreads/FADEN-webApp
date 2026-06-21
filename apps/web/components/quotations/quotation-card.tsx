import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import {
  formatInr,
  isQuotationExpired,
  type QuotationSummary,
} from "@/lib/quotation/queries";
import { formatDateOnly } from "@/lib/datetime/format";

interface QuotationCardProps {
  quotation: QuotationSummary;
  mode: "owner" | "customer";
  footer?: React.ReactNode;
}

export function QuotationCard({ quotation, mode, footer }: QuotationCardProps) {
  const expired = isQuotationExpired(quotation.valid_until);
  const title =
    mode === "customer"
      ? quotation.boutique_name ?? "Boutique"
      : quotation.customer_name || quotation.customer_email || "Customer";

  return (
    <PremiumCard hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{quotation.outfit_type ?? "Custom order"}</p>
          <p className="mt-1 text-sm text-foreground-muted">{title}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gold">{formatInr(quotation.total)}</p>
          <p className="mt-1 text-xs capitalize text-foreground-muted">
            {quotation.order_status.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {quotation.line_items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-foreground-muted">
            <span>
              {item.label} × {item.quantity}
            </span>
            <span>{formatInr(item.quantity * item.unit_price)}</span>
          </li>
        ))}
        {quotation.tax > 0 && (
          <li className="flex justify-between gap-4 text-foreground-muted">
            <span>Tax</span>
            <span>{formatInr(quotation.tax)}</span>
          </li>
        )}
      </ul>

      {quotation.notes && (
        <p className="mt-3 text-sm text-foreground-muted">
          <span className="text-gold/80">Note:</span> {quotation.notes}
        </p>
      )}

      <PostedAt value={quotation.created_at} prefix="Sent" className="mt-3 text-xs text-foreground-muted" />
      {quotation.valid_until && (
        <p className="mt-1 text-xs text-foreground-muted">
          Valid until {formatDateOnly(quotation.valid_until)}
          {expired && quotation.order_status === "quoted" && (
            <span className="text-red-accent"> (expired)</span>
          )}
        </p>
      )}

      {footer && <div className="mt-4 border-t border-border pt-4">{footer}</div>}
    </PremiumCard>
  );
}
