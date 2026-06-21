"use client";

import { useEffect, useState } from "react";
import { Button } from "@faden/ui";
import { FormField, SelectInput, TextInput } from "@/components/ui/form-field";
import type { SavedMeasurementProfile } from "@/lib/measurement/saved-profiles";
import {
  EMPTY_SELF_MEASUREMENTS,
  SELF_MEASUREMENT_FIELDS,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";

interface SavedSizePickerProps {
  selectedProfileId: string;
  onSelect: (profile: SavedMeasurementProfile | null) => void;
  outfitAudience?: string;
}

export function SavedSizePicker({ selectedProfileId, onSelect, outfitAudience }: SavedSizePickerProps) {
  const [profiles, setProfiles] = useState<SavedMeasurementProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/account/measurement-profiles")
      .then((res) => res.json())
      .then((data: { profiles?: SavedMeasurementProfile[] }) => {
        if (mounted && data.profiles) setProfiles(data.profiles);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = outfitAudience
    ? profiles.filter((profile) => !profile.outfitAudience || profile.outfitAudience === outfitAudience)
    : profiles;

  if (loading) {
    return <p className="text-sm text-foreground-muted">Loading saved sizes…</p>;
  }

  if (!filtered.length) {
    return (
      <p className="text-sm text-foreground-muted">
        No saved sizes yet. Add them in{" "}
        <a href="/account/sizes" className="text-gold hover:underline">
          My Account → Saved sizes
        </a>
        .
      </p>
    );
  }

  return (
    <FormField label="Use a saved size profile" hint="Prefill measurements from your account.">
      <SelectInput
        value={selectedProfileId}
        onChange={(event) => {
          const id = event.target.value;
          const profile = filtered.find((item) => item.id === id) ?? null;
          onSelect(profile);
        }}
        options={[
          { value: "", label: "Enter measurements manually" },
          ...filtered.map((profile) => ({
            value: profile.id,
            label: profile.label + (profile.outfitType ? ` · ${profile.outfitType}` : ""),
          })),
        ]}
      />
    </FormField>
  );
}

interface SelfMeasurementFieldsProps {
  values: SelfMeasurements;
  unit: MeasurementUnit;
  onValuesChange: (values: SelfMeasurements) => void;
  onUnitChange: (unit: MeasurementUnit) => void;
  showSaveOption?: boolean;
  saveToAccount?: boolean;
  onSaveToAccountChange?: (value: boolean) => void;
  savedLabel?: string;
  onSavedLabelChange?: (value: string) => void;
}

export function SelfMeasurementFields({
  values,
  unit,
  onValuesChange,
  onUnitChange,
  showSaveOption,
  saveToAccount,
  onSaveToAccountChange,
  savedLabel,
  onSavedLabelChange,
}: SelfMeasurementFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField label="Measurement unit">
        <SelectInput
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as MeasurementUnit)}
          options={[
            { value: "in", label: "Inches (in)" },
            { value: "cm", label: "Centimetres (cm)" },
          ]}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        {SELF_MEASUREMENT_FIELDS.map(({ key, label, placeholder }) => (
          <FormField key={key} label={label}>
            <TextInput
              inputMode="decimal"
              placeholder={`${placeholder} ${unit}`}
              value={values[key]}
              onChange={(event) => onValuesChange({ ...values, [key]: event.target.value })}
            />
          </FormField>
        ))}
      </div>
      {showSaveOption && onSaveToAccountChange && (
        <div className="rounded-xl border border-border bg-background-elevated p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={saveToAccount ?? false}
              onChange={(event) => onSaveToAccountChange(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-gold"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Save to my account</span>
              <span className="mt-1 block text-xs text-foreground-muted">
                Reuse these measurements on future outfit requests.
              </span>
            </span>
          </label>
          {saveToAccount && onSavedLabelChange && (
            <FormField label="Profile name" hint="Name this size profile (e.g. Wedding lehenga — me)" className="mt-4">
              <TextInput
                placeholder="My wedding lehenga sizes"
                value={savedLabel ?? ""}
                onChange={(event) => onSavedLabelChange(event.target.value)}
              />
            </FormField>
          )}
        </div>
      )}
      <p className="faden-hint">
        Fill in the measurements you know. Your boutique can request additional sizes after you submit.
      </p>
    </div>
  );
}

export { EMPTY_SELF_MEASUREMENTS };
