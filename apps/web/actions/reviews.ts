"use server";

import { revalidatePath } from "next/cache";
import { createReviewSchema } from "@faden/validators";
import type { ActionResult } from "@faden/types";
import { createClient } from "@/lib/supabase/server";

export async function submitReview(input: unknown): Promise<ActionResult> {
  try {
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const { orderId, rating, body } = parsed.data;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, boutique_id, status, boutiques ( slug )")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) return { ok: false, error: "Order not found." };
    if (order.customer_id !== user.id) {
      return { ok: false, error: "You can only review your own orders." };
    }
    if (order.status !== "delivered") {
      return { ok: false, error: "You can review an order after it is delivered." };
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) return { ok: false, error: "You already reviewed this order." };

    const { error } = await supabase.from("reviews").insert({
      boutique_id: order.boutique_id,
      customer_id: user.id,
      order_id: orderId,
      rating,
      body: body?.trim() || null,
    });

    if (error) return { ok: false, error: error.message };

    const boutique = Array.isArray(order.boutiques)
      ? (order.boutiques[0] as { slug?: string } | undefined)
      : (order.boutiques as { slug?: string } | null);
    if (boutique?.slug) {
      revalidatePath(`/boutique/${boutique.slug}`);
    }

    revalidatePath("/account");
    revalidatePath("/dashboard");
    revalidatePath(`/boutique`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
