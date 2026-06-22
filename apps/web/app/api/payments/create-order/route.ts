import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createPaymentOrderSchema } from "@faden/validators";
import { getPaymentWriteClient } from "@/lib/payment/db";
import {
  amountToPaise,
  createRazorpayOrder,
  getRazorpayPublicKey,
  isRazorpayConfigured,
} from "@/lib/payment/razorpay";
import {
  resolveOutstandingPayment,
  type PaymentPhase,
} from "@/lib/payment/split-payment";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function applyCookies(response: NextResponse, cookies: SupabaseCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

const RLS_HINT =
  "Run packages/database/src/schema/006_phase5_payments_rls.sql in Supabase, or add SUPABASE_SERVICE_ROLE_KEY to apps/web/.env.local";

export async function POST(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = createPaymentOrderSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const pendingCookies: SupabaseCookie[] = [];
  const { url, anonKey } = getWebSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse("You must be signed in.", 401);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, customer_id, status, total_amount, currency")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (orderError || !order) return errorResponse("Order not found.", 404);
  if (order.customer_id !== user.id) return errorResponse("Access denied.", 403);

  const total = Number(order.total_amount);
  if (!total || total <= 0) {
    return errorResponse("Order has no payable amount.", 400);
  }

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
    total,
    advancePercent: Number(quotation?.advance_percent ?? 40),
    orderStatus: order.status as string,
    capturedPayments: (capturedPayments ?? []).map((payment) => ({
      amount: Number(payment.amount),
      metadata: payment.metadata as { phase?: string } | null,
    })),
  });

  if (!outstanding) {
    return errorResponse("This order has no outstanding payment.", 400);
  }

  const phase: PaymentPhase = parsed.data.phase ?? outstanding.phase;
  if (phase !== outstanding.phase) {
    return errorResponse(
      phase === "deposit"
        ? "Advance payment is not due for this order."
        : "Balance payment is not due yet. Pay the advance first or wait until the order is ready for delivery.",
      400,
    );
  }

  const amount = outstanding.dueAmount;
  if (!amount || amount <= 0) {
    return errorResponse("Nothing to pay for this phase.", 400);
  }

  const db = getPaymentWriteClient(supabase);

  const { data: pendingPayments } = await db
    .from("payments")
    .select("id, metadata")
    .eq("order_id", order.id)
    .eq("status", "pending");

  const existingPending = (pendingPayments ?? []).find((payment) => {
    const meta = payment.metadata as { phase?: PaymentPhase } | null;
    return meta?.phase === phase;
  });

  let paymentId: string;
  let existingRazorpayOrderId: string | null = null;

  if (existingPending) {
    paymentId = existingPending.id;
    const metadata = existingPending.metadata as { razorpay_order_id?: string } | null;
    existingRazorpayOrderId = metadata?.razorpay_order_id ?? null;
  } else {
    const { data: payment, error: paymentError } = await db
      .from("payments")
      .insert({
        order_id: order.id,
        amount,
        currency: order.currency,
        status: "pending",
        metadata: { phase },
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      const isRls = paymentError?.message?.includes("row-level security");
      return errorResponse(
        isRls && !isAdminClientConfigured()
          ? `${paymentError.message}. ${RLS_HINT}`
          : paymentError?.message ?? "Failed to create payment",
        400,
      );
    }
    paymentId = payment.id;
  }

  const mock = !isRazorpayConfigured();
  let razorpayOrderId: string | null = existingRazorpayOrderId;

  if (!mock && !razorpayOrderId) {
    try {
      const razorpayOrder = await createRazorpayOrder({
        amountPaise: amountToPaise(amount),
        receipt: `faden_${order.id.slice(0, 8)}_${phase}`,
        notes: {
          faden_order_id: order.id,
          faden_payment_id: paymentId,
          faden_phase: phase,
        },
      });

      razorpayOrderId = razorpayOrder.id;

      const { error: updateError } = await db
        .from("payments")
        .update({ metadata: { phase, razorpay_order_id: razorpayOrder.id } })
        .eq("id", paymentId);

      if (updateError) {
        return errorResponse(updateError.message, 400);
      }
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : "Payment setup failed", 500);
    }
  }

  const response = NextResponse.json({
    ok: true,
    paymentId,
    amount,
    phase,
    totalAmount: total,
    advancePercent: outstanding.advancePercent,
    currency: order.currency,
    mock,
    keyId: getRazorpayPublicKey(),
    razorpayOrderId,
  });
  applyCookies(response, pendingCookies);
  return response;
}
