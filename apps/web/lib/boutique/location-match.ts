export function extractCityLabel(locationLabel: string): string {
  return locationLabel.split(",")[0]?.trim().toLowerCase() ?? "";
}

export function extractRegionTokens(locationLabel: string): string[] {
  return locationLabel
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 1);
}

export function boutiqueAddressText(address: string | null): string {
  return (address ?? "").toLowerCase();
}

/** True when boutique address overlaps customer city or region tokens. */
export function isBoutiqueNearCustomer(
  boutiqueAddress: string | null,
  customerLocation: string,
): boolean {
  if (!customerLocation.trim()) return true;

  const address = boutiqueAddressText(boutiqueAddress);
  if (!address) return false;

  const tokens = extractRegionTokens(customerLocation);
  const city = extractCityLabel(customerLocation);

  if (city && address.includes(city)) return true;
  return tokens.some((token) => address.includes(token));
}

/** Higher score = closer / better location match (0–30). */
export function locationProximityScore(
  boutiqueAddress: string | null,
  customerLocation: string,
): number {
  if (!customerLocation.trim()) return 0;

  const address = boutiqueAddressText(boutiqueAddress);
  if (!address) return 0;

  const city = extractCityLabel(customerLocation);
  if (city && address.includes(city)) return 30;

  const tokens = extractRegionTokens(customerLocation);
  for (const token of tokens) {
    if (token.length > 2 && address.includes(token)) return 18;
  }

  return 0;
}

export function locationMatchLabel(
  boutiqueAddress: string | null,
  customerLocation: string,
): string | null {
  if (!customerLocation.trim()) return null;
  if (isBoutiqueNearCustomer(boutiqueAddress, customerLocation)) {
    const city = customerLocation.split(",")[0]?.trim();
    return city ? `Near ${city}` : "Near you";
  }
  return null;
}
