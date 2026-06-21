import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@faden/types";

export interface QuotationLineItem {
  id: string;
  label: string;
  quantity: number;
  unit_price: number;
}

export interface QuotationSummary {
  id: string;
  order_id: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  order_status: OrderStatus;
  outfit_type: string | null;
  customer_name: string | null;
  customer_email: string | null;
  boutique_name: string | null;
  line_items: QuotationLineItem[];
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

const QUOTATION_SELECT = `
  id,
  order_id,
  subtotal,
  tax,
  total,
  notes,
  valid_until,
  created_at,
  quotation_line_items ( id, label, quantity, unit_price ),
  orders ( status, customization_requests ( outfit_type ) ),
  boutiques ( name ),
  profiles ( full_name, email )
`;

function mapQuotationRow(row: Record<string, unknown>): QuotationSummary {
  const order = readNestedRecord<{ status: OrderStatus; customization_requests: unknown }>(
    row.orders,
  );
  const request = readNestedRecord<{ outfit_type: string | null }>(order?.customization_requests);
  const boutique = readNestedRecord<{ name: string }>(row.boutiques);
  const customer = readProfile(row.profiles);
  const lineItemsRaw = row.quotation_line_items;
  const lineItems = (Array.isArray(lineItemsRaw) ? lineItemsRaw : lineItemsRaw ? [lineItemsRaw] : []) as Array<{
    id: string;
    label: string;
    quantity: number;
    unit_price: number;
  }>;

  return {
    id: row.id as string,
    order_id: row.order_id as string,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    notes: row.notes as string | null,
    valid_until: row.valid_until as string | null,
    created_at: row.created_at as string,
    order_status: order?.status ?? "draft",
    outfit_type: request?.outfit_type ?? null,
    customer_name: customer?.full_name ?? null,
    customer_email: customer?.email ?? null,
    boutique_name: boutique?.name ?? null,
    line_items: lineItems.map((item) => ({
      id: item.id,
      label: item.label,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
    })),
  };
}

export async function listBoutiqueQuotations(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<QuotationSummary[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select(QUOTATION_SELECT)
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapQuotationRow(row as Record<string, unknown>));
}

export async function listCustomerQuotations(
  supabase: SupabaseClient,
  customerId: string,
): Promise<QuotationSummary[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select(QUOTATION_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapQuotationRow(row as Record<string, unknown>));
}

/** Latest quotation per order — useful for customer pending quotes. */
export function latestQuotationsByOrder(quotations: QuotationSummary[]): QuotationSummary[] {
  const byOrder = new Map<string, QuotationSummary>();
  for (const quote of quotations) {
    if (!byOrder.has(quote.order_id)) {
      byOrder.set(quote.order_id, quote);
    }
  }
  return [...byOrder.values()];
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isQuotationExpired(validUntil: string | null) {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() < Date.now();
}
