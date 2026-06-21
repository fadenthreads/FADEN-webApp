import type { BoutiqueRegistrationInput } from "@faden/validators";

export const BOUTIQUE_FORM_SECTIONS = [
  "basic",
  "portfolio",
  "services",
  "pricing",
  "delivery",
  "trust",
  "availability",
  "communication",
] as const;

export type BoutiqueFormSection = (typeof BOUTIQUE_FORM_SECTIONS)[number];

export const BOUTIQUE_SECTION_LABELS: Record<BoutiqueFormSection, string> = {
  basic: "Basic Details",
  portfolio: "Portfolio",
  services: "Services Offered",
  pricing: "Pricing Information",
  delivery: "Delivery Information",
  trust: "Trust Signals & Reviews",
  availability: "Availability",
  communication: "Communication",
};

export const DEFAULT_BOUTIQUE_FORM: BoutiqueRegistrationInput = {
  name: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  mapsUrl: "",
  yearsInBusiness: undefined,
  portfolioPhotoUrls: "",
  audiences: "women",
  outfitTypes: "",
  servicesOffered: "",
  pricingInfo: "",
  avgDeliveryTime: "",
  rushOrdersAccepted: "no",
  maxOrdersPerMonth: undefined,
  reviewsSummary: "",
  trustMediaUrls: "",
  socialLinks: "",
  completedOrdersApprox: undefined,
  availabilityStatus: "open",
  workingHours: "",
  bookingMode: "both",
  communicationPrefs: "",
};

export const BOUTIQUE_SECTION_FIELDS: Record<BoutiqueFormSection, (keyof BoutiqueRegistrationInput)[]> = {
  basic: ["name", "ownerName", "phone", "email", "address"],
  portfolio: ["outfitTypes", "portfolioPhotoUrls"],
  services: ["servicesOffered"],
  pricing: ["pricingInfo"],
  delivery: ["avgDeliveryTime", "rushOrdersAccepted", "maxOrdersPerMonth"],
  trust: ["reviewsSummary", "trustMediaUrls", "socialLinks", "completedOrdersApprox"],
  availability: ["availabilityStatus", "workingHours", "bookingMode"],
  communication: ["communicationPrefs"],
};

export function boutiqueSectionForField(field: keyof BoutiqueRegistrationInput): BoutiqueFormSection {
  for (const section of BOUTIQUE_FORM_SECTIONS) {
    if (BOUTIQUE_SECTION_FIELDS[section].includes(field)) return section;
  }
  return "basic";
}

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

/** True when any boutique detail field differs from the loaded baseline. */
export function boutiqueDetailsChanged(
  current: BoutiqueRegistrationInput,
  baseline: BoutiqueRegistrationInput,
): boolean {
  const keys = Object.keys(DEFAULT_BOUTIQUE_FORM) as (keyof BoutiqueRegistrationInput)[];
  return keys.some(
    (key) => normalizeFormField(key, current[key]) !== normalizeFormField(key, baseline[key]),
  );
}
