import Link from "next/link";
import { DashboardShell, type DashboardData, type DashboardPanelId } from "@/components/dashboard/dashboard-shell";
import { getLiveBoutiqueProfileBySlug, getOwnerBoutique } from "@/lib/boutique/queries";
import {
  getDashboardStats,
  listBoutiqueConversations,
  listBoutiqueCustomizationRequests,
  listBoutiqueOrders,
  listConversationMessages,
} from "@/lib/customization/queries";
import { listBoutiqueQuotations } from "@/lib/quotation/queries";
import { listBoutiquePayments } from "@/lib/payment/queries";
import { listBoutiqueReviewsForOwner } from "@/lib/review/queries";
import { listTailorAppointments } from "@/lib/appointments/queries";
import { listBoutiqueHomeVisits } from "@/lib/home-visits/queries";
import { getOwnerListingSettings } from "@/lib/dashboard/boutique-listings";
import { isBoutiqueStaffAvailable, listBoutiqueStaff } from "@/lib/dashboard/boutique-staff";
import {
  buildOwnerAnalytics,
  buildOwnerCustomers,
  buildOwnerPerformance,
} from "@/lib/dashboard/owner-insights";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Boutique Dashboard — FADEN",
  description: "Manage orders, customers, portfolio, and performance.",
};

export const dynamic = "force-dynamic";

const EMPTY_DASHBOARD: DashboardData = {
  customizationRequests: [],
  orders: [],
  quotations: [],
  payments: [],
  reviews: [],
  conversations: [],
  messagesByConversation: {},
  appointments: [],
  homeVisits: [],
  stats: null,
  customers: [],
  analytics: null,
  performance: null,
  listing: null,
  publicProfile: null,
  staff: [],
  staffTableAvailable: false,
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ panel?: string }>;
}) {
  const { panel } = await searchParams;
  const validPanels = new Set<DashboardPanelId>([
    "overview",
    "orders",
    "customization",
    "appointments",
    "customers",
    "portfolio",
    "listings",
    "messages",
    "quotations",
    "reviews",
    "analytics",
    "payments",
    "delivery",
    "staff",
    "marketing",
    "performance",
  ]);
  const initialPanel = panel && validPanels.has(panel as DashboardPanelId)
    ? (panel as DashboardPanelId)
    : undefined;

  let boutique = null;
  let dashboardData: DashboardData = EMPTY_DASHBOARD;

  if (isWebSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        boutique = await getOwnerBoutique(supabase, user.id);
        if (boutique?.id && boutique.status === "verified") {
          const [
            customizationRequests,
            orders,
            quotations,
            payments,
            reviews,
            conversations,
            stats,
            appointments,
            listing,
            publicProfile,
            staffTableAvailable,
          ] = await Promise.all([
            listBoutiqueCustomizationRequests(supabase, boutique.id),
            listBoutiqueOrders(supabase, boutique.id),
            listBoutiqueQuotations(supabase, boutique.id),
            listBoutiquePayments(supabase, boutique.id),
            listBoutiqueReviewsForOwner(supabase, boutique.id),
            listBoutiqueConversations(supabase, boutique.id),
            getDashboardStats(supabase, boutique.id),
            listTailorAppointments(supabase, user.id),
            getOwnerListingSettings(supabase, boutique.id),
            getLiveBoutiqueProfileBySlug(supabase, boutique.slug),
            isBoutiqueStaffAvailable(supabase),
          ]);

          const [staff, homeVisits] = await Promise.all([
            staffTableAvailable ? listBoutiqueStaff(supabase, boutique.id) : Promise.resolve([]),
            listBoutiqueHomeVisits(supabase, boutique.id),
          ]);

          const messagesByConversation: Record<string, Awaited<ReturnType<typeof listConversationMessages>>> = {};
          await Promise.all(
            conversations.map(async (conversation) => {
              messagesByConversation[conversation.id] = await listConversationMessages(
                supabase,
                conversation.id,
              );
            }),
          );

          const customers = buildOwnerCustomers({ orders, requests: customizationRequests });
          const analytics = buildOwnerAnalytics({ orders, requests: customizationRequests, payments });
          const performance = buildOwnerPerformance({
            orders,
            requests: customizationRequests,
            reviews,
            conversations,
            messagesByConversation,
            customers,
          });

          dashboardData = {
            customizationRequests,
            orders,
            quotations,
            payments,
            reviews,
            conversations,
            messagesByConversation,
            appointments,
            homeVisits,
            stats,
            customers,
            analytics,
            performance,
            listing,
            publicProfile,
            staff,
            staffTableAvailable,
          };
        }
      }
    } catch {
      boutique = null;
      dashboardData = EMPTY_DASHBOARD;
    }
  }

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <header className="mx-auto mb-8 max-w-container">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold">BOUTIQUE PORTAL</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Dashboard</h1>
        {boutique?.status === "verified" && (
          <p className="mt-2 text-sm text-foreground-muted">
            Live on FADEN —{" "}
            <Link href={`/boutique/${boutique.slug}`} className="text-gold hover:text-gold-light">
              view your public profile
            </Link>
          </p>
        )}
      </header>
      <DashboardShell boutique={boutique} data={dashboardData} initialPanel={initialPanel} />
    </div>
  );
}
