"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Mail, MessageSquare, Phone, User, Video } from "lucide-react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import { ReferenceImageGallery } from "@/components/dashboard/reference-image-gallery";
import { updateCustomizationStatus } from "@/actions/operations";
import type { CustomizationRequestDetail } from "@/lib/customization/queries";
import {
  formatOptionalDate,
  labelAssistantGender,
  labelFabricSource,
  labelMeasurementMode,
  labelOutfitAudience,
  labelRequestStatus,
  splitLinks,
} from "@/lib/customization/format-request-detail";
import {
  EMPTY_SELF_MEASUREMENTS,
} from "@/data/measurement-fields";
import { MeasurementGrid } from "@/components/measurement/measurement-grid";
import { CustomerSaveMeasurementsCard } from "@/components/account/customer-save-measurements-card";
import { resolveRequestMeasurements } from "@/lib/customization/resolve-request-measurements";
import { formatHomeVisitWhen } from "@/lib/home-visits/queries";
import { Home } from "lucide-react";
import { orderStatusLabel } from "@/lib/order/status";
import { formatDateOnly } from "@/lib/datetime/format";
import { formatAppointmentWhen } from "@/lib/appointments/queries";
import { JoinLiveFittingButton } from "@/components/appointments/customer-appointments-panel";
import { OwnerHomeVisitActions } from "@/components/home-visits/owner-home-visit-actions";
import { OwnerRequestMeasurementCapture } from "@/components/measurement/owner-request-measurement-capture";

