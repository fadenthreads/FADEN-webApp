"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { ImageUrlUpload } from "@/components/ui/image-url-upload";
import { formatPostedAt } from "@/lib/datetime/format";

const ALL_CLOTHING_TYPES_LABEL = "All kinds of clothing — full customization for women, men, and kids";

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
  const t = useTranslations("RegisterBoutiqueForm");
  const tf = useTranslations("RegisterBoutiqueForm.fields");
  const tc = useTranslations("Common");
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
  const [allKindsOfClothing, setAllKindsOfClothing] = useState(
    () => initialForm?.outfitTypes?.includes("All kinds of clothing") ?? false,
  );

  const activeIndex = SECTIONS.indexOf(active);
  const isLastSection = activeIndex === SECTIONS.length - 1;

  function goToNextSection() {
    if (!isLastSection) setActive(SECTIONS[activeIndex + 1]);
  }

  function goToPreviousSection() {
    if (activeIndex > 0) setActive(SECTIONS[activeIndex - 1]);
  }

  function toggleAllKindsOfClothing(checked: boolean) {
    setAllKindsOfClothing(checked);
    if (checked) {
      updateField("outfitTypes", ALL_CLOTHING_TYPES_LABEL);
      updateField("audiences", "women,men,kids");
    } else if (form.outfitTypes === ALL_CLOTHING_TYPES_LABEL) {
      updateField("outfitTypes", "");
    }
  }

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
        setError(t("errors.boutiqueNotFound"));
        return;
      }

      if (!hasDetailChanges) {
        setError(t("errors.updateOneField"));
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
          setError(result.error ?? t("errors.updateFailed"));
          setPending(false);
          return;
        }

        setModifySubmitted(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.updateFailed"));
        setPending(false);
      }
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/register-boutique/submit", parsed.data);

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? t("errors.submissionFailed"));
        setPending(false);
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setSubmittedSlug((payload as { slug?: string }).slug ?? null);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? t("errors.requestTimeout")
          : err instanceof Error
            ? err.message
            : t("errors.submissionFailed");
      setError(message);
      setPending(false);
    }
  }

  if (modifySubmitted) {
    return (
      <PremiumCard className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">
          {isVerifiedModify ? t("success.modificationSent") : t("success.detailsUpdated")}
        </h2>
        <p className="mt-4 text-foreground-muted">
          {isVerifiedModify ? t("success.modificationBody") : t("success.updatedBody")}
        </p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account">{t("success.backToAccount")}</Link>
        </Button>
      </PremiumCard>
    );
  }

  if (submittedSlug) {
    return (
      <PremiumCard className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">{t("success.registrationTitle")}</h2>
        <p className="mt-4 text-foreground-muted">{t("success.registrationBody")}</p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/dashboard">{t("success.goToDashboard")}</Link>
        </Button>
      </PremiumCard>
    );
  }

  if (isModify && pendingModification) {
    return (
      <PremiumCard className="mx-auto max-w-lg" hover={false}>
        <h2 className="font-display text-xl font-semibold text-gold">{t("success.pendingTitle")}</h2>
        <p className="mt-4 text-sm text-foreground-muted">
          {t("success.pendingBody", { date: formatPostedAt(pendingModification.submitted_at) })}
        </p>
        {pendingModification.owner_notes && (
          <p className="mt-3 text-sm text-foreground-muted">
            {t("success.yourNote")}: {pendingModification.owner_notes}
          </p>
        )}
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account">{t("success.backToAccount")}</Link>
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
              active === s ? "bg-navy text-white" : "text-foreground-muted hover:text-gold"
            }`}
          >
            {t(`sections.${s}`)}
          </button>
        ))}
      </nav>

      <PremiumCard className="min-w-0 flex-1" hover={false}>
        <h2 className="font-display text-xl font-semibold text-gold">{t(`sections.${active}`)}</h2>

        {error && (
          <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
            {error.includes("signed in") && (
              <>
                {" "}
                <Link href="/login?next=/register-boutique" className="underline">
                  {tc("signIn")}
                </Link>
              </>
            )}
          </p>
        )}
        {draftSaved && (
          <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            {t("draftSaved")}
          </p>
        )}

        <div className="mt-6 space-y-5">
          {active === "basic" && (
            <>
              <FormField label={tf("boutiqueName")}>
                <TextInput
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={tf("boutiqueNamePlaceholder")}
                  required
                />
              </FormField>
              <FormField label={tf("ownerName")}>
                <TextInput
                  value={form.ownerName}
                  onChange={(e) => updateField("ownerName", e.target.value)}
                  placeholder={tf("ownerNamePlaceholder")}
                  required
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label={tf("phone")}>
                  <TextInput
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                </FormField>
                <FormField label={tf("email")}>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </FormField>
              </div>
              <FormField label={tf("address")}>
                <TextArea
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={tf("addressPlaceholder")}
                  required
                />
              </FormField>
              <FormField label={tf("mapsUrl")} hint={tf("mapsUrlHint")}>
                <TextInput
                  value={form.mapsUrl}
                  onChange={(e) => updateField("mapsUrl", e.target.value)}
                  placeholder={tf("mapsUrlPlaceholder")}
                />
              </FormField>
              <FormField label={tf("yearsInBusiness")}>
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
              <ImageUrlUpload
                label={tf("portfolioPhotos")}
                hint={tf("portfolioPhotosHint")}
                value={form.portfolioPhotoUrls ?? ""}
                onChange={(value) => updateField("portfolioPhotoUrls", value)}
                purpose="portfolio"
              />
              <AudienceFormField
                value={form.audiences}
                onChange={(value) => updateField("audiences", value)}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={allKindsOfClothing}
                  onChange={(e) => toggleAllKindsOfClothing(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">{tf("allClothing")}</span>
                  <span className="mt-1 block text-xs text-foreground-muted">{tf("allClothingHint")}</span>
                </span>
              </label>
              <FormField label={tf("outfitTypes")} hint={tf("outfitTypesHint")}>
                <TextArea
                  value={form.outfitTypes}
                  onChange={(e) => {
                    setAllKindsOfClothing(false);
                    updateField("outfitTypes", e.target.value);
                  }}
                  placeholder={tf("outfitTypesPlaceholder")}
                  required={!allKindsOfClothing}
                  disabled={allKindsOfClothing}
                />
              </FormField>
            </>
          )}
          {active === "services" && (
            <FormField label={tf("servicesOffered")}>
              <TextArea
                value={form.servicesOffered}
                onChange={(e) => updateField("servicesOffered", e.target.value)}
                placeholder={tf("servicesPlaceholder")}
                required
              />
            </FormField>
          )}
          {active === "pricing" && (
            <FormField label={tf("pricingInfo")} hint={tf("pricingHint")}>
              <TextArea
                value={form.pricingInfo}
                onChange={(e) => updateField("pricingInfo", e.target.value)}
                placeholder={tf("pricingPlaceholder")}
              />
            </FormField>
          )}
          {active === "delivery" && (
            <>
              <FormField label={tf("avgDeliveryTime")}>
                <TextInput
                  value={form.avgDeliveryTime}
                  onChange={(e) => updateField("avgDeliveryTime", e.target.value)}
                  placeholder={tf("avgDeliveryPlaceholder")}
                />
              </FormField>
              <FormField label={tf("rushOrders")}>
                <SelectInput
                  value={form.rushOrdersAccepted}
                  onChange={(e) => updateField("rushOrdersAccepted", e.target.value as "yes" | "no")}
                  options={[
                    { value: "yes", label: tc("yes") },
                    { value: "no", label: tc("no") },
                  ]}
                />
              </FormField>
              <FormField label={tf("maxOrders")}>
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
              <ImageUrlUpload
                label={tf("verificationMedia")}
                hint={tf("verificationMediaHint")}
                value={form.trustMediaUrls ?? ""}
                onChange={(value) => updateField("trustMediaUrls", value)}
                purpose="verification"
              />
              <FormField label={tf("reviewsSummary")}>
                <TextArea
                  value={form.reviewsSummary}
                  onChange={(e) => updateField("reviewsSummary", e.target.value)}
                  placeholder={tf("reviewsPlaceholder")}
                />
              </FormField>
              <FormField label={tf("socialLinks")}>
                <TextArea
                  value={form.socialLinks}
                  onChange={(e) => updateField("socialLinks", e.target.value)}
                  placeholder={tf("socialPlaceholder")}
                />
              </FormField>
              <FormField label={tf("completedOrders")}>
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
              <FormField label={tf("status")}>
                <SelectInput
                  value={form.availabilityStatus}
                  onChange={(e) => updateField("availabilityStatus", e.target.value as "open" | "closed")}
                  options={[
                    { value: "open", label: tf("open") },
                    { value: "closed", label: tf("closed") },
                  ]}
                />
              </FormField>
              <FormField label={tf("workingHours")}>
                <TextInput
                  value={form.workingHours}
                  onChange={(e) => updateField("workingHours", e.target.value)}
                  placeholder={tf("workingHoursPlaceholder")}
                />
              </FormField>
              <FormField label={tf("booking")}>
                <SelectInput
                  value={form.bookingMode}
                  onChange={(e) => updateField("bookingMode", e.target.value as BoutiqueRegistrationInput["bookingMode"])}
                  options={[
                    { value: "appointment", label: tf("bookingAppointment") },
                    { value: "video", label: tf("bookingVideo") },
                    { value: "both", label: tf("bookingBoth") },
                  ]}
                />
              </FormField>
            </>
          )}
          {active === "communication" && (
            <FormField label={tf("communicationPrefs")}>
              <TextArea
                value={form.communicationPrefs}
                onChange={(e) => updateField("communicationPrefs", e.target.value)}
                placeholder={tf("communicationPlaceholder")}
              />
            </FormField>
          )}
          {isVerifiedModify && (
            <FormField label={tf("adminNote")}>
              <TextArea
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                placeholder={tf("adminNotePlaceholder")}
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
                  ? t("footer.modifyVerified")
                  : t("footer.modifyUnverified")
                : t("footer.modifyNoChanges")
              : t("footer.registerRequired")}
          </p>
          {!isModify && activeIndex > 0 && (
            <Button type="button" variant="luxury-outline" onClick={goToPreviousSection} disabled={pending}>
              {tc("back")}
            </Button>
          )}
          {!isModify && (
            <Button type="button" variant="luxury-outline" onClick={saveDraft} disabled={pending}>
              {t("buttons.saveDraft")}
            </Button>
          )}
          {!isModify && !isLastSection && (
            <Button type="button" variant="luxury" onClick={goToNextSection} disabled={pending}>
              {tc("next")}
            </Button>
          )}
          {(isModify || isLastSection) && (
            <Button
              type="button"
              variant="luxury"
              onClick={handleSubmit}
              disabled={pending || (isModify && !hasDetailChanges)}
            >
              {pending
                ? tc("submitting")
                : isModify
                  ? isVerifiedModify
                    ? t("buttons.submitModification")
                    : t("buttons.saveChanges")
                  : t("buttons.submitRegistration")}
            </Button>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
