import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FittingScheduleEmbed } from "@/components/appointments/fitting-schedule-embed";
import { resolveCalLinkForBoutique } from "@/lib/appointments/calcom";
import { getAppointmentIntegrationsEnv } from "@/lib/appointments/env";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import { getBoutiqueCustomizationRequestDetail } from "@/lib/customization/queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import { formatAppointmentWhen } from "@/lib/appointments/queries";
import { JoinLiveFittingButton } from "@/components/appointments/customer-appointments-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@faden/ui";

export const metadata = {
  title: "Schedule Video Measurement — Boutique Dashboard — FADEN",
  description: "Schedule a video measurement session with your customer.",
};

export const dynamic = "force-dynamic";

export default async function ScheduleVideoMeasurementPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ reschedule?: string }>;
}) {
  const { requestId } = await params;
  const { reschedule } = await searchParams;
  const isReschedule = reschedule === "1" || reschedule === "true";

  if (!isWebSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/requests/${requestId}/schedule-video`)}`);
  }

  const boutique = await getOwnerBoutique(supabase, user.id);
  if (!boutique?.id || boutique.status !== "verified") {
    redirect("/dashboard");
  }

  const request = await getBoutiqueCustomizationRequestDetail(supabase, boutique.id, requestId);
  if (!request) {
    notFound();
  }

  if (request.measurement_mode !== "video") {
    redirect(`/dashboard/requests/${requestId}`);
  }

  const { data: boutiqueCal } = await supabase
    .from("boutiques")
    .select("cal_username, cal_event_type_slug")
    .eq("id", boutique.id)
    .maybeSingle();

  const env = getAppointmentIntegrationsEnv();
  const calLink = resolveCalLinkForBoutique({
    calUsername: boutiqueCal?.cal_username,
    calEventTypeSlug: boutiqueCal?.cal_event_type_slug,
    defaultUsername: env.calcomDefaultUsername,
    defaultEventSlug: env.calcomDefaultEventSlug,
  });

  const backHref = `/dashboard/requests/${requestId}`;
  const rescheduleHref = `/dashboard/requests/${requestId}/schedule-video?reschedule=1`;
  const videoAppointment = request.video_appointment;

  if (videoAppointment && isReschedule) {
    return (
      <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href={backHref} className="text-sm text-gold hover:text-gold-light">
            ← Back to request
          </Link>
          <div className="mt-6">
            <FittingScheduleEmbed
              boutiqueId={boutique.id}
              boutiqueName={boutique.name}
              calLink={calLink}
              customizationRequestId={requestId}
              mode="owner"
              customerEmail={request.customer_email}
              customerName={request.customer_name}
              successRedirect={backHref}
              backHref={backHref}
              backLabel="Back to request"
              action="reschedule"
              appointmentId={videoAppointment.id}
              rescheduleCalBookingUid={videoAppointment.cal_booking_uid}
            />
          </div>
        </div>
      </div>
    );
  }

  if (videoAppointment) {
    return (
      <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href={backHref} className="text-sm text-gold hover:text-gold-light">
            ← Back to request
          </Link>
          <PremiumCard className="mt-6 space-y-4" hover={false}>
            <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO MEASUREMENT</p>
            <h1 className="font-display text-2xl font-semibold">Already scheduled</h1>
            <p className="text-sm text-foreground-muted">
              A video measurement is already booked for{" "}
              <span className="font-medium text-foreground">
                {request.customer_name ?? "this customer"}
              </span>
              .
            </p>
            <p className="text-sm text-foreground">
              {formatAppointmentWhen(
                videoAppointment.scheduled_start,
                videoAppointment.scheduled_end,
              )}
            </p>
            <p className="text-xs capitalize text-foreground-muted">
              Status: {videoAppointment.status}
            </p>
            {videoAppointment.daily_room_url && (
              <div className="mt-4">
                <JoinLiveFittingButton appointment={videoAppointment} />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {videoAppointment.cal_booking_uid && (
                <Button asChild variant="luxury">
                  <Link href={rescheduleHref}>Reschedule meeting</Link>
                </Button>
              )}
              <Button asChild variant="luxury-outline">
                <Link href={backHref}>Back to request details</Link>
              </Button>
            </div>
          </PremiumCard>
        </div>
      </div>
    );
  }

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href={backHref} className="text-sm text-gold hover:text-gold-light">
          ← Back to request
        </Link>
        <div className="mt-6">
          <FittingScheduleEmbed
            boutiqueId={boutique.id}
            boutiqueName={boutique.name}
            calLink={calLink}
            customizationRequestId={requestId}
            mode="owner"
            customerEmail={request.customer_email}
            customerName={request.customer_name}
            successRedirect={backHref}
            backHref={backHref}
            backLabel="Back to request"
          />
        </div>
      </div>
    </div>
  );
}
