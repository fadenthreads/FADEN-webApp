import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { upiConfirmPaymentSchema } from "@faden/validators";
import { completeSuccessfulPayment } from "@/lib/payment/complete-payment";
import { getPaymentWriteClient } from "@/lib/payment/db";
import { isUpiPaymentEnabled } from "@/lib/payment/upi";
import { errorResponse } from "@/lib/api/response";
import { checkRateLimit, getRequestIp } from "@/lib/api/rate-limit";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(`payment-upi:${getRequestIp(request)}`, { limit: 8, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait before retrying." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  if (!isWebSupabaseConfigured()) {
    return errorResponse("Supabase is not configured.", 503);
  }

  if (!isUpiPaymentEnabled()) {
    return errorResponse("UPI payments are not configured.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const parsed = upiConfirmPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse("You must be signed in.", 401);

  const { paymentId, utr } = parsed.data;

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id, status, metadata, orders ( customer_id, status, customization_request_id )")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !payment) return errorResponse("Payment not found.", 404);

  const order = payment.orders as
    | {
        customer_id: string;
        status: string;
        customization_request_id: string | null;
      }
    | Array<{
        customer_id: string;
        status: string;
        customization_request_id: string | null;
      }>
    | null;

  const orderRow = Array.isArray(order) ? order[0] : order;
  if (!orderRow || orderRow.customer_id !== user.id) {
    return errorResponse("Access denied.", 403);
  }

  if (payment.status === "captured") {
    return errorResponse("Payment already completed.", 400);
  }

  const metadata = payment.metadata as { phase?: "deposit" | "balance"; utr?: string } | null;
  const phase = metadata?.phase ?? "deposit";
  const allowedStatuses = phase === "deposit" ? ["confirmed"] : ["shipped"];

  if (!allowedStatuses.includes(orderRow.status)) {
    return errorResponse(
      phase === "deposit"
        ? "Order is not awaiting advance payment."
        : "Balance payment is only available when your order is ready for delivery.",
      400,
    );
  }

  const normalizedUtr = utr.replace(/\s+/g, "").toUpperCase();

  const { data: duplicate } = await supabase
    .from("payments")
    .select("id")
    .eq("provider_payment_id", `upi_${normalizedUtr}`)
    .neq("id", paymentId)
    .maybeSingle();

  if (duplicate) {
    return errorResponse("This UPI reference was already used. Contact support if this is a mistake.", 400);
  }

  try {
    const db = getPaymentWriteClient(supabase);
    await completeSuccessfulPayment(db, {
      paymentId: payment.id,
      orderId: payment.order_id,
      providerPaymentId: `upi_${normalizedUtr}`,
      userId: user.id,
      customizationRequestId: orderRow.customization_request_id,
      phase,
    });

    await db
      .from("payments")
      .update({
        metadata: {
          ...metadata,
          phase,
          method: "upi",
          utr: normalizedUtr,
          submitted_at: new Date().toISOString(),
        },
      })
      .eq("id", payment.id);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to complete payment", 500);
  }

  revalidatePath("/account");
  revalidatePath("/account/payments");
  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
