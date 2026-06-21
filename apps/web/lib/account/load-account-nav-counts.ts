import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountNavCounts } from "@/lib/account/account-nav";

export async function loadAccountNavCounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountNavCounts> {
  const [
    requestsRes,
    ordersRes,
    quotationsRes,
    payableRes,
    paymentsRes,
    appointmentsRes,
    conversationsRes,
    reviewableRes,
  ] = await Promise.all([
    supabase
      .from("customization_requests")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", userId),
    supabase
      .from("quotations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .eq("status", "confirmed"),
    supabase
      .from("orders")
      .select("id")
      .eq("customer_id", userId),
    supabase
      .from("fitting_appointments")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .eq("status", "delivered"),
  ]);

  let paymentsCount = 0;
  const orderIds = (paymentsRes.data ?? []).map((row) => row.id as string);
  if (orderIds.length) {
    const { count } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .in("order_id", orderIds)
      .eq("status", "captured");
    paymentsCount = count ?? 0;
  }

  return {
    requests: requestsRes.count ?? 0,
    orders: ordersRes.count ?? 0,
    quotations: quotationsRes.count ?? 0,
    payments: Math.max(payableRes.count ?? 0, paymentsCount),
    appointments: appointmentsRes.error ? 0 : appointmentsRes.count ?? 0,
    messages: conversationsRes.count ?? 0,
    reviews: reviewableRes.count ?? 0,
  };
}
