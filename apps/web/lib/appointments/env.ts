export interface AppointmentIntegrationsEnv {
  calcomApiKey: string;
  calcomWebhookSecret: string;
  calcomDefaultUsername: string;
  calcomDefaultEventSlug: string;
  dailyApiKey: string;
  dailyDomain: string;
}

export function getAppointmentIntegrationsEnv(): AppointmentIntegrationsEnv {
  const defaultUsername =
    process.env.NEXT_PUBLIC_CALCOM_USERNAME ??
    process.env.CALCOM_DEFAULT_USERNAME ??
    process.env.NEXT_PUBLIC_CALCOM_NAMESPACE ??
    "";
  const eventSlug =
    process.env.NEXT_PUBLIC_CALCOM_EVENT_SLUG ??
    process.env.CALCOM_DEFAULT_EVENT_SLUG ??
    "video-measurement";

  return {
    calcomApiKey: process.env.CALCOM_API_KEY ?? "",
    calcomWebhookSecret: process.env.CALCOM_WEBHOOK_SECRET ?? "",
    calcomDefaultUsername: defaultUsername,
    calcomDefaultEventSlug: eventSlug,
    dailyApiKey: process.env.DAILY_API_KEY ?? "",
    dailyDomain: process.env.DAILY_DOMAIN ?? "faden.daily.co",
  };
}

export function isCalcomConfigured(): boolean {
  return Boolean(getAppointmentIntegrationsEnv().calcomApiKey);
}

export function isDailyConfigured(): boolean {
  return Boolean(getAppointmentIntegrationsEnv().dailyApiKey);
}
