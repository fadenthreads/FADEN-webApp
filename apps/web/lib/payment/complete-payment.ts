import type { SupabaseClient } from "@supabase/supabase-js";

export async function completeSuccessfulPayment(
  supabase: SupabaseClient,
  params: {
    paymentId: string;
    orderId: string;
    providerPaymentId: string;
    userId: string;
    customizationRequestId: string | null;
  },
) {
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "captured",
      provider_payment_id: params.providerPaymentId,
      metadata: { captured_at: new Date().toISOString() },
    })
    .eq("id", params.paymentId);

  if (paymentError) throw new Error(paymentError.message);

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", params.orderId);

  if (orderError) throw new Error(orderError.message);

  if (params.customizationRequestId) {
    await supabase
      .from("customization_requests")
      .update({ status: "in_production" })
      .eq("id", params.customizationRequestId);
  }

  await supabase.from("order_events").insert({
    order_id: params.orderId,
    status: "in_progress",
    note: "Payment received — production started",
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
      body: "Payment received. Your order is now in production.",
    });

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);
  }
}
