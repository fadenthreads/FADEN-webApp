import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  fetchPlatformStats,
  formatPlatformStatsForDisplay,
  type PlatformStats,
} from "@/lib/platform/platform-stats";

const EMPTY_STATS: PlatformStats = {
  boutiqueCount: 0,
  customerCount: 0,
  averageRating: null,
};

export async function GET() {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({
      stats: formatPlatformStatsForDisplay(EMPTY_STATS),
      source: "empty",
    });
  }

  try {
    const supabase = await createClient();
    const stats = await fetchPlatformStats(supabase);
    return NextResponse.json({
      stats: formatPlatformStatsForDisplay(stats),
      source: "live",
    });
  } catch {
    return NextResponse.json({
      stats: formatPlatformStatsForDisplay(EMPTY_STATS),
      source: "empty",
    });
  }
}
