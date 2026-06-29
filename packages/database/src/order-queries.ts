import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, PaymentStatus } from "@faden/types";

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) return (value[0] as T | undefined) ?? null;
  return (value as T | null) ?? null;
}

export interface AdminOrderListItem {
  id: string;
  status: OrderStatus;
  totalAmount: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug: string;
  boutiqueOwnerName: string | null;
  outfitType: string | null;
  occasion: string | null;
  paymentStatus: PaymentStatus | null;
  paidAmount: number | null;
  isPaid: boolean;
}

export interface AdminOrderEvent {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface AdminOrderQuotation {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string | null;
  notes: string | null;
  createdAt: string;
}

export interface AdminOrderPayment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerPaymentId: string | null;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  status: OrderStatus;
  totalAmount: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  customizationRequestId: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    locationLabel: string | null;
  };
  boutique: {
    id: string;
    name: string;
    slug: string;
    ownerName: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: string;
  };
  request: {
    id: string;
    status: string;
    outfitType: string | null;
    outfitAudience: string | null;
    occasion: string | null;
    deliveryDate: string | null;
    measurementMode: string | null;
    fabricSource: string | null;
  } | null;
  conversationId: string | null;
  events: AdminOrderEvent[];
  quotation: AdminOrderQuotation | null;
  payment: AdminOrderPayment | null;
  hasReview: boolean;
  paidAmount: number | null;
  isPaid: boolean;
}

export interface AdminOrderStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  pendingPayment: number;
}

const ORDER_LIST_SELECT = `
  id,
  status,
  total_amount,
  currency,
  created_at,
  updated_at,
  customer_id,
  boutique_id,
  profiles!orders_customer_id_fkey ( full_name, email, phone ),
  boutiques ( name, slug, owner_name ),
  customization_requests ( outfit_type, occasion )
`;

export async function listAllOrdersForAdmin(
  supabase: SupabaseClient,
): Promise<AdminOrderListItem[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(ORDER_LIST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const orderIds = orders.map((row) => row.id as string);

  const { data: payments } = await supabase
    .from("payments")
    .select("order_id, status, amount, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  const paymentStatusByOrder = new Map<string, PaymentStatus>();
  const paidAmountByOrder = new Map<string, number>();

  for (const payment of payments ?? []) {
    const orderId = payment.order_id as string;
    const status = payment.status as PaymentStatus;
    const amount = payment.amount as number;

    if (!paymentStatusByOrder.has(orderId)) {
      paymentStatusByOrder.set(orderId, status);
    }

    if (status === "captured") {
      paidAmountByOrder.set(orderId, (paidAmountByOrder.get(orderId) ?? 0) + amount);
    }
  }

  return orders.map((row) => {
    const customer = readNestedRecord<{ full_name: string | null; email: string; phone: string | null }>(
      row.profiles,
    );
    const boutique = readNestedRecord<{ name: string; slug: string; owner_name: string | null }>(row.boutiques);
    const request = readNestedRecord<{ outfit_type: string | null; occasion: string | null }>(
      row.customization_requests,
    );
    const id = row.id as string;
    const paidAmount = paidAmountByOrder.get(id) ?? null;

    return {
      id,
      status: row.status as OrderStatus,
      totalAmount: row.total_amount as number | null,
      currency: row.currency as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      customerId: row.customer_id as string,
      customerName: customer?.full_name ?? null,
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phone ?? null,
      boutiqueId: row.boutique_id as string,
      boutiqueName: boutique?.name ?? "Unknown boutique",
      boutiqueSlug: boutique?.slug ?? "",
      boutiqueOwnerName: boutique?.owner_name ?? null,
      outfitType: request?.outfit_type ?? null,
      occasion: request?.occasion ?? null,
      paymentStatus: paymentStatusByOrder.get(id) ?? null,
      paidAmount,
      isPaid: paidAmount != null && paidAmount > 0,
    };
  });
}

export async function getAdminOrderStats(supabase: SupabaseClient): Promise<AdminOrderStats> {
  const countByStatus = (status: string) =>
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", status);

  const activeStatuses: OrderStatus[] = ["draft", "quoted", "confirmed", "in_progress", "shipped"];

  const [totalRes, deliveredRes, cancelledRes, confirmedRes, ...otherActiveRes] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    countByStatus("delivered"),
    countByStatus("cancelled"),
    countByStatus("confirmed"),
    ...activeStatuses.filter((status) => status !== "confirmed").map(countByStatus),
  ]);

  if (totalRes.error) throw new Error(totalRes.error.message);
  if (deliveredRes.error) throw new Error(deliveredRes.error.message);
  if (cancelledRes.error) throw new Error(cancelledRes.error.message);
  if (confirmedRes.error) throw new Error(confirmedRes.error.message);

  const pendingPayment = confirmedRes.count ?? 0;
  const active =
    pendingPayment +
    otherActiveRes.reduce((sum, res) => {
      if (res.error) throw new Error(res.error.message);
      return sum + (res.count ?? 0);
    }, 0);

  return {
    total: totalRes.count ?? 0,
    active,
    completed: deliveredRes.count ?? 0,
    cancelled: cancelledRes.count ?? 0,
    pendingPayment,
  };
}

