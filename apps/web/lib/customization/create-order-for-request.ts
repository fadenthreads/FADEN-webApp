import type { SupabaseClient } from "@supabase/supabase-js";

export async function createOrderForCustomizationRequest(
  supabase: SupabaseClient,
  params: {
    customerId: string;
    boutiqueId: string;
    requestId: string;
    outfitType: string;
    outfitAudience?: string | null;
    occasion?: string | null;
    budgetRange?: string | null;
    deliveryDate?: string | null;
  },
): Promise<{ orderId: string; conversationId: string } | { error: string }> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: params.customerId,
      boutique_id: params.boutiqueId,
      customization_request_id: params.requestId,
      status: "draft",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order" };
  }

  await supabase.from("order_events").insert({
    order_id: order.id,
    status: "draft",
    note: "Customization request received",
    created_by: params.customerId,
  });

  const now = new Date().toISOString();
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      customer_id: params.customerId,
      boutique_id: params.boutiqueId,
      order_id: order.id,
      last_message_at: now,
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    return { error: conversationError?.message ?? "Failed to start conversation" };
  }

  const audienceLabel =
    params.outfitAudience === "men"
      ? "Men"
      : params.outfitAudience === "kids"
        ? "Kids"
        : params.outfitAudience === "women"
          ? "Women"
          : null;

  const summary = [
    `New customization request: ${params.outfitType}`,
    audienceLabel ? `For: ${audienceLabel}` : null,
    params.occasion ? `Occasion: ${params.occasion}` : null,
    params.budgetRange ? `Budget: ${params.budgetRange}` : null,
    params.deliveryDate ? `Target delivery: ${params.deliveryDate}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: params.customerId,
    sender_type: "customer",
    body: summary,
  });

  if (messageError) return { error: messageError.message };

  return { orderId: order.id, conversationId: conversation.id };
}
