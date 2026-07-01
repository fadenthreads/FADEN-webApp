import type { SupabaseClient } from "@supabase/supabase-js";

export interface PlatformStats {
  boutiqueCount: number;
  customerCount: number;
  averageRating: number | null;
}

function formatStatCount(value: number): string {
  if (value <= 0) return "0";
  if (value >= 1000) return `${Math.floor(value / 1000)}K+`;
  return String(value);
}

function formatAverageRating(value: number | null): string {
  if (value == null || value <= 0) return "—";
  return value.toFixed(1);
}

export async function fetchPlatformStats(
  supabase: SupabaseClient,
): Promise<PlatformStats> {
  const [boutiqueRes, customerRes, reviewsRes] = await Promise.all([
    supabase
      .from("boutiques")
      .select("id", { count: "exact", head: true })
      .eq("status", "verified"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase.from("reviews").select("rating"),
  ]);

  const boutiqueCount = boutiqueRes.count ?? 0;
  const customerCount = customerRes.count ?? 0;

  const ratings = (reviewsRes.data ?? [])
    .map((row) => Number(row.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : null;

  return { boutiqueCount, customerCount, averageRating };
}

export function formatPlatformStatsForDisplay(stats: PlatformStats) {
  return {
    boutiques: formatStatCount(stats.boutiqueCount),
    customers: formatStatCount(stats.customerCount),
    averageRating: formatAverageRating(stats.averageRating),
    hasAverageRating: stats.averageRating != null && stats.averageRating > 0,
  };
}
