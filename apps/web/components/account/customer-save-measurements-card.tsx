"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, TextInput } from "@/components/ui/form-field";
import { saveMeasurementProfile } from "@/actions/measurement-profiles";
import { MeasurementGrid } from "@/components/measurement/measurement-grid";
import type { ResolvedRequestMeasurements } from "@/lib/customization/resolve-request-measurements";

interface CustomerSaveMeasurementsCardProps {
  measurements: ResolvedRequestMeasurements;
  outfitType?: string | null;
  outfitAudience?: string | null;
  defaultLabel?: string;
}

export function CustomerSaveMeasurementsCard({
  measurements,
  outfitType,
  outfitAudience,
  defaultLabel,
}: CustomerSaveMeasurementsCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState(defaultLabel ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!label.trim()) {
      setError("Give this size profile a name before saving.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const audience =
        outfitAudience === "women" || outfitAudience === "men" || outfitAudience === "kids"
          ? outfitAudience
          : undefined;

      const result = await saveMeasurementProfile({
        label: label.trim(),
        outfitType: outfitType ?? undefined,
        outfitAudience: audience,
        measurementUnit: measurements.unit,
        measurements: measurements.values as unknown as Record<string, string | undefined>,
      });

      if (!result.ok) {
        setError(result.error ?? "Could not save sizes");
        return;
      }

      setSaved(true);
      router.refresh();
    });
  }

  return (
    <PremiumCard hover={false} className="mt-4 border-gold/20 bg-gold/5">
      <p className="text-sm font-medium text-foreground">Your size details</p>
      <p className="mt-1 text-xs text-foreground-muted">{measurements.sourceLabel}</p>
      <div className="mt-4">
        <MeasurementGrid values={measurements.values} unit={measurements.unit} />
      </div>

      {measurements.canSave && !saved && (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <FormField
            label="Save to my account"
            hint="Name this profile to reuse on future outfit requests."
          >
            <TextInput
              placeholder={defaultLabel ?? "My outfit sizes"}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </FormField>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="button" variant="luxury" size="sm" disabled={pending} onClick={handleSave}>
            {pending ? "Saving…" : "Save sizes to account"}
          </Button>
        </div>
      )}

      {saved && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-sm text-gold">Sizes saved to your account.</p>
          <Button asChild variant="luxury-outline" size="sm" className="mt-3">
            <Link href="/account/sizes">View saved sizes</Link>
          </Button>
        </div>
      )}
    </PremiumCard>
  );
}
