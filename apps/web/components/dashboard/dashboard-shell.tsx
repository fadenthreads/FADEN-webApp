"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  Scissors,
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
import { OwnerAlterationsPanel } from "@/components/alterations/owner-alterations-panel";
import type { AlterationRequestSummary } from "@/lib/alterations/queries";
import type { OwnerListingSettings } from "@/lib/dashboard/boutique-listings";
import type {
  OwnerAnalyticsSnapshot,
  OwnerCustomerRecord,
  OwnerPerformanceSnapshot,
} from "@/lib/dashboard/owner-insights";

const NAV = [
  { id: "overview", icon: LayoutDashboard },
  { id: "orders", icon: Package },
  { id: "customization", icon: Palette },
  { id: "appointments", icon: Video },
  { id: "alterations", icon: Scissors },
  { id: "customers", icon: Users },
  { id: "portfolio", icon: ClipboardList },
  { id: "listings", icon: Settings },
  { id: "messages", icon: MessageSquare },
  { id: "quotations", icon: CreditCard },
  { id: "reviews", icon: Star },
  { id: "analytics", icon: BarChart3 },
  { id: "payments", icon: CreditCard },
  { id: "delivery", icon: Truck },
  { id: "staff", icon: Users },
  { id: "marketing", icon: Megaphone },
  { id: "performance", icon: BarChart3 },
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
  alterationRequests: AlterationRequestSummary[];
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
  const t = useTranslations("Dashboard.overview");
  const tc = useTranslations("Common");
  const statusLabel = boutique?.status?.replace(/_/g, " ") ?? t("notRegistered");
  const overviewStats = stats
    ? [
        { label: t("newRequests"), value: String(stats.pendingRequests) },
        { label: t("pendingOrders"), value: String(stats.pendingOrders) },
        { label: t("conversations"), value: String(stats.messageCount) },
        { label: t("totalRequests"), value: String(stats.totalRequests) },
      ]
    : [
        { label: t("newRequests"), value: "—" },
        { label: t("pendingOrders"), value: "—" },
        { label: t("conversations"), value: "—" },
        { label: t("totalRequests"), value: "—" },
      ];

  return (
    <div className="space-y-6">
      {boutique ? (
        <PremiumCard hover={false} className="border-gold/30">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold">{t("yourBoutique")}</p>
          <h3 className="mt-2 font-display text-xl font-semibold">{boutique.name}</h3>
          <p className="mt-2 capitalize text-sm text-foreground-muted">
            {tc("status")}: {statusLabel}
          </p>
          {boutique.status === "verified" && (
            <Link
              href={`/boutique/${boutique.slug}`}
              className="mt-4 inline-block text-sm text-gold hover:text-gold-light"
            >
              {tc("viewPublicProfile")}
            </Link>
          )}
          {boutique.status === "pending_verification" && (
            <p className="mt-3 text-sm text-foreground-muted">{t("pendingVerification")}</p>
          )}
        </PremiumCard>
      ) : (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">
            {t("noBoutiqueLinked")}{" "}
            <Link href="/register-boutique" className="text-gold hover:text-gold-light">
              {t("registerBoutique")}
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
        <h3 className="font-semibold text-gold">{t("todaysSnapshot")}</h3>
        <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
          {stats ? (
            <>
              <li>• {t("awaitingReview", { count: stats.pendingRequests })}</li>
              <li>• {t("activeOrders", { count: stats.pendingOrders })}</li>
              <li>• {t("customerConversations", { count: stats.messageCount })}</li>
            </>
          ) : (
            <>
              <li>• {t("approveToStart")}</li>
              <li>• {t("ordersWhenLive")}</li>
            </>
          )}
        </ul>
      </PremiumCard>
    </div>
  );
}

function StubPanel({ title, items }: { title: string; items: string[] }) {
  const tc = useTranslations("Common");
  return (
    <PremiumCard hover={false}>
      <h3 className="font-display text-lg font-semibold text-gold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-foreground-muted/70">{tc("comingSoon")}</p>
    </PremiumCard>
  );
}

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
  const t = useTranslations("Dashboard");
  const tn = useTranslations("Dashboard.nav");
  const te = useTranslations("Dashboard.empty");

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
    ) : active === "alterations" ? (
      boutique?.id ? (
        <OwnerAlterationsPanel requests={data.alterationRequests} boutiqueId={boutique.id} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">{te("alterationsTitle")}</h3>
          <p className="mt-4 text-sm text-foreground-muted">{te("alterationsBody")}</p>
        </PremiumCard>
      )
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
          <h3 className="font-display text-lg font-semibold text-gold">{te("listingsTitle")}</h3>
          <p className="mt-4 text-sm text-foreground-muted">{te("listingsBody")}</p>
        </PremiumCard>
      )
    ) : active === "analytics" ? (
      data.analytics ? (
        <AnalyticsPanel analytics={data.analytics} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">{te("analyticsTitle")}</h3>
          <p className="mt-4 text-sm text-foreground-muted">{te("analyticsBody")}</p>
        </PremiumCard>
      )
    ) : active === "performance" ? (
      data.performance ? (
        <PerformancePanel performance={data.performance} />
      ) : (
        <PremiumCard hover={false}>
          <h3 className="font-display text-lg font-semibold text-gold">{te("performanceTitle")}</h3>
          <p className="mt-4 text-sm text-foreground-muted">{te("performanceBody")}</p>
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
          <h3 className="font-display text-lg font-semibold text-gold">{te("staffTitle")}</h3>
          <p className="mt-4 text-sm text-foreground-muted">{te("staffBody")}</p>
        </PremiumCard>
      )
    ) : (
      <StubPanel title={t("marketing.title")} items={[t("marketing.items")]} />
    );

  return (
    <div className="mx-auto flex max-w-container flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="premium-surface-3d shrink-0 rounded-xl p-4 lg:w-64">
        <p className="mb-4 font-display text-sm font-semibold tracking-wide text-gold">{t("title")}</p>
        <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {NAV.map(({ id, icon: Icon }) => (
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
              {tn(id)}
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
