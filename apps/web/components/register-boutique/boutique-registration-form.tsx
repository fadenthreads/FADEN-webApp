"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { boutiqueRegistrationSchema, type BoutiqueRegistrationInput } from "@faden/validators";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import { authFetch } from "@/lib/supabase/client";
import {
  submitBoutiqueModification,
  updateOwnerBoutiqueDetails,
} from "@/actions/boutique-modification";
import type { BoutiqueModificationSummary } from "@/lib/boutique/modification-queries";
import { boutiqueDetailsChanged } from "@/components/boutique/boutique-form-constants";
import { AudienceFormField } from "@/components/boutique/audience-form-field";
import { formatPostedAt } from "@/lib/datetime/format";

const DRAFT_KEY = "faden-boutique-registration-draft";

const SECTIONS = [
  "basic",
  "portfolio",
  "services",
  "pricing",
  "delivery",
  "trust",
  "availability",
  "communication",
] as const;

type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, string> = {
  basic: "Basic Details",
  portfolio: "Portfolio",
  services: "Services Offered",
  pricing: "Pricing Information",
  delivery: "Delivery Information",
  trust: "Trust Signals & Reviews",
  availability: "Availability",
  communication: "Communication",
};

const defaultForm: BoutiqueRegistrationInput = {
  name: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  mapsUrl: "",
  yearsInBusiness: undefined,
  portfolioPhotoUrls: "",
  audiences: "women",
  outfitTypes: "",
  servicesOffered: "",
  pricingInfo: "",
  avgDeliveryTime: "",
  rushOrdersAccepted: "no",
  maxOrdersPerMonth: undefined,
  reviewsSummary: "",
  trustMediaUrls: "",
  socialLinks: "",
  completedOrdersApprox: undefined,
  availabilityStatus: "open",
  workingHours: "",
  bookingMode: "both",
  communicationPrefs: "",
};

const SECTION_FIELDS: Record<Section, (keyof BoutiqueRegistrationInput)[]> = {
  basic: ["name", "ownerName", "phone", "email", "address"],
  portfolio: ["audiences", "outfitTypes", "portfolioPhotoUrls"],
  services: ["servicesOffered"],
  pricing: ["pricingInfo"],
  delivery: ["avgDeliveryTime", "rushOrdersAccepted", "maxOrdersPerMonth"],
  trust: ["reviewsSummary", "trustMediaUrls", "socialLinks", "completedOrdersApprox"],
  availability: ["availabilityStatus", "workingHours", "bookingMode"],
  communication: ["communicationPrefs"],
};

function sectionForField(field: keyof BoutiqueRegistrationInput): Section {
  for (const section of SECTIONS) {
    if (SECTION_FIELDS[section].includes(field)) return section;
  }
  return "basic";
}

interface BoutiqueRegistrationFormProps {
  mode?: "register" | "modify";
  boutiqueId?: string;
  boutiqueStatus?: string;
  initialForm?: BoutiqueRegistrationInput;
  pendingModification?: BoutiqueModificationSummary | null;
}

