import type { OrderStatus, PaymentStatus } from "@faden/types";

const ORDER_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  quoted: "Quoted",
  confirmed: "Confirmed — awaiting payment",
  in_progress: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  authorized: "Authorized",
  captured: "Captured",
  failed: "Failed",
  refunded: "Refunded",
};

export function orderStatusLabel(status: OrderStatus | string): string {
  return ORDER_LABELS[status as OrderStatus] ?? String(status).replace(/_/g, " ");
}

export function paymentStatusLabel(status: PaymentStatus | string): string {
  return PAYMENT_LABELS[status as PaymentStatus] ?? String(status);
}

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "draft",
  "quoted",
  "confirmed",
  "in_progress",
  "shipped",
  "delivered",
  "cancelled",
];

export function formatMoney(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function orderPaidLabel(options: {
  isPaid: boolean;
  paidAmount: number | null;
  totalAmount: number | null;
  currency: string;
  paymentStatus?: string | null;
}): { label: string; detail: string } {
  const { isPaid, paidAmount, totalAmount, currency, paymentStatus } = options;

  if (paymentStatus === "refunded") {
    return { label: "Refunded", detail: paidAmount ? formatMoney(paidAmount, currency) : "—" };
  }

  if (isPaid && paidAmount != null) {
    const paid = formatMoney(paidAmount, currency);
    const total = totalAmount != null ? formatMoney(totalAmount, currency) : null;
    return {
      label: "Paid",
      detail: total && paidAmount < (totalAmount ?? 0) ? `${paid} of ${total}` : paid,
    };
  }

  if (paymentStatus === "authorized") {
    return { label: "Authorized", detail: "Payment authorized, not captured" };
  }

  if (paymentStatus === "failed") {
    return { label: "Not paid", detail: "Last payment attempt failed" };
  }

  if (paymentStatus === "pending") {
    return { label: "Not paid", detail: "Payment pending" };
  }

  return { label: "Not paid", detail: totalAmount != null ? `Due ${formatMoney(totalAmount, currency)}` : "No payment yet" };
}

export function paymentBadgeClass(isPaid: boolean, paymentStatus?: string | null): string {
  if (paymentStatus === "refunded") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-400";
  }
  if (isPaid) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }
  return "border-border bg-background-soft text-foreground-muted";
}
