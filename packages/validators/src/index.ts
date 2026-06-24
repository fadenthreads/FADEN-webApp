import { z } from "zod";

export * from "./audiences";

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email");

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least 1 uppercase letter")
  .regex(/[a-z]/, "Include at least 1 lowercase letter")
  .regex(/[0-9]/, "Include at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Include at least 1 special character");

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: normalizedEmailSchema,
  password: strongPasswordSchema,
  role: z.enum(["customer", "boutique_owner"]).default("customer"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormInput = z.infer<typeof signupFormSchema>;

export const boutiqueRegistrationSchema = z.object({
  name: z.string().min(2, "Boutique name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Valid phone number required (at least 10 digits)")),
  email: z.string().email("Valid email required"),
  address: z.string().min(5, "Address is required"),
  mapsUrl: z.string().optional(),
  yearsInBusiness: z.coerce.number().min(0).optional(),
  portfolioPhotoUrls: z.string().optional(),
  outfitTypes: z.string().min(1, "List at least one outfit type"),
  audiences: z.string().min(1, "Select at least one category you serve (Women, Men, or Kids)"),
  servicesOffered: z.string().min(1, "Describe services offered"),
  pricingInfo: z.string().optional(),
  avgDeliveryTime: z.string().optional(),
  rushOrdersAccepted: z.enum(["yes", "no"]),
  maxOrdersPerMonth: z.coerce.number().min(0).optional(),
  reviewsSummary: z.string().optional(),
  trustMediaUrls: z.string().optional(),
  socialLinks: z.string().optional(),
  completedOrdersApprox: z.coerce.number().min(0).optional(),
  availabilityStatus: z.enum(["open", "closed"]),
  workingHours: z.string().optional(),
  bookingMode: z.enum(["appointment", "video", "both"]),
  communicationPrefs: z.string().optional(),
});

export type BoutiqueRegistrationInput = z.infer<typeof boutiqueRegistrationSchema>;

/** Same fields as registration — used when a verified owner requests profile updates. */
export const boutiqueModificationSchema = boutiqueRegistrationSchema;

export type BoutiqueModificationInput = z.infer<typeof boutiqueModificationSchema>;

export const submitBoutiqueModificationSchema = z.object({
  boutiqueId: z.string().uuid(),
  details: boutiqueModificationSchema,
  ownerNotes: z.string().max(2000).optional(),
});

export type SubmitBoutiqueModificationInput = z.infer<typeof submitBoutiqueModificationSchema>;

export const modificationDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "needs_info"]),
  notes: z.string().optional(),
});

export type ModificationDecisionInput = z.infer<typeof modificationDecisionSchema>;

export const verificationDecisionSchema = z.object({
  boutiqueId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "needs_info"]),
  notes: z.string().optional(),
});

export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["customer", "boutique_owner", "admin"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const customerLocationUpdateSchema = z.object({
  label: z.string().min(1, "Location label is required"),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});

export type CustomerLocationUpdateInput = z.infer<typeof customerLocationUpdateSchema>;

export const dressLengthDetailsSchema = z
  .object({
    blouseLength: z.string().max(80).optional(),
    skirtLength: z.string().max(80).optional(),
    dupattaLength: z.string().max(80).optional(),
    sleeveLength: z.string().max(80).optional(),
    overallLength: z.string().max(80).optional(),
    notes: z.string().max(500).optional(),
  })
  .optional();

export const createPortfolioItemSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().max(2000).optional(),
  priceHint: z.string().max(200).optional(),
  sizeLabel: z.string().max(120).optional(),
  lengthDetails: dressLengthDetailsSchema,
  outfitTypeId: z.string().uuid().optional().nullable(),
  outfitTypeLabel: z.string().max(80).optional(),
  mediaUrl: z.string().min(1, "Photo URL or upload is required"),
});

export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>;

export const updatePortfolioItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).optional(),
  description: z.string().max(2000).optional(),
  priceHint: z.string().max(200).optional(),
  sizeLabel: z.string().max(120).optional(),
  lengthDetails: dressLengthDetailsSchema,
  outfitTypeId: z.string().uuid().optional().nullable(),
  outfitTypeLabel: z.string().max(80).optional(),
  mediaUrl: z.string().min(1).optional(),
});

