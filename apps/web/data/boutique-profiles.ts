import type { AudienceCategory } from "@faden/validators";
import type { BoutiqueData } from "./boutiques";
import { MOCK_BOUTIQUES } from "./boutiques";
import { resolveBoutiqueAudiences } from "@/lib/boutique/audiences";

export interface BoutiqueCategory {
  id: string;
  label: string;
  iconGradient: string;
  audience?: AudienceCategory;
}

export interface DressLengthDetails {
  blouseLength?: string;
  skirtLength?: string;
  dupattaLength?: string;
  sleeveLength?: string;
  overallLength?: string;
  notes?: string;
}

export interface BoutiqueDesign {
  id: string;
  title: string;
  categoryId: string;
  outfitLabel?: string;
  rating: number;
  review: string;
  customerName: string;
  turnaround: string;
  madeAgo: string;
  material: string;
  price: string;
  fitting: string;
  gradient: string;
  imageUrl?: string | null;
  description?: string | null;
  sizeLabel?: string | null;
  lengthDetails?: DressLengthDetails | null;
  boutiqueSlug?: string;
}

export interface CreativePiece {
  id: string;
  title: string;
  tag: string;
  description: string;
  gradient: string;
  imageUrl?: string | null;
}

export interface BoutiqueReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  outfit: string;
  photoGradient?: string;
}

export interface BoutiqueProfileData extends BoutiqueData {
  owner: string;
  experienceSummary: string;
  categories: BoutiqueCategory[];
  portfolioDesigns: BoutiqueDesign[];
  latestDesigns: BoutiqueDesign[];
  creativeDispatch: CreativePiece[];
  reviews: BoutiqueReview[];
}

const MOCK_DRESS_SPECS: Record<
  string,
  { description: string; sizeLabel: string; lengthDetails: DressLengthDetails }
> = {
  lehenga: {
    description:
      "Full bridal lehenga set with zari-embroidered blouse, flared skirt, and net dupatta. Can be replicated in the same size or custom-fitted.",
    sizeLabel: "M (Bust 36\" · Waist 30\" · Hip 40\")",
    lengthDetails: {
      blouseLength: "15 in",
      skirtLength: "42 in",
      dupattaLength: "2.75 m",
      sleeveLength: "12 in",
    },
  },
  kurti: {
    description:
      "Anarkali-style kurti with hand-embroidered yoke and paired bottom. Suitable for festive and reception wear.",
    sizeLabel: "L (Bust 38\" · Waist 32\")",
    lengthDetails: {
      overallLength: "50 in",
      sleeveLength: "13 in",
    },
  },
  saree: {
    description:
      "Pure silk saree with contrast temple border and matching unstitched blouse fabric. Drape length standard for 5.5 m saree.",
    sizeLabel: "Free size (fits up to 42\" bust blouse)",
    lengthDetails: {
      overallLength: "5.5 m saree",
      blouseLength: "1.2 m unstitched blouse",
    },
  },
  bridal: {
    description:
      "Heavy bridal ensemble with velvet base, kundan accents, and fully lined components. Includes blouse, skirt, and dupatta.",
    sizeLabel: "Custom (Sample: Bust 37\" · Waist 29\")",
    lengthDetails: {
      blouseLength: "16 in",
      skirtLength: "44 in",
      dupattaLength: "3 m",
      sleeveLength: "14 in",
    },
  },
  sherwani: {
    description:
      "Classic wedding sherwani with embroidered collar, churidar-ready length, and structured shoulders. Can be replicated in the same size.",
    sizeLabel: "L (Chest 40\" · Shoulder 18\")",
    lengthDetails: {
      overallLength: "44 in",
      sleeveLength: "25 in",
    },
  },
  "kurta-set": {
    description:
      "Festive kurta with straight pajama set. Lightweight embroidery on yoke and cuffs.",
    sizeLabel: "M (Chest 38\" · Length 42\")",
    lengthDetails: {
      overallLength: "42 in",
      sleeveLength: "24 in",
    },
  },
  "kids-lehenga": {
    description:
      "Lightweight kids lehenga with soft lining, flared skirt, and matching dupatta. Ideal for weddings and pujas.",
    sizeLabel: "Age 8–10 (Chest 28\" · Waist 26\")",
    lengthDetails: {
      blouseLength: "12 in",
      skirtLength: "32 in",
      dupattaLength: "2 m",
    },
  },
  "kids-kurta": {
    description:
      "Comfortable kids kurta set with minimal embellishment for all-day wear at festive events.",
    sizeLabel: "Age 6–8 (Chest 26\")",
    lengthDetails: {
      overallLength: "28 in",
      sleeveLength: "16 in",
    },
  },
};

