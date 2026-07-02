export interface BoutiqueMedia {
  type: "image" | "video";
  label: string;
  gradient: string;
  /** Real portfolio URL from Supabase (Phase 3+) */
  url?: string;
}

export interface BoutiqueData {
  slug: string;
  name: string;
  location: string;
  rating: number;
  reviewCount?: number;
  experience: string;
  experienceSummary?: string;
  /** Who this boutique serves — women, men, and/or kids */
  audiences?: import("@faden/validators").AudienceCategory[];
  outfitTypes?: string[];
  fabrics?: string[];
  media: BoutiqueMedia[];
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  /** Whether the boutique is accepting new orders */
  availability?: "open" | "closed";
  /** Shown to customers when availability is closed */
  availabilityMessage?: string | null;
}

export const MOCK_BOUTIQUES: BoutiqueData[] = [];
