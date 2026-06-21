import {
  EMPTY_SELF_MEASUREMENTS,
  type MeasurementAssistantGender,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";
import { ALL_OUTFIT_TYPES, OUTFIT_TYPES_BY_AUDIENCE } from "@/lib/boutique/audiences";

export type { SelfMeasurements, MeasurementAssistantGender, MeasurementUnit };

export const OUTFIT_TYPES = ALL_OUTFIT_TYPES;

export { OUTFIT_TYPES_BY_AUDIENCE };

export const OCCASION_SUGGESTIONS = [
  "Wedding",
  "Reception",
  "Engagement",
  "Mehendi",
  "Haldi",
  "Sangeet",
  "Cocktail party",
  "Bridal",
  "Festival",
  "Diwali",
  "Navratri",
  "Eid",
  "Puja",
  "Religious ceremony",
  "Housewarming",
  "Birthday party",
  "Anniversary",
  "Corporate event",
  "Office wear",
  "Casual outing",
  "Date night",
  "Photoshoot",
  "College fest",
  "Graduation",
] as const;

export const MEASUREMENT_MODES = [
  { value: "self", label: "Self-submit measurements" },
  { value: "video", label: "Video measurement session" },
  { value: "home", label: "Home measurement visit (boutique)" },
];

export interface CustomizeFormData {
  flowOrder: "boutique-first" | "requirements-first";
  outfitAudience: import("@faden/validators").AudienceCategory | "";
  outfitType: string;
  outfitDescription: string;
  occasion: string;
  inspirationLinks: string;
  sketchNotes: string;
  mixOutfitNotes: string;
  mixOutfitLinks: string;
  mixOutfitImages: string[];
  fabricSource: "customer" | "boutique";
  fabricTypes: string;
  fabricColors: string;
  colorCount: string;
  measurementMode: string;
  measurementAssistantGender: MeasurementAssistantGender;
  homeVisitNotes: string;
  homeVisitLocationLabel: string;
  homeVisitLat: number | null;
  homeVisitLng: number | null;
  homeVisitDate: string;
  homeVisitTime: string;
  savedMeasurementProfileId: string;
  saveMeasurementToAccount: boolean;
  savedMeasurementLabel: string;
  videoSessionDate: string;
  videoSessionTime: string;
  videoSessionNotes: string;
  measurementUnit: MeasurementUnit;
  selfMeasurements: SelfMeasurements;
  measurements: string;
  deliveryDate: string;
  neckDesign: string;
  neckDesignImages: string[];
  sleeveDesign: string;
  sleeveDesignImages: string[];
  backDesign: string;
  backDesignImages: string[];
  embroideryDetails: string;
  embroideryDetailImages: string[];
  budgetRange: string;
  specialRequests: string;
  specialRequestImages: string[];
  selectedBoutiqueSlug: string;
  portfolioReferenceId: string;
  portfolioReferenceTitle: string;
  portfolioOrderSame: boolean;
}

export const INITIAL_CUSTOMIZE_DATA: CustomizeFormData = {
  flowOrder: "requirements-first",
  outfitAudience: "",
  outfitType: "",
  outfitDescription: "",
  occasion: "",
  inspirationLinks: "",
  sketchNotes: "",
  mixOutfitNotes: "",
  mixOutfitLinks: "",
  mixOutfitImages: [],
  fabricSource: "boutique",
  fabricTypes: "",
  fabricColors: "",
  colorCount: "",
  measurementMode: "self",
  measurementAssistantGender: "any",
  homeVisitNotes: "",
  homeVisitLocationLabel: "",
  homeVisitLat: null,
  homeVisitLng: null,
  homeVisitDate: "",
  homeVisitTime: "",
  savedMeasurementProfileId: "",
  saveMeasurementToAccount: false,
  savedMeasurementLabel: "",
  videoSessionDate: "",
  videoSessionTime: "",
  videoSessionNotes: "",
  measurementUnit: "in",
  selfMeasurements: { ...EMPTY_SELF_MEASUREMENTS },
  measurements: "",
  deliveryDate: "",
  neckDesign: "",
  neckDesignImages: [],
  sleeveDesign: "",
  sleeveDesignImages: [],
  backDesign: "",
  backDesignImages: [],
  embroideryDetails: "",
  embroideryDetailImages: [],
  budgetRange: "",
  specialRequests: "",
  specialRequestImages: [],
  selectedBoutiqueSlug: "",
  portfolioReferenceId: "",
  portfolioReferenceTitle: "",
  portfolioOrderSame: false,
};

export const CUSTOMIZE_STEPS = [
  { id: "start", title: "How to Begin" },
  { id: "category", title: "Outfit & Occasion" },
  { id: "inspiration", title: "Inspiration" },
  { id: "fabric", title: "Fabric & Colour" },
  { id: "measurements", title: "Measurements" },
  { id: "design", title: "Design Details" },
  { id: "delivery", title: "Delivery & Budget" },
  { id: "review", title: "Review" },
] as const;

export type CustomizeStepId = (typeof CUSTOMIZE_STEPS)[number]["id"];
