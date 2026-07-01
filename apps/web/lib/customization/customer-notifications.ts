import type { SupabaseClient } from "@supabase/supabase-js";

async function insertSystemMessage(
  supabase: SupabaseClient,
  conversationId: string,
  body: string,
) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: null,
    sender_type: "system",
    body,
  });

  if (error) throw new Error(error.message);

  await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);
}

export async function notifyRequestSubmitted(
  supabase: SupabaseClient,
  conversationId: string,
) {
  await insertSystemMessage(
    supabase,
    conversationId,
    "✅ Request Submitted Successfully — Your customization request has been submitted. The boutique will review it and respond soon.",
  );
}

export async function notifyRequestAccepted(
  supabase: SupabaseClient,
  params: { requestId: string; boutiqueName: string },
) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("customization_request_id", params.requestId)
    .maybeSingle();

  if (orderError || !order) return;

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (conversationError || !conversation) return;

  await insertSystemMessage(
    supabase,
    conversation.id,
    `🎉 Your customization request has been accepted by ${params.boutiqueName}.`,
  );
}
