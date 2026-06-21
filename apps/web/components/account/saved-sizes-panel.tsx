"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { Pencil, Plus, Trash2, Ruler } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  deleteMeasurementProfile,
  saveMeasurementProfile,
  updateMeasurementProfile,
} from "@/actions/measurement-profiles";
import { SelfMeasurementFields } from "@/components/measurement/self-measurement-fields";
import { FormField, TextInput } from "@/components/ui/form-field";
import type { SavedMeasurementProfile } from "@/lib/measurement/saved-profiles";
import {
  EMPTY_SELF_MEASUREMENTS,
  formatSelfMeasurementsSummary,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";
import { OUTFIT_TYPES_BY_AUDIENCE } from "@/data/customize-form";

interface ProfileFormState {
  label: string;
  outfitType: string;
  outfitAudience: "" | "women" | "men" | "kids";
  measurementUnit: MeasurementUnit;
  measurements: SelfMeasurements;
}

const EMPTY_FORM: ProfileFormState = {
  label: "",
  outfitType: "",
  outfitAudience: "",
  measurementUnit: "in",
  measurements: { ...EMPTY_SELF_MEASUREMENTS },
};

function profileToForm(profile: SavedMeasurementProfile): ProfileFormState {
  return {
    label: profile.label,
    outfitType: profile.outfitType ?? "",
    outfitAudience: profile.outfitAudience ?? "",
    measurementUnit: profile.measurementUnit,
    measurements: profile.measurements,
  };
}

interface SavedSizesPanelProps {
  profiles: SavedMeasurementProfile[];
  tableAvailable: boolean;
}

export function SavedSizesPanel({ profiles, tableAvailable }: SavedSizesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setMessage(null);
    setShowForm(true);
  }

  function openEdit(profile: SavedMeasurementProfile) {
    setEditingId(profile.id);
    setForm(profileToForm(profile));
    setError(null);
    setMessage(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit() {
    if (!form.label.trim()) {
      setError("Give this size profile a name.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const payload = {
        label: form.label.trim(),
        outfitType: form.outfitType.trim() || undefined,
        outfitAudience: form.outfitAudience || undefined,
        measurementUnit: form.measurementUnit,
        measurements: form.measurements as unknown as Record<string, string | undefined>,
      };

      const result = editingId
        ? await updateMeasurementProfile({ id: editingId, ...payload })
        : await saveMeasurementProfile(payload);

      if (!result.ok) {
        setError(result.error ?? "Failed to save");
        return;
      }

      setMessage(editingId ? "Size profile updated." : "Size profile saved.");
      closeForm();
      router.refresh();
    });
  }

  function handleDelete(profileId: string) {
    if (!window.confirm("Delete this saved size profile?")) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteMeasurementProfile(profileId);
      if (!result.ok) {
        setError(result.error ?? "Failed to delete");
        return;
      }
      setMessage("Size profile deleted.");
      router.refresh();
    });
  }

  const outfitOptions =
    form.outfitAudience && form.outfitAudience in OUTFIT_TYPES_BY_AUDIENCE
      ? OUTFIT_TYPES_BY_AUDIENCE[form.outfitAudience]
      : [];

  return (
    <div>
      {!tableAvailable && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">
            Run migration 023_measurements_and_home_visits.sql in Supabase to enable saved sizes.
          </p>
        </PremiumCard>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-gold">SAVED SIZES</p>
          <h2 className="mt-2 font-display text-xl font-semibold">Your measurement profiles</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Save sizes for different outfits and reuse them when customizing.
          </p>
        </div>
        <Button type="button" variant="luxury" onClick={openAdd} disabled={!tableAvailable || pending}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add size profile
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-gold">{message}</p>}

      {showForm && (
        <PremiumCard className="mt-6" hover={false}>
          <h3 className="font-display text-lg font-semibold">
            {editingId ? "Edit size profile" : "New size profile"}
          </h3>
          <div className="mt-4 space-y-4">
            <FormField label="Profile name" hint="Your choice — e.g. Wedding lehenga, Office kurta">
              <TextInput
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="My wedding lehenga sizes"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Who is this for?">
                <select
                  className="faden-field"
                  value={form.outfitAudience}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      outfitAudience: e.target.value as ProfileFormState["outfitAudience"],
                      outfitType: "",
                    })
                  }
                >
                  <option value="">Any</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kids">Kids</option>
                </select>
              </FormField>
              <FormField label="Outfit type (optional)">
                {outfitOptions.length ? (
                  <select
                    className="faden-field"
                    value={form.outfitType}
                    onChange={(e) => setForm({ ...form, outfitType: e.target.value })}
                  >
                    <option value="">Select outfit</option>
                    {outfitOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextInput
                    value={form.outfitType}
                    onChange={(e) => setForm({ ...form, outfitType: e.target.value })}
                    placeholder="e.g. Lehenga, Sherwani"
                  />
                )}
              </FormField>
            </div>
            <SelfMeasurementFields
              values={form.measurements}
              unit={form.measurementUnit}
              onValuesChange={(measurements) => setForm({ ...form, measurements })}
              onUnitChange={(measurementUnit) => setForm({ ...form, measurementUnit })}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="luxury" disabled={pending} onClick={handleSubmit}>
                {pending ? "Saving…" : editingId ? "Update profile" : "Save profile"}
              </Button>
              <Button type="button" variant="luxury-outline" disabled={pending} onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </div>
        </PremiumCard>
      )}

      <div className="mt-6 space-y-4">
        {profiles.length === 0 ? (
          <PremiumCard hover={false}>
            <div className="flex items-start gap-3">
              <Ruler className="mt-0.5 h-5 w-5 text-gold" aria-hidden />
              <div>
                <p className="font-medium text-foreground">No saved sizes yet</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  Add a profile with your measurements, or save sizes when submitting a customization request.
                </p>
              </div>
            </div>
          </PremiumCard>
        ) : (
          profiles.map((profile) => {
            const summary = formatSelfMeasurementsSummary(profile.measurements, profile.measurementUnit);
            return (
              <PremiumCard key={profile.id} hover={false}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold">{profile.label}</p>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {[profile.outfitType, profile.outfitAudience].filter(Boolean).join(" · ") ||
                        "General profile"}
                    </p>
                    {summary && (
                      <p className="mt-2 text-xs leading-relaxed text-foreground-muted/90">{summary}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="luxury-outline" size="sm" onClick={() => openEdit(profile)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="luxury-outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </div>
              </PremiumCard>
            );
          })
        )}
      </div>
    </div>
  );
}
