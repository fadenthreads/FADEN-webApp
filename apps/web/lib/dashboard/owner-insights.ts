import type { CustomizationFormPayload } from "@/lib/customization/form-payload";
import { parseFormPayload } from "@/lib/customization/form-payload";
import type {
  ConversationSummary,
  CustomizationRequestSummary,
  MessageRow,
  OrderSummary,
} from "@/lib/customization/queries";
import { SELF_MEASUREMENT_FIELDS } from "@/data/measurement-fields";
import { formatInr } from "@/lib/payment/queries";
import type { PaymentSummary } from "@/lib/payment/queries";
import type { ReviewRecord } from "@/lib/review/queries";
import { computeReviewStats } from "@/lib/review/queries";

export interface OwnerCustomerOrder {
  id: string;
  status: string;
  outfitType: string | null;
  amount: number | null;
  currency: string;
  createdAt: string;
}

export interface OwnerCustomerRecord {
  customerId: string;
  name: string | null;
  email: string | null;
  orderCount: number;
  deliveredCount: number;
  totalSpend: number;
  isRepeat: boolean;
  lastActivityAt: string | null;
  outfitTypes: string[];
  measurementSummary: string | null;
  preferences: string[];
  orders: OwnerCustomerOrder[];
}

export interface OwnerAnalyticsSnapshot {
  inquiries: number;
  uniqueCustomers: number;
  profileViewsNote: string;
  conversionRate: number | null;
  ordersWon: number;
  ordersLost: number;
  ordersActive: number;
  monthlyRevenue: { month: string; amount: number }[];
  topCategories: { label: string; count: number }[];
  totalRevenue: number;
}

export interface OwnerPerformanceSnapshot {
  onTimeDeliveryScore: number | null;
  onTimeDeliveryLabel: string;
  satisfactionScore: number | null;
  satisfactionLabel: string;
  responseTimeHours: number | null;
  responseTimeLabel: string;
  repeatCustomerRate: number | null;
  repeatCustomerLabel: string;
  overallScore: number | null;
}

function formatMeasurements(payload: CustomizationFormPayload): string | null {
  if (payload.selfMeasurements) {
    const parts = SELF_MEASUREMENT_FIELDS.filter((field) =>
      payload.selfMeasurements?.[field.key]?.trim(),
    ).map((field) => `${field.label}: ${payload.selfMeasurements![field.key]}`);
    if (parts.length) return parts.join(" · ");
  }
  if (payload.measurements?.trim()) return payload.measurements.trim();
  return null;
}

function collectPreferences(payload: CustomizationFormPayload, occasion: string | null): string[] {
  const prefs = new Set<string>();
  if (occasion?.trim()) prefs.add(`Occasion: ${occasion.trim()}`);
  if (payload.fabricTypes?.trim()) prefs.add(`Fabrics: ${payload.fabricTypes.trim()}`);
  if (payload.fabricColors?.trim()) prefs.add(`Colors: ${payload.fabricColors.trim()}`);
  if (payload.budgetRange?.trim()) prefs.add(`Budget: ${payload.budgetRange.trim()}`);
  if (payload.specialRequests?.trim()) prefs.add(`Notes: ${payload.specialRequests.trim()}`);
  if (payload.measurementUnit) prefs.add(`Units: ${payload.measurementUnit}`);
  return [...prefs];
}

function latestIso(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean) as string[];
  if (!valid.length) return null;
  return valid.sort((a, b) => b.localeCompare(a))[0] ?? null;
}