export async function getAdminOrderDetail(
  supabase: SupabaseClient,
  orderId: string,
): Promise<AdminOrderDetail | null> {
  const { data: row, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total_amount,
      currency,
      created_at,
      updated_at,
      customization_request_id,
      customer_id,
      boutique_id,
      profiles!orders_customer_id_fkey ( id, full_name, email, phone, location_label ),
      boutiques ( id, name, slug, owner_name, phone, email, address, status ),
      customization_requests (
        id,
        status,
        outfit_type,
        outfit_audience,
        occasion,
        delivery_date,
        measurement_mode,
        fabric_source
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const id = row.id as string;

  const [{ data: events }, { data: payments }, { data: quotation }, { data: conversation }, { data: review }] =
    await Promise.all([
      supabase
        .from("order_events")
        .select("id, status, note, created_at, created_by, profiles ( full_name )")
        .eq("order_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("payments")
        .select("id, amount, currency, status, provider, provider_payment_id, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("quotations")
        .select("id, subtotal, tax, total, valid_until, notes, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("conversations").select("id").eq("order_id", id).maybeSingle(),
      supabase.from("reviews").select("id").eq("order_id", id).maybeSingle(),
    ]);

  const customer = readNestedRecord<{
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    location_label: string | null;
  }>(row.profiles);

  const boutique = readNestedRecord<{
    id: string;
    name: string;
    slug: string;
    owner_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: string;
  }>(row.boutiques);

  const requestRow = readNestedRecord<{
    id: string;
    status: string;
    outfit_type: string | null;
    outfit_audience: string | null;
    occasion: string | null;
    delivery_date: string | null;
    measurement_mode: string | null;
    fabric_source: string | null;
  }>(row.customization_requests);

  const paymentRows = payments ?? [];
  const capturedTotal = paymentRows
    .filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + (p.amount as number), 0);
  const paymentRow = paymentRows[0] ?? null;
  const paidAmount = capturedTotal > 0 ? capturedTotal : null;
  const isPaid = paidAmount != null && paidAmount > 0;

  return {
    id,
    status: row.status as OrderStatus,
    totalAmount: row.total_amount as number | null,
    currency: row.currency as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    customizationRequestId: row.customization_request_id as string | null,
    customer: {
      id: customer?.id ?? (row.customer_id as string),
      name: customer?.full_name ?? null,
      email: customer?.email ?? "",
      phone: customer?.phone ?? null,
      locationLabel: customer?.location_label ?? null,
    },
    boutique: {
      id: boutique?.id ?? (row.boutique_id as string),
      name: boutique?.name ?? "Unknown boutique",
      slug: boutique?.slug ?? "",
      ownerName: boutique?.owner_name ?? null,
      phone: boutique?.phone ?? null,
      email: boutique?.email ?? null,
      address: boutique?.address ?? null,
      status: boutique?.status ?? "unknown",
    },
    request: requestRow
      ? {
          id: requestRow.id,
          status: requestRow.status,
          outfitType: requestRow.outfit_type,
          outfitAudience: requestRow.outfit_audience,
          occasion: requestRow.occasion,
          deliveryDate: requestRow.delivery_date,
          measurementMode: requestRow.measurement_mode,
          fabricSource: requestRow.fabric_source,
        }
      : null,
    conversationId: (conversation?.id as string | undefined) ?? null,
    events: (events ?? []).map((event) => {
      const author = readNestedRecord<{ full_name: string | null }>(event.profiles);
      return {
        id: event.id as string,
        status: event.status as OrderStatus,
        note: event.note as string | null,
        createdAt: event.created_at as string,
        createdByName: author?.full_name ?? null,
      };
    }),
    quotation: quotation?.[0]
      ? {
          id: quotation[0].id as string,
          subtotal: quotation[0].subtotal as number,
          tax: quotation[0].tax as number,
          total: quotation[0].total as number,
          validUntil: quotation[0].valid_until as string | null,
          notes: quotation[0].notes as string | null,
          createdAt: quotation[0].created_at as string,
        }
      : null,
    payment: paymentRow
      ? {
          id: paymentRow.id as string,
          amount: paymentRow.amount as number,
          currency: paymentRow.currency as string,
          status: paymentRow.status as PaymentStatus,
          provider: paymentRow.provider as string,
          providerPaymentId: paymentRow.provider_payment_id as string | null,
          createdAt: paymentRow.created_at as string,
        }
      : null,
    hasReview: Boolean(review),
    paidAmount,
    isPaid,
  };
}

export function formatAdminOrderRef(orderId: string): string {
  return `#${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