export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>;

export const createCreativeDispatchSchema = z.object({
  title: z.string().min(2, "Title is required"),
  tag: z.string().max(80).optional(),
  description: z.string().max(2000).optional(),
  mediaUrl: z.string().optional(),
  gradient: z.string().max(160).optional(),
});

export type CreateCreativeDispatchInput = z.infer<typeof createCreativeDispatchSchema>;

export const updateCreativeDispatchSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).optional(),
  tag: z.string().max(80).optional(),
  description: z.string().max(2000).optional(),
  mediaUrl: z.string().optional(),
  gradient: z.string().max(160).optional(),
});

export type UpdateCreativeDispatchInput = z.infer<typeof updateCreativeDispatchSchema>;

export const staffPayPeriodSchema = z.enum(["monthly", "weekly", "hourly", "per_piece"]);

/** UUID field that may be omitted or sent as "" from client forms. */
export const optionalUuidField = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const createBoutiqueStaffSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(120),
  role: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]).optional(),
  payAmount: z.string().trim().min(1, "Pay amount is required").max(80),
  payPeriod: staffPayPeriodSchema.default("monthly"),
  notes: z.string().trim().max(500).optional(),
  gender: z.enum(["female", "male"]).optional(),
  canDoHomeVisits: z.boolean().optional(),
});

export type CreateBoutiqueStaffInput = z.infer<typeof createBoutiqueStaffSchema>;

export const updateBoutiqueStaffSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120).optional(),
  role: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  payAmount: z.string().trim().min(1).max(80).optional(),
  payPeriod: staffPayPeriodSchema.optional(),
  notes: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
  gender: z.enum(["female", "male"]).optional(),
  canDoHomeVisits: z.boolean().optional(),
});

export type UpdateBoutiqueStaffInput = z.infer<typeof updateBoutiqueStaffSchema>;

export const selfMeasurementsSchema = z.object({
  height: z.string().optional(),
  bust: z.string().optional(),
  underBust: z.string().optional(),
  waist: z.string().optional(),
  hip: z.string().optional(),
  shoulder: z.string().optional(),
  armhole: z.string().optional(),
  sleeveLength: z.string().optional(),
  blouseLength: z.string().optional(),
  kurtaLength: z.string().optional(),
  inseam: z.string().optional(),
  neck: z.string().optional(),
});

export const customizationRequestSchema = z.object({
  flowOrder: z.enum(["boutique-first", "requirements-first"]),
  outfitAudience: z.enum(["women", "men", "kids"], {
    required_error: "Select who this outfit is for (Women, Men, or Kids)",
  }),
  outfitType: z.string().min(1, "Select an outfit type"),
  outfitDescription: z.string().optional(),
  occasion: z.string().optional(),
  inspirationLinks: z.string().optional(),
  sketchNotes: z.string().optional(),
  mixOutfitNotes: z.string().optional(),
  mixOutfitLinks: z.string().optional(),
  mixOutfitImages: z.array(z.string()).optional(),
  fabricSource: z.enum(["customer", "boutique"]),
  fabricTypes: z.string().optional(),
  fabricColors: z.string().optional(),
  colorCount: z.string().optional(),
  measurementMode: z.string().min(1, "Select a measurement option"),
  measurementAssistantGender: z.enum(["female", "male", "any"]).optional(),
  homeVisitNotes: z.string().optional(),
  homeVisitLocationLabel: z.string().optional(),
  homeVisitLat: z.number().nullable().optional(),
  homeVisitLng: z.number().nullable().optional(),
  homeVisitDate: z.string().optional(),
  homeVisitTime: z.string().optional(),
  savedMeasurementProfileId: optionalUuidField,
  saveMeasurementToAccount: z.boolean().optional(),
  savedMeasurementLabel: z.string().trim().max(120).optional(),
  videoSessionDate: z.string().optional(),
  videoSessionTime: z.string().optional(),
  videoSessionNotes: z.string().optional(),
  measurementUnit: z.enum(["in", "cm"]).optional(),
  selfMeasurements: selfMeasurementsSchema.optional(),
  measurements: z.string().optional(),
  deliveryDate: z.string().optional(),
  neckDesign: z.string().optional(),
  neckDesignImages: z.array(z.string()).optional(),
  sleeveDesign: z.string().optional(),
  sleeveDesignImages: z.array(z.string()).optional(),
  backDesign: z.string().optional(),
  backDesignImages: z.array(z.string()).optional(),
  embroideryDetails: z.string().optional(),
  embroideryDetailImages: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  specialRequests: z.string().optional(),
  specialRequestImages: z.array(z.string()).optional(),
  selectedBoutiqueSlug: z.string().optional(),
});

