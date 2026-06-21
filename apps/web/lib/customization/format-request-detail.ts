import { MEASUREMENT_MODES } from "@/data/customize-form";
import { MEASUREMENT_ASSISTANT_OPTIONS } from "@/data/measurement-fields";
import { formatDateOnly } from "@/lib/datetime/format";

export function labelFabricSource(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === "customer") return "Customer provides fabric";
  if (value === "boutique") return "Boutique provides fabric";
  return value.replace(/_/g, " ");
}

export function labelMeasurementMode(value: string | null | undefined): string | null {
  if (!value) return null;
  return MEASUREMENT_MODES.find((mode) => mode.value === value)?.label ?? value.replace(/_/g, " ");
}

export function labelOutfitAudience(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === "women") return "Women";
  if (value === "men") return "Men";
  if (value === "kids") return "Kids";
  return value;
}

export function labelAssistantGender(value: string | null | undefined): string | null {
  if (!value) return null;
  return MEASUREMENT_ASSISTANT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function labelRequestStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function formatOptionalDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return formatDateOnly(value);
}

export function splitLinks(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter((part) => part.startsWith("http"));
}
