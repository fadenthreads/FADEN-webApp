export { getSupabaseEnv, isSupabaseConfigured } from "./env";
export type { SupabaseEnv } from "./env";

/** Relative path to Phase 2 SQL migration (run manually in Supabase). */
export const PHASE2_SCHEMA_PATH = "packages/database/src/schema/001_phase2.sql";
/** Phase 3 — public read policies for verified boutique portfolio data. */
export const PHASE3_SCHEMA_PATH = "packages/database/src/schema/004_phase3_public_boutique_reads.sql";
/** Phase 4 — operational RLS for orders, messaging, quotations. */
export const PHASE4_SCHEMA_PATH = "packages/database/src/schema/005_phase4_operations_rls.sql";
/** Phase 5 — payments RLS. */
export const PHASE5_SCHEMA_PATH = "packages/database/src/schema/006_phase5_payments_rls.sql";
/** Boutique owners can read customer profiles for their orders/conversations. */
export const PHASE5B_SCHEMA_PATH = "packages/database/src/schema/007_boutique_customer_profiles_rls.sql";
/** Boutique modification requests — owner submit, admin approve. */
export const PHASE6_SCHEMA_PATH = "packages/database/src/schema/008_boutique_modification_requests.sql";
/** Phase 6 — reviews constraints (one review per delivered order). */
export const PHASE6B_SCHEMA_PATH = "packages/database/src/schema/009_phase6_reviews_rls.sql";

export { applyBoutiqueDetails, boutiqueRowToFormInput } from "./apply-boutique-details";
export {
  geocodeAddress,
  parseCoordinatesFromMapsUrl,
  resolveBoutiqueLatLng,
} from "./geocode-boutique";
export {
  getBoutiqueFormById,
  getBoutiqueFormByOwnerId,
  listAllBoutiqueForms,
  type BoutiqueFormRecord,
} from "./boutique-form-queries";
export {
  BOUTIQUE_DETAIL_SECTIONS,
  BOUTIQUE_FIELD_LABELS,
  diffBoutiqueDetails,
  formatBoutiqueFieldValue,
  type BoutiqueFieldChange,
} from "./boutique-details-diff";
export {
  listPendingModificationRequests,
  type AdminModificationRequest,
} from "./modification-queries";
export {
  listAllCustomersForAdmin,
  type AdminCustomerRecord,
} from "./customer-queries";
export {
  formatAdminOrderRef,
  getAdminOrderDetail,
  getAdminOrderStats,
  listAllOrdersForAdmin,
  type AdminOrderDetail,
  type AdminOrderEvent,
  type AdminOrderListItem,
  type AdminOrderPayment,
  type AdminOrderQuotation,
  type AdminOrderStats,
} from "./order-queries";
