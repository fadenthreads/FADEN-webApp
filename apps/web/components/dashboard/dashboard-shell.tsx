"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@faden/utils";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette,
  Star,
  Truck,
  Users,
  Megaphone,
  ClipboardList,
  Settings,
  Video,
} from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { CustomizationRequestsPanel } from "@/components/dashboard/customization-requests-panel";
import { OrdersPanel } from "@/components/dashboard/orders-panel";
import { DeliveryTrackingPanel } from "@/components/dashboard/delivery-tracking-panel";
import { MessagesPanel } from "@/components/dashboard/messages-panel";
import { OwnerAppointmentsPanel } from "@/components/appointments/owner-appointments-panel";
import { OwnerHomeVisitsPanel } from "@/components/home-visits/home-visits-panels";
import { OwnerQuotationsPanel } from "@/components/quotations/owner-quotations-panel";
import { OwnerPaymentsPanel } from "@/components/payments/owner-payments-panel";
import { OwnerReviewsPanel } from "@/components/reviews/owner-reviews-panel";
import { OwnerPortfolioPanel } from "@/components/dashboard/owner-portfolio-panel";
import type { BoutiqueProfileData } from "@/data/boutique-profiles";
import { OwnerAvailabilityControl } from "@/components/dashboard/owner-availability-control";
import { CustomersPanel } from "@/components/dashboard/customers-panel";
import { ListingsPanel } from "@/components/dashboard/listings-panel";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { PerformancePanel } from "@/components/dashboard/performance-panel";
import { StaffPanel } from "@/components/dashboard/staff-panel";
import type { OwnerStaffMember } from "@/lib/dashboard/boutique-staff";
import type {
  ConversationSummary,
  CustomizationRequestSummary,
  MessageRow,
  OrderSummary,
} from "@/lib/customization/queries";
import type { QuotationSummary } from "@/lib/quotation/queries";
import type { PaymentSummary } from "@/lib/payment/queries";
import type { ReviewRecord } from "@/lib/review/queries";
import type { TailorAppointmentSummary } from "@/lib/appointments/queries";
import type { HomeMeasurementVisit } from "@/lib/home-visits/queries";
import type { OwnerListingSettings } from "@/lib/dashboard/boutique-listings";
import type {
  OwnerAnalyticsSnapshot,
  OwnerCustomerRecord,
  OwnerPerformanceSnapshot,
} from "@/lib/dashboard/owner-insights";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "customization", label: "Customization Requests", icon: Palette },
  { id: "appointments", label: "Fittings & Visits", icon: Video },
  { id: "customers", label: "Customers", icon: Users },
  { id: "portfolio", label: "Portfolio", icon: ClipboardList },
  { id: "listings", label: "Products & Services", icon: Settings },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "quotations", label: "Quotations", icon: CreditCard },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery Tracking", icon: Truck },
  { id: "staff", label: "Staff", icon: Users },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "performance", label: "Performance Score", icon: BarChart3 },
] as const;

type PanelId = (typeof NAV)[number]["id"];

export type DashboardPanelId = PanelId;

export interface OwnerBoutiqueSummary {
  id?: string;
  slug: string;
  name: string;
  status: string;
}

export interface DashboardStats {
  pendingRequests: number;
  pendingOrders: number;
  messageCount: number;
  totalRequests: number;
}

export interface DashboardData {
  customizationRequests: CustomizationRequestSummary[];
  orders: OrderSummary[];
  quotations: QuotationSummary[];
  payments: PaymentSummary[];
  reviews: ReviewRecord[];
  conversations: ConversationSummary[];
  messagesByConversation: Record<string, MessageRow[]>;
  appointments: TailorAppointmentSummary[];
  homeVisits: HomeMeasurementVisit[];
  stats: DashboardStats | null;
  customers: OwnerCustomerRecord[];
  analytics: OwnerAnalyticsSnapshot | null;
  performance: OwnerPerformanceSnapshot | null;
  listing: OwnerListingSettings | null;
  publicProfile: BoutiqueProfileData | null;
  staff: OwnerStaffMember[];
  staffTableAvailable: boolean;
}

