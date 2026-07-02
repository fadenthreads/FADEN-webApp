"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import {
  materialBusinessRegistrationSchema,
  type MaterialBusinessRegistrationInput,
} from "@faden/validators";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, TextArea, TextInput } from "@/components/ui/form-field";
import { authFetch } from "@/lib/supabase/client";

const defaultForm: MaterialBusinessRegistrationInput = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  materialCategories: "",
  inventorySummary: "",
  onlineStoreUrl: "",
};

export function MaterialBusinessRegistrationForm() {
  const t = useTranslations("RegisterMaterialBusinessForm");
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof MaterialBusinessRegistrationInput>(
    key: K,
    value: MaterialBusinessRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = materialBusinessRegistrationSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { res, payload } = await authFetch("/register-material-business/submit", parsed.data);

    setSubmitting(false);

    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent("/register-material-business")}`);
      return;
    }

    if (!res.ok || !payload.ok) {
      setError(payload.error ?? "Submission failed. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PremiumCard hover={false} className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-2xl font-semibold text-navy">{t("successTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{t("successBody")}</p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.24em] text-gold">{t("sectionBasic")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label={t("businessName")}>
            <TextInput
              id="businessName"
              value={form.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("ownerName")}>
            <TextInput
              id="ownerName"
              value={form.ownerName}
              onChange={(event) => updateField("ownerName", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("phone")}>
            <TextInput
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("email")}>
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </FormField>
        </div>
        <FormField label={t("address")} className="mt-4">
          <TextArea
            id="address"
            rows={3}
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            required
          />
        </FormField>
      </PremiumCard>

      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.24em] text-gold">{t("sectionMaterials")}</p>
        <FormField label={t("materialCategories")} className="mt-5">
          <TextArea
            id="materialCategories"
            rows={3}
            placeholder={t("materialCategoriesPlaceholder")}
            value={form.materialCategories}
            onChange={(event) => updateField("materialCategories", event.target.value)}
            required
          />
        </FormField>
        <FormField label={t("inventorySummary")} className="mt-4">
          <TextArea
            id="inventorySummary"
            rows={4}
            placeholder={t("inventorySummaryPlaceholder")}
            value={form.inventorySummary}
            onChange={(event) => updateField("inventorySummary", event.target.value)}
            required
          />
        </FormField>
        <FormField label={t("onlineStoreUrl")} className="mt-4">
          <TextInput
            id="onlineStoreUrl"
            type="url"
            placeholder="https://"
            value={form.onlineStoreUrl ?? ""}
            onChange={(event) => updateField("onlineStoreUrl", event.target.value)}
          />
        </FormField>
      </PremiumCard>

      {error && <p className="text-sm text-red-accent">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="luxury-outline" asChild>
          <Link href="/">{t("cancel")}</Link>
        </Button>
        <Button type="submit" variant="luxury" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