export function BoutiqueRegistrationForm({
  mode = "register",
  boutiqueId,
  boutiqueStatus,
  initialForm,
  pendingModification = null,
}: BoutiqueRegistrationFormProps) {
  const router = useRouter();
  const isModify = mode === "modify";
  const isVerifiedModify = isModify && boutiqueStatus === "verified";

  const [active, setActive] = useState<Section>("basic");
  const [baselineForm, setBaselineForm] = useState<BoutiqueRegistrationInput>(
    initialForm ?? defaultForm,
  );
  const [form, setForm] = useState<BoutiqueRegistrationInput>(initialForm ?? defaultForm);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const [modifySubmitted, setModifySubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const hasDetailChanges = useMemo(
    () => isModify && boutiqueDetailsChanged(form, baselineForm),
    [isModify, form, baselineForm],
  );

  useEffect(() => {
    if (!isModify) return;

    if (initialForm) {
      setBaselineForm(initialForm);
      setForm(initialForm);
    }

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, [initialForm, isModify]);

  useEffect(() => {
    if (isModify) return;

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm({ ...defaultForm, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt draft
    }
  }, [isModify]);

  function updateField<K extends keyof BoutiqueRegistrationInput>(key: K, value: BoutiqueRegistrationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDraftSaved(false);
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setDraftSaved(true);
  }

  async function handleSubmit() {
    setError(null);
    const parsed = boutiqueRegistrationSchema.safeParse(form);
    if (!parsed.success) {
      const firstIssue = parsed.error.errors[0];
      const field = firstIssue?.path[0] as keyof BoutiqueRegistrationInput | undefined;
      if (field) setActive(sectionForField(field));
      setError(firstIssue?.message ?? "Please complete all required fields.");
      return;
    }

    if (isModify) {
      if (!boutiqueId) {
        setError("Boutique not found.");
        return;
      }

      if (!hasDetailChanges) {
        setError("Update at least one field before submitting.");
        return;
      }

      setPending(true);
      try {
        const result = isVerifiedModify
          ? await submitBoutiqueModification({
              boutiqueId,
              details: parsed.data,
              ownerNotes,
            })
          : await updateOwnerBoutiqueDetails({
              boutiqueId,
              details: parsed.data,
            });

        if (!result.ok) {
          setError(result.error ?? "Update failed");
          setPending(false);
          return;
        }

        setModifySubmitted(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
        setPending(false);
      }
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/register-boutique/submit", parsed.data);

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Submission failed");
        setPending(false);
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setSubmittedSlug((payload as { slug?: string }).slug ?? null);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out. Restart the dev server and try again."
          : err instanceof Error
            ? err.message
            : "Submission failed";
      setError(message);
      setPending(false);
    }
  }

  if (modifySubmitted) {
    return (
      <PremiumCard className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">
          {isVerifiedModify ? "Modification Request Sent" : "Details Updated"}
        </h2>
        <p className="mt-4 text-foreground-muted">
          {isVerifiedModify
            ? "Our team will review your changes. Your live profile stays unchanged until approved."
            : "Your boutique registration has been updated."}
        </p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account">Back to Account</Link>
        </Button>
      </PremiumCard>
    );
  }

  if (submittedSlug) {
    return (
      <PremiumCard className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">Registration Received</h2>
        <p className="mt-4 text-foreground-muted">
          Our team will verify your portfolio and trust signals. You&apos;ll receive dashboard
          access once approved.
        </p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </PremiumCard>
    );
  }

  if (isModify && pendingModification) {
    return (
      <PremiumCard className="mx-auto max-w-lg" hover={false}>
        <h2 className="font-display text-xl font-semibold text-gold">Modification Pending Review</h2>
        <p className="mt-4 text-sm text-foreground-muted">
          You submitted changes on {formatPostedAt(pendingModification.submitted_at)}. Your live profile
          stays unchanged until an admin approves the request.
        </p>
        {pendingModification.owner_notes && (
          <p className="mt-3 text-sm text-foreground-muted">
            Your note: {pendingModification.owner_notes}
          </p>
        )}
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account">Back to Account</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
      <nav className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-56 lg:flex-col">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={`rounded-lg px-4 py-2 text-left text-sm transition-colors ${
              active === s ? "bg-cherry text-gold-light" : "text-foreground-muted hover:text-gold"
            }`}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </nav>

      <PremiumCard className="min-w-0 flex-1" hover={false}>
        <h2 className="font-display text-xl font-semibold text-gold">{SECTION_LABELS[active]}</h2>

        {error && (
          <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
            {error.includes("signed in") && (
              <>
                {" "}
                <Link href="/login?next=/register-boutique" className="underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}
        {draftSaved && (
          <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            Draft saved on this device.
          </p>
        )}

        <div className="mt-6 space-y-5">
          {active === "basic" && (
            <>
              <FormField label="Boutique name">
                <TextInput
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Silk & Thread Studio"
                  required
                />
              </FormField>
              <FormField label="Owner name">
                <TextInput
                  value={form.ownerName}
                  onChange={(e) => updateField("ownerName", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Phone">
                  <TextInput
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Email">
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </FormField>
              </div>
              <FormField label="Address">
                <TextArea
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Full address"
                  required
                />
              </FormField>
              <FormField label="Google Maps location" hint="Paste maps link or coordinates.">
                <TextInput
                  value={form.mapsUrl}
                  onChange={(e) => updateField("mapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/…"
                />
              </FormField>
              <FormField label="Years in business">
                <TextInput
                  type="number"
                  min={0}
                  value={form.yearsInBusiness ?? ""}
                  onChange={(e) =>
                    updateField("yearsInBusiness", e.target.value ? Number(e.target.value) : undefined)
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
                  onChange={(e) => updateField("portfolioPhotoUrls", e.target.value)}
                  placeholder="Photo URLs, one per line"
                />
              </FormField>
              <AudienceFormField
                value={form.audiences}
                onChange={(value) => updateField("audiences", value)}
              />
              <FormField
                label="Outfit types you make"
                hint="List women's, men's, and kids' types — e.g. Lehenga, Sherwani, Kids Kurta."
              >
                <TextArea
                  value={form.outfitTypes}
                  onChange={(e) => updateField("outfitTypes", e.target.value)}
                  placeholder="Lehenga, Saree, Sherwani, Kids Lehenga…"
                  required
                />
              </FormField>
            </>
          )}
          {active === "services" && (
            <FormField label="Services offered">
              <TextArea
                value={form.servicesOffered}
                onChange={(e) => updateField("servicesOffered", e.target.value)}
                placeholder="Stitching only, custom design, alterations…"
                required
              />
            </FormField>
          )}
          {active === "pricing" && (
            <FormField label="Pricing information" hint="e.g. Blouses start from ₹2,500">
              <TextArea
                value={form.pricingInfo}
                onChange={(e) => updateField("pricingInfo", e.target.value)}
                placeholder="Describe your pricing ranges per garment type"
              />
            </FormField>
          )}
          {active === "delivery" && (
            <>
              <FormField label="Average delivery time">
                <TextInput
                  value={form.avgDeliveryTime}
                  onChange={(e) => updateField("avgDeliveryTime", e.target.value)}
                  placeholder="e.g. 12–18 days"
                />
              </FormField>
              <FormField label="Rush orders accepted?">
                <SelectInput
                  value={form.rushOrdersAccepted}
                  onChange={(e) => updateField("rushOrdersAccepted", e.target.value as "yes" | "no")}
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
                    updateField("maxOrdersPerMonth", e.target.value ? Number(e.target.value) : undefined)
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
                  onChange={(e) => updateField("reviewsSummary", e.target.value)}
                  placeholder="Written reviews, delivery ratings, quality ranges"
                />
              </FormField>
              <FormField label="Photos & videos" hint="Required — or FADEN will schedule a visit.">
                <TextArea
                  value={form.trustMediaUrls}
                  onChange={(e) => updateField("trustMediaUrls", e.target.value)}
                  placeholder="Portfolio / workshop video URLs"
                />
              </FormField>
              <FormField label="Social media links">
                <TextArea
                  value={form.socialLinks}
                  onChange={(e) => updateField("socialLinks", e.target.value)}
                  placeholder="Instagram, Facebook…"
                />
              </FormField>
              <FormField label="Completed orders (approx.)">
                <TextInput
                  type="number"
                  value={form.completedOrdersApprox ?? ""}
                  onChange={(e) =>
                    updateField("completedOrdersApprox", e.target.value ? Number(e.target.value) : undefined)
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
                  onChange={(e) => updateField("availabilityStatus", e.target.value as "open" | "closed")}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </FormField>
              <FormField label="Working hours">
                <TextInput
                  value={form.workingHours}
                  onChange={(e) => updateField("workingHours", e.target.value)}
                  placeholder="Mon–Sat 10am–7pm"
                />
              </FormField>
              <FormField label="Booking">
                <SelectInput
                  value={form.bookingMode}
                  onChange={(e) => updateField("bookingMode", e.target.value as BoutiqueRegistrationInput["bookingMode"])}
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
                onChange={(e) => updateField("communicationPrefs", e.target.value)}
                placeholder="In-app messaging, consultation booking preferences…"
              />
            </FormField>
          )}
          {isVerifiedModify && (
            <FormField label="Note for admin (optional)">
              <TextArea
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                placeholder="Explain what changed or why you updated your profile…"
                rows={3}
              />
            </FormField>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <p className="text-xs text-foreground-muted sm:mr-auto sm:self-center">
            {isModify
              ? hasDetailChanges
                ? isVerifiedModify
                  ? "Submit your changes for admin review."
                  : "Save your updated registration details."
                : "Change at least one field to enable submission."
              : "Required: basic details, outfit types, and services (check all sections)."}
          </p>
          {!isModify && (
            <Button type="button" variant="luxury-outline" onClick={saveDraft} disabled={pending}>
              Save Draft
            </Button>
          )}
          <Button
            type="button"
            variant="luxury"
            onClick={handleSubmit}
            disabled={pending || (isModify && !hasDetailChanges)}
          >
            {pending
              ? "Submitting…"
              : isModify
                ? isVerifiedModify
                  ? "Submit modification"
                  : "Save changes"
                : "Submit Registration"}
          </Button>
        </div>
      </PremiumCard>
    </div>
  );
}