const CATEGORY_CATALOG: BoutiqueCategory[] = [
  { id: "lehenga", label: "Lehenga", audience: "women", iconGradient: "from-rose-900/50 via-burgundy/40 to-background-soft" },
  { id: "kurti", label: "Kurti", audience: "women", iconGradient: "from-emerald-900/40 via-burgundy/30 to-background-soft" },
  { id: "saree", label: "Saree", audience: "women", iconGradient: "from-amber-900/40 via-burgundy/30 to-background-soft" },
  { id: "bridal", label: "Bridal", audience: "women", iconGradient: "from-red-900/50 via-burgundy/30 to-background-soft" },
  { id: "sherwani", label: "Sherwani", audience: "men", iconGradient: "from-stone-800/50 via-burgundy/30 to-background-soft" },
  { id: "kurta-set", label: "Kurta Set", audience: "men", iconGradient: "from-orange-900/40 via-burgundy/20 to-background-soft" },
  { id: "bandhgala", label: "Bandhgala", audience: "men", iconGradient: "from-slate-800/50 via-burgundy/30 to-background-soft" },
  { id: "kids-lehenga", label: "Kids Lehenga", audience: "kids", iconGradient: "from-pink-900/40 via-burgundy/20 to-background-soft" },
  { id: "kids-kurta", label: "Kids Kurta", audience: "kids", iconGradient: "from-sky-900/30 via-burgundy/20 to-background-soft" },
  { id: "party-wear", label: "Party Wear", audience: "kids", iconGradient: "from-violet-900/30 via-burgundy/20 to-background-soft" },
];

