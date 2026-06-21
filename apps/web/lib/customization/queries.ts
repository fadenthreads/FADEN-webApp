import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomizationStatus, OrderStatus } from "@faden/types";
import {
  parseFormPayload,
  type CustomizationFormPayload,
} from "@/lib/customization/form-payload";
import { getHomeVisitByRequestId } from "@/lib/home-visits/queries";

export interface CustomizationRequestSummary {
  id: string;
  status: CustomizationStatus;
  outfit_type: string | null;
  outfit_audience?: string | null;
  occasion: string | null;
  delivery_date: string | null;
  created_at: string;
  boutique_id: string | null;
  customer_id: string;
  measurement_mode?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  boutique_name?: string | null;
  boutique_slug?: string | null;
  matched_boutiques?: MatchedBoutiqueSummary[];
  form_payload?: CustomizationFormPayload;
}

export interface MatchedBoutiqueSummary {
  slug: string;
  name: string;
  score: number;
  reasons: string[];
}

export interface CustomizationInspirationRow {
  id: string;
  url: string | null;
  notes: string | null;
}

export interface CustomizationRequestDetail {
  id: string;
  status: CustomizationStatus;
  outfit_type: string | null;
  outfit_audience: string | null;
  outfit_description: string | null;
  occasion: string | null;
  fabric_source: string | null;
  measurement_mode: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
  boutique_id: string | null;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  boutique_name: string | null;
  boutique_slug: string | null;
  form_payload: CustomizationFormPayload;
  inspirations: CustomizationInspirationRow[];
  linked_order_id: string | null;
  linked_order_status: OrderStatus | null;
  conversation_id: string | null;
  video_appointment: {
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    daily_room_url: string | null;
    cal_booking_uid: string | null;
  } | null;
  home_visit: import("@/lib/home-visits/queries").HomeMeasurementVisit | null;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  total_amount: number | null;
  currency: string;
  created_at: string;
  customer_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  outfit_type?: string | null;
}

export interface OrderEventSummary {
  id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface CustomerTrackedOrder {
  id: string;
  status: OrderStatus;
  total_amount: number | null;
  currency: string;
  created_at: string;
  outfit_type: string | null;
  boutique_name: string | null;
  events: OrderEventSummary[];
}

export interface ConversationSummary {
  id: string;
  customer_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  boutique_name?: string | null;
  boutique_slug?: string | null;
  order_id: string | null;
  last_message_at: string | null;
  last_message?: string | null;
}

export interface MessageRow {
  id: string;
  body: string;
  sender_type: string;
  created_at: string;
  sender_id: string | null;
}

function readProfile(value: unknown): { full_name: string | null; email: string } | null {
  if (Array.isArray(value)) {
    return (value[0] as { full_name: string | null; email: string } | undefined) ?? null;
  }
  return (value as { full_name: string | null; email: string } | null) ?? null;
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null;
  }
  return (value as T | null) ?? null;
}

const REQUEST_SELECT = `
  id,
  status,
  outfit_type,
  outfit_audience,
  occasion,
  delivery_date,
  created_at,
  boutique_id,
  customer_id,
  measurement_mode,
  form_payload,
  profiles ( full_name, email ),
  boutiques ( name, slug )
`;

const ORDER_SELECT = `
  id,
  status,
  total_amount,
  currency,
  created_at,
  customer_id,
  profiles ( full_name, email ),
  customization_requests ( outfit_type )
`;

