"use server";

import { revalidatePath } from "next/cache";
import {
  createQuotationSchema,
  quotationDecisionSchema,
} from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";

function readOwnerId(boutiques: unknown): string | undefined {
  if (Array.isArray(boutiques)) {
    return (boutiques[0] as { owner_id?: string } | undefined)?.owner_id;
  }
  return (boutiques as { owner_id?: string } | null)?.owner_id;
}

function readOrderJoin(value: unknown): {
  status: string;
  customization_request_id: string | null;
} | null {
  if (Array.isArray(value)) {
    return (value[0] as { status: string; customization_request_id: string | null } | undefined) ?? null;
  }
  return (value as { status: string; customization_request_id: string | null } | null) ?? null;
}

async function assertAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return { supabase, userId: user.id };
}

async function notifyConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  senderId: string,
  body: string,
) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!conversation) return;

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: senderId,
    sender_type: "system",
    body,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversation.id);
}

export async function createQuotation(input: unknown): Promise<ActionResult<{ quotationId: string }>> {
  try {
    const parsed = createQuotationSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, userId } = await assertAuthenticatedUser();
    const { orderId, lineItems, tax, notes, validUntilDays } = parsed.data;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, customer_id, boutique_id, customization_request_id, status, boutiques ( owner_id )",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) return { ok: false, error: "Order not found." };

    const ownerId = readOwnerId(order.boutiques);
    if (ownerId !== userId) return { ok: false, error: "Only the boutique owner can send quotations." };

    if (!["draft", "quoted"].includes(order.status)) {
      return { ok: false, error: "This order cannot receive a new quotation." };
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = subtotal + tax;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validUntilDays);

    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        order_id: orderId,
        boutique_id: order.boutique_id,
        customer_id: order.customer_id,
        subtotal,
        tax,
        total,
        notes: notes?.trim() || null,
        valid_until: validUntil.toISOString(),
      })
      .select("id")
      .single();

    if (quotationError || !quotation) {
      return { ok: false, error: quotationError?.message ?? "Failed to create quotation" };
    }

    const { error: itemsError } = await supabase.from("quotation_line_items").insert(
      lineItems.map((item) => ({
        quotation_id: quotation.id,
        label: item.label,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    );

    if (itemsError) return { ok: false, error: itemsError.message };

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ status: "quoted", total_amount: total })
      .eq("id", orderId);

    if (updateOrderError) return { ok: false, error: updateOrderError.message };

    if (order.customization_request_id) {
      await supabase
        .from("customization_requests")
        .update({ status: "quoted" })
        .eq("id", order.customization_request_id);
    }

    await supabase.from("order_events").insert({
      order_id: orderId,
      status: "quoted",
      note: `Quotation sent — ${total.toFixed(0)} INR`,
      created_by: userId,
    });

    await notifyConversation(
      supabase,
      orderId,
      userId,
      `Quotation sent: ₹${total.toLocaleString("en-IN")}. Valid until ${validUntil.toLocaleDateString("en-IN")}.`,
    );

    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function decideQuotation(input: unknown): Promise<ActionResult> {
  try {
    const parsed = quotationDecisionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, userId } = await assertAuthenticatedUser();
    const { quotationId, decision } = parsed.data;

    const { data: quotation, error: quoteError } = await supabase
      .from("quotations")
      .select("id, order_id, customer_id, total, valid_until, orders ( status, customization_request_id )")
      .eq("id", quotationId)
      .maybeSingle();

    if (quoteError || !quotation) return { ok: false, error: "Quotation not found." };
    if (quotation.customer_id !== userId) {
      return { ok: false, error: "Only the customer can respond to this quotation." };
    }

    const order = readOrderJoin(quotation.orders);

    if (!order || order.status !== "quoted") {
      return { ok: false, error: "This quotation is no longer pending." };
    }

    if (quotation.valid_until && new Date(quotation.valid_until).getTime() < Date.now()) {
      return { ok: false, error: "This quotation has expired." };
    }

    if (decision === "accepted") {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "confirmed", total_amount: quotation.total })
        .eq("id", quotation.order_id);

      if (orderError) return { ok: false, error: orderError.message };

      if (order.customization_request_id) {
        await supabase
          .from("customization_requests")
          .update({ status: "accepted" })
          .eq("id", order.customization_request_id);
      }

      await supabase.from("order_events").insert({
        order_id: quotation.order_id,
        status: "confirmed",
        note: "Customer accepted quotation",
        created_by: userId,
      });

      await notifyConversation(
        supabase,
        quotation.order_id,
        userId,
        `Quotation accepted — ₹${Number(quotation.total).toLocaleString("en-IN")}. Complete payment on your account to start production.`,
      );
    } else {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", quotation.order_id);

      if (orderError) return { ok: false, error: orderError.message };

      if (order.customization_request_id) {
        await supabase
          .from("customization_requests")
          .update({ status: "cancelled" })
          .eq("id", order.customization_request_id);
      }

      await supabase.from("order_events").insert({
        order_id: quotation.order_id,
        status: "cancelled",
        note: "Customer declined quotation",
        created_by: userId,
      });

      await notifyConversation(
        supabase,
        quotation.order_id,
        userId,
        "Quotation declined. You can message the boutique to negotiate or request a revised quote.",
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
