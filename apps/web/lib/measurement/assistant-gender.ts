import type { AudienceCategory } from "@faden/validators";
import {
  MEASUREMENT_ASSISTANT_OPTIONS,
  type MeasurementAssistantGender,
} from "@/data/measurement-fields";

/** Default assistant gender from outfit audience (home / video measurement). */
export function preferredAssistantGenderForAudience(
  audience: AudienceCategory | "" | null | undefined,
): MeasurementAssistantGender {
  if (audience === "men") return "male";
  if (audience === "women") return "female";
  return "any";
}

/** Allowed assistant choices per outfit audience for home visits. */
export function assistantOptionsForAudience(audience: AudienceCategory | "" | null | undefined) {
  if (audience === "men") {
    return MEASUREMENT_ASSISTANT_OPTIONS.filter(
      (option) => option.value === "male" || option.value === "any",
    );
  }
  if (audience === "women") {
    return MEASUREMENT_ASSISTANT_OPTIONS.filter(
      (option) => option.value === "female" || option.value === "any",
    );
  }
  return MEASUREMENT_ASSISTANT_OPTIONS;
}

export function normalizeAssistantGenderForAudience(
  audience: AudienceCategory | "" | null | undefined,
  gender: MeasurementAssistantGender,
): MeasurementAssistantGender {
  const allowed = assistantOptionsForAudience(audience).map((option) => option.value);
  if (allowed.includes(gender)) return gender;
  return preferredAssistantGenderForAudience(audience);
}
