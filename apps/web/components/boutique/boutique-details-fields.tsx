"use client";

import type { BoutiqueRegistrationInput } from "@faden/validators";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import {
  BOUTIQUE_FORM_SECTIONS,
  BOUTIQUE_SECTION_LABELS,
  type BoutiqueFormSection,
} from "@/components/boutique/boutique-form-constants";
import { AudienceFormField } from "@/components/boutique/audience-form-field";

interface BoutiqueDetailsFieldsProps {
  active: BoutiqueFormSection;
  form: BoutiqueRegistrationInput;
  onFieldChange: <K extends keyof BoutiqueRegistrationInput>(
    key: K,
    value: BoutiqueRegistrationInput[K],
  ) => void;
}

export function BoutiqueDetailsFields({ active, form, onFieldChange }: BoutiqueDetailsFieldsProps) {
  return (
    <div className="mt-6 space-y-5">
      {active === "basic" && (
        <>
          <FormField label="Boutique name">
            <TextInput
              value={form.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Silk & Thread Studio"
              required
            />
          </FormField>
          <FormField label="Owner name">
            <TextInput
              value={form.ownerName}
              onChange={(e) => onFieldChange("ownerName", e.target.value)}
              placeholder="Full name"
              required
            />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Phone">
              <TextInput
                type="tel"
                value={form.phone}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                required
              />
            </FormField>
            <FormField label="Email">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                required
              />
            </FormField>
          </div>
          <FormField label="Address">
            <TextArea
              value={form.address}
              onChange={(e) => onFieldChange("address", e.target.value)}
              placeholder="Full address"
              required
            />
          </FormField>
          <FormField label="Google Maps location" hint="Paste maps link or coordinates.">
            <TextInput
              value={form.mapsUrl}
              onChange={(e) => onFieldChange("mapsUrl", e.target.value)}
              placeholder="https://maps.google.com/…"
            />
          </FormField>
          <FormField label="Years in business">
            <TextInput
              type="number"
              min={0}
              value={form.yearsInBusiness ?? ""}
              onChange={(e) =>
                onFieldChange("yearsInBusiness", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </FormField>
        </>
      )}
      {active === "portfolio" && (
        <>
          <FormField label="Completed outfit photos" hint="One URL per line until file upload is enabled.">
            <TextArea
              value={form.portfolioPhotoUrls}
              onChange={(e) => onFieldChange("portfolioPhotoUrls", e.target.value)}
              placeholder="Photo URLs, one per line"
            />
          </FormField>
          <AudienceFormField
            value={form.audiences}
            onChange={(value) => onFieldChange("audiences", value)}
          />
          <FormField
            label="Outfit types you make"
            hint="Include women's, men's, and kids' types you stitch."
          >
            <TextArea
              value={form.outfitTypes}
              onChange={(e) => onFieldChange("outfitTypes", e.target.value)}
              placeholder="Lehenga, Sherwani, Kids Kurta…"
              required
            />
          </FormField>
        </>
      )}
      {active === "services" && (
        <FormField label="Services offered">
          <TextArea
            value={form.servicesOffered}
            onChange={(e) => onFieldChange("servicesOffered", e.target.value)}
            placeholder="Stitching only, custom design, alterations…"
            required
          />
        </FormField>
      )}
      {active === "pricing" && (
        <FormField label="Pricing information" hint="e.g. Blouses start from ₹2,500">
          <TextArea
            value={form.pricingInfo}
            onChange={(e) => onFieldChange("pricingInfo", e.target.value)}
            placeholder="Describe your pricing ranges per garment type"
          />
        </FormField>
      )}
      {active === "delivery" && (
        <>
          <FormField label="Average delivery time">
            <TextInput
              value={form.avgDeliveryTime}
              onChange={(e) => onFieldChange("avgDeliveryTime", e.target.value)}
              placeholder="e.g. 12–18 days"
            />
          </FormField>
          <FormField label="Rush orders accepted?">
            <SelectInput
              value={form.rushOrdersAccepted}
              onChange={(e) => onFieldChange("rushOrdersAccepted", e.target.value as "yes" | "no")}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </FormField>
          <FormField label="Max orders per month">
            <TextInput
              type="number"
              value={form.maxOrdersPerMonth ?? ""}
              onChange={(e) =>
                onFieldChange("maxOrdersPerMonth", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </FormField>
        </>
      )}
      {active === "trust" && (
        <>
          <FormField label="Customer reviews summary">
            <TextArea
              value={form.reviewsSummary}
              onChange={(e) => onFieldChange("reviewsSummary", e.target.value)}
              placeholder="Written reviews, delivery ratings, quality ranges"
            />
          </FormField>
          <FormField label="Photos & videos">
            <TextArea
              value={form.trustMediaUrls}
              onChange={(e) => onFieldChange("trustMediaUrls", e.target.value)}
              placeholder="Portfolio / workshop video URLs"
            />
          </FormField>
          <FormField label="Social media links">
            <TextArea
              value={form.socialLinks}
              onChange={(e) => onFieldChange("socialLinks", e.target.value)}
              placeholder="Instagram, Facebook…"
            />
          </FormField>
          <FormField label="Completed orders (approx.)">
            <TextInput
              type="number"
              value={form.completedOrdersApprox ?? ""}
              onChange={(e) =>
                onFieldChange(
                  "completedOrdersApprox",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </FormField>
        </>
      )}
      {active === "availability" && (
        <>
          <FormField label="Status">
            <SelectInput
              value={form.availabilityStatus}
              onChange={(e) => onFieldChange("availabilityStatus", e.target.value as "open" | "closed")}
              options={[
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ]}
            />
          </FormField>
          <FormField label="Working hours">
            <TextInput
              value={form.workingHours}
              onChange={(e) => onFieldChange("workingHours", e.target.value)}
              placeholder="Mon–Sat 10am–7pm"
            />
          </FormField>
          <FormField label="Booking">
            <SelectInput
              value={form.bookingMode}
              onChange={(e) =>
                onFieldChange("bookingMode", e.target.value as BoutiqueRegistrationInput["bookingMode"])
              }
              options={[
                { value: "appointment", label: "Appointment booking" },
                { value: "video", label: "Video call booking" },
                { value: "both", label: "Both" },
              ]}
            />
          </FormField>
        </>
      )}
      {active === "communication" && (
        <FormField label="Preferred communication">
          <TextArea
            value={form.communicationPrefs}
            onChange={(e) => onFieldChange("communicationPrefs", e.target.value)}
            placeholder="In-app messaging, consultation booking preferences…"
          />
        </FormField>
      )}
    </div>
  );
}

interface BoutiqueDetailsSectionNavProps {
  active: BoutiqueFormSection;
  onSectionChange: (section: BoutiqueFormSection) => void;
}

export function BoutiqueDetailsSectionNav({ active, onSectionChange }: BoutiqueDetailsSectionNavProps) {
  return (
    <nav className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-56 lg:flex-col">
      {BOUTIQUE_FORM_SECTIONS.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => onSectionChange(section)}
          className={`rounded-lg px-4 py-2 text-left text-sm transition-colors ${
            active === section ? "bg-cherry text-gold-light" : "text-foreground-muted hover:text-gold"
          }`}
        >
          {BOUTIQUE_SECTION_LABELS[section]}
        </button>
      ))}
    </nav>
  );
}
