import type { SupabaseClient } from "@supabase/supabase-js";

export interface ReviewRecord {
  id: string;
  boutique_id: string;
  customer_id: string;
  order_id: string | null;
  rating: number;
  body: string | null;
  created_at: string;
  customer_name?: string | null;
  outfit_type?: string | null;
}

export interface ReviewableOrder {
  id: string;
  boutique_id: string;
  boutique_name: string | null;
  boutique_slug: string | null;
  outfit_type: string | null;
  delivered_at: string | null;
}

export interface BoutiqueReviewStats {
  averageRating: number;
  reviewCount: number;
}

function readNestedRecord<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null;
  }
  return (value as T | null) ?? null;
}

function readProfile(value: unknown): { full_name: string | null; email: string } | null {
  if (Array.isArray(value)) {
    return (value[0] as { full_name: string | null; email: string } | undefined) ?? null;
  }
  return (value as { full_name: string | null; email: string } | null) ?? null;
}

export function computeReviewStats(reviews: { rating: number }[]): BoutiqueReviewStats {
  if (!reviews.length) return { averageRating: 0, reviewCount: 0 };
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export async function getBoutiqueReviewStats(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<BoutiqueReviewStats> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("boutique_id", boutiqueId);

  if (error) throw new Error(error.message);
  return computeReviewStats((data ?? []).map((row) => ({ rating: Number(row.rating) })));
}

export async function listBoutiqueReviews(
  supabase: SupabaseClient,
  boutiqueId: string,
  limit = 20,
): Promise<ReviewRecord[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      boutique_id,
      customer_id,
      order_id,
      rating,
      body,
      created_at,
      orders (
        customization_requests ( outfit_type )
      )
    `,
    )
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const order = readNestedRecord<{ customization_requests: unknown }>(row.orders);
    const request = readNestedRecord<{ outfit_type: string | null }>(order?.customization_requests);
    return {
      id: row.id as string,
      boutique_id: row.boutique_id as string,
      customer_id: row.customer_id as string,
      order_id: row.order_id as string | null,
      rating: Number(row.rating),
      body: row.body as string | null,
      created_at: row.created_at as string,
      outfit_type: request?.outfit_type ?? null,
    };
  });
}

export async function listBoutiqueReviewsForOwner(
  supabase: SupabaseClient,
  boutiqueId: string,
): Promise<ReviewRecord[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      boutique_id,
      customer_id,
      order_id,
      rating,
      body,
      created_at,
      profiles ( full_name, email ),
      orders (
        customization_requests ( outfit_type )
      )
    `,
    )
    .eq("boutique_id", boutiqueId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const customer = readProfile(row.profiles);
    const order = readNestedRecord<{ customization_requests: unknown }>(row.orders);
    const request = readNestedRecord<{ outfit_type: string | null }>(order?.customization_requests);
    return {
      id: row.id as string,
      boutique_id: row.boutique_id as string,
      customer_id: row.customer_id as string,
      order_id: row.order_id as string | null,
      rating: Number(row.rating),
      body: row.body as string | null,
      created_at: row.created_at as string,
      customer_name: customer?.full_name ?? customer?.email ?? null,
      outfit_type: request?.outfit_type ?? null,
    };
  });
}

export async function listCustomerReviewableOrders(
  supabase: SupabaseClient,
  customerId: string,
): Promise<ReviewableOrder[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      boutique_id,
      created_at,
      boutiques ( name, slug ),
      customization_requests ( outfit_type )
    `,
    )
    .eq("customer_id", customerId)
    .eq("status", "delivered")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const orderIds = orders.map((order) => order.id as string);
  const { data: existingReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("order_id")
    .in("order_id", orderIds);

  if (reviewsError) throw new Error(reviewsError.message);

  const reviewed = new Set((existingReviews ?? []).map((row) => row.order_id as string));

  return orders
    .filter((order) => !reviewed.has(order.id as string))
    .map((order) => {
      const boutique = readNestedRecord<{ name: string; slug: string }>(order.boutiques);
      const request = readNestedRecord<{ outfit_type: string | null }>(order.customization_requests);
      return {
        id: order.id as string,
        boutique_id: order.boutique_id as string,
        boutique_name: boutique?.name ?? null,
        boutique_slug: boutique?.slug ?? null,
        outfit_type: request?.outfit_type ?? null,
        delivered_at: order.created_at as string,
      };
    });
}

export async function loadReviewStatsByBoutiqueIds(
  supabase: SupabaseClient,
  boutiqueIds: string[],
): Promise<Map<string, BoutiqueReviewStats>> {
  if (!boutiqueIds.length) return new Map();

  const { data, error } = await supabase
    .from("reviews")
    .select("boutique_id, rating")
    .in("boutique_id", boutiqueIds);

  if (error) throw new Error(error.message);

  const grouped = new Map<string, { rating: number }[]>();
  for (const row of data ?? []) {
    const id = row.boutique_id as string;
    const list = grouped.get(id) ?? [];
    list.push({ rating: Number(row.rating) });
    grouped.set(id, list);
  }

  const stats = new Map<string, BoutiqueReviewStats>();
  for (const id of boutiqueIds) {
    stats.set(id, computeReviewStats(grouped.get(id) ?? []));
  }
  return stats;
}
