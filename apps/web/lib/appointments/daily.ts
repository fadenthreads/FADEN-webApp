import { getAppointmentIntegrationsEnv, isDailyConfigured } from "@/lib/appointments/env";

export interface DailyRoomResult {
  name: string;
  url: string;
}

/**
 * Creates a private Daily.co room that expires after the fitting ends.
 * Daily REST API — POST https://api.daily.co/v1/rooms
 */
export async function createDailyFittingRoom(options: {
  appointmentId: string;
  scheduledEnd: Date;
}): Promise<DailyRoomResult> {
  const roomName = `faden-fitting-${options.appointmentId.replace(/-/g, "").slice(0, 20)}`;
  const exp = Math.floor(options.scheduledEnd.getTime() / 1000) + 15 * 60;

  if (!isDailyConfigured()) {
    const { dailyDomain } = getAppointmentIntegrationsEnv();
    return {
      name: roomName,
      url: `https://${dailyDomain}/${roomName}?dev=1`,
    };
  }

  const { dailyApiKey } = getAppointmentIntegrationsEnv();

  const response = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dailyApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        exp,
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        max_participants: 4,
      },
    }),
  });

  const json = (await response.json()) as { name?: string; url?: string; error?: string; info?: string };

  if (!response.ok) {
    throw new Error(json.error ?? json.info ?? "Failed to create Daily.co room");
  }

  if (!json.url || !json.name) {
    throw new Error("Daily.co did not return a room URL");
  }

  return { name: json.name, url: json.url };
}
