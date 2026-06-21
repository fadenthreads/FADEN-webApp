"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatusSchema } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";

function readOwnerId(boutiques: unknown): string | undefined {
  if (Array.isArray(boutiques)) {
    return (boutiques[0] as { owner_id?: string } | undefined)?.owner_id;
  }
  return (boutiques as { owner_id?: string } | null)?.owner_id;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["in_progress"],
  in_progress: ["shipped"],
  shipped: ["delivered"],
};

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateOrderStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, customization_request_id, boutiques ( owner_id )")
      .eq("id", parsed.data.orderId)
      .maybeSingle();

    if (fetchError || !order) return { ok: false, error: "Order not found." };

    const ownerId = readOwnerId(order.boutiques);
    if (ownerId !== user.id) {
      return { ok: false, error: "Only the boutique owner can update order status." };
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      return { ok: false, error: `Cannot move from ${order.status} to ${parsed.data.status}.` };
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.orderId);

    if (error) return { ok: false, error: error.message };

    const statusNotes: Record<string, string> = {
      in_progress: "Production started",
      shipped: "Order shipped",
      delivered: "Order delivered",
    };

    if (parsed.data.status === "delivered" && order.customization_request_id) {
      await supabase
        .from("customization_requests")
        .update({ status: "completed" })
        .eq("id", order.customization_request_id);
    }

    await supabase.from("order_events").insert({
      order_id: parsed.data.orderId,
      status: parsed.data.status,
      note: statusNotes[parsed.data.status] ?? "Status updated",
      created_by: user.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
