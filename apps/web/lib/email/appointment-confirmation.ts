import { formatAppointmentWhen } from "@/lib/appointments/queries";
import { getEmailEnv, isEmailConfigured } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AppointmentEmailContext {
  appointmentId: string;
  boutiqueName: string;
  scheduledStart: string;
  scheduledEnd: string;
  joinUrl: string | null;
  customerId: string;
  tailorId: string;
  customerEmail?: string | null;
  customerName?: string | null;
}

async function resolveProfile(
  userId: string,
): Promise<{ email: string | null; fullName: string | null }> {
  const admin = createAdminClient();
  if (!admin) {
    return { email: null, fullName: null };
  }

  const { data } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  return {
    email: (data?.email as string | undefined) ?? null,
    fullName: (data?.full_name as string | undefined) ?? null,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAppointmentEmailHtml(options: {
  title: string;
  greeting: string;
  intro: string;
  when: string;
  joinUrl: string | null;
  dashboardUrl: string;
  dashboardLabel: string;
}): string {
  const joinBlock = options.joinUrl
    ? `<p style="margin:24px 0;">
        <a href="${escapeHtml(options.joinUrl)}" style="display:inline-block;padding:12px 24px;background:#d4af37;color:#0a0a0a;text-decoration:none;border-radius:8px;font-weight:600;">
          Join video measurement
        </a>
      </p>
      <p style="font-size:13px;color:#666;">Or copy this link: ${escapeHtml(options.joinUrl)}</p>`
    : `<p style="font-size:14px;color:#666;">Your meeting link will appear in your FADEN dashboard shortly.</p>`;

  return `<!DOCTYPE html>
<html>
  <body style="font-family:Georgia,serif;background:#0a0a0a;color:#f5f5f5;padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
      <p style="letter-spacing:0.25em;font-size:11px;color:#d4af37;margin:0;">FADEN</p>
      <h1 style="font-size:24px;margin:16px 0 8px;">${escapeHtml(options.title)}</h1>
      <p style="font-size:15px;line-height:1.6;color:#a3a3a3;">${escapeHtml(options.greeting)}</p>
      <p style="font-size:15px;line-height:1.6;">${escapeHtml(options.intro)}</p>
      <p style="font-size:15px;margin:20px 0;"><strong>When:</strong> ${escapeHtml(options.when)}</p>
      ${joinBlock}
      <p style="margin-top:24px;">
        <a href="${escapeHtml(options.dashboardUrl)}" style="color:#d4af37;">${escapeHtml(options.dashboardLabel)}</a>
      </p>
    </div>
  </body>
</html>`;
}

export async function sendAppointmentConfirmationEmails(
  context: AppointmentEmailContext,
): Promise<void> {
  if (!isEmailConfigured()) return;

  const { appBaseUrl } = getEmailEnv();
  const when = formatAppointmentWhen(context.scheduledStart, context.scheduledEnd);

  const [customerProfile, ownerProfile] = await Promise.all([
    resolveProfile(context.customerId),
    resolveProfile(context.tailorId),
  ]);

  const customerEmail = context.customerEmail ?? customerProfile.email;
  const customerName = context.customerName ?? customerProfile.fullName ?? "Customer";
  const ownerEmail = ownerProfile.email;
  const ownerName = ownerProfile.fullName ?? "Boutique owner";

  const sends: Promise<{ ok: boolean }>[] = [];

  if (customerEmail) {
    sends.push(
      sendEmail({
        to: customerEmail,
        subject: `Video measurement with ${context.boutiqueName} — ${when}`,
        html: buildAppointmentEmailHtml({
          title: "Video measurement scheduled",
          greeting: `Hi ${customerName},`,
          intro: `Your video measurement with ${context.boutiqueName} is confirmed.`,
          when,
          joinUrl: context.joinUrl,
          dashboardUrl: `${appBaseUrl}/account/appointments`,
          dashboardLabel: "View in your FADEN account",
        }),
        text: `Hi ${customerName},\n\nYour video measurement with ${context.boutiqueName} is confirmed for ${when}.\n\nJoin: ${context.joinUrl ?? "See your FADEN account"}\n\nDashboard: ${appBaseUrl}/account/appointments`,
      }).then((result) => ({ ok: result.ok })),
    );
  }

  if (ownerEmail) {
    sends.push(
      sendEmail({
        to: ownerEmail,
        subject: `Video measurement with ${customerName} — ${when}`,
        html: buildAppointmentEmailHtml({
          title: "Video measurement scheduled",
          greeting: `Hi ${ownerName},`,
          intro: `You scheduled a video measurement with ${customerName} for ${context.boutiqueName}.`,
          when,
          joinUrl: context.joinUrl,
          dashboardUrl: `${appBaseUrl}/dashboard?panel=appointments`,
          dashboardLabel: "View in your boutique dashboard",
        }),
        text: `Hi ${ownerName},\n\nVideo measurement with ${customerName} for ${context.boutiqueName} on ${when}.\n\nJoin: ${context.joinUrl ?? "See your FADEN dashboard"}\n\nDashboard: ${appBaseUrl}/dashboard?panel=appointments`,
      }).then((result) => ({ ok: result.ok })),
    );
  }

  const results = await Promise.all(sends);
  const failed = results.filter((result) => !result.ok).length;
  if (failed > 0) {
    console.warn(`[email] ${failed} appointment confirmation email(s) failed to send`);
  }
}

export async function sendAppointmentRescheduledEmails(
  context: AppointmentEmailContext,
): Promise<void> {
  if (!isEmailConfigured()) return;

  const { appBaseUrl } = getEmailEnv();
  const when = formatAppointmentWhen(context.scheduledStart, context.scheduledEnd);

  const [customerProfile, ownerProfile] = await Promise.all([
    resolveProfile(context.customerId),
    resolveProfile(context.tailorId),
  ]);

  const customerEmail = context.customerEmail ?? customerProfile.email;
  const customerName = context.customerName ?? customerProfile.fullName ?? "Customer";
  const ownerEmail = ownerProfile.email;
  const ownerName = ownerProfile.fullName ?? "Boutique owner";

  const sends: Promise<{ ok: boolean }>[] = [];

  if (customerEmail) {
    sends.push(
      sendEmail({
        to: customerEmail,
        subject: `Video measurement rescheduled — ${context.boutiqueName} — ${when}`,
        html: buildAppointmentEmailHtml({
          title: "Video measurement rescheduled",
          greeting: `Hi ${customerName},`,
          intro: `Your video measurement with ${context.boutiqueName} has a new time.`,
          when,
          joinUrl: context.joinUrl,
          dashboardUrl: `${appBaseUrl}/account/appointments`,
          dashboardLabel: "View in your FADEN account",
        }),
        text: `Hi ${customerName},\n\nYour video measurement with ${context.boutiqueName} was rescheduled to ${when}.\n\nJoin: ${context.joinUrl ?? "See your FADEN account"}\n\nDashboard: ${appBaseUrl}/account/appointments`,
      }).then((result) => ({ ok: result.ok })),
    );
  }

  if (ownerEmail) {
    sends.push(
      sendEmail({
        to: ownerEmail,
        subject: `Video measurement rescheduled — ${customerName} — ${when}`,
        html: buildAppointmentEmailHtml({
          title: "Video measurement rescheduled",
          greeting: `Hi ${ownerName},`,
          intro: `The video measurement with ${customerName} for ${context.boutiqueName} was rescheduled.`,
          when,
          joinUrl: context.joinUrl,
          dashboardUrl: `${appBaseUrl}/dashboard?panel=appointments`,
          dashboardLabel: "View in your boutique dashboard",
        }),
        text: `Hi ${ownerName},\n\nVideo measurement with ${customerName} was rescheduled to ${when}.\n\nJoin: ${context.joinUrl ?? "See your FADEN dashboard"}\n\nDashboard: ${appBaseUrl}/dashboard?panel=appointments`,
      }).then((result) => ({ ok: result.ok })),
    );
  }

  const results = await Promise.all(sends);
  const failed = results.filter((result) => !result.ok).length;
  if (failed > 0) {
    console.warn(`[email] ${failed} appointment reschedule email(s) failed to send`);
  }
}