function OverviewPanel({
  boutique,
  stats,
  listing,
}: {
  boutique: OwnerBoutiqueSummary | null;
  stats: DashboardStats | null;
  listing: OwnerListingSettings | null;
}) {
  const statusLabel = boutique?.status?.replace(/_/g, " ") ?? "not registered";
  const overviewStats = stats
    ? [
        { label: "New Requests", value: String(stats.pendingRequests) },
        { label: "Pending Orders", value: String(stats.pendingOrders) },
        { label: "Conversations", value: String(stats.messageCount) },
        { label: "Total Requests", value: String(stats.totalRequests) },
      ]
    : [
        { label: "New Requests", value: "—" },
        { label: "Pending Orders", value: "—" },
        { label: "Conversations", value: "—" },
        { label: "Total Requests", value: "—" },
      ];

  return (
    <div className="space-y-6">
      {boutique ? (
        <PremiumCard hover={false} className="border-gold/30">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">YOUR BOUTIQUE</p>
          <h3 className="mt-2 font-display text-xl font-semibold">{boutique.name}</h3>
          <p className="mt-2 capitalize text-sm text-foreground-muted">Status: {statusLabel}</p>
          {boutique.status === "verified" && (
            <Link
              href={`/boutique/${boutique.slug}`}
              className="mt-4 inline-block text-sm text-gold hover:text-gold-light"
            >
              View public profile →
            </Link>
          )}
          {boutique.status === "pending_verification" && (
            <p className="mt-3 text-sm text-foreground-muted">
              Your studio is in the admin verification queue. You&apos;ll appear on discovery once approved.
            </p>
          )}
        </PremiumCard>
      ) : (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">
            No boutique linked yet.{" "}
            <Link href="/register-boutique" className="text-gold hover:text-gold-light">
              Register your boutique
            </Link>
          </p>
        </PremiumCard>
      )}
      {listing && boutique?.status === "verified" && (
        <OwnerAvailabilityControl listing={listing} compact />
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((s) => (
          <PremiumCard key={s.label} className="p-4">
            <p className="text-xs text-foreground-muted">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold">{s.value}</p>
          </PremiumCard>
        ))}
      </div>
      <PremiumCard hover={false}>
        <h3 className="font-semibold text-gold">Today&apos;s Snapshot</h3>
        <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
          {stats ? (
            <>
              <li>• {stats.pendingRequests} new customization request{stats.pendingRequests === 1 ? "" : "s"} awaiting review</li>
              <li>• {stats.pendingOrders} active order{stats.pendingOrders === 1 ? "" : "s"} in pipeline</li>
              <li>• {stats.messageCount} customer conversation{stats.messageCount === 1 ? "" : "s"}</li>
            </>
          ) : (
            <>
              <li>• Approve your boutique to start receiving customer requests</li>
              <li>• Orders and messages appear when customers customize with your studio</li>
            </>
          )}
        </ul>
      </PremiumCard>
    </div>
  );
}

function StubPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <PremiumCard hover={false}>
      <h3 className="font-display text-lg font-semibold text-gold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-foreground-muted/70">Detailed tools — coming soon</p>
    </PremiumCard>
  );
}

const PANEL_STUBS: Record<
  Exclude<
    PanelId,
    | "overview"
    | "customization"
    | "appointments"
    | "orders"
    | "messages"
    | "quotations"
    | "payments"
    | "delivery"
    | "reviews"
    | "portfolio"
    | "customers"
    | "listings"
    | "analytics"
    | "performance"
    | "staff"
  >,
  React.ReactNode
> = {
  marketing: (
    <StubPanel
      title="Marketing Tools"
      items={["Featured listings, promotions, discount campaigns, festival offers, sponsored placement"]}
    />
  ),
};

export function DashboardShell({
  boutique,
  data,
  initialPanel,
}: {
  boutique: OwnerBoutiqueSummary | null;
  data: DashboardData;
  initialPanel?: PanelId;
}) {
  const [active, setActive] = useState<PanelId>(initialPanel ?? "overview");

  const panel =
    active === "overview" ? (
      <OverviewPanel boutique={boutique} stats={data.stats} listing={data.listing} />
    ) : active === "customization" ? (
      <CustomizationRequestsPanel requests={data.customizationRequests} mode="owner" />
    ) : active === "appointments" ? (
      <div className="space-y-10">
        <OwnerAppointmentsPanel appointments={data.appointments} />
        <OwnerHomeVisitsPanel visits={data.homeVisits} />
      </div>
    ) : active === "orders" ? (
      <OrdersPanel orders={data.orders} />
    ) : active === "messages" ? (
      <MessagesPanel
        conversations={data.conversations}
        initialMessages={data.messagesByConversation}
      />
    ) : active === "quotations" ? (
      <OwnerQuotationsPanel orders={data.orders} quotations={data.quotations} />
    ) : active === "payments" ? (
      <OwnerPaymentsPanel payments={data.payments} />
    ) : active === "delivery" ? (
      <DeliveryTrackingPanel orders={data.orders} />
    ) : active === "reviews" ? (
      <OwnerReviewsPanel reviews={data.reviews} />
    ) : active === "portfolio" ? (
      <OwnerPortfolioPanel profile={data.publicProfile} boutiqueSlug={boutique?.slug} />
    ) : active === "customers" ? (
      <CustomersPanel customers={data.customers} />
    ) : active === "listings" ? (
      data.listing ? (
        <ListingsPanel listing={data.listing} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Products & Service Listings</h3>
          <p className="mt-4 text-sm text-foreground-muted">
            Listing settings appear once your boutique is verified.
          </p>
        </PremiumCard>
      )
    ) : active === "analytics" ? (
      data.analytics ? (
        <AnalyticsPanel analytics={data.analytics} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Analytics</h3>
          <p className="mt-4 text-sm text-foreground-muted">
            Analytics appear once your boutique is live and receiving customer activity.
          </p>
        </PremiumCard>
      )
    ) : active === "performance" ? (
      data.performance ? (
        <PerformancePanel performance={data.performance} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Performance Score</h3>
          <p className="mt-4 text-sm text-foreground-muted">
            Performance metrics build as you fulfill orders and collect reviews.
          </p>
        </PremiumCard>
      )
    ) : active === "staff" ? (
      boutique?.id ? (
        <StaffPanel
          boutiqueId={boutique.id}
          staff={data.staff}
          staffTableAvailable={data.staffTableAvailable}
        />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">Staff Management</h3>
          <p className="mt-4 text-sm text-foreground-muted">
            Staff management is available once your boutique is registered and verified.
          </p>
        </PremiumCard>
      )
    ) : (
      PANEL_STUBS[active]
    );

  return (
    <div className="mx-auto flex max-w-container flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="premium-surface-3d shrink-0 rounded-xl p-4 lg:w-64">
        <p className="mb-4 font-display text-sm font-semibold tracking-wide text-gold">BOUTIQUE DASHBOARD</p>
        <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors lg:text-sm",
                active === id ? "bg-cherry text-gold-light" : "text-foreground-muted hover:text-gold"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div key={active} className="min-w-0 flex-1">
        {panel}
      </div>
    </div>
  );
}
