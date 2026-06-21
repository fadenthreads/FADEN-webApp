import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentSchema } from "@faden/validators";
import { completeSuccessfulPayment } from "@/lib/payment/complete-payment";
import { getPaymentWriteClient } from "@/lib/payment/db";
import { isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/payment/razorpay";
import { getWebSupabaseEnv, isWebSupabaseConfigured } from "@/lib/supabase/env";
import type { SupabaseCookie } from "@/lib/supabase/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

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

  const parsed = verifyPaymentSchema.safeParse(body);
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

  const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, mock } = parsed.data;

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(
      "id, order_id, status, metadata, orders ( customer_id, status, customization_request_id )",
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !payment) return errorResponse("Payment not found.", 404);

  const order = payment.orders as {
    customer_id: string;
    status: string;
    customization_request_id: string | null;
  } | Array<{
    customer_id: string;
    status: string;
    customization_request_id: string | null;
  }> | null;

  const orderRow = Array.isArray(order) ? order[0] : order;
  if (!orderRow || orderRow.customer_id !== user.id) {
    return errorResponse("Access denied.", 403);
  }

  if (payment.status === "captured") {
    return errorResponse("Payment already completed.", 400);
  }

  if (orderRow.status !== "confirmed") {
    return errorResponse("Order is not awaiting payment.", 400);
  }

  let providerPaymentId: string;

  if (mock || !isRazorpayConfigured()) {
    if (isRazorpayConfigured()) {
      return errorResponse("Invalid mock payment in production mode.", 400);
    }
    if (!mock) {
      return errorResponse("Use mock payment in development or configure Razorpay.", 400);
    }
    providerPaymentId = `mock_${paymentId.slice(0, 8)}`;
  } else {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return errorResponse("Missing Razorpay verification fields.", 400);
    }

    const metadata = payment.metadata as { razorpay_order_id?: string } | null;
    const expectedOrderId = metadata?.razorpay_order_id ?? razorpayOrderId;

    const valid = verifyRazorpaySignature({
      orderId: expectedOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) return errorResponse("Payment verification failed.", 400);
    providerPaymentId = razorpayPaymentId;
  }

  try {
    const db = getPaymentWriteClient(supabase);
    await completeSuccessfulPayment(db, {
      paymentId: payment.id,
      orderId: payment.order_id,
      providerPaymentId,
      userId: user.id,
      customizationRequestId: orderRow.customization_request_id,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to complete payment", 500);
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");

  const response = NextResponse.json({ ok: true });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
