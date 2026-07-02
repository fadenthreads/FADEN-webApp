import type { SavedItemInput } from "@faden/validators";
import type { BoutiqueDesign } from "@/data/boutique-profiles";

export function savedBoutiqueItem(boutique: {
  slug: string;
  name: string;
  media?: { type: string; url?: string }[];
}): SavedItemInput {
  const imageUrl = boutique.media?.find((m) => m.type === "image" && m.url)?.url;
  return {
    itemType: "boutique",
    boutiqueSlug: boutique.slug,
    boutiqueName: boutique.name,
    title: boutique.name,
    imageUrl,
  };
}

export function savedDesignItem(
  design: Pick<BoutiqueDesign, "id" | "title" | "imageUrl" | "price" | "outfitLabel">,
  boutiqueSlug: string,
  boutiqueName: string,
): SavedItemInput {
  return {
    itemType: "design",
    boutiqueSlug,
    boutiqueName,
    designId: design.id,
    title: design.title,
    imageUrl: design.imageUrl ?? undefined,
    priceHint: design.price,
    outfitLabel: design.outfitLabel,
  };
}

export function savedMaterialItem(material: {
  id: string;
  name: string;
  boutiqueSlug: string;
  boutiqueName: string;
  priceHint?: string;
  imageUrl?: string | null;
}): SavedItemInput {
  return {
    itemType: "material",
    boutiqueSlug: material.boutiqueSlug,
    boutiqueName: material.boutiqueName,
    designId: material.id,
    title: material.name,
    imageUrl: material.imageUrl ?? undefined,
    priceHint: material.priceHint,
    outfitLabel: "Material",
  };
}
