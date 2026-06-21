import { cn } from "@faden/utils";
import type { BoutiqueDesign } from "@/data/boutique-profiles";

interface DressImageProps {
  design: Pick<BoutiqueDesign, "imageUrl" | "gradient" | "title">;
  className?: string;
}

export function DressImage({ design, className }: DressImageProps) {
  if (design.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={design.imageUrl}
        alt={design.title}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return <div className={cn("h-full w-full bg-gradient-to-br", design.gradient, className)} />;
}
