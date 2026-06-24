import type { CustomizeFormData, CustomizeStepId } from "@/data/customize-form";
import { CUSTOMIZE_STEPS } from "@/data/customize-form";
import { formatSelfMeasurementsSummary } from "@/data/measurement-fields";

export type ReviewWarningSeverity = "error" | "warning";

export interface ReviewWarning {
  id: string;
  message: string;
  stepId: CustomizeStepId;
  severity: ReviewWarningSeverity;
}

const STEP_INDEX: Record<CustomizeStepId, number> = Object.fromEntries(
  CUSTOMIZE_STEPS.map((step, index) => [step.id, index]),
) as Record<CustomizeStepId, number>;

export function getCustomizeReviewWarnings(data: CustomizeFormData): ReviewWarning[] {
  const warnings: ReviewWarning[] = [];

  if (!data.outfitAudience) {
    warnings.push({
      id: "outfitAudience",
      message: "Select who this outfit is for (Women, Men, or Kids).",
      stepId: "category",
      severity: "error",
    });
  }

  if (!data.outfitType.trim()) {
    warnings.push({
      id: "outfitType",
      message: "Choose an outfit type.",
      stepId: "category",
      severity: "error",
    });
  }

  if (!data.occasion.trim()) {
    warnings.push({
      id: "occasion",
      message: "Add the occasion for this outfit.",
      stepId: "category",
      severity: "warning",
    });
  }

  if (!data.fabricTypes.trim() && data.fabricSource === "boutique") {
    warnings.push({
      id: "fabricTypes",
      message: "Describe fabric preferences or mark that you will provide fabric.",
      stepId: "fabric",
      severity: "warning",
    });
  }

  if (data.measurementMode === "self") {
    const summary = formatSelfMeasurementsSummary(data.selfMeasurements, data.measurementUnit);
    if (!summary) {
      warnings.push({
        id: "selfMeasurements",
        message: "Enter your measurements or choose another measurement option.",
        stepId: "measurements",
        severity: "error",
      });
    }
  } else if (data.measurementMode === "video" && !data.videoSessionDate) {
    warnings.push({
      id: "videoSessionDate",
      message: "Pick a date for your video measurement session.",
      stepId: "measurements",
      severity: "warning",
    });
  } else if (data.measurementMode === "home" && !data.homeVisitDate) {
    warnings.push({
      id: "homeVisitDate",
      message: "Pick a date for your home measurement visit.",
      stepId: "measurements",
      severity: "warning",
    });
  }

  if (!data.deliveryDate) {
    warnings.push({
      id: "deliveryDate",
      message: "Set your preferred delivery date.",
      stepId: "delivery",
      severity: "warning",
    });
  }

  if (!data.budgetRange.trim()) {
    warnings.push({
      id: "budgetRange",
      message: "Add a budget range so boutiques can quote accurately.",
      stepId: "delivery",
      severity: "warning",
    });
  }

  if (data.flowOrder === "boutique-first" && !data.selectedBoutiqueSlug.trim()) {
    warnings.push({
      id: "selectedBoutiqueSlug",
      message: "Choose a boutique for boutique-first flow.",
      stepId: "start",
      severity: "error",
    });
  }

  return warnings.sort((a, b) => STEP_INDEX[a.stepId] - STEP_INDEX[b.stepId]);
}
