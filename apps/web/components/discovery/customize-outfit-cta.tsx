import Link from "next/link";
import { Button } from "@faden/ui";

interface CustomizeOutfitCtaProps {
  className?: string;
}

export function CustomizeOutfitCta({ className }: CustomizeOutfitCtaProps) {
  return (
    <div className={className}>
      <Button asChild variant="luxury" size="lg">
        <Link href="/customize">Customize Outfit</Link>
      </Button>
    </div>
  );
}
