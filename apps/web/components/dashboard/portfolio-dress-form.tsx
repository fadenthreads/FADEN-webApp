"use client";

import { useMemo } from "react";
import { Button } from "@faden/ui";
import { DressImage } from "@/components/boutique/dress-image";
import type { DressLengthDetails } from "@/data/boutique-profiles";
import { DRESS_LENGTH_FIELDS } from "@/lib/boutique/dress-specs";
import { MAX_MEDIA_BYTES, uploadMediaFile } from "@/lib/storage/client-upload";

export interface PortfolioOutfitTypeOption {
  id: string;
  label: string;
}

export interface PortfolioDressFormValues {
  title: string;
  description: string;
  priceHint: string;
  sizeLabel: string;
  lengthDetails: DressLengthDetails;
  outfitTypeId: string;
  outfitTypeLabel: string;
  mediaUrl: string;
}

interface PortfolioDressFormProps {
  editingId: string | null;
  values: PortfolioDressFormValues;
  outfitTypes: PortfolioOutfitTypeOption[];
  outfitTypeSuggestions: string[];
  saving: boolean;
  error: string | null;
  message: string | null;
  onChange: (values: PortfolioDressFormValues) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

const MAX_IMAGE_BYTES = MAX_MEDIA_BYTES;

export function PortfolioDressForm({
  editingId,
  values,
  outfitTypes,
  outfitTypeSuggestions,
  saving,
  error,
  message,
  onChange,
  onSubmit,
  onCancel,
}: PortfolioDressFormProps) {
  const suggestionOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const type of outfitTypes) labels.add(type.label);
    for (const label of outfitTypeSuggestions) labels.add(label);
    return [...labels].sort((a, b) => a.localeCompare(b));
  }, [outfitTypeSuggestions, outfitTypes]);

  const selectedOutfitLabel =
    outfitTypes.find((type) => type.id === values.outfitTypeId)?.label ?? values.outfitTypeLabel;

  function patch(partial: Partial<PortfolioDressFormValues>) {
    onChange({ ...values, ...partial });
  }

  function applyOutfitSelection(label: string) {
    const match = outfitTypes.find((type) => type.label.toLowerCase() === label.toLowerCase());
    if (match) {
      patch({ outfitTypeId: match.id, outfitTypeLabel: "" });
    } else {
      patch({ outfitTypeId: "", outfitTypeLabel: label });
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) return;

    try {
      const uploaded = await uploadMediaFile(file, "portfolio");
      patch({ mediaUrl: uploaded.url });
    } catch {
      // Parent form surfaces save errors; ignore transient upload failures here.
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{editingId ? "Edit outfit" : "Add outfit photo"}</h3>
        <Button type="button" variant="luxury-outline" size="sm" onClick={onCancel}>
          {editingId ? "Cancel edit" : "Close"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-foreground-muted">Outfit title</span>
          <input
            required
            value={values.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
            placeholder="Emerald bridal lehenga"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Outfit type / collection</span>
          <input
            list="portfolio-outfit-types"
            value={selectedOutfitLabel}
            onChange={(e) => applyOutfitSelection(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
            placeholder="Lehenga, Saree, Sherwani…"
          />
          <datalist id="portfolio-outfit-types">
            {suggestionOptions.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </label>
      </div>
      {outfitTypeSuggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground-muted">Suggested outfit types</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {outfitTypeSuggestions.slice(0, 12).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => applyOutfitSelection(label)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedOutfitLabel.toLowerCase() === label.toLowerCase()
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      {outfitTypes.length > 0 && (
        <label className="block text-sm">
          <span className="text-foreground-muted">Or pick from your boutique types</span>
          <select
            value={values.outfitTypeId}
            onChange={(e) => {
              const match = outfitTypes.find((type) => type.id === e.target.value);
              patch({ outfitTypeId: e.target.value, outfitTypeLabel: match?.label ?? "" });
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          >
            <option value="">Select saved type</option>
            {outfitTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        <span className="text-foreground-muted">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="Fabric, embellishment, occasion, fit notes…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Price hint (optional)</span>
        <input
          value={values.priceHint}
          onChange={(e) => patch({ priceHint: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="From ₹12,000"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Size (for re-orders, optional)</span>
        <input
          value={values.sizeLabel}
          onChange={(e) => patch({ sizeLabel: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder='e.g. M (Bust 36" · Waist 30")'
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {DRESS_LENGTH_FIELDS.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            <span className="text-foreground-muted">{label}</span>
            <input
              value={values.lengthDetails[key] ?? ""}
              onChange={(e) =>
                patch({
                  lengthDetails: { ...values.lengthDetails, [key]: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder="e.g. 42 in"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="text-foreground-muted">Length notes (optional)</span>
        <textarea
          value={values.lengthDetails.notes ?? ""}
          onChange={(e) =>
            patch({
              lengthDetails: { ...values.lengthDetails, notes: e.target.value },
            })
          }
          rows={2}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="Any extra sizing context…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Photo URL</span>
        <input
          value={values.mediaUrl.startsWith("data:") ? "" : values.mediaUrl}
          onChange={(e) => patch({ mediaUrl: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="https://…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Or upload image (max 2 MB)</span>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm" />
      </label>
      {values.mediaUrl && (
        <div className="h-40 w-32 overflow-hidden rounded-lg border border-border">
          <DressImage
            design={{
              title: values.title,
              imageUrl: values.mediaUrl,
              gradient: "from-burgundy/40 to-background-soft",
            }}
          />
        </div>
      )}
      <Button type="submit" variant="luxury" disabled={saving || !values.title.trim() || !values.mediaUrl.trim()}>
        {saving ? "Saving…" : editingId ? "Save changes" : "Add to portfolio"}
      </Button>
      {error && <p className="text-sm text-red-accent">{error}</p>}
      {message && <p className="text-sm text-gold">{message}</p>}
    </form>
  );
}

export const EMPTY_PORTFOLIO_FORM: PortfolioDressFormValues = {
  title: "",
  description: "",
  priceHint: "",
  sizeLabel: "",
  lengthDetails: {},
  outfitTypeId: "",
  outfitTypeLabel: "",
  mediaUrl: "",
};
