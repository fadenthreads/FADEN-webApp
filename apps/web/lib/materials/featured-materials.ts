import type { SupabaseClient } from "@supabase/supabase-js";

export interface FeaturedMaterialItem {
  id: string;
  name: string;
  description: string;
  composition?: string;
  weight?: string;
  priceHint?: string;
  gradient: string;
  imageUrl?: string | null;
  boutiqueName: string;
  boutiqueSlug: string;
  careInstructions?: string;
}

const GRADIENTS = [
  "from-navy/50 via-gold/25 to-background-soft",
  "from-amber-900/40 via-navy/30 to-background-soft",
  "from-rose-900/35 via-gold/20 to-background-soft",
  "from-emerald-900/30 via-navy/25 to-background-soft",
  "from-indigo-900/35 via-gold/15 to-background-soft",
];

const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  silk: "Luxurious natural silk with a soft sheen — ideal for lehengas, sarees, and occasion wear.",
  cotton: "Breathable cotton suited for everyday kurtas, linings, and structured casual pieces.",
  georgette: "Light, flowing georgette that drapes beautifully for anarkalis and layered outfits.",
  chiffon: "Sheer, airy chiffon perfect for overlays, dupattas, and elegant evening silhouettes.",
  velvet: "Rich velvet with depth and warmth — a favourite for winter festive and bridal looks.",
  linen: "Crisp linen with a relaxed texture, excellent for summer tailoring and Indo-western sets.",
  banarasi: "Heritage Banarasi weave with zari motifs — crafted for statement sarees and blouses.",
  organza: "Crisp organza for structured blouses, dupattas, and contemporary festive layers.",
  brocade: "Ornate brocade with raised patterns, suited to ceremonial and bridal ensembles.",
  satin: "Smooth satin with a polished finish for gowns, linings, and luxe evening wear.",
};

function describeMaterial(name: string, boutiqueName: string): string {
  const key = name.toLowerCase();
  for (const [fabric, copy] of Object.entries(MATERIAL_DESCRIPTIONS)) {
    if (key.includes(fabric)) return copy;
  }
  return `Premium ${name} sourced through ${boutiqueName}. Request swatches and yardage when you customize an outfit.`;
}

function slugifyMaterial(name: string, boutiqueSlug: string): string {
  return `${boutiqueSlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export async function listFeaturedMaterialsFromDb(
  supabase: SupabaseClient,
  limit = 24,
): Promise<FeaturedMaterialItem[]> {
  const { data, error } = await supabase
    .from("boutiques")
    .select(`
      slug, name, pricing_info, reviews_summary,
      boutique_services ( label )
    `)
    .eq("status", "verified")
    .limit(40);

  if (error || !data?.length) return [];

  const items: FeaturedMaterialItem[] = [];
  let gradientIndex = 0;

  for (const row of data) {
    const services = (row.boutique_services ?? []) as { label: string }[];
    const fabricCandidates = new Set<string>();

    const textBlob = [row.pricing_info, row.reviews_summary, ...services.map((s) => s.label)]
      .filter(Boolean)
      .join(" ");

    for (const match of textBlob.match(/\b(?:silk|cotton|georgette|chiffon|velvet|linen|banarasi|organza|brocade|satin|khadi|net|crepe|tussar|zari|jacquard|tissue)\b/gi) ?? []) {
      fabricCandidates.add(match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());
    }

    for (const service of services) {
      if (/silk|cotton|georgette|chiffon|velvet|fabric|linen|banarasi/i.test(service.label)) {
        fabricCandidates.add(service.label.trim());
      }
    }

    for (const name of fabricCandidates) {
      if (items.length >= limit) return items;
      items.push({
        id: slugifyMaterial(name, row.slug as string),
        name,
        description: describeMaterial(name, row.name as string),
        composition: name,
        priceHint: "Price on request",
        gradient: GRADIENTS[gradientIndex % GRADIENTS.length],
        boutiqueName: row.name as string,
        boutiqueSlug: row.slug as string,
        careInstructions: "Dry clean recommended for most festive fabrics. Ask the boutique for swatch-specific care.",
      });
      gradientIndex += 1;
    }
  }

  return items;
}