export type CustomizationRequestInput = z.infer<typeof customizationRequestSchema>;

export const savedMeasurementProfileSchema = z.object({
  label: z.string().trim().min(1, "Give this size profile a name").max(120),
  outfitType: z.string().trim().max(80).optional(),
  outfitAudience: z.enum(["women", "men", "kids"]).optional(),
  measurementUnit: z.enum(["in", "cm"]).default("in"),
  measurements: selfMeasurementsSchema,
});

export type SavedMeasurementProfileInput = z.infer<typeof savedMeasurementProfileSchema>;

export const updateSavedMeasurementProfileSchema = savedMeasurementProfileSchema.extend({
  id: z.string().uuid(),
});

export type UpdateSavedMeasurementProfileInput = z.infer<typeof updateSavedMeasurementProfileSchema>;

export const confirmHomeVisitSchema = z.object({
  visitId: z.string().uuid(),
  confirmedStart: z.string().min(1),
  confirmedEnd: z.string().min(1),
  assignedStaffId: optionalUuidField,
  ownerNotes: z.string().max(1000).optional(),
});

export type ConfirmHomeVisitInput = z.infer<typeof confirmHomeVisitSchema>;

export const captureHomeVisitMeasurementsSchema = z.object({
  visitId: z.string().uuid(),
  measurements: selfMeasurementsSchema,
  measurementUnit: z.enum(["in", "cm"]).default("in"),
});

export type CaptureHomeVisitMeasurementsInput = z.infer<typeof captureHomeVisitMeasurementsSchema>;

export const completeHomeVisitSchema = z.object({
  visitId: z.string().uuid(),
  saveToCustomerAccount: z.boolean().optional(),
  savedMeasurementLabel: z.string().trim().max(120).optional(),
});

export type CompleteHomeVisitInput = z.infer<typeof completeHomeVisitSchema>;

/** Fields required to preview boutique matches before submit. */
export const customizationMatchSchema = customizationRequestSchema
  .pick({
    outfitAudience: true,
    outfitType: true,
    occasion: true,
    budgetRange: true,
    deliveryDate: true,
  })
  .extend({
    customerLocation: z.string().optional(),
    customerLat: z.number().optional(),
    customerLng: z.number().optional(),
  });

export type CustomizationMatchInput = z.infer<typeof customizationMatchSchema>;

export const customizationMultiSubmitSchema = customizationRequestSchema.extend({
  selectedBoutiqueSlugs: z
    .array(z.string().min(1))
    .min(1, "Select at least one boutique")
    .max(5, "You can request quotes from up to 5 boutiques"),
});

export type CustomizationMultiSubmitInput = z.infer<typeof customizationMultiSubmitSchema>;

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1, "Message cannot be empty").max(4000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const updateCustomizationStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["submitted", "quoted", "accepted", "in_production", "completed", "cancelled"]),
});

export type UpdateCustomizationStatusInput = z.infer<typeof updateCustomizationStatusSchema>;

const quotationLineItemSchema = z.object({
  label: z.string().min(1, "Line item label is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be zero or more"),
});

