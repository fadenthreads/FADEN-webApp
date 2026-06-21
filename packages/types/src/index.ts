export type UserRole = "customer" | "boutique_owner" | "admin";

export type BoutiqueStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended";

export type VerificationStatus = "pending" | "approved" | "rejected" | "needs_info";

export type CustomizationStatus =
  | "draft"
  | "submitted"
  | "quoted"
  | "accepted"
  | "in_production"
  | "completed"
  | "cancelled";

export type OrderStatus =
  | "draft"
  | "quoted"
  | "confirmed"
  | "in_progress"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded";

export type AvailabilityStatus = "open" | "closed";

export type BookingMode = "appointment" | "video" | "both";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Boutique {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  years_in_business: number | null;
  status: BoutiqueStatus;
  pricing_info: string | null;
  avg_delivery_time: string | null;
  rush_orders_accepted: boolean;
  max_orders_per_month: number | null;
  reviews_summary: string | null;
  social_links: string | null;
  completed_orders_approx: number | null;
  availability: AvailabilityStatus;
  working_hours: string | null;
  booking_mode: BookingMode;
  communication_prefs: string | null;
  /** PostgreSQL text[] — women, men, kids */
  audiences?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BoutiqueVerification {
  id: string;
  boutique_id: string;
  status: VerificationStatus;
  reviewer_id: string | null;
  notes: string | null;
  trust_media_urls: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface BoutiqueWithVerification extends Boutique {
  verification?: BoutiqueVerification | null;
}

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}
