import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, PaymentStatus } from "@faden/types";
import type { OrderEventSummary } from "@/lib/customization/queries";

export interface CustomerOrderHistoryItem {
  id: string;
  status: OrderStatus;
  total_amount: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
  outfit_type: string | null;
  occasion: string | null;
  delivery_date: string | null;
  boutique_name: string | null;
  boutique_slug: string | null;
  customization_request_id: string | null;
  payment_status: PaymentStatus | null;
  has_review: boolean;
  events: OrderEventSummary[];
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null;
  }
  return (value as T | null) ?? null;
}

const ORDER_HISTORY_SELECT = `
  id,
  status,
  total_amount,
  currency,
  created_at,
  updated_at,
  customization_request_id,
  boutiques ( name, slug ),
  customization_requests ( outfit_type, occasion, delivery_date )
`;

export async function listCustomerOrderHistory(
  supabase: SupabaseClient,
  customerId: string,
): Promise<CustomerOrderHistoryItem[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(ORDER_HISTORY_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const orderIds = orders.map((order) => order.id as string);

  const [{ data: events, error: eventsError }, { data: payments }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("order_events")
        .select("id, order_id, status, note, created_at")
        .in("order_id", orderIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("payments")
        .select("order_id, status, created_at")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false }),
      supabase.from("reviews").select("order_id").in("order_id", orderIds),
    ]);

  if (eventsError) throw new Error(eventsError.message);

  const eventsByOrder = new Map<string, OrderEventSummary[]>();
  for (const event of events ?? []) {
    const orderId = event.order_id as string;
    const list = eventsByOrder.get(orderId) ?? [];
    list.push({
      id: event.id as string,
      status: event.status as OrderStatus,
      note: event.note as string | null,
      created_at: event.created_at as string,
    });
    eventsByOrder.set(orderId, list);
  }

  const paymentByOrder = new Map<string, PaymentStatus>();
  for (const payment of payments ?? []) {
    const orderId = payment.order_id as string;
    if (!paymentByOrder.has(orderId)) {
      paymentByOrder.set(orderId, payment.status as PaymentStatus);
    }
  }

  const reviewedOrders = new Set((reviews ?? []).map((review) => review.order_id as string));

  return orders.map((row) => {
    const boutique = readNestedRecord<{ name: string; slug: string }>(row.boutiques);
    const request = readNestedRecord<{
      outfit_type: string | null;
      occasion: string | null;
      delivery_date: string | null;
    }>(row.customization_requests);
    const id = row.id as string;

    return {
      id,
      status: row.status as OrderStatus,
      total_amount: row.total_amount as number | null,
      currency: row.currency as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      outfit_type: request?.outfit_type ?? null,
      occasion: request?.occasion ?? null,
      delivery_date: request?.delivery_date ?? null,
      boutique_name: boutique?.name ?? null,
      boutique_slug: boutique?.slug ?? null,
      customization_request_id: row.customization_request_id as string | null,
      payment_status: paymentByOrder.get(id) ?? null,
      has_review: reviewedOrders.has(id),
      events: eventsByOrder.get(id) ?? [],
    };
  });
}

export type OrderHistoryFilter = "all" | "active" | "completed" | "cancelled";

export function filterOrderHistory(
  orders: CustomerOrderHistoryItem[],
  filter: OrderHistoryFilter,
): CustomerOrderHistoryItem[] {
  switch (filter) {
    case "active":
      return orders.filter((order) =>
        ["draft", "quoted", "confirmed", "in_progress", "shipped"].includes(order.status),
      );
    case "completed":
      return orders.filter((order) => order.status === "delivered");
    case "cancelled":
      return orders.filter((order) => order.status === "cancelled");
    default:
      return orders;
  }
}

export function orderHistoryCounts(orders: CustomerOrderHistoryItem[]) {
  return {
    all: orders.length,
    active: filterOrderHistory(orders, "active").length,
    completed: filterOrderHistory(orders, "completed").length,
    cancelled: filterOrderHistory(orders, "cancelled").length,
  };
}

export function formatOrderRef(orderId: string): string {
  return `#${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function isOrderPayable(order: CustomerOrderHistoryItem): boolean {
  return order.status === "confirmed" && order.payment_status !== "captured";
}

export function isOrderReviewable(order: CustomerOrderHistoryItem): boolean {
  return order.status === "delivered" && !order.has_review;
}
