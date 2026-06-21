import {
  EMPTY_SELF_MEASUREMENTS,
  hasAnySelfMeasurement,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";
import type { CustomizationRequestDetail } from "@/lib/customization/queries";

export interface ResolvedRequestMeasurements {
  values: SelfMeasurements;
  unit: MeasurementUnit;
  sourceLabel: string;
  canSave: boolean;
}

export function resolveRequestMeasurements(
  request: CustomizationRequestDetail,
): ResolvedRequestMeasurements | null {
  const payload = request.form_payload;
  const unit: MeasurementUnit =
    request.home_visit?.measurementUnit ?? payload.measurementUnit ?? "in";

  if (
    request.home_visit?.status === "completed" &&
    request.home_visit.capturedMeasurements &&
    hasAnySelfMeasurement(request.home_visit.capturedMeasurements)
  ) {
    return {
      values: { ...EMPTY_SELF_MEASUREMENTS, ...request.home_visit.capturedMeasurements },
      unit,
      sourceLabel: "Recorded during your home measurement visit",
      canSave: true,
    };
  }

  const payloadValues = { ...EMPTY_SELF_MEASUREMENTS, ...payload.selfMeasurements };
  if (hasAnySelfMeasurement(payloadValues)) {
    const mode = request.measurement_mode;
    const sourceLabel =
      mode === "self"
        ? "Self-submitted with your request"
        : mode === "home"
          ? payload.homeVisitCompleted
            ? "Updated after your home measurement visit"
            : "Submitted with your request"
          : mode === "video"
            ? "Recorded after your video fitting"
            : "Recorded for this outfit";
    return {
      values: payloadValues,
      unit,
      sourceLabel,
      canSave: true,
    };
  }

  if (request.home_visit?.capturedMeasurements && hasAnySelfMeasurement(request.home_visit.capturedMeasurements)) {
    return {
      values: { ...EMPTY_SELF_MEASUREMENTS, ...request.home_visit.capturedMeasurements },
      unit,
      sourceLabel: "Captured during your home visit (pending completion)",
      canSave: false,
    };
  }

  return null;
}