export function buildOwnerCustomers(input: {
  orders: OrderSummary[];
  requests: CustomizationRequestSummary[];
}): OwnerCustomerRecord[] {
  const byCustomer = new Map<string, OwnerCustomerRecord>();

  function ensure(customerId: string, name?: string | null, email?: string | null) {
    let record = byCustomer.get(customerId);
    if (!record) {
      record = {
        customerId,
        name: name ?? null,
        email: email ?? null,
        orderCount: 0,
        deliveredCount: 0,
        totalSpend: 0,
        isRepeat: false,
        lastActivityAt: null,
        outfitTypes: [],
        measurementSummary: null,
        preferences: [],
        orders: [],
      };
      byCustomer.set(customerId, record);
    } else {
      if (name && !record.name) record.name = name;
      if (email && !record.email) record.email = email;
    }
    return record;
  }

  for (const order of input.orders) {
    const record = ensure(order.customer_id, order.customer_name, order.customer_email);
    record.orderCount += 1;
    if (order.status === "delivered") record.deliveredCount += 1;
    if (order.total_amount != null) record.totalSpend += order.total_amount;
    if (order.outfit_type && !record.outfitTypes.includes(order.outfit_type)) {
      record.outfitTypes.push(order.outfit_type);
    }
    record.orders.push({
      id: order.id,
      status: order.status,
      outfitType: order.outfit_type ?? null,
      amount: order.total_amount,
      currency: order.currency,
      createdAt: order.created_at,
    });
    record.lastActivityAt = latestIso([record.lastActivityAt, order.created_at]);
  }

  for (const request of input.requests) {
    const record = ensure(request.customer_id, request.customer_name, request.customer_email);
    const payload = request.form_payload ?? {};
    const measurement = formatMeasurements(payload);
    if (measurement && !record.measurementSummary) {
      record.measurementSummary = measurement;
    }
    for (const pref of collectPreferences(payload, request.occasion)) {
      if (!record.preferences.includes(pref)) record.preferences.push(pref);
    }
    if (request.outfit_type && !record.outfitTypes.includes(request.outfit_type)) {
      record.outfitTypes.push(request.outfit_type);
    }
    record.lastActivityAt = latestIso([record.lastActivityAt, request.created_at]);
  }

  for (const record of byCustomer.values()) {
    record.isRepeat = record.orderCount >= 2;
    record.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return [...byCustomer.values()].sort((a, b) =>
    (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""),
  );
}

function monthKey(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function buildOwnerAnalytics(input: {
  orders: OrderSummary[];
  requests: CustomizationRequestSummary[];
  payments: PaymentSummary[];
}): OwnerAnalyticsSnapshot {
  const inquiries = input.requests.length;
  const uniqueCustomers = new Set([
    ...input.orders.map((order) => order.customer_id),
    ...input.requests.map((request) => request.customer_id),
  ]).size;

  const nonCancelledOrders = input.orders.filter((order) => order.status !== "cancelled");
  const ordersLost = input.orders.filter((order) => order.status === "cancelled").length;
  const ordersWon = input.orders.filter((order) =>
    ["delivered", "shipped", "in_progress", "confirmed", "quoted"].includes(order.status),
  ).length;
  const ordersActive = input.orders.filter((order) =>
    ["confirmed", "in_progress", "shipped", "quoted"].includes(order.status),
  ).length;

  const conversionRate =
    inquiries > 0 ? Math.round((nonCancelledOrders.length / inquiries) * 100) : null;

  const captured = input.payments.filter((payment) => payment.status === "captured");
  const totalRevenue = captured.reduce((sum, payment) => sum + payment.amount, 0);

  const revenueByMonth = new Map<string, number>();
  for (const payment of captured) {
    const key = monthKey(payment.created_at);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + payment.amount);
  }
  const monthlyRevenue = [...revenueByMonth.entries()]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  const categoryCounts = new Map<string, number>();
  for (const order of input.orders) {
    const label = order.outfit_type?.trim() || "Custom order";
    categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1);
  }
  for (const request of input.requests) {
    if (request.outfit_type?.trim()) {
      const label = request.outfit_type.trim();
      categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1);
    }
  }
  const topCategories = [...categoryCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    inquiries,
    uniqueCustomers,
    profileViewsNote: "Profile view tracking is not enabled yet. Unique customers reflects everyone who inquired or ordered.",
    conversionRate,
    ordersWon,
    ordersLost,
    ordersActive,
    monthlyRevenue,
    topCategories,
    totalRevenue,
  };
}

