import type { SupabaseClient } from "@supabase/supabase-js";

export interface CustomerNotification {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  conversationId: string;
}

export async function listCustomerNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 30,
): Promise<CustomerNotification[]> {
  const { data: conversations, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", userId);

  if (conversationError || !conversations?.length) return [];

  const conversationIds = conversations.map((row) => row.id);

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, body, created_at, read_at, conversation_id")
    .in("conversation_id", conversationIds)
    .eq("sender_type", "system")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !messages) return [];

  return messages.map((row) => ({
    id: row.id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    readAt: (row.read_at as string | null) ?? null,
    conversationId: row.conversation_id as string,
  }));
}

export async function countUnreadNotifications(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const notifications = await listCustomerNotifications(supabase, userId, 100);
  return notifications.filter((item) => !item.readAt).length;
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  ids: string[],
): Promise<void> {
  if (!ids.length) return;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", userId);

  const allowedConversationIds = new Set((conversations ?? []).map((row) => row.id));
  const now = new Date().toISOString();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, conversation_id")
    .in("id", ids)
    .is("read_at", null);

  const allowedIds = (messages ?? [])
    .filter((row) => allowedConversationIds.has(row.conversation_id as string))
    .map((row) => row.id as string);

  if (!allowedIds.length) return;

  await supabase.from("messages").update({ read_at: now }).in("id", allowedIds);
}
