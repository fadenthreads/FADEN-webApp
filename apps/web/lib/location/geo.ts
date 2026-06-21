export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km away`;
  return `${Math.round(distanceKm)} km away`;
}

export function isValidCoordinate(lat: number | null | undefined, lng: number | null | undefined): lat is number {
  return (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function bestMatchScore(rating: number, distanceKm: number | null): number {
  const ratingScore = Math.max(0, Math.min(rating / 5, 1));
  if (distanceKm == null || !Number.isFinite(distanceKm)) {
    return ratingScore;
  }
  const distanceScore = Math.max(0, 1 - Math.min(distanceKm, 50) / 50);
  return ratingScore * 0.55 + distanceScore * 0.45;
}
