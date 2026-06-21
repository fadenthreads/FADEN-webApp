import { getEmailEnv } from "@/lib/email/env";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { resendApiKey, fromAddress } = getEmailEnv();

  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY is not set — skipping send:", input.subject);
    return { ok: false, error: "Email is not configured" };
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: body || `Resend error (${response.status})` };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}
