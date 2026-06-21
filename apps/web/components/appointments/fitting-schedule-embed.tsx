"use client";

import Cal, { getCalApi, type EmbedEvent } from "@calcom/embed-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { calcomPublicBookingUrl, buildCalcomRescheduleEmbedLink, calcomPublicRescheduleUrl } from "@/lib/appointments/calcom";

const CAL_EMBED_NAMESPACE = process.env.NEXT_PUBLIC_CALCOM_NAMESPACE?.trim() || "";

type CalEmbedConfig = {
  layout?: "month_view" | "week_view" | "column_view";
  name?: string;
  email?: string;
  metadata?: Record<string, string>;
};

interface CalBookingDetail {
  uid?: string;
  bookingId?: string | number;
  startTime?: string;
  endTime?: string;
  eventTypeId?: number;
  attendees?: { email?: string; name?: string }[];
}

function extractCalBookingDetail(event: unknown): CalBookingDetail | null {
  if (!event || typeof event !== "object") return null;
  const root = event as Record<string, unknown>;
  const detail = (root.detail ?? root.data ?? root) as Record<string, unknown>;
  const data = (detail.data ?? detail) as CalBookingDetail;
  if (!data.startTime && !data.uid) return null;
  return data;
}

export interface FittingScheduleEmbedProps {
  boutiqueId: string;
  boutiqueName: string;
  calLink: string;
  customizationRequestId?: string;
  mode?: "customer" | "owner";
  customerEmail?: string | null;
  customerName?: string | null;
  successRedirect?: string;
  backHref?: string;
  backLabel?: string;
  action?: "book" | "reschedule";
  appointmentId?: string;
  rescheduleCalBookingUid?: string | null;
}

