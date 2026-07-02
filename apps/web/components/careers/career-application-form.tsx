"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";

const ROLE_OPTIONS = [
  { value: "Product & full-stack engineering", label: "Product & full-stack engineering" },
  { value: "Design (brand, product, motion)", label: "Design (brand, product, motion)" },
  { value: "Boutique partnerships & operations", label: "Boutique partnerships & operations" },
  { value: "Other / general application", label: "Other / general application" },
];

export function CareerApplicationForm() {
  const t = useTranslations("CareersApplication");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/careers/apply", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? t("submitFailed"));
        return;
      }

      setSubmitted(true);
      form.reset();
      setResumeName(null);
    } catch {
      setError(t("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PremiumCard hover={false} className="text-center">
        <h2 className="font-display text-2xl font-semibold text-navy">{t("successTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{t("successBody")}</p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.24em] text-gold">{t("sectionDetails")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label={t("fullName")}>
            <TextInput name="fullName" required autoComplete="name" />
          </FormField>
          <FormField label={t("email")}>
            <TextInput name="email" type="email" required autoComplete="email" />
          </FormField>
          <FormField label={t("phone")}>
            <TextInput name="phone" type="tel" autoComplete="tel" />
          </FormField>
          <FormField label={t("roleInterest")}>
            <SelectInput name="roleInterest" required options={ROLE_OPTIONS} defaultValue={ROLE_OPTIONS[0].value} />
          </FormField>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label={t("linkedinUrl")}>
            <TextInput name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/…" />
          </FormField>
          <FormField label={t("portfolioUrl")}>
            <TextInput name="portfolioUrl" type="url" placeholder="https://" />
          </FormField>
        </div>
        <FormField label={t("coverNote")} className="mt-4">
          <TextArea
            name="coverNote"
            rows={5}
            placeholder={t("coverNotePlaceholder")}
          />
        </FormField>
      </PremiumCard>

      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.24em] text-gold">{t("sectionResume")}</p>
        <FormField label={t("resume")} hint={t("resumeHint")} className="mt-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-navy/20 bg-navy/[0.03] px-4 py-8 text-center transition-colors hover:border-gold/40 hover:bg-gold/5">
            <input
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setResumeName(file?.name ?? null);
              }}
            />
            <span className="text-sm font-medium text-navy">
              {resumeName ?? t("resumeChoose")}
            </span>
            <span className="mt-1 text-xs text-foreground-muted">{t("resumeFormats")}</span>
          </label>
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