export const createQuotationSchema = z.object({
  orderId: z.string().uuid(),
  lineItems: z.array(quotationLineItemSchema).min(1, "Add at least one line item"),
  tax: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  validUntilDays: z.coerce.number().int().min(1).max(30).default(7),
  advancePercent: z.coerce
    .number()
    .int("Advance must be a whole number")
    .min(0, "Advance cannot be negative")
    .max(40, "Advance payment cannot exceed 40%")
    .default(40),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export const quotationDecisionSchema = z.object({
  quotationId: z.string().uuid(),
  decision: z.enum(["accepted", "declined"]),
});

export type QuotationDecisionInput = z.infer<typeof quotationDecisionSchema>;

export const createPaymentOrderSchema = z.object({
  orderId: z.string().uuid(),
  phase: z.enum(["deposit", "balance"]).optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;

export const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  mock: z.boolean().optional(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["in_progress", "shipped", "delivered"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  body: z.string().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const connectBoutiqueSchema = z.object({
  requestId: z.string().uuid(),
  boutiqueSlug: z.string().min(1, "Select a boutique"),
});

export type ConnectBoutiqueInput = z.infer<typeof connectBoutiqueSchema>;

/** POST /api/appointments/book — Cal.com slot confirmed → meeting URL → DB row */
export const bookFittingAppointmentSchema = z.object({
  boutiqueId: z.string().uuid(),
  calBookingId: z.union([z.string(), z.number()]).optional(),
  calBookingUid: z.string().min(1).optional(),
  scheduledStart: z.string().min(1, "scheduledStart is required"),
  scheduledEnd: z.string().min(1, "scheduledEnd is required"),
  customizationRequestId: z.string().uuid().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).optional(),
  source: z.enum(["cal_embed", "cal_webhook", "manual", "owner_scheduled"]).optional(),
});

export type BookFittingAppointmentInput = z.infer<typeof bookFittingAppointmentSchema>;

/** POST /api/appointments/reschedule — Cal.com slot changed → update DB row */
export const rescheduleFittingAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  calBookingId: z.union([z.string(), z.number()]).optional(),
  calBookingUid: z.string().min(1).optional(),
  scheduledStart: z.string().min(1, "scheduledStart is required"),
  scheduledEnd: z.string().min(1, "scheduledEnd is required"),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).optional(),
  source: z.enum(["cal_embed", "owner_rescheduled"]).optional(),
});

export type RescheduleFittingAppointmentInput = z.infer<typeof rescheduleFittingAppointmentSchema>;

export const savedItemSchema = z.object({
  itemType: z.enum(["boutique", "design"]),
  boutiqueSlug: z.string().min(1),
  boutiqueName: z.string().min(1),
  designId: z.string().optional(),
  title: z.string().min(1),
  imageUrl: z.string().optional(),
  priceHint: z.string().optional(),
  outfitLabel: z.string().optional(),
});

export type SavedItemInput = z.infer<typeof savedItemSchema>;

export const adminOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "draft",
    "quoted",
    "confirmed",
    "in_progress",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  note: z.string().max(500).optional(),
});

export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;

export const adminOrderNoteSchema = z.object({
  orderId: z.string().uuid(),
  note: z.string().min(1, "Note is required").max(500),
});

export type AdminOrderNoteInput = z.infer<typeof adminOrderNoteSchema>;

export const adminCancelOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export type AdminCancelOrderInput = z.infer<typeof adminCancelOrderSchema>;

export const alterationRequestSchema = z.object({
  alterationType: z.string().trim().min(3, "Describe the alteration you need"),
  urgencyHours: z.coerce
    .number()
    .int()
    .min(1, "Select how soon you need it")
    .max(48, "Urgency must be within 48 hours"),
  homeServiceOk: z.boolean().default(false),
  homeAddress: z.string().optional(),
  homeLat: z.coerce.number().optional().nullable(),
  homeLng: z.coerce.number().optional().nullable(),
  photoUrls: z.array(z.string()).max(6).default([]),
  notes: z.string().max(2000).optional(),
  customerLat: z.coerce.number().optional().nullable(),
  customerLng: z.coerce.number().optional().nullable(),
});

export type AlterationRequestInput = z.infer<typeof alterationRequestSchema>;

export const alterationStatusUpdateSchema = z.object({
  requestId: z.string().uuid(),
  boutiqueId: z.string().uuid(),
  status: z.enum(["assigned", "in_progress", "completed", "cancelled"]),
});

export type AlterationStatusUpdateInput = z.infer<typeof alterationStatusUpdateSchema>;

/** Split newline- or comma-separated free text into trimmed tokens. */
export function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
