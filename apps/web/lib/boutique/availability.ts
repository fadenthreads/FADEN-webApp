import type { AvailabilityStatus } from "@faden/types";

export function isBoutiqueAcceptingOrders(availability?: AvailabilityStatus | null): boolean {
  return (availability ?? "open") === "open";
}

export function boutiqueAvailabilityLabel(availability?: AvailabilityStatus | null): string {
  return isBoutiqueAcceptingOrders(availability) ? "Available" : "Not available";
}

export function boutiqueAvailabilityHint(availability?: AvailabilityStatus | null): string {
  return isBoutiqueAcceptingOrders(availability)
    ? "Accepting new customization orders"
    : "Not accepting new orders right now";
}
