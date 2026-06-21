import type { BoutiqueRegistrationInput } from "@faden/validators";

export const BOUTIQUE_FIELD_LABELS: Record<keyof BoutiqueRegistrationInput, string> = {
  name: "Boutique name",
  ownerName: "Owner name",
  phone: "Phone",
  email: "Email",
  address: "Address",
  mapsUrl: "Google Maps",
  yearsInBusiness: "Years in business",
  portfolioPhotoUrls: "Portfolio photos",
  audiences: "Categories served",
  outfitTypes: "Outfit types",
  servicesOffered: "Services offered",
  pricingInfo: "Pricing information",
  avgDeliveryTime: "Average delivery time",
  rushOrdersAccepted: "Rush orders accepted",
  maxOrdersPerMonth: "Max orders per month",
  reviewsSummary: "Reviews summary",
  trustMediaUrls: "Trust photos & videos",
  socialLinks: "Social media links",
  completedOrdersApprox: "Completed orders (approx.)",
  availabilityStatus: "Availability status",
  workingHours: "Working hours",
  bookingMode: "Booking mode",
  communicationPrefs: "Communication preferences",
};

export const BOUTIQUE_DETAIL_SECTIONS: {
  title: string;
  fields: (keyof BoutiqueRegistrationInput)[];
}[] = [
  {
    title: "Basic Details",
    fields: ["name", "ownerName", "phone", "email", "address", "mapsUrl", "yearsInBusiness"],
  },
  {
    title: "Portfolio",
    fields: ["portfolioPhotoUrls", "audiences", "outfitTypes"],
  },
  { title: "Services", fields: ["servicesOffered"] },
  { title: "Pricing", fields: ["pricingInfo"] },
  {
    title: "Delivery",
    fields: ["avgDeliveryTime", "rushOrdersAccepted", "maxOrdersPerMonth"],
  },
  {
    title: "Trust & Reviews",
    fields: ["reviewsSummary", "trustMediaUrls", "socialLinks", "completedOrdersApprox"],
  },
  {
    title: "Availability",
    fields: ["availabilityStatus", "workingHours", "bookingMode"],
  },
  { title: "Communication", fields: ["communicationPrefs"] },
];

function normalizeFormField(
  key: keyof BoutiqueRegistrationInput,
  value: BoutiqueRegistrationInput[keyof BoutiqueRegistrationInput],
): string | number | boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (key === "phone") return trimmed.replace(/\D/g, "");
    return trimmed;
  }
  return value;
}

function formatDisplayValue(
  key: keyof BoutiqueRegistrationInput,
  value: BoutiqueRegistrationInput[keyof BoutiqueRegistrationInput],
): string {
  const normalized = normalizeFormField(key, value);
  if (normalized === null || normalized === "") return "—";

  if (key === "rushOrdersAccepted") {
    return normalized === "yes" ? "Yes" : "No";
  }
  if (key === "availabilityStatus") {
    return normalized === "open" ? "Open" : "Closed";
  }
  if (key === "bookingMode") {
    if (normalized === "appointment") return "Appointment booking";
    if (normalized === "video") return "Video call booking";
    return "Both";
  }
  if (key === "audiences") {
    return String(normalized)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(", ");
  }

  return String(normalized);
}

export interface BoutiqueFieldChange {
  field: keyof BoutiqueRegistrationInput;
  label: string;
  before: string;
  after: string;
}

export function diffBoutiqueDetails(
  current: BoutiqueRegistrationInput,
  proposed: BoutiqueRegistrationInput,
): BoutiqueFieldChange[] {
  const keys = Object.keys(BOUTIQUE_FIELD_LABELS) as (keyof BoutiqueRegistrationInput)[];
  const changes: BoutiqueFieldChange[] = [];

  for (const field of keys) {
    const beforeNorm = normalizeFormField(field, current[field]);
    const afterNorm = normalizeFormField(field, proposed[field]);
    if (beforeNorm === afterNorm) continue;

    changes.push({
      field,
      label: BOUTIQUE_FIELD_LABELS[field],
      before: formatDisplayValue(field, current[field]),
      after: formatDisplayValue(field, proposed[field]),
    });
  }

  return changes;
}

export function formatBoutiqueFieldValue(
  field: keyof BoutiqueRegistrationInput,
  form: BoutiqueRegistrationInput,
): string {
  return formatDisplayValue(field, form[field]);
}