export function FittingScheduleEmbed({
  boutiqueId,
  boutiqueName,
  calLink,
  customizationRequestId,
  mode = "customer",
  customerEmail,
  customerName,
  successRedirect,
  backHref,
  backLabel,
  action = "book",
  appointmentId,
  rescheduleCalBookingUid,
}: FittingScheduleEmbedProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [embedReady, setEmbedReady] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const redirectPath =
    successRedirect ?? (mode === "owner" ? "/dashboard?panel=customization" : "/account/appointments");
  const isReschedule = action === "reschedule";
  const normalizedCalLink = isReschedule && rescheduleCalBookingUid
    ? buildCalcomRescheduleEmbedLink(rescheduleCalBookingUid)
    : calLink.trim();
  const publicCalUrl = isReschedule && rescheduleCalBookingUid
    ? calcomPublicRescheduleUrl(rescheduleCalBookingUid)
    : calcomPublicBookingUrl(calLink);

  const embedConfig = useMemo((): CalEmbedConfig => {
    const config: CalEmbedConfig = {
      layout: "month_view",
      metadata: {
        boutiqueId,
        ...(customizationRequestId ? { customizationRequestId } : {}),
      },
    };

    if (mode === "owner" && customerName) {
      config.name = customerName;
    } else if (mode === "customer") {
      config.name = boutiqueName;
    }

    if (customerEmail) {
      config.email = customerEmail;
    }

    return config;
  }, [boutiqueId, boutiqueName, customizationRequestId, customerEmail, customerName, mode]);

  useEffect(() => {
    if (!normalizedCalLink) {
      setError("Cal.com calendar link is not configured.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function setupCalListeners() {
      try {
        const cal = await getCalApi(
          CAL_EMBED_NAMESPACE ? { namespace: CAL_EMBED_NAMESPACE } : {},
        );
        if (cancelled) return;

        const handleBookingSuccess = async (
          event: EmbedEvent<
            "bookingSuccessful" | "bookingSuccessfulV2" | "rescheduleBookingSuccessfulV2"
          >,
        ) => {
          const detail = extractCalBookingDetail(event);
          if (!detail?.startTime || !detail.endTime) {
            setError(
              isReschedule
                ? "Reschedule succeeded but time details were missing. Check the appointments list."
                : "Booking succeeded but time details were missing. Check the appointments list.",
            );
            return;
          }

          setBooking(true);
          setError(null);

          try {
            const endpoint = isReschedule ? "/api/appointments/reschedule" : "/api/appointments/book";
            const payload = isReschedule
              ? {
                  appointmentId,
                  calBookingUid: detail.uid,
                  calBookingId: detail.bookingId,
                  scheduledStart: detail.startTime,
                  scheduledEnd: detail.endTime,
                  customerEmail: customerEmail ?? detail.attendees?.[0]?.email,
                  customerName: customerName ?? detail.attendees?.[0]?.name,
                  source: "owner_rescheduled" as const,
                }
              : {
                  boutiqueId,
                  calBookingUid: detail.uid,
                  calBookingId: detail.bookingId,
                  scheduledStart: detail.startTime,
                  scheduledEnd: detail.endTime,
                  customizationRequestId,
                  customerEmail: customerEmail ?? detail.attendees?.[0]?.email,
                  customerName: customerName ?? detail.attendees?.[0]?.name,
                  source: mode === "owner" ? "owner_scheduled" : "cal_embed",
                };

            const response = await fetch(endpoint, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const json = (await response.json()) as { ok?: boolean; error?: string };

            if (!response.ok || !json.ok) {
              throw new Error(json.error ?? (isReschedule ? "Could not finalize reschedule" : "Could not finalize booking"));
            }

            setSuccess(
              isReschedule
                ? "Video measurement rescheduled. You and the customer will receive an updated confirmation email."
                : mode === "owner"
                  ? "Video measurement scheduled. You and the customer will receive a confirmation email with the join link."
                  : "Your video fitting is confirmed. Check your email and account for the join link.",
            );
            setTimeout(() => router.push(redirectPath), 1800);
          } catch (err) {
            setError(err instanceof Error ? err.message : isReschedule ? "Reschedule failed" : "Booking failed");
          } finally {
            setBooking(false);
          }
        };

        cal("on", {
          action: "linkFailed",
          callback: (event: EmbedEvent<"linkFailed">) => {
            const message = event.detail?.data?.msg;
            if (!cancelled && message) {
              setError(`Cal.com could not load this calendar: ${message}`);
            }
          },
        });

        cal("on", {
          action: "bookingSuccessful",
          callback: handleBookingSuccess,
        });

        cal("on", {
          action: "bookingSuccessfulV2",
          callback: handleBookingSuccess,
        });

        cal("on", {
          action: "rescheduleBookingSuccessfulV2",
          callback: handleBookingSuccess,
        });

        cal("on", {
          action: "rescheduleBookingSuccessful",
          callback: handleBookingSuccess,
        });

        cal("on", {
          action: "__iframeReady",
          callback: () => {
            if (!cancelled) {
              setEmbedReady(true);
              setLoading(false);
            }
          },
        });

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load scheduler");
          setLoading(false);
        }
      }
    }

    void setupCalListeners();

    return () => {
      cancelled = true;
    };
  }, [
    appointmentId,
    action,
    boutiqueId,
    customerEmail,
    customerName,
    customizationRequestId,
    isReschedule,
    mode,
    normalizedCalLink,
    redirectPath,
    rescheduleCalBookingUid,
    router,
  ]);

  if (isReschedule && (!appointmentId || !rescheduleCalBookingUid)) {
    return (
      <PremiumCard className="space-y-4" hover={false}>
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          This appointment cannot be rescheduled because the Cal.com booking reference is missing.
        </p>
      </PremiumCard>
    );
  }

  if (!normalizedCalLink) {
    return (
      <PremiumCard className="space-y-4" hover={false}>
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Cal.com is not configured. Set NEXT_PUBLIC_CALCOM_NAMESPACE and NEXT_PUBLIC_CALCOM_EVENT_SLUG,
          then restart the dev server.
        </p>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="space-y-4" hover={false}>
      <div>
        <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO MEASUREMENT</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          {isReschedule
            ? `Reschedule with ${customerName ?? "customer"}`
            : mode === "owner"
              ? `Schedule with ${customerName ?? "customer"}`
              : boutiqueName}
        </h2>
        <p className="mt-2 text-sm text-foreground-muted">
          {isReschedule
            ? "Pick a new slot on your Cal.com calendar. The customer receives an updated confirmation email and join link."
            : mode === "owner"
              ? "Pick a slot on your Cal.com calendar. The customer receives the Cal.com video link on their FADEN account."
              : "Select an available slot below. When you confirm, your Cal.com video link is saved to your FADEN account."}
        </p>
        {mode === "owner" && customerEmail && (
          <p className="mt-2 text-xs text-foreground-muted">
            Customer email pre-filled: <span className="text-foreground">{customerEmail}</span>
          </p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-foreground-muted">
          {isReschedule ? "Loading reschedule calendar…" : "Loading availability…"}
        </p>
      )}
      {booking && (
        <p className="text-sm text-gold">
          {isReschedule ? "Saving your rescheduled appointment…" : "Saving your Cal.com appointment…"}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
          {success}
        </p>
      )}

      {!loading && !embedReady && !error && (
        <p className="text-sm text-foreground-muted">
          If the calendar does not appear within a few seconds, use the button below to open Cal.com directly.
        </p>
      )}

      <Cal
        {...(CAL_EMBED_NAMESPACE ? { namespace: CAL_EMBED_NAMESPACE } : {})}
        calLink={normalizedCalLink}
        config={embedConfig}
        style={{ width: "100%", height: "620px", minHeight: "620px", overflow: "auto" }}
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="luxury-outline">
          <a href={publicCalUrl} target="_blank" rel="noopener noreferrer">
            {isReschedule ? "Open reschedule on Cal.com" : "Open calendar on Cal.com"}
          </a>
        </Button>
        {backHref && (
          <Button asChild variant="luxury-outline">
            <Link href={backHref}>{backLabel ?? "Back"}</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="luxury-outline"
          onClick={() => router.push(mode === "owner" ? "/dashboard?panel=customization" : "/account/appointments")}
        >
          {mode === "owner" ? "Back to dashboard" : "View my appointments"}
        </Button>
      </div>
    </PremiumCard>
  );
}
