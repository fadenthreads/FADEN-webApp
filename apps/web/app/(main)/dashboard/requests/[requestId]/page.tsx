import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CustomizationRequestDetailView } from "@/components/dashboard/customization-request-detail-view";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import { getBoutiqueCustomizationRequestDetail } from "@/lib/customization/queries";
import { listBoutiqueStaff } from "@/lib/dashboard/boutique-staff";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Request Details — Boutique Dashboard — FADEN",
  description: "View full customization request details from your customer.",
};

export const dynamic = "force-dynamic";

export default async function DashboardRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  if (!isWebSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/requests/${requestId}`)}`);
  }

  const boutique = await getOwnerBoutique(supabase, user.id);
  if (!boutique?.id || boutique.status !== "verified") {
    redirect("/dashboard");
  }

  let request = null;
  try {
    request = await getBoutiqueCustomizationRequestDetail(supabase, boutique.id, requestId);
  } catch {
    request = null;
  }

  if (!request) {
    notFound();
  }

  const staff = await listBoutiqueStaff(supabase, boutique.id).catch(() => []);

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <header className="mx-auto mb-8 max-w-container">
        <Link
          href="/dashboard?panel=customization"
          className="text-sm text-gold hover:text-gold-light"
        >
          ← Back to customization requests
        </Link>
        <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-gold">BOUTIQUE PORTAL</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Request details</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Full customer submission for {boutique.name}
        </p>
      </header>

      <div className="mx-auto max-w-container">
        <CustomizationRequestDetailView
          request={request}
          boutiqueId={boutique.id}
          staff={staff}
        />
      </div>
    </div>
  );
}
