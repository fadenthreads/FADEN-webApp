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

export const MOCK_BOUTIQUES: BoutiqueData[] = [
  {
    slug: "silk-thread-studio",
    name: "Silk & Thread Studio",
    location: "Mumbai, Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    rating: 4.9,
    reviewCount: 48,
    experience: "15 years",
    audiences: ["women"],
    outfitTypes: ["Lehenga", "Bridal", "Saree"],
    fabrics: ["Silk", "Banarasi", "Zari"],
    media: [
      { type: "image", label: "Bridal lehenga", gradient: "from-burgundy/60 via-rose-900/40 to-background-soft" },
      { type: "video", label: "Workshop reel", gradient: "from-amber-900/50 via-burgundy/40 to-background-soft" },
      { type: "image", label: "Custom saree", gradient: "from-purple-900/40 via-burgundy/30 to-background-soft" },
    ],
  },
  {
    slug: "royal-stitch",
    name: "Royal Stitch Boutique",
    location: "Jaipur, Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    rating: 4.8,
    reviewCount: 32,
    experience: "12 years",
    audiences: ["women", "men"],
    outfitTypes: ["Lehenga", "Anarkali", "Kurti", "Sherwani", "Kurta Set"],
    fabrics: ["Velvet", "Silk", "Brocade"],
    media: [
      { type: "image", label: "Royal lehenga", gradient: "from-orange-900/50 via-red-900/40 to-background-soft" },
      { type: "image", label: "Embroidered kurti", gradient: "from-yellow-900/30 via-burgundy/40 to-background-soft" },
    ],
  },
  {
    slug: "elegant-drapes",
    name: "Elegant Drapes",
    location: "Hyderabad, Telangana",
    latitude: 17.4156,
    longitude: 78.4487,
    rating: 4.7,
    reviewCount: 21,
    experience: "8 years",
    audiences: ["women"],
    outfitTypes: ["Saree", "Blouse", "Indo-Western"],
    fabrics: ["Georgette", "Chiffon", "Cotton"],
    media: [
      { type: "video", label: "Draping showcase", gradient: "from-indigo-900/40 via-burgundy/30 to-background-soft" },
      { type: "image", label: "Designer saree", gradient: "from-pink-900/40 via-rose-900/30 to-background-soft" },
      { type: "image", label: "Fusion wear", gradient: "from-violet-900/40 via-burgundy/20 to-background-soft" },
    ],
  },
  {
    slug: "thread-craft",
    name: "Thread & Craft Atelier",
    location: "Bangalore, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.9,
    reviewCount: 56,
    experience: "10 years",
    audiences: ["women", "kids"],
    outfitTypes: ["Anarkali", "Bridal", "Gown", "Kids Lehenga", "Party Wear"],
    fabrics: ["Organza", "Net", "Satin"],
    media: [
      { type: "image", label: "Anarkali suit", gradient: "from-emerald-900/30 via-burgundy/40 to-background-soft" },
      { type: "image", label: "Bridal couture", gradient: "from-red-900/50 via-burgundy/30 to-background-soft" },
    ],
  },
  {
    slug: "heritage-weaves",
    name: "Heritage Weaves",
    location: "Chennai, Tamil Nadu",
    rating: 4.6,
    reviewCount: 18,
    experience: "20 years",
    audiences: ["women", "men", "kids"],
    outfitTypes: ["Saree", "Kurti", "Lehenga", "Sherwani", "Kurta Set", "Kids Lehenga", "Kids Kurta"],
    fabrics: ["Silk", "Khadi", "Cotton"],
    media: [
      { type: "image", label: "Silk saree", gradient: "from-amber-800/40 via-burgundy/30 to-background-soft" },
      { type: "video", label: "Weaving process", gradient: "from-stone-800/50 via-burgundy/20 to-background-soft" },
    ],
  },
];
