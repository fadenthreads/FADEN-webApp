import { redirect, notFound } from "next/navigation";
import { FittingScheduleEmbed } from "@/components/appointments/fitting-schedule-embed";
import { resolveCalLinkForBoutique } from "@/lib/appointments/calcom";
import { getAppointmentIntegrationsEnv } from "@/lib/appointments/env";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Schedule Video Fitting — FADEN",
  description: "Book a live video fitting with your boutique tailor.",
};

export const dynamic = "force-dynamic";

interface SchedulePageProps {
  searchParams: Promise<{
    boutique?: string;
    request?: string;
  }>;
}

export default async function ScheduleFittingPage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const boutiqueSlug = params.boutique?.trim();

  if (!boutiqueSlug) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/appointments/schedule?boutique=${boutiqueSlug}`)}`);
  }

  if (!isWebSupabaseConfigured()) {
    notFound();
  }

  const { data: boutique } = await supabase
    .from("boutiques")
    .select("id, name, slug, status, cal_username, cal_event_type_slug")
    .eq("slug", boutiqueSlug)
    .maybeSingle();

  if (!boutique || boutique.status !== "verified") {
    notFound();
  }

  const env = getAppointmentIntegrationsEnv();
  const calLink = resolveCalLinkForBoutique({
    calUsername: boutique.cal_username,
    calEventTypeSlug: boutique.cal_event_type_slug,
    defaultUsername: env.calcomDefaultUsername,
    defaultEventSlug: env.calcomDefaultEventSlug,
  });

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <FittingScheduleEmbed
          boutiqueId={boutique.id}
          boutiqueName={boutique.name}
          calLink={calLink}
          customizationRequestId={params.request}
        />
      </div>
    </div>
  );
}
