import { getBoutiqueFormById, isSupabaseConfigured } from "@faden/database";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { BoutiqueWithVerification } from "@faden/types";
import { createClient } from "@/lib/supabase/server";
import { PendingBoutiques, type PendingBoutiqueReview } from "@/components/pending-boutiques";

async function getPendingBoutiques(): Promise<PendingBoutiqueReview[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boutiques")
      .select("*, boutique_verifications(*)")
      .in("status", ["pending_verification"])
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const boutiques = await Promise.all(
      data.map(async (row) => {
        const verifications = row.boutique_verifications as BoutiqueWithVerification["verification"][] | null;
        const boutique = { ...row };
        delete (boutique as { boutique_verifications?: unknown }).boutique_verifications;

        let details: BoutiqueRegistrationInput = {
          name: boutique.name as string,
          ownerName: boutique.owner_name as string,
          phone: (boutique.phone as string | null) ?? "",
          email: (boutique.email as string | null) ?? "",
          address: (boutique.address as string | null) ?? "",
          mapsUrl: (boutique.maps_url as string | null) ?? "",
          yearsInBusiness: (boutique.years_in_business as number | null) ?? undefined,
          portfolioPhotoUrls: "",
          audiences: "women",
          outfitTypes: "",
          servicesOffered: "",
          pricingInfo: (boutique.pricing_info as string | null) ?? "",
          avgDeliveryTime: (boutique.avg_delivery_time as string | null) ?? "",
          rushOrdersAccepted: (boutique.rush_orders_accepted as boolean) ? "yes" : "no",
          maxOrdersPerMonth: (boutique.max_orders_per_month as number | null) ?? undefined,
          reviewsSummary: (boutique.reviews_summary as string | null) ?? "",
          trustMediaUrls: verifications?.[0]?.trust_media_urls ?? "",
          socialLinks: (boutique.social_links as string | null) ?? "",
          completedOrdersApprox: (boutique.completed_orders_approx as number | null) ?? undefined,
          availabilityStatus: boutique.availability as "open" | "closed",
          workingHours: (boutique.working_hours as string | null) ?? "",
          bookingMode: boutique.booking_mode as "appointment" | "video" | "both",
          communicationPrefs: (boutique.communication_prefs as string | null) ?? "",
        };

        try {
          const full = await getBoutiqueFormById(supabase, boutique.id as string);
          if (full) details = full.form;
        } catch {
          // Use partial details from row above.
        }

        return {
          ...(boutique as BoutiqueWithVerification),
          verification: verifications?.[0] ?? null,
          details,
        };
      }),
    );

    return boutiques;
  } catch {
    return [];
  }
}

export default async function BoutiquesPage() {
  const boutiques = await getPendingBoutiques();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">VERIFICATION</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Boutique Queue</h1>
      <p className="mt-2 text-foreground-muted">
        Review registrations, trust signals, and approve boutiques for discovery.
      </p>
      <div className="mt-8">
        <PendingBoutiques boutiques={boutiques} />
      </div>
    </div>
  );
}
