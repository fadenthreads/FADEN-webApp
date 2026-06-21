import type { SelfMeasurements, MeasurementUnit, MeasurementAssistantGender } from "@/data/measurement-fields";
import type { MatchedBoutiqueSummary } from "@/lib/customization/queries";

export interface CustomizationFormPayload {
  flowOrder?: "boutique-first" | "requirements-first";
  outfitAudience?: import("@faden/validators").AudienceCategory;
  sketchNotes?: string;
  mixOutfitNotes?: string;
  mixOutfitLinks?: string;
  mixOutfitImages?: string[];
  fabricTypes?: string;
  fabricColors?: string;
  colorCount?: string;
  measurementAssistantGender?: MeasurementAssistantGender;
  homeVisitNotes?: string;
  homeVisitLocationLabel?: string;
  homeVisitLat?: number | null;
  homeVisitLng?: number | null;
  homeVisitCompleted?: boolean;
  videoSessionDate?: string;
  videoSessionTime?: string;
  videoSessionNotes?: string;
  measurementUnit?: MeasurementUnit;
  selfMeasurements?: SelfMeasurements;
  measurements?: string;
  neckDesign?: string;
  neckDesignImages?: string[];
  sleeveDesign?: string;
  sleeveDesignImages?: string[];
  backDesign?: string;
  backDesignImages?: string[];
  embroideryDetails?: string;
  embroideryDetailImages?: string[];
  budgetRange?: string;
  specialRequests?: string;
  specialRequestImages?: string[];
  selectedBoutiqueSlug?: string;
  matchedBoutiques?: MatchedBoutiqueSummary[];
}

export function parseFormPayload(value: unknown): CustomizationFormPayload {
  if (!value || typeof value !== "object") return {};
  return value as CustomizationFormPayload;
}