export async function listCustomerCustomizationRequests(
  supabase: SupabaseClient,
  customerId: string,
): Promise<CustomizationRequestSummary[]> {
  const { data, error } = await supabase
    .from("customization_requests")
    .select(REQUEST_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapRequestRows(data ?? []);
}

export async function listBoutiqueCustomizationRequests(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<CustomizationRequestSummary[]> {
  const { data, error } = await supabase
    .from("customization_requests")
    .select(REQUEST_SELECT)
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapRequestRows(data ?? []);
}

const REQUEST_DETAIL_SELECT = `
  id,
  status,
  outfit_type,
  outfit_audience,
  outfit_description,
  occasion,
  fabric_source,
  measurement_mode,
  delivery_date,
  created_at,
  updated_at,
  boutique_id,
  customer_id,
  form_payload,
  profiles ( full_name, email, phone ),
  boutiques ( name, slug ),
  customization_inspirations ( id, url, notes, sort_order )
`;

async function buildCustomizationRequestDetail(
  supabase: SupabaseClient,
  data: Record<string, unknown>,
  requestId: string,
): Promise<CustomizationRequestDetail> {
  const customer = readProfile(data.profiles);
  const boutique = readNestedRecord<{ name: string; slug: string }>(data.boutiques);
  const inspirationRows = Array.isArray(data.customization_inspirations)
    ? data.customization_inspirations
    : data.customization_inspirations
      ? [data.customization_inspirations]
      : [];

  const inspirations: CustomizationInspirationRow[] = inspirationRows
    .map((row) => ({
      id: row.id as string,
      url: row.url as string | null,
      notes: row.notes as string | null,
      sort_order: (row.sort_order as number | undefined) ?? 0,
    }))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ id, url, notes }) => ({ id, url, notes }));

  const { data: linkedOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("customization_request_id", requestId)
    .maybeSingle();

  let conversationId: string | null = null;
  if (linkedOrder?.id) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("order_id", linkedOrder.id)
      .maybeSingle();
    conversationId = (conversation?.id as string | undefined) ?? null;
  }

  const { data: videoAppointment } = await supabase
    .from("fitting_appointments")
    .select("id, scheduled_start, scheduled_end, status, daily_room_url, cal_booking_uid")
    .eq("customization_request_id", requestId)
    .not("status", "eq", "cancelled")
    .order("scheduled_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const homeVisit = await getHomeVisitByRequestId(supabase, requestId);

  const profileWithPhone = customer as { full_name: string | null; email: string; phone?: string | null } | null;

  return {
    id: data.id as string,
    status: data.status as CustomizationStatus,
    outfit_type: data.outfit_type as string | null,
    outfit_audience:
      (data.outfit_audience as string | null) ??
      parseFormPayload(data.form_payload).outfitAudience ??
      null,
    outfit_description: data.outfit_description as string | null,
    occasion: data.occasion as string | null,
    fabric_source: data.fabric_source as string | null,
    measurement_mode: data.measurement_mode as string | null,
    delivery_date: data.delivery_date as string | null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    boutique_id: data.boutique_id as string | null,
    customer_id: data.customer_id as string,
    customer_name: profileWithPhone?.full_name ?? null,
    customer_email: profileWithPhone?.email ?? null,
    customer_phone: profileWithPhone?.phone ?? null,
    boutique_name: boutique?.name ?? null,
    boutique_slug: boutique?.slug ?? null,
    form_payload: parseFormPayload(data.form_payload),
    inspirations,
    linked_order_id: (linkedOrder?.id as string | undefined) ?? null,
    linked_order_status: (linkedOrder?.status as OrderStatus | undefined) ?? null,
    conversation_id: conversationId,
    video_appointment: videoAppointment
      ? {
          id: videoAppointment.id as string,
          scheduled_start: videoAppointment.scheduled_start as string,
          scheduled_end: videoAppointment.scheduled_end as string,
          status: videoAppointment.status as string,
          daily_room_url: videoAppointment.daily_room_url as string | null,
          cal_booking_uid: videoAppointment.cal_booking_uid as string | null,
        }
      : null,
    home_visit: homeVisit,
  };
}

