"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import { ImageUrlUpload } from "@/components/ui/image-url-upload";
import { submitAlterationRequest } from "@/actions/alterations";
import { splitList } from "@faden/validators";
import { getStoredCustomerLocation } from "@/lib/location/customer-location";

const URGENCY_OPTIONS = [
  { value: "2", label: "Within 2 hours (urgent)" },
  { value: "4", label: "Within 4 hours" },
  { value: "8", label: "Same day (8 hours)" },
  { value: "24", label: "Within 24 hours" },
  { value: "48", label: "Within 2 days" },
];

export function AlterationBookingForm() {
  const t = useTranslations("Alterations");
  const router = useRouter();
  const [alterationType, setAlterationType] = useState("");
  const [urgencyHours, setUrgencyHours] = useState("2");
  const [homeServiceOk, setHomeServiceOk] = useState(false);
  const [homeAddress, setHomeAddress] = useState("");
  const [photoUrlsText, setPhotoUrlsText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<{
    requestId: string;
    boutiqueName?: string;
    boutiqueSlug?: string;
    distanceKm?: number | null;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const storedLocation = getStoredCustomerLocation();
    const result = await submitAlterationRequest({
      alterationType,
      urgencyHours: Number(urgencyHours),
      homeServiceOk,
      homeAddress: homeServiceOk ? homeAddress : undefined,
      photoUrls: splitList(photoUrlsText),
      notes,
      customerLat: storedLocation?.lat ?? undefined,
      customerLng: storedLocation?.lng ?? undefined,
    });

    setPending(false);

    if (!result.ok) {
      if (result.error?.includes("Sign in")) {
        router.push(`/login?next=${encodeURIComponent("/alterations")}`);
        return;
      }
      setError(result.error ?? t("submitFailed"));
      return;
    }

    setSuccess(result.data ?? null);
  }

  if (success) {
    return (
      <PremiumCard className="mx-auto max-w-lg text-center" hover={false}>
        <h2 className="font-display text-2xl font-semibold text-gold">{t("requestReceived")}</h2>
        <p className="mt-4 text-foreground-muted">
          {success.boutiqueName
            ? t("assignedBoutique", {
                name: success.boutiqueName,
                distance: success.distanceKm != null ? `${success.distanceKm.toFixed(1)} km` : t("nearYou"),
              })
            : t("matchingBoutique")}
        </p>
        {success.boutiqueSlug && (
          <Button asChild variant="luxury-outline" className="mt-6">
            <Link href={`/boutique/${success.boutiqueSlug}`}>{t("viewBoutique")}</Link>
          </Button>
        )}
        <Button asChild variant="luxury" className="mt-3">
          <Link href="/account">{t("goToAccount")}</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="mx-auto max-w-2xl" hover={false}>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">{t("eyebrow")}</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-sm text-foreground-muted">{t("subtitle")}</p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <FormField label={t("alterationType")} hint={t("alterationTypeHint")}>
          <TextArea
            value={alterationType}
            onChange={(e) => setAlterationType(e.target.value)}
            placeholder={t("alterationTypePlaceholder")}
            required
            rows={3}
          />
        </FormField>

        <FormField label={t("urgency")} hint={t("urgencyHint")}>
          <SelectInput
            value={urgencyHours}
            onChange={(e) => setUrgencyHours(e.target.value)}
            options={URGENCY_OPTIONS}
          />
        </FormField>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={homeServiceOk}
            onChange={(e) => setHomeServiceOk(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium">{t("homeServiceOk")}</span>
            <span className="mt-1 block text-xs text-foreground-muted">{t("homeServiceHint")}</span>
          </span>
        </label>

        {homeServiceOk && (
          <FormField label={t("homeAddress")}>
            <TextInput
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder={t("homeAddressPlaceholder")}
              required
            />
          </FormField>
        )}

        <ImageUrlUpload
          label={t("photos")}
          hint={t("photosHint")}
          value={photoUrlsText}
          onChange={setPhotoUrlsText}
          maxImages={6}
        />

        <FormField label={t("notes")}>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={3}
          />
        </FormField>

        <Button type="submit" variant="luxury" className="w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        {t("boutiqueOwnerPrompt")}{" "}
        <Link href="/alterations" className="text-gold hover:text-gold-light">
          {t("boutiqueOwnerLink")}
        </Link>
      </p>
    </PremiumCard>
  );
}
