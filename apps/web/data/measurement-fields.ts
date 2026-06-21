export type MeasurementAssistantGender = "female" | "male" | "any";

export type MeasurementUnit = "in" | "cm";

export interface SelfMeasurements {
  height: string;
  bust: string;
  underBust: string;
  waist: string;
  hip: string;
  shoulder: string;
  armhole: string;
  sleeveLength: string;
  blouseLength: string;
  kurtaLength: string;
  inseam: string;
  neck: string;
}

export const EMPTY_SELF_MEASUREMENTS: SelfMeasurements = {
  height: "",
  bust: "",
  underBust: "",
  waist: "",
  hip: "",
  shoulder: "",
  armhole: "",
  sleeveLength: "",
  blouseLength: "",
  kurtaLength: "",
  inseam: "",
  neck: "",
};

export const SELF_MEASUREMENT_FIELDS: {
  key: keyof SelfMeasurements;
  label: string;
  placeholder: string;
}[] = [
  { key: "height", label: "Height", placeholder: 'e.g. 5\'4" or 163' },
  { key: "bust", label: "Bust / chest", placeholder: "e.g. 34" },
  { key: "underBust", label: "Under bust", placeholder: "e.g. 32" },
  { key: "waist", label: "Waist", placeholder: "e.g. 28" },
  { key: "hip", label: "Hip", placeholder: "e.g. 38" },
  { key: "shoulder", label: "Shoulder width", placeholder: "e.g. 15" },
  { key: "armhole", label: "Armhole", placeholder: "e.g. 16" },
  { key: "sleeveLength", label: "Sleeve length", placeholder: "e.g. 22" },
  { key: "blouseLength", label: "Blouse / top length", placeholder: "e.g. 15" },
  { key: "kurtaLength", label: "Kurta / outfit length", placeholder: "e.g. 44" },
  { key: "inseam", label: "Inseam (bottoms)", placeholder: "e.g. 30" },
  { key: "neck", label: "Neck", placeholder: "e.g. 14" },
];

export const MEASUREMENT_ASSISTANT_OPTIONS: {
  value: MeasurementAssistantGender;
  label: string;
  description: string;
}[] = [
  {
    value: "female",
    label: "Female assistant",
    description: "Match a female boutique member for women's / girls' outfits.",
  },
  {
    value: "male",
    label: "Male assistant",
    description: "Match a male boutique member for men's / boys' outfits.",
  },
  {
    value: "any",
    label: "Anyone available",
    description: "No gender preference — first available team member.",
  },
];

export function formatSelfMeasurementsSummary(
  values: SelfMeasurements,
  unit: MeasurementUnit,
): string {
  const unitLabel = unit === "cm" ? "cm" : "in";
  return SELF_MEASUREMENT_FIELDS.filter(({ key }) => values[key]?.trim())
    .map(({ key, label }) => `${label}: ${values[key].trim()} ${unitLabel}`)
    .join(" · ");
}

export function hasAnySelfMeasurement(values: SelfMeasurements): boolean {
  return SELF_MEASUREMENT_FIELDS.some(({ key }) => values[key]?.trim());
}