const BASE_PROFILE = {
  categories: CATEGORY_CATALOG.filter((cat) => cat.audience === "women"),
  latestDesigns: [
    {
      id: "d1",
      title: "Emerald Bridal Lehenga",
      categoryId: "lehenga",
      rating: 5,
      review: "Absolutely stunning craftsmanship!",
      customerName: "Aditi K.",
      turnaround: "18 days",
      madeAgo: "2 weeks ago",
      material: "Silk, zari embroidery",
      price: "₹45,000",
      fitting: "Custom fitted",
      gradient: "from-emerald-900/40 via-burgundy/30 to-background-soft",
    },
    {
      id: "d2",
      title: "Floral Anarkali Set",
      categoryId: "kurti",
      rating: 4.8,
      review: "Perfect fit and beautiful detailing.",
      customerName: "Sneha R.",
      turnaround: "12 days",
      madeAgo: "1 month ago",
      material: "Georgette, hand embroidery",
      price: "₹12,500",
      fitting: "Semi-stitched",
      gradient: "from-pink-900/40 via-burgundy/20 to-background-soft",
    },
    {
      id: "d3",
      title: "Classic Silk Saree",
      categoryId: "saree",
      rating: 5,
      review: "Exceeded my expectations completely.",
      customerName: "Divya M.",
      turnaround: "10 days",
      madeAgo: "3 weeks ago",
      material: "Pure silk, temple border",
      price: "₹28,000",
      fitting: "Ready to drape",
      gradient: "from-amber-900/40 via-burgundy/30 to-background-soft",
    },
    {
      id: "d4",
      title: "Festive Kurti Set",
      categoryId: "kurti",
      rating: 4.7,
      review: "Timely delivery and great quality.",
      customerName: "Riya P.",
      turnaround: "8 days",
      madeAgo: "5 days ago",
      material: "Cotton silk blend",
      price: "₹6,800",
      fitting: "Custom fitted",
      gradient: "from-indigo-900/30 via-burgundy/30 to-background-soft",
    },
    {
      id: "d5",
      title: "Royal Bridal Ensemble",
      categoryId: "bridal",
      rating: 5,
      review: "Dream wedding outfit — every detail was perfect.",
      customerName: "Meera S.",
      turnaround: "21 days",
      madeAgo: "1 week ago",
      material: "Velvet, kundan work",
      price: "₹62,000",
      fitting: "Custom fitted",
      gradient: "from-red-900/50 via-burgundy/40 to-background-soft",
    },
    {
      id: "d6",
      title: "Ivory Wedding Sherwani",
      categoryId: "sherwani",
      rating: 4.9,
      review: "Perfect fit for the groom's side ceremonies.",
      customerName: "Rahul V.",
      turnaround: "16 days",
      madeAgo: "2 weeks ago",
      material: "Silk brocade, pearl buttons",
      price: "₹38,000",
      fitting: "Custom fitted",
      gradient: "from-stone-800/50 via-burgundy/30 to-background-soft",
    },
    {
      id: "d7",
      title: "Festive Kurta Set",
      categoryId: "kurta-set",
      rating: 4.8,
      review: "Elegant and comfortable for sangeet night.",
      customerName: "Arjun M.",
      turnaround: "12 days",
      madeAgo: "3 weeks ago",
      material: "Cotton silk, minimal embroidery",
      price: "₹9,500",
      fitting: "Custom fitted",
      gradient: "from-orange-900/40 via-burgundy/20 to-background-soft",
    },
    {
      id: "d8",
      title: "Pink Kids Lehenga",
      categoryId: "kids-lehenga",
      rating: 5,
      review: "My daughter loved it — light and twirly!",
      customerName: "Pooja N.",
      turnaround: "10 days",
      madeAgo: "1 week ago",
      material: "Net, soft lining",
      price: "₹6,200",
      fitting: "Custom fitted",
      gradient: "from-pink-900/40 via-burgundy/20 to-background-soft",
    },
    {
      id: "d9",
      title: "Kids Festive Kurta",
      categoryId: "kids-kurta",
      rating: 4.7,
      review: "Great quality for a growing child — roomy but neat.",
      customerName: "Neha T.",
      turnaround: "8 days",
      madeAgo: "4 days ago",
      material: "Cotton blend",
      price: "₹3,800",
      fitting: "Custom fitted",
      gradient: "from-sky-900/30 via-burgundy/20 to-background-soft",
    },
  ] as BoutiqueDesign[],
  creativeDispatch: [
    {
      id: "c1",
      title: "Experimental Draping Study",
      tag: "Skill showcase",
      description: "Exploring contemporary saree drapes without client brief.",
      gradient: "from-violet-900/30 via-burgundy/30 to-background-soft",
    },
    {
      id: "c2",
      title: "Hand-Embroidered Motif Panel",
      tag: "Art piece",
      description: "Standalone motif panel demonstrating zardozi mastery.",
      gradient: "from-orange-900/40 via-burgundy/20 to-background-soft",
    },
    {
      id: "c3",
      title: "Heritage Weave Sample",
      tag: "Craft display",
      description: "Revival weave technique sample for the studio archive.",
      gradient: "from-stone-800/50 via-burgundy/20 to-background-soft",
    },
  ] as CreativePiece[],
  reviews: [
    {
      id: "r1",
      name: "Aditi K.",
      rating: 5,
      text: "The lehenga was exactly what I envisioned. Priya understood my references perfectly.",
      outfit: "Bridal Lehenga",
      photoGradient: "from-burgundy/50 via-rose-900/30 to-background-soft",
    },
    {
      id: "r2",
      name: "Sneha R.",
      rating: 4.8,
      text: "Professional from start to finish. Measurements were spot on and delivery was on time.",
      outfit: "Custom Anarkali",
    },
    {
      id: "r3",
      name: "Divya M.",
      rating: 5,
      text: "I've ordered three times now. Consistent quality and beautiful finishing every time.",
      outfit: "Silk Saree",
      photoGradient: "from-amber-900/40 via-burgundy/30 to-background-soft",
    },
  ] as BoutiqueReview[],
};

