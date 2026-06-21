import Link from "next/link";
import { getAdminOrderStats, isSupabaseConfigured } from "@faden/database";
import { createClient } from "@/lib/supabase/server";

async function getOverviewStats() {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const [users, pending, verified, orderStats] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("boutiques")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_verification"),
      supabase.from("boutiques").select("id", { count: "exact", head: true }).eq("status", "verified"),
      getAdminOrderStats(supabase),
    ]);

    return {
      users: users.count ?? 0,
      pending: pending.count ?? 0,
      verified: verified.count ?? 0,
      orders: orderStats,
    };
  } catch {
    return null;
  }
}

export default async function AdminOverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">OVERVIEW</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Admin Console</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Orders, boutique verification, user management, and platform controls.
      </p>

      {!isSupabaseConfigured() && (
        <div className="mt-8 rounded-xl border border-gold/30 bg-accent-50 p-6">
          <h2 className="font-display text-lg text-gold">Supabase not configured</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Copy <code className="text-gold">.env.example</code> to <code className="text-gold">.env.local</code>,
            add your Supabase keys, and run the Phase 2 SQL migration from{" "}
            <code className="text-gold">packages/database/src/schema/001_phase2.sql</code>.
          </p>
        </div>
      )}

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total users", value: stats.users },
            { label: "Pending boutiques", value: stats.pending },
            { label: "Verified boutiques", value: stats.verified },
            { label: "Total orders", value: stats.orders.total },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-background-elevated p-5"
            >
              <p className="text-sm text-foreground-muted">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-gold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.orders && stats.orders.total > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active orders", value: stats.orders.active },
            { label: "Delivered", value: stats.orders.completed },
            { label: "Cancelled", value: stats.orders.cancelled },
            { label: "Awaiting payment", value: stats.orders.pendingPayment },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-background-elevated p-5"
            >
              <p className="text-sm text-foreground-muted">{card.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-gold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          View all orders
        </Link>
        <Link
          href="/boutiques"
          className="rounded-lg border border-gold/40 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-accent-50"
        >
          Review pending boutiques
        </Link>
        <Link
          href="/users"
          className="rounded-lg border border-gold/40 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-accent-50"
        >
          Manage users
        </Link>
      </div>
    </div>
  );
}
