import { getAppointmentIntegrationsEnv, isCalcomConfigured } from "@/lib/appointments/env";

/** Payload returned by Cal.com embed `bookingSuccessful` or webhook BOOKING_CREATED */
export interface CalcomBookingPayload {
  bookingId?: string | number;
  uid?: string;
  startTime?: string;
  endTime?: string;
  eventTypeId?: number;
  attendees?: { email?: string; name?: string }[];
}

export function normalizeCalcomBooking(payload: CalcomBookingPayload) {
  return {
    calBookingId: payload.bookingId != null ? String(payload.bookingId) : null,
    calBookingUid: payload.uid ?? null,
    scheduledStart: payload.startTime ?? null,
    scheduledEnd: payload.endTime ?? null,
  };
}

export interface CalcomBookingDetails {
  ok: boolean;
  start?: string;
  end?: string;
  meetingUrl?: string | null;
  location?: string | null;
  error?: string;
}

type CalcomBookingRecord = Record<string, unknown>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function isIntegrationPlaceholder(value: string): boolean {
  return value.startsWith("integrations:") || value === "Cal Video";
}

function readNestedString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

/** Pull a join URL from Cal.com booking payload (Cal Video, Meet, Zoom, etc.). */
export function extractCalcomMeetingUrl(data: CalcomBookingRecord, bookingUid: string): string {
  const metadata = (data.metadata ?? {}) as CalcomBookingRecord;
  const bookingFields = (data.bookingFieldsResponses ?? {}) as CalcomBookingRecord;
  const locationField = bookingFields.location;

  const candidates = [
    data.location,
    data.meetingUrl,
    metadata.videoCallUrl,
    metadata.meetingUrl,
    typeof locationField === "object" && locationField !== null
      ? (locationField as CalcomBookingRecord).value
      : locationField,
  ];

  for (const candidate of candidates) {
    const value = readNestedString(candidate);
    if (value && isHttpUrl(value)) return value;
  }

  return `https://cal.com/booking/${bookingUid}`;
}

async function fetchCalcomBookingRecord(uid: string): Promise<CalcomBookingRecord | null> {
  const { calcomApiKey } = getAppointmentIntegrationsEnv();

  const response = await fetch(`https://api.cal.com/v2/bookings/${encodeURIComponent(uid)}`, {
    headers: {
      Authorization: `Bearer ${calcomApiKey}`,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as { data?: CalcomBookingRecord };
  return json.data ?? null;
}

/**
 * Confirms a booking in Cal.com and returns the video meeting link from Cal
 * (Cal Video, Google Meet, Zoom, etc.). Retries briefly when Cal is still
 * generating the URL.
 */
export async function fetchCalcomBookingDetails(uid: string): Promise<CalcomBookingDetails> {
  if (!isCalcomConfigured()) {
    return {
      ok: true,
      meetingUrl: `https://cal.com/booking/${uid}`,
    };
  }

  try {
    let lastRecord: CalcomBookingRecord | null = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const record = await fetchCalcomBookingRecord(uid);
      if (!record) {
        return { ok: false, error: "Cal.com booking not found" };
      }

      lastRecord = record;
      const location = readNestedString(record.location);
      const metadata = (record.metadata ?? {}) as CalcomBookingRecord;
      const directCandidates = [
        record.location,
        record.meetingUrl,
        metadata.videoCallUrl,
        metadata.meetingUrl,
      ];

      const directUrl = directCandidates.find(
        (value): value is string => typeof value === "string" && isHttpUrl(value),
      );

      if (directUrl) {
        return {
          ok: true,
          start: readNestedString(record.start) ?? undefined,
          end: readNestedString(record.end) ?? undefined,
          meetingUrl: directUrl,
          location,
        };
      }

      const stillGenerating =
        location != null && isIntegrationPlaceholder(location);

      if (!stillGenerating && attempt > 0) {
        break;
      }

      if (attempt < 3) {
        await sleep(2000);
      }
    }

    if (!lastRecord) {
      return { ok: false, error: "Cal.com booking not found" };
    }

    return {
      ok: true,
      start: readNestedString(lastRecord.start) ?? undefined,
      end: readNestedString(lastRecord.end) ?? undefined,
      meetingUrl: extractCalcomMeetingUrl(lastRecord, uid),
      location: readNestedString(lastRecord.location),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Cal.com request failed",
    };
  }
}

/** @deprecated Use fetchCalcomBookingDetails */
export async function verifyCalcomBooking(uid: string): Promise<{
  ok: boolean;
  start?: string;
  end?: string;
  error?: string;
}> {
  const details = await fetchCalcomBookingDetails(uid);
  return {
    ok: details.ok,
    start: details.start,
    end: details.end,
    error: details.error,
  };
}

export function buildCalcomEmbedLink(calUsername: string, eventSlug: string): string {
  return `${calUsername}/${eventSlug}`;
}

export function resolveCalLinkForBoutique(options: {
  calUsername?: string | null;
  calEventTypeSlug?: string | null;
  defaultUsername: string;
  defaultEventSlug: string;
}): string {
  const username = options.calUsername || options.defaultUsername;
  const slug = options.calEventTypeSlug || options.defaultEventSlug;
  return buildCalcomEmbedLink(username, slug);
}

export function calcomBookingPageUrl(bookingUid: string): string {
  return `https://cal.com/booking/${bookingUid}`;
}

export function calcomPublicBookingUrl(calLink: string): string {
  const normalized = calLink.replace(/^\/+/, "");
  return `https://cal.com/${normalized}`;
}

export function buildCalcomRescheduleEmbedLink(bookingUid: string): string {
  return `reschedule/${bookingUid.replace(/^\/+/, "")}`;
}

export function calcomPublicRescheduleUrl(bookingUid: string): string {
  return calcomPublicBookingUrl(buildCalcomRescheduleEmbedLink(bookingUid));
}
