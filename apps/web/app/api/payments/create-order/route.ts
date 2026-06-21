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
  if (order.status !== "confirmed") {
    return errorResponse("This order is not ready for payment. Accept the quotation first.", 400);
  }

  const amount = Number(order.total_amount);
  if (!amount || amount <= 0) {
    return errorResponse("Order has no payable amount.", 400);
  }

  const db = getPaymentWriteClient(supabase);

  const { data: existingCaptured } = await db
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .eq("status", "captured")
    .maybeSingle();

  if (existingCaptured) {
    return errorResponse("This order has already been paid.", 400);
  }

  let paymentId: string;
  let existingRazorpayOrderId: string | null = null;

  const { data: existingPending } = await db
    .from("payments")
    .select("id, metadata")
    .eq("order_id", order.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
        receipt: `faden_${order.id.slice(0, 8)}`,
        notes: {
          faden_order_id: order.id,
          faden_payment_id: paymentId,
        },
      });

      razorpayOrderId = razorpayOrder.id;

      const { error: updateError } = await db
        .from("payments")
        .update({ metadata: { razorpay_order_id: razorpayOrder.id } })
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
    currency: order.currency,
    mock,
    keyId: getRazorpayPublicKey(),
    razorpayOrderId,
  });
  applyCookies(response, pendingCookies);
  return response;
}
