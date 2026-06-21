export const DEFAULT_CUSTOMER_LOCATION = "Hyderabad, TS";

export type CustomerLocationSource = "preset" | "map" | "gps" | "profile";

export interface CustomerLocation {
  label: string;
  lat: number | null;
  lng: number | null;
  source?: CustomerLocationSource;
}