const STUB_OWNERS: Record<string, string> = {
  "silk-thread-studio": "Priya Mehta",
  "royal-stitch": "Ananya Sharma",
  "elegant-drapes": "Kavya Reddy",
  "thread-craft": "Meera Iyer",
  "heritage-weaves": "Lakshmi Venkat",
};

export const BOUTIQUE_PROFILES: Record<string, BoutiqueProfileData> = {};

for (const b of MOCK_BOUTIQUES) {
  const audiences = resolveBoutiqueAudiences(b);
  const categories = CATEGORY_CATALOG.filter(
    (cat) => !cat.audience || audiences.includes(cat.audience),
  );
  const designTemplates = BASE_PROFILE.latestDesigns.filter((design) =>
    categories.some((cat) => cat.id === design.categoryId),
  );

  const portfolioDesigns = designTemplates.map((d, i) => {
    const specs = MOCK_DRESS_SPECS[d.categoryId];
    return {
      ...d,
      id: `${b.slug}-d${i}`,
      boutiqueSlug: b.slug,
      outfitLabel: categories.find((c) => c.id === d.categoryId)?.label,
      description: specs?.description ?? `${d.material}. ${d.fitting}. Crafted for a verified FADEN client.`,
      sizeLabel: specs?.sizeLabel ?? null,
      lengthDetails: specs?.lengthDetails ?? null,
      title: b.slug === "silk-thread-studio" ? d.title : `${d.title.split(" ").slice(0, 2).join(" ")} — ${b.name.split(" ")[0]}`,
    };
  });

  BOUTIQUE_PROFILES[b.slug] = {
    ...b,
    owner: STUB_OWNERS[b.slug] ?? "Studio Owner",
    experienceSummary:
      b.slug === "silk-thread-studio"
        ? "Specialists in bridal couture and heirloom silk work across Maharashtra."
        : `${b.experience} of bespoke tailoring for ${audiences.map((a) => (a === "kids" ? "kids" : `${a}'s wear`)).join(", ")} in ${b.location.split(",")[0]}.`,
    categories,
    portfolioDesigns,
    latestDesigns: portfolioDesigns.slice(0, 6),
    creativeDispatch: BASE_PROFILE.creativeDispatch.map((c, i) => ({
      ...c,
      id: `${b.slug}-c${i}`,
    })),
    reviews: BASE_PROFILE.reviews.map((r, i) => ({
      ...r,
      id: `${b.slug}-r${i}`,
    })),
  };
}

export function getBoutiqueProfile(slug: string): BoutiqueProfileData | undefined {
  return BOUTIQUE_PROFILES[slug];
}

export function getDesignsByCategory(profile: BoutiqueProfileData, categoryId: string): BoutiqueDesign[] {
  const designs = profile.portfolioDesigns?.length ? profile.portfolioDesigns : profile.latestDesigns;
  return designs.filter((d) => d.categoryId === categoryId);
}

export function getDesignById(profile: BoutiqueProfileData, designId: string): BoutiqueDesign | undefined {
  const designs = profile.portfolioDesigns?.length ? profile.portfolioDesigns : profile.latestDesigns;
  return designs.find((d) => d.id === designId);
}

export function getReviewsForDesign(profile: BoutiqueProfileData, design: BoutiqueDesign): BoutiqueReview[] {
  const label = design.outfitLabel?.toLowerCase() ?? design.title.toLowerCase();
  const matched = profile.reviews.filter((review) => {
    const outfit = review.outfit.toLowerCase();
    return outfit.includes(label) || label.includes(outfit.split(" ")[0] ?? "");
  });
  return matched.length ? matched : profile.reviews.slice(0, 3);
}
