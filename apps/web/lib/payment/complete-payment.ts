import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentPhase } from "@/lib/payment/split-payment";

export async function completeSuccessfulPayment(
  supabase: SupabaseClient,
  params: {
    paymentId: string;
    orderId: string;
    providerPaymentId: string;
    userId: string;
    customizationRequestId: string | null;
    phase: PaymentPhase;
  },
) {
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "captured",
      provider_payment_id: params.providerPaymentId,
      metadata: {
        captured_at: new Date().toISOString(),
        phase: params.phase,
      },
    })
    .eq("id", params.paymentId);

  if (paymentError) throw new Error(paymentError.message);

  const isDeposit = params.phase === "deposit";
  const nextOrderStatus = isDeposit ? "in_progress" : "delivered";
  const eventNote = isDeposit
    ? "Advance payment received — production started"
    : "Final payment received — order delivered";
  const messageBody = isDeposit
    ? "Advance payment received. Your order is now in production."
    : "Final payment received. Your order has been delivered.";

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: nextOrderStatus })
    .eq("id", params.orderId);

  if (orderError) throw new Error(orderError.message);

  if (params.customizationRequestId) {
    await supabase
      .from("customization_requests")
      .update({ status: isDeposit ? "in_production" : "completed" })
      .eq("id", params.customizationRequestId);
  }

  await supabase.from("order_events").insert({
    order_id: params.orderId,
    status: nextOrderStatus,
    note: eventNote,
    created_by: params.userId,
  });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("order_id", params.orderId)
    .maybeSingle();

  if (conversation) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: params.userId,
      sender_type: "system",
      body: messageBody,
    });

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);
  }
}
