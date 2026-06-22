import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentStatus } from "@faden/types";
import type { OrderSummary } from "@/lib/customization/queries";
import { formatInr } from "@/lib/quotation/queries";
import {
  resolveOutstandingPayment,
  type PaymentPhase,
} from "@/lib/payment/split-payment";

export interface PaymentSummary {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider_payment_id: string | null;
  created_at: string;
  updated_at: string;
  outfit_type: string | null;
  boutique_name: string | null;
  customer_name: string | null;
  order_status: string | null;
  payment_phase: PaymentPhase | null;
}

export interface PayableOrder {
  id: string;
  total_amount: number;
  due_amount: number;
  currency: string;
  outfit_type: string | null;
  boutique_name: string | null;
  created_at: string;
  payment_phase: PaymentPhase;
  advance_percent: number;
  order_status: string;
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null;
  }
  return (value as T | null) ?? null;
}

function readProfile(value: unknown): { full_name: string | null; email: string } | null {
  if (Array.isArray(value)) {
    return (value[0] as { full_name: string | null; email: string } | undefined) ?? null;
  }
  return (value as { full_name: string | null; email: string } | null) ?? null;
}

const PAYMENT_SELECT = `
  id,
  order_id,
  amount,
  currency,
  status,
  provider_payment_id,
  metadata,
  created_at,
  updated_at,
  orders (
    status,
    customization_requests ( outfit_type ),
    boutiques ( name ),
    profiles ( full_name, email )
  )
`;

function mapPaymentRow(row: Record<string, unknown>): PaymentSummary {
  const order = readNestedRecord<{
    status: string;
    customization_requests: unknown;
    boutiques: unknown;
    profiles: unknown;
  }>(row.orders);
  const request = readNestedRecord<{ outfit_type: string | null }>(order?.customization_requests);
  const boutique = readNestedRecord<{ name: string }>(order?.boutiques);
  const customer = readProfile(order?.profiles);
  const metadata = row.metadata as { phase?: PaymentPhase } | null;

  return {
    id: row.id as string,
    order_id: row.order_id as string,
    amount: Number(row.amount),
    currency: row.currency as string,
    status: row.status as PaymentStatus,
    provider_payment_id: row.provider_payment_id as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    outfit_type: request?.outfit_type ?? null,
    boutique_name: boutique?.name ?? null,
    customer_name: customer?.full_name ?? customer?.email ?? null,
    order_status: order?.status ?? null,
    payment_phase: metadata?.phase ?? null,
  };
}

export async function listCustomerPayments(
  supabase: SupabaseClient,
  customerId: string,
): Promise<PaymentSummary[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customerId);

  if (ordersError) throw new Error(ordersError.message);

  const orderIds = (orders ?? []).map((order) => order.id as string);
  if (!orderIds.length) return [];

  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapPaymentRow(row as Record<string, unknown>));
}

export async function listBoutiquePayments(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<PaymentSummary[]> {
  const { data: orders } = await supabase.from("orders").select("id").eq("boutique_id", boutiqueId);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (!orderIds.length) return [];

  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapPaymentRow(row as Record<string, unknown>));
}

export async function listCustomerPayableOrders(
  supabase: SupabaseClient,
  customerId: string,
): Promise<PayableOrder[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_amount,
      currency,
      status,
      created_at,
      boutiques ( name ),
      customization_requests ( outfit_type )
    `,
    )
    .eq("customer_id", customerId)
    .in("status", ["confirmed", "shipped"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const payable: PayableOrder[] = [];

  for (const order of orders ?? []) {
    const { data: quotation } = await supabase
      .from("quotations")
      .select("advance_percent")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: capturedPayments } = await supabase
      .from("payments")
      .select("amount, metadata")
      .eq("order_id", order.id)
      .eq("status", "captured");

    const outstanding = resolveOutstandingPayment({
      total: Number(order.total_amount ?? 0),
      advancePercent: Number(quotation?.advance_percent ?? 40),
      orderStatus: order.status as string,
      capturedPayments: (capturedPayments ?? []).map((payment) => ({
        amount: Number(payment.amount),
        metadata: payment.metadata as { phase?: string } | null,
      })),
    });

    if (!outstanding) continue;

    const boutique = readNestedRecord<{ name: string }>(order.boutiques);
    const request = readNestedRecord<{ outfit_type: string | null }>(order.customization_requests);

    payable.push({
      id: order.id,
      total_amount: Number(order.total_amount ?? 0),
      due_amount: outstanding.dueAmount,
      currency: order.currency as string,
      outfit_type: request?.outfit_type ?? null,
      boutique_name: boutique?.name ?? null,
      created_at: order.created_at as string,
      payment_phase: outstanding.phase,
      advance_percent: outstanding.advancePercent,
      order_status: order.status as string,
    });
  }

  return payable;
}

export { formatInr };

export function paymentStatusLabel(status: PaymentStatus) {
  return status.replace(/_/g, " ");
}

export function summarizePaymentsForOwner(payments: PaymentSummary[]) {
  const captured = payments.filter((p) => p.status === "captured");
  const pending = payments.filter((p) => p.status === "pending");
  const totalCaptured = captured.reduce((sum, p) => sum + p.amount, 0);
  return { captured, pending, totalCaptured };
}

export type { OrderSummary };
