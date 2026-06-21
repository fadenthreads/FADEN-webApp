import {
  getAdminOrderStats,
  isSupabaseConfigured,
  listAllOrdersForAdmin,
} from "@faden/database";
import { createClient } from "@/lib/supabase/server";
import { OrdersDirectory } from "@/components/orders-directory";

async function getOrdersData() {
  if (!isSupabaseConfigured()) {
    return { orders: [], stats: null };
  }

  try {
    const supabase = await createClient();
    const [orders, stats] = await Promise.all([
      listAllOrdersForAdmin(supabase),
      getAdminOrderStats(supabase),
    ]);
    return { orders, stats };
  } catch {
    return { orders: [], stats: null };
  }
}

export default async function OrdersPage() {
  const { orders, stats } = await getOrdersData();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">ORDERS</p>
      <h1 className="mt-2 font-display text-3xl font-bold">All Orders</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Monitor every customer–boutique order, payment status, and fulfillment stage. Open an order
        to update status, cancel, or leave admin notes.
      </p>
      <div className="mt-8">
        <OrdersDirectory orders={orders} stats={stats} />
      </div>
    </div>
  );
}