export async function getCustomerCustomizationRequestDetail(
  supabase: SupabaseClient,
  customerId: string,
  requestId: string,
): Promise<CustomizationRequestDetail | null> {
  const { data, error } = await supabase
    .from("customization_requests")
    .select(REQUEST_DETAIL_SELECT)
    .eq("id", requestId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return buildCustomizationRequestDetail(supabase, data as Record<string, unknown>, requestId);
}

export async function getBoutiqueCustomizationRequestDetail(
  supabase: SupabaseClient,
  boutiqueId: string,
  requestId: string,
): Promise<CustomizationRequestDetail | null> {
  const { data, error } = await supabase
    .from("customization_requests")
    .select(REQUEST_DETAIL_SELECT)
    .eq("id", requestId)
    .eq("boutique_id", boutiqueId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return buildCustomizationRequestDetail(supabase, data as Record<string, unknown>, requestId);
}

const CUSTOMER_ORDER_SELECT = `
  id,
  status,
  total_amount,
  currency,
  created_at,
  boutiques ( name ),
  customization_requests ( outfit_type )
`;

export async function listCustomerTrackedOrders(
  supabase: SupabaseClient,
  customerId: string,
): Promise<CustomerTrackedOrder[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("customer_id", customerId)
    .in("status", ["in_progress", "shipped", "delivered"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const orderIds = orders.map((order) => order.id as string);
  const { data: events, error: eventsError } = await supabase
    .from("order_events")
    .select("id, order_id, status, note, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

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

  return orders.map((row) => {
    const boutique = readNestedRecord<{ name: string }>(row.boutiques);
    const request = readNestedRecord<{ outfit_type: string | null }>(row.customization_requests);
    const id = row.id as string;
    return {
      id,
      status: row.status as OrderStatus,
      total_amount: row.total_amount as number | null,
      currency: row.currency as string,
      created_at: row.created_at as string,
      outfit_type: request?.outfit_type ?? null,
      boutique_name: boutique?.name ?? null,
      events: eventsByOrder.get(id) ?? [],
    };
  });
}

export async function listBoutiqueOrders(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<OrderSummary[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const customer = readProfile(row.profiles);
    const request = readNestedRecord<{ outfit_type: string | null }>(row.customization_requests);
    return {
      id: row.id,
      status: row.status as OrderStatus,
      total_amount: row.total_amount,
      currency: row.currency,
      created_at: row.created_at,
      customer_id: row.customer_id,
      customer_name: customer?.full_name,
      customer_email: customer?.email,
      outfit_type: request?.outfit_type ?? null,
    };
  });
}

export async function listBoutiqueConversations(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      customer_id,
      order_id,
      last_message_at,
      profiles ( full_name, email )
    `,
    )
    .eq("boutique_id", boutiqueId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  const conversations = (data ?? []) as Array<{
    id: string;
    customer_id: string;
    order_id: string | null;
    last_message_at: string | null;
    profiles: unknown;
  }>;

  return enrichConversations(supabase, conversations, (conv) => ({
    id: conv.id,
    customer_id: conv.customer_id,
    customer_name: readProfile(conv.profiles)?.full_name,
    customer_email: readProfile(conv.profiles)?.email,
    order_id: conv.order_id,
    last_message_at: conv.last_message_at,
  }));
}

export async function listCustomerConversations(
  supabase: SupabaseClient,
  customerId: string,
): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      customer_id,
      order_id,
      last_message_at,
      boutiques ( name, slug )
    `,
    )
    .eq("customer_id", customerId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  const conversations = (data ?? []) as Array<{
    id: string;
    customer_id: string;
    order_id: string | null;
    last_message_at: string | null;
    boutiques: unknown;
  }>;

  return enrichConversations(supabase, conversations, (conv) => {
    const boutique = readNestedRecord<{ name: string; slug: string }>(conv.boutiques);
    return {
      id: conv.id,
      customer_id: conv.customer_id,
      boutique_name: boutique?.name,
      boutique_slug: boutique?.slug,
      order_id: conv.order_id,
      last_message_at: conv.last_message_at,
    };
  });
}

async function enrichConversations<T extends { id: string }>(
  supabase: SupabaseClient,
  conversations: T[],
  mapBase: (conv: T) => Omit<ConversationSummary, "last_message">,
): Promise<ConversationSummary[]> {
  const enriched: ConversationSummary[] = [];

  for (const conv of conversations) {
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("body")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    enriched.push({
      ...mapBase(conv),
      last_message: lastMsg?.body ?? null,
    });
  }

  return enriched;
}

export async function listConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, sender_type, created_at, sender_id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

function mapRequestRows(
  rows: Array<Record<string, unknown>>,
): CustomizationRequestSummary[] {
  return rows.map((row) => {
    const customer = readProfile(row.profiles);
    const boutique = readNestedRecord<{ name: string; slug: string }>(row.boutiques);
    const payload = parseFormPayload(row.form_payload);
    const matched = (row.form_payload as { matchedBoutiques?: MatchedBoutiqueSummary[] } | null)
      ?.matchedBoutiques?.map((match) => ({
      slug: match.slug,
      name: match.name,
      score: match.score,
      reasons: match.reasons ?? [],
    }));

    return {
      id: row.id as string,
      status: row.status as CustomizationStatus,
      outfit_type: row.outfit_type as string | null,
      outfit_audience:
        (row.outfit_audience as string | null | undefined) ?? payload.outfitAudience ?? null,
      occasion: row.occasion as string | null,
      delivery_date: row.delivery_date as string | null,
      created_at: row.created_at as string,
      boutique_id: row.boutique_id as string | null,
      customer_id: row.customer_id as string,
      measurement_mode: row.measurement_mode as string | null,
      customer_name: customer?.full_name,
      customer_email: customer?.email,
      boutique_name: boutique?.name,
      boutique_slug: boutique?.slug,
      matched_boutiques: matched?.length ? matched : undefined,
      form_payload: payload,
    };
  });
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  boutiqueId: string,
) {
  const [requests, orders, conversations] = await Promise.all([
    listBoutiqueCustomizationRequests(supabase, boutiqueId),
    listBoutiqueOrders(supabase, boutiqueId),
    listBoutiqueConversations(supabase, boutiqueId),
  ]);

  const pendingOrders = orders.filter((o) =>
    ["draft", "quoted", "confirmed", "in_progress"].includes(o.status),
  ).length;

  return {
    pendingRequests: requests.filter((r) => r.status === "submitted").length,
    pendingOrders,
    messageCount: conversations.length,
    totalRequests: requests.length,
  };
}
