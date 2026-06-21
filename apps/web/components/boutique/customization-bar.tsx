import Link from "next/link";
import { Button } from "@faden/ui";
import type { AvailabilityStatus } from "@faden/types";
import { isBoutiqueAcceptingOrders } from "@/lib/boutique/availability";

interface CustomizationBarProps {
  boutiqueName: string;
  boutiqueSlug: string;
  availability?: AvailabilityStatus | null;
}

export function CustomizationBar({
  boutiqueName,
  boutiqueSlug,
  availability,
}: CustomizationBarProps) {
  const shortName = boutiqueName.split(" ")[0];
  const accepting = isBoutiqueAcceptingOrders(availability);

  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl lg:px-12">
      <div className="mx-auto flex max-w-container flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {accepting ? (
          <Button asChild variant="luxury" size="lg" className="w-full sm:w-auto">
            <Link href={`/customize?boutique=${boutiqueSlug}`}>
              Customize with {shortName}
            </Link>
          </Button>
        ) : (
          <Button variant="luxury" size="lg" className="w-full sm:w-auto" disabled>
            Not accepting orders right now
          </Button>
        )}
        <Button asChild variant="luxury-outline" size="lg" className="w-full sm:w-auto">
          <Link href="/#featured-boutiques">Browse Featured Boutiques</Link>
        </Button>
      </div>
    </div>
  );
}
