import type { BoutiqueRegistrationInput } from "@faden/validators";
import { FADEN_CONTACT } from "@/lib/content/faden-contact";
import { getEmailEnv, isEmailConfigured } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/send";

export const ADMIN_NOTIFY_EMAIL = FADEN_CONTACT.primaryEmail;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function adminEmailShell(title: string, bodyHtml: string): string {
  const { appBaseUrl } = getEmailEnv();
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #161d6e; max-width: 560px;">
      <p style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #C5A059; margin: 0 0 12px;">FADEN Admin</p>
      <h1 style="font-size: 22px; margin: 0 0 16px;">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 13px; color: #666;">
        <a href="${escapeHtml(appBaseUrl)}/dashboard" style="color: #161d6e;">Open FADEN dashboard</a>
      </p>
    </div>
  `;
}

function detailRow(label: string, value: string): string {
  return `<p style="margin: 0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export async function sendBoutiqueRegistrationAdminEmail(options: {
  boutiqueName: string;
  boutiqueSlug: string;
  boutiqueId: string;
  ownerUserId: string;
  details: BoutiqueRegistrationInput;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const { details } = options;
  const html = adminEmailShell(
    "New boutique registration",
    `
      <p style="margin: 0 0 16px; line-height: 1.5;">A boutique owner submitted a new registration for admin verification.</p>
      ${detailRow("Boutique", details.name)}
      ${detailRow("Slug", options.boutiqueSlug)}
      ${detailRow("Owner", details.ownerName)}
      ${detailRow("Phone", details.phone)}
      ${detailRow("Email", details.email)}
      ${detailRow("Address", details.address)}
      ${detailRow("Outfit types", details.outfitTypes)}
      ${detailRow("Services", details.servicesOffered)}
      ${detailRow("Boutique ID", options.boutiqueId)}
      ${detailRow("Owner user ID", options.ownerUserId)}
    `,
  );

  const result = await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `[FADEN] New boutique registration — ${details.name}`,
    html,
    text: `New boutique registration: ${details.name} (${options.boutiqueSlug}). Owner: ${details.ownerName}, ${details.phone}, ${details.email}`,
  });

  if (!result.ok) {
    console.warn("[email] boutique registration admin notify failed:", result.error);
  }
}

export async function sendBoutiqueModificationAdminEmail(options: {
  requestId: string;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerNotes: string | null;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const html = adminEmailShell(
    "Boutique modification request",
    `
      <p style="margin: 0 0 16px; line-height: 1.5;">A verified boutique owner submitted profile changes for admin review.</p>
      ${detailRow("Boutique", options.boutiqueName)}
      ${detailRow("Slug", options.boutiqueSlug)}
      ${detailRow("Owner", options.ownerName)}
      ${options.ownerEmail ? detailRow("Owner email", options.ownerEmail) : ""}
      ${options.ownerNotes ? detailRow("Owner note", options.ownerNotes) : ""}
      ${detailRow("Request ID", options.requestId)}
      ${detailRow("Boutique ID", options.boutiqueId)}
    `,
  );

  const result = await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `[FADEN] Boutique modification request — ${options.boutiqueName}`,
    html,
    text: `Boutique modification request for ${options.boutiqueName} (${options.boutiqueSlug}). Request ID: ${options.requestId}`,
  });

  if (!result.ok) {
    console.warn("[email] boutique modification admin notify failed:", result.error);
  }
}
