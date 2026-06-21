export interface EmailEnv {
  resendApiKey: string;
  fromAddress: string;
  appBaseUrl: string;
}

export function getEmailEnv(): EmailEnv {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    fromAddress: process.env.EMAIL_FROM ?? "FADEN <onboarding@resend.dev>",
    appBaseUrl,
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(getEmailEnv().resendApiKey);
}
