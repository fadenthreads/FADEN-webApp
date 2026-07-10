import type { BoutiqueData } from "./boutiques";

/** Static showcase boutique so first-time visitors see a studio preview. */
export const SAMPLE_BOUTIQUE: BoutiqueData & {
  owner: string;
  tagline: string;
  specialties: string[];
  highlightReview: { name: string; text: string; rating: number };
} = {
  slug: "sample-studio",
  name: "Atelier Noor",
  owner: "Noor Rahman",
  tagline: "Bridal & occasion wear · Hand embroidery · Custom fittings",
  location: "Jubilee Hills, Hyderabad",
  rating: 4.9,
  reviewCount: 128,
  experience: "12 years",
  experienceSummary: "Award-winning studio specializing in lehengas, sarees, and fusion occasion wear.",
  audiences: ["women"],
  outfitTypes: ["Lehenga", "Saree", "Anarkali", "Bridal"],
  fabrics: ["Silk", "Georgette", "Organza", "Velvet"],
  availability: "open",
  media: [
    {
      type: "image",
      label: "Bridal lehenga showcase",
      gradient: "from-amber-900/40 via-burgundy/30 to-background-soft",
      url: "/hero-background.png",
    },
  ],
  specialties: ["Bridal lehengas", "Same-day fittings", "Video consultations", "Rush orders"],
  highlightReview: {
    name: "Priya M.",
    rating: 5,
    text: "They understood my vision instantly — the fit and embroidery were flawless for my wedding.",
  },
};