const STATUS_OPTIONS = [
  { value: "quoted", label: "Mark quoted" },
  { value: "accepted", label: "Mark accepted" },
  { value: "in_production", label: "In production" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

interface CustomizationRequestDetailViewProps {
  request: CustomizationRequestDetail;
  mode?: "owner" | "customer";
  boutiqueId?: string;
  staff?: import("@/lib/dashboard/boutique-staff").OwnerStaffMember[];
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PremiumCard hover={false}>
      <h2 className="font-display text-lg font-semibold text-gold">{title}</h2>
      <div className="mt-4">{children}</div>
    </PremiumCard>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function DesignBlock({
  title,
  text,
  images,
}: {
  title: string;
  text?: string;
  images?: string[];
}) {
  if (!text?.trim() && !images?.length) return null;
  return (
    <div className="border-b border-border/60 py-4 last:border-0">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {text?.trim() && <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">{text}</p>}
      {images && images.length > 0 && (
        <div className="mt-3">
          <ReferenceImageGallery images={images} />
        </div>
      )}
    </div>
  );
}

export function CustomizationRequestDetailView({
  request,
  mode = "owner",
  boutiqueId,
  staff = [],
}: CustomizationRequestDetailViewProps) {
  const isCustomer = mode === "customer";
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const payload = request.form_payload;
  const selfMeasurements = { ...EMPTY_SELF_MEASUREMENTS, ...payload.selfMeasurements };
  const measurementUnit = payload.measurementUnit ?? "in";

  const generalInspirations = request.inspirations.filter((row) => row.notes !== "mix-outfit");
  const mixInspirations = request.inspirations.filter((row) => row.notes === "mix-outfit");
  const mixLinksFromPayload = splitLinks(payload.mixOutfitLinks);
  const resolvedMeasurements = resolveRequestMeasurements(request);
  const defaultSaveLabel = request.outfit_type
    ? `${request.outfit_type} sizes`
    : "My outfit sizes";

  function handleStatusUpdate(next: (typeof STATUS_OPTIONS)[number]["value"]) {
    setError(null);
    startTransition(async () => {
      const result = await updateCustomizationStatus({ requestId: request.id, status: next });
      if (!result.ok) {
        setError(result.error ?? "Update failed");
        return;
      }
      setStatus(next);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <PremiumCard hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Customization request</p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
                {request.outfit_type ?? "Custom outfit"}
              </h1>
              {request.outfit_description && (
                <p className="mt-2 text-sm text-foreground-muted">{request.outfit_description}</p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold capitalize text-gold">
                {labelRequestStatus(status)}
              </span>
              <p className="mt-2 text-xs text-foreground-muted">
                Ref {request.id.slice(0, 8).toUpperCase()}
              </p>
              <PostedAt value={request.created_at} prefix="Submitted" className="mt-1 text-right text-xs text-foreground-muted" />
            </div>
          </div>
        </PremiumCard>

        <DetailSection title={isCustomer ? "Boutique" : "Customer"}>
          <dl>
            {isCustomer ? (
              <>
                <DetailRow
                  label="Boutique"
                  value={
                    request.boutique_slug && request.boutique_name ? (
                      <Link href={`/boutique/${request.boutique_slug}`} className="text-gold hover:text-gold-light">
                        {request.boutique_name}
                      </Link>
                    ) : (
                      request.boutique_name ?? "Assigned boutique"
                    )
                  }
                />
              </>
            ) : (
              <>
                <DetailRow
                  label="Name"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4 text-gold/70" aria-hidden />
                      {request.customer_name || "Customer"}
                    </span>
                  }
                />
                {request.customer_email && (
                  <DetailRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${request.customer_email}`}
                        className="inline-flex items-center gap-2 text-gold hover:text-gold-light"
                      >
                        <Mail className="h-4 w-4" aria-hidden />
                        {request.customer_email}
                      </a>
                    }
                  />
                )}
                {request.customer_phone && (
                  <DetailRow
                    label="Phone"
                    value={
                      <a
                        href={`tel:${request.customer_phone}`}
                        className="inline-flex items-center gap-2 text-gold hover:text-gold-light"
                      >
                        <Phone className="h-4 w-4" aria-hidden />
                        {request.customer_phone}
                      </a>
                    }
                  />
                )}
              </>
            )}
          </dl>
        </DetailSection>

        <DetailSection title="Outfit & occasion">
          <dl>
            <DetailRow
              label="For"
              value={labelOutfitAudience(request.outfit_audience ?? payload.outfitAudience)}
            />
            <DetailRow label="Outfit type" value={request.outfit_type} />
            <DetailRow label="Description" value={request.outfit_description} />
            <DetailRow label="Occasion" value={request.occasion} />
            <DetailRow label="Budget" value={payload.budgetRange} />
            <DetailRow label="Delivery needed by" value={formatOptionalDate(request.delivery_date)} />
          </dl>
        </DetailSection>

        <DetailSection title="Inspiration & references">
          {generalInspirations.length > 0 && (
            <ul className="mb-4 space-y-2">
              {generalInspirations.map((row) =>
                row.url ? (
                  <li key={row.id}>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-light"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      {row.url}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          )}
          <DetailRow label="Sketch / style notes" value={payload.sketchNotes} />
          <DetailRow label="Mix-outfit notes" value={payload.mixOutfitNotes} />
          {(mixLinksFromPayload.length > 0 || mixInspirations.length > 0) && (
            <div className="border-b border-border/60 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">
                Mix-outfit links
              </p>
              <ul className="mt-2 space-y-2">
                {mixLinksFromPayload.map((url, index) => (
                  <li key={`mix-link-${index}`}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-light"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      {url}
                    </a>
                  </li>
                ))}
                {mixInspirations.map((row) =>
                  row.url ? (
                    <li key={row.id}>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-light"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        {row.url}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}
          {payload.mixOutfitImages && payload.mixOutfitImages.length > 0 && (
            <div className="mt-4">
              <ReferenceImageGallery images={payload.mixOutfitImages} title="Mix-outfit photos" />
            </div>
          )}
          {!generalInspirations.length &&
            !payload.sketchNotes &&
            !payload.mixOutfitNotes &&
            !mixLinksFromPayload.length &&
            !mixInspirations.length &&
            !payload.mixOutfitImages?.length && (
              <p className="text-sm text-foreground-muted">No inspiration references provided.</p>
            )}
        </DetailSection>

        <DetailSection title="Fabric & color">
          <dl>
            <DetailRow label="Fabric source" value={labelFabricSource(request.fabric_source)} />
            <DetailRow label="Fabric types" value={payload.fabricTypes} />
            <DetailRow label="Colors" value={payload.fabricColors} />
            <DetailRow label="Number of colors" value={payload.colorCount} />
          </dl>
        </DetailSection>

        <DetailSection title="Measurements">
          <dl className="mb-4">
            <DetailRow label="Measurement method" value={labelMeasurementMode(request.measurement_mode)} />
            <DetailRow
              label="Preferred assistant"
              value={labelAssistantGender(payload.measurementAssistantGender)}
            />
            <DetailRow label="Home visit notes" value={payload.homeVisitNotes} />
            <DetailRow label="Visit area" value={payload.homeVisitLocationLabel} />
            {(payload.homeVisitLat != null && payload.homeVisitLng != null) ||
            (request.home_visit?.visitLatitude != null && request.home_visit?.visitLongitude != null) ? (
              <DetailRow
                label="Map pin"
                value={
                  <a
                    href={`https://www.google.com/maps?q=${request.home_visit?.visitLatitude ?? payload.homeVisitLat},${request.home_visit?.visitLongitude ?? payload.homeVisitLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-light"
                  >
                    Open in Google Maps
                  </a>
                }
              />
            ) : null}
            <DetailRow
              label="Video session"
              value={
                payload.videoSessionDate
                  ? [
                      formatDateOnly(payload.videoSessionDate),
                      payload.videoSessionTime,
                    ]
                      .filter(Boolean)
                      .join(" at ")
                  : null
              }
            />
            <DetailRow label="Video session notes" value={payload.videoSessionNotes} />
            <DetailRow label="Additional measurement notes" value={payload.measurements} />
          </dl>
          {request.measurement_mode === "self" &&
            (isCustomer && resolvedMeasurements ? (
              <CustomerSaveMeasurementsCard
                measurements={resolvedMeasurements}
                outfitType={request.outfit_type}
                outfitAudience={request.outfit_audience}
                defaultLabel={defaultSaveLabel}
              />
            ) : (
              <MeasurementGrid values={selfMeasurements} unit={measurementUnit} />
            ))}
          {request.measurement_mode === "video" && (
            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
              <div className="flex items-start gap-3">
                <Video className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {isCustomer ? "Video measurement session" : "Video measurement requested"}
                  </p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {isCustomer
                      ? "Join your scheduled video fitting. Size details appear here once recorded by the boutique."
                      : "The customer chose a live video session for measurements. Schedule a Cal.com slot — they join via the Cal.com video link on their account."}
                  </p>
                  {request.video_appointment ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-foreground">
                        Scheduled:{" "}
                        {formatAppointmentWhen(
                          request.video_appointment.scheduled_start,
                          request.video_appointment.scheduled_end,
                        )}
                      </p>
                      {request.video_appointment.daily_room_url && (
                        <JoinLiveFittingButton appointment={request.video_appointment} />
                      )}
                      {!isCustomer && request.video_appointment.cal_booking_uid && (
                        <Button asChild variant="luxury-outline" size="sm">
                          <Link href={`/dashboard/requests/${request.id}/schedule-video?reschedule=1`}>
                            Reschedule meeting
                          </Link>
                        </Button>
                      )}
                      {isCustomer && (
                        <Button asChild variant="luxury-outline" size="sm">
                          <Link href="/account/appointments">All fittings & visits</Link>
                        </Button>
                      )}
                    </div>
                  ) : isCustomer ? (
                    <Button asChild variant="luxury" size="sm" className="mt-3">
                      <Link href="/account/appointments">Book or view video fitting</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="luxury" size="sm" className="mt-3">
                      <Link href={`/dashboard/requests/${request.id}/schedule-video`}>
                        Schedule video measurement
                      </Link>
                    </Button>
                  )}
                  {!isCustomer && boutiqueId && (
                    <OwnerRequestMeasurementCapture
                      boutiqueId={boutiqueId}
                      requestId={request.id}
                      initialValues={selfMeasurements}
                      initialUnit={measurementUnit}
                      title="Record measurements after video session"
                    />
                  )}
                </div>
              </div>
              {isCustomer && resolvedMeasurements && (
                <CustomerSaveMeasurementsCard
                  measurements={resolvedMeasurements}
                  outfitType={request.outfit_type}
                  outfitAudience={request.outfit_audience}
                  defaultLabel={defaultSaveLabel}
                />
              )}
            </div>
          )}
          {request.measurement_mode === "home" && request.home_visit && !isCustomer && boutiqueId && (
            <OwnerHomeVisitActions
              visit={request.home_visit}
              boutiqueId={boutiqueId}
              staff={staff}
            />
          )}
          {request.measurement_mode === "home" && request.home_visit && isCustomer && (
            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">Home measurement visit</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {formatHomeVisitWhen(
                      request.home_visit.confirmedStart ?? request.home_visit.requestedStart,
                      request.home_visit.confirmedEnd ?? request.home_visit.requestedEnd,
                    )}
                  </p>
                  <p className="mt-1 text-xs capitalize text-gold/90">Status: {request.home_visit.status}</p>
                  {request.home_visit.assignedStaffName && (
                    <p className="mt-1 text-sm text-foreground-muted">
                      Assigned: {request.home_visit.assignedStaffName}
                    </p>
                  )}
                </div>
              </div>
              {resolvedMeasurements ? (
                <CustomerSaveMeasurementsCard
                  measurements={resolvedMeasurements}
                  outfitType={request.outfit_type}
                  outfitAudience={request.outfit_audience}
                  defaultLabel={defaultSaveLabel}
                />
              ) : (
                <p className="mt-3 text-sm text-foreground-muted">
                  Size details will appear here after your home visit is completed.
                </p>
              )}
            </div>
          )}
          {request.measurement_mode === "home" && !request.home_visit && (
            <p className="mt-4 text-sm text-foreground-muted">
              {isCustomer
                ? "Your home visit request is being processed by the boutique."
                : "Home visit booking will appear here once the customer submits their preferred slot."}
            </p>
          )}
        </DetailSection>

        <DetailSection title="Design details">
          <DesignBlock title="Neck design" text={payload.neckDesign} images={payload.neckDesignImages} />
          <DesignBlock title="Sleeve design" text={payload.sleeveDesign} images={payload.sleeveDesignImages} />
          <DesignBlock title="Back design" text={payload.backDesign} images={payload.backDesignImages} />
          <DesignBlock
            title="Embroidery"
            text={payload.embroideryDetails}
            images={payload.embroideryDetailImages}
          />
          <DesignBlock
            title="Special requests"
            text={payload.specialRequests}
            images={payload.specialRequestImages}
          />
          {!payload.neckDesign &&
            !payload.sleeveDesign &&
            !payload.backDesign &&
            !payload.embroideryDetails &&
            !payload.specialRequests &&
            !payload.neckDesignImages?.length &&
            !payload.sleeveDesignImages?.length &&
            !payload.backDesignImages?.length &&
            !payload.embroideryDetailImages?.length &&
            !payload.specialRequestImages?.length && (
              <p className="text-sm text-foreground-muted">No design details provided.</p>
            )}
        </DetailSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <PremiumCard hover={false}>
          <h2 className="font-display text-sm font-semibold text-gold">Actions</h2>
          <div className="mt-4 space-y-2">
            {isCustomer ? (
              <>
                <Button asChild variant="luxury" className="w-full">
                  <Link href="/account/messages">
                    <MessageSquare className="mr-2 h-4 w-4" aria-hidden />
                    Message boutique
                  </Link>
                </Button>
                <Button asChild variant="luxury-outline" className="w-full">
                  <Link href="/account/quotations">View quotations</Link>
                </Button>
                {request.linked_order_id && (
                  <Button asChild variant="luxury-outline" className="w-full">
                    <Link href="/account/orders">View order</Link>
                  </Button>
                )}
                <Button asChild variant="luxury-outline" className="w-full">
                  <Link href="/account/appointments">Fittings & visits</Link>
                </Button>
                <Button asChild variant="luxury-outline" className="w-full">
                  <Link href="/account/sizes">Saved sizes</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="luxury" className="w-full">
                  <Link href="/dashboard?panel=messages">
                    <MessageSquare className="mr-2 h-4 w-4" aria-hidden />
                    Message customer
                  </Link>
                </Button>
                <Button asChild variant="luxury-outline" className="w-full">
                  <Link href="/dashboard?panel=quotations">Create quotation</Link>
                </Button>
                {request.linked_order_id && (
                  <Button asChild variant="luxury-outline" className="w-full">
                    <Link href="/dashboard?panel=orders">View linked order</Link>
                  </Button>
                )}
                {request.measurement_mode === "video" && !request.video_appointment && (
                  <Button asChild variant="luxury" className="w-full">
                    <Link href={`/dashboard/requests/${request.id}/schedule-video`}>
                      <Video className="mr-2 h-4 w-4" aria-hidden />
                      Schedule video measurement
                    </Link>
                  </Button>
                )}
                {request.video_appointment && (
                  <>
                    {request.video_appointment.daily_room_url && (
                      <JoinLiveFittingButton
                        appointment={request.video_appointment}
                        className="w-full"
                      />
                    )}
                    {request.video_appointment.cal_booking_uid && (
                      <Button asChild variant="luxury" className="w-full">
                        <Link href={`/dashboard/requests/${request.id}/schedule-video?reschedule=1`}>
                          Reschedule meeting
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="luxury-outline" className="w-full">
                      <Link href={`/dashboard/requests/${request.id}/schedule-video`}>
                        View video appointment
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
          {request.linked_order_id && (
            <p className="mt-4 text-xs text-foreground-muted">
              Order status:{" "}
              <span className="font-medium capitalize text-foreground">
                {orderStatusLabel(request.linked_order_status ?? "draft")}
              </span>
            </p>
          )}
        </PremiumCard>

        {!isCustomer && status === "submitted" && (
          <PremiumCard hover={false}>
            <h2 className="font-display text-sm font-semibold text-gold">Update status</h2>
            {error && (
              <p className="mt-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="luxury-outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleStatusUpdate(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PremiumCard>
        )}
      </aside>
    </div>
  );
}
