"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@faden/database";
import type { ActionResult } from "@faden/types";
import {
  adminCancelOrderSchema,
  adminOrderNoteSchema,
  adminOrderStatusSchema,
} from "@faden/validators";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") throw new Error("Admin access required.");

  return { supabase, adminId: user.id };
}

async function syncRequestStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestId: string | null,
  orderStatus: string,
) {
  if (!requestId) return;

  if (orderStatus === "delivered") {
    await supabase.from("customization_requests").update({ status: "completed" }).eq("id", requestId);
    return;
  }

  if (orderStatus === "cancelled") {
    await supabase.from("customization_requests").update({ status: "cancelled" }).eq("id", requestId);
    return;
  }

  if (orderStatus === "in_progress") {
    await supabase.from("customization_requests").update({ status: "in_production" }).eq("id", requestId);
    return;
  }

  if (orderStatus === "confirmed") {
    await supabase.from("customization_requests").update({ status: "accepted" }).eq("id", requestId);
    return;
  }

  if (orderStatus === "quoted") {
    await supabase.from("customization_requests").update({ status: "quoted" }).eq("id", requestId);
  }
}

export async function adminUpdateOrderStatus(input: unknown): Promise<ActionResult> {
  try {
    const parsed = adminOrderStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, adminId } = await assertAdmin();
    const { orderId, status, note } = parsed.data;

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, customization_request_id")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) return { ok: false, error: "Order not found." };

    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId);

    if (updateError) return { ok: false, error: updateError.message };

    await syncRequestStatus(
      supabase,
      order.customization_request_id as string | null,
      status,
    );

    await supabase.from("order_events").insert({
      order_id: orderId,
      status,
      note: note?.trim() || `Status updated to ${status.replace(/_/g, " ")} by admin`,
      created_by: adminId,
    });

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: "admin_update_order_status",
      entity_type: "order",
      entity_id: orderId,
      metadata: { from: order.status, to: status, note: note ?? null },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function adminCancelOrder(input: unknown): Promise<ActionResult> {
  const parsed = adminCancelOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid order id" };
  }
  return adminUpdateOrderStatus({
    orderId: parsed.data.orderId,
    status: "cancelled",
    note: "Order cancelled by admin",
  });
}

export async function adminAddOrderNote(input: unknown): Promise<ActionResult> {
  try {
    const parsed = adminOrderNoteSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const { supabase, adminId } = await assertAdmin();
    const { orderId, note } = parsed.data;

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) return { ok: false, error: "Order not found." };

    await supabase.from("order_events").insert({
      order_id: orderId,
      status: order.status,
      note: `[Admin note] ${note.trim()}`,
      created_by: adminId,
    });

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: "admin_add_order_note",
      entity_type: "order",
      entity_id: orderId,
      metadata: { note },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
