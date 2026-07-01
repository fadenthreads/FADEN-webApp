"use server";

import { revalidatePath } from "next/cache";
import {
  sendMessageSchema,
  updateCustomizationStatusSchema,
} from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { notifyRequestAccepted } from "@/lib/customization/customer-notifications";

async function assertAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return { supabase, userId: user.id };
}

function readOwnerId(boutiques: unknown): string | undefined {
  if (Array.isArray(boutiques)) {
    return (boutiques[0] as { owner_id?: string } | undefined)?.owner_id;
  }
  return (boutiques as { owner_id?: string } | null)?.owner_id;
}

function readBoutiqueName(boutiques: unknown): string {
  if (Array.isArray(boutiques)) {
    return (boutiques[0] as { name?: string } | undefined)?.name ?? "The boutique";
  }
  return (boutiques as { name?: string } | null)?.name ?? "The boutique";
}

async function assertBoutiqueOwnerForConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  conversationId: string,
) {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, boutique_id, customer_id, boutiques ( owner_id )")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !conversation) throw new Error("Conversation not found.");

  const ownerId = readOwnerId(conversation.boutiques);
  const isParticipant = conversation.customer_id === userId || ownerId === userId;
  if (!isParticipant) throw new Error("Access denied.");

  return { conversation, isOwner: ownerId === userId };
}

export async function sendMessage(input: unknown): Promise<ActionResult> {
  try {
    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, userId } = await assertAuthenticatedUser();
    const { conversation, isOwner } = await assertBoutiqueOwnerForConversation(
      supabase,
      userId,
      parsed.data.conversationId,
    );

    const { error } = await supabase.from("messages").insert({
      conversation_id: parsed.data.conversationId,
      sender_id: userId,
      sender_type: isOwner ? "boutique" : conversation.customer_id === userId ? "customer" : "system",
      body: parsed.data.body.trim(),
    });

    if (error) return { ok: false, error: error.message };

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", parsed.data.conversationId);

    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function updateCustomizationStatus(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateCustomizationStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, userId } = await assertAuthenticatedUser();

    const { data: request, error: fetchError } = await supabase
      .from("customization_requests")
      .select("id, boutique_id, boutiques ( owner_id, name )")
      .eq("id", parsed.data.requestId)
      .maybeSingle();

    if (fetchError || !request) return { ok: false, error: "Request not found." };

    const ownerId = readOwnerId(request.boutiques);
    if (ownerId !== userId) return { ok: false, error: "Only the boutique owner can update status." };

    const { error } = await supabase
      .from("customization_requests")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.requestId);

    if (error) return { ok: false, error: error.message };

    if (parsed.data.status === "accepted") {
      await notifyRequestAccepted(supabase, {
        requestId: parsed.data.requestId,
        boutiqueName: readBoutiqueName(request.boutiques),
      }).catch(() => undefined);
    }

    revalidatePath("/dashboard");
    revalidatePath("/account");
    revalidatePath("/account/messages");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
