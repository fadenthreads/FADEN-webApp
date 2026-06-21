import type { OrderStatus } from "@faden/types";

const LABELS: Partial<Record<OrderStatus, string>> = {
  draft: "Request submitted",
  quoted: "Quotation received",
  confirmed: "Awaiting payment",
  in_progress: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const CUSTOMER_HINTS: Partial<Record<OrderStatus, string>> = {
  draft: "Your boutique has received your request and will send a quotation soon.",
  quoted: "Review the quotation below and accept to proceed to payment.",
  confirmed: "Accept the quotation, then complete payment to start production.",
  in_progress: "Your boutique is working on your order.",
  shipped: "Your order is on its way.",
  delivered: "Your order has been delivered.",
};

export function orderStatusLabel(status: OrderStatus | string): string {
  return LABELS[status as OrderStatus] ?? status.replace(/_/g, " ");
}

export function orderStatusHint(status: OrderStatus | string): string | null {
  return CUSTOMER_HINTS[status as OrderStatus] ?? null;
}

export const FULFILLMENT_STEPS: OrderStatus[] = [
  "confirmed",
  "in_progress",
  "shipped",
  "delivered",
];

export function fulfillmentStepIndex(status: OrderStatus): number {
  const index = FULFILLMENT_STEPS.indexOf(status);
  return index >= 0 ? index : -1;
}