function averageResponseHours(
  conversations: ConversationSummary[],
  messagesByConversation: Record<string, MessageRow[]>,
  requests: CustomizationRequestSummary[],
): number | null {
  const requestByCustomer = new Map<string, string>();
  for (const request of requests) {
    if (!requestByCustomer.has(request.customer_id)) {
      requestByCustomer.set(request.customer_id, request.created_at);
    }
  }

  const deltas: number[] = [];
  for (const conversation of conversations) {
    const messages = messagesByConversation[conversation.id] ?? [];
    const firstOwnerMessage = messages.find((message) => message.sender_type === "boutique");
    if (!firstOwnerMessage) continue;

    const requestStart =
      requestByCustomer.get(conversation.customer_id) ?? conversation.last_message_at;
    if (!requestStart) continue;

    const start = new Date(requestStart).getTime();
    const reply = new Date(firstOwnerMessage.created_at).getTime();
    if (Number.isFinite(start) && Number.isFinite(reply) && reply >= start) {
      deltas.push((reply - start) / (1000 * 60 * 60));
    }
  }

  if (!deltas.length) return null;
  return deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
}

export function buildOwnerPerformance(input: {
  orders: OrderSummary[];
  requests: CustomizationRequestSummary[];
  reviews: ReviewRecord[];
  conversations: ConversationSummary[];
  messagesByConversation: Record<string, MessageRow[]>;
  customers: OwnerCustomerRecord[];
}): OwnerPerformanceSnapshot {
  const delivered = input.orders.filter((order) => order.status === "delivered");
  const deliveredWithDate = delivered.filter((order) => {
    const request = input.requests.find((item) => item.customer_id === order.customer_id);
    return Boolean(request?.delivery_date);
  });

  let onTime = 0;
  for (const order of deliveredWithDate) {
    const request = input.requests.find(
      (item) =>
        item.customer_id === order.customer_id &&
        item.outfit_type === order.outfit_type &&
        item.delivery_date,
    );
    if (!request?.delivery_date) continue;
    const target = new Date(request.delivery_date).getTime();
    const actual = new Date(order.created_at).getTime();
    if (actual <= target + 7 * 24 * 60 * 60 * 1000) onTime += 1;
  }
  const onTimeDeliveryScore =
    deliveredWithDate.length > 0 ? Math.round((onTime / deliveredWithDate.length) * 100) : null;

  const reviewStats = computeReviewStats(input.reviews);
  const satisfactionScore =
    reviewStats.reviewCount > 0 ? Math.round((reviewStats.averageRating / 5) * 100) : null;

  const responseTimeHours = averageResponseHours(
    input.conversations,
    input.messagesByConversation,
    input.requests,
  );

  const repeatCount = input.customers.filter((customer) => customer.isRepeat).length;
  const repeatCustomerRate =
    input.customers.length > 0 ? Math.round((repeatCount / input.customers.length) * 100) : null;

  const scores = [onTimeDeliveryScore, satisfactionScore, repeatCustomerRate].filter(
    (value): value is number => value != null,
  );
  if (responseTimeHours != null) {
    const responseScore = Math.max(0, Math.min(100, 100 - responseTimeHours * 4));
    scores.push(Math.round(responseScore));
  }
  const overallScore =
    scores.length > 0 ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;

  return {
    onTimeDeliveryScore,
    onTimeDeliveryLabel:
      onTimeDeliveryScore != null
        ? `${onTimeDeliveryScore}% of tracked deliveries met target dates`
        : "Not enough delivered orders with delivery dates yet",
    satisfactionScore,
    satisfactionLabel:
      satisfactionScore != null
        ? `${reviewStats.averageRating.toFixed(1)} / 5 from ${reviewStats.reviewCount} review${reviewStats.reviewCount === 1 ? "" : "s"}`
        : "No customer reviews yet",
    responseTimeHours,
    responseTimeLabel:
      responseTimeHours != null
        ? `Average first reply in ${responseTimeHours < 24 ? `${Math.round(responseTimeHours)} hours` : `${(responseTimeHours / 24).toFixed(1)} days`}`
        : "Reply to customer messages to build a response-time score",
    repeatCustomerRate,
    repeatCustomerLabel:
      repeatCustomerRate != null
        ? `${repeatCount} of ${input.customers.length} customers ordered again`
        : "Repeat rate appears after your first returning customer",
    overallScore,
  };
}

export function formatOwnerCurrency(amount: number): string {
  return formatInr(amount);
}
