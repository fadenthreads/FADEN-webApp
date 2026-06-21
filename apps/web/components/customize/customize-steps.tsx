"use client";

import { cn } from "@faden/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import { todayIsoDate } from "@/lib/datetime/format";
import { BoutiquePickerInput } from "@/components/customize/boutique-picker-input";
import { DesignDetailField } from "@/components/customize/design-detail-field";
import { MixOutfitReferences } from "@/components/customize/mix-outfit-references";
import { MeasurementStepFields } from "@/components/customize/measurement-step-fields";
import { SuggestTextInput } from "@/components/customize/suggest-text-input";
import { DESIGN_DETAIL_FIELDS } from "@/data/design-options";
import { FABRIC_COLOR_SUGGESTIONS, FABRIC_KIND_SUGGESTIONS } from "@/data/fabric-options";
import { formatSelfMeasurementsSummary } from "@/data/measurement-fields";
import { formatDateOnly } from "@/lib/datetime/format";
import { OCCASION_SUGGESTIONS, type CustomizeFormData } from "@/data/customize-form";
import { AUDIENCE_LABELS, OUTFIT_TYPES_BY_AUDIENCE } from "@/lib/boutique/audiences";
import { preferredAssistantGenderForAudience } from "@/lib/measurement/assistant-gender";
import type { AudienceCategory } from "@faden/validators";
import { AUDIENCE_VALUES } from "@faden/validators";

interface StepProps {
  data: CustomizeFormData;
  onChange: (patch: Partial<CustomizeFormData>) => void;
}

export function StepStart({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-foreground-muted">
        Choose your path — pick a boutique first, or describe your dream outfit and we&apos;ll match
        the best boutiques for you.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            { value: "requirements-first", label: "Requirements First", desc: "Describe outfit → get matched boutiques" },
            { value: "boutique-first", label: "Boutique First", desc: "Choose a boutique → then customize" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ flowOrder: opt.value })}
            className={`premium-surface-3d rounded-xl p-6 text-left ${data.flowOrder === opt.value ? "ring-2 ring-gold" : ""}`}
          >
            <h3 className="font-display text-lg font-semibold text-gold">{opt.label}</h3>
            <p className="mt-2 text-sm text-foreground-muted">{opt.desc}</p>
          </button>
        ))}
      </div>
      {data.flowOrder === "boutique-first" && (
        <FormField
          label="Choose your boutique"
          hint="Start typing a boutique name — matching studios appear as you type."
        >
          <BoutiquePickerInput
            slug={data.selectedBoutiqueSlug}
            onSlugChange={(selectedBoutiqueSlug) => onChange({ selectedBoutiqueSlug })}
          />
        </FormField>
      )}
    </div>
  );
}

export function StepCategory({ data, onChange }: StepProps) {
  const activeAudience = (data.outfitAudience || "women") as AudienceCategory;
  const outfitTypes = OUTFIT_TYPES_BY_AUDIENCE[activeAudience] ?? OUTFIT_TYPES_BY_AUDIENCE.women;

  return (
    <div className="space-y-6">
      <FormField label="Who is this outfit for?" hint="Select Women, Men, or Kids so the boutique knows who will wear it.">
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_VALUES.map((audience) => (
            <button
              key={audience}
              type="button"
              onClick={() =>
                onChange({
                  outfitAudience: audience,
                  outfitType: "",
                  measurementAssistantGender: preferredAssistantGenderForAudience(audience),
                })
              }
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                activeAudience === audience
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border bg-background-elevated text-foreground-muted hover:border-gold/40 hover:text-gold",
              )}
            >
              {AUDIENCE_LABELS[audience]}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="Outfit type">
        <SelectInput
          options={[
            { value: "", label: "Select type…" },
            ...outfitTypes.map((type) => ({ value: type, label: type })),
          ]}
          value={data.outfitType}
          onChange={(e) =>
            onChange({
              outfitAudience: activeAudience,
              outfitType: e.target.value,
            })
          }
        />
      </FormField>
      <FormField label="Describe your outfit" hint="Type freely if your outfit isn't listed above.">
        <TextArea
          placeholder="e.g. Floor-length lehenga with cape sleeves and minimal embroidery…"
          value={data.outfitDescription}
          onChange={(e) => onChange({ outfitDescription: e.target.value })}
        />
      </FormField>
      <FormField
        label="Occasion"
        hint="Start typing — suggestions appear, or pick one below."
      >
        <SuggestTextInput
          value={data.occasion}
          onChange={(occasion) => onChange({ occasion })}
          suggestions={OCCASION_SUGGESTIONS}
          placeholder="Wedding, reception, festival…"
          multi={false}
        />
      </FormField>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Popular occasions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {OCCASION_SUGGESTIONS.map((occasion) => {
            const selected = data.occasion.toLowerCase() === occasion.toLowerCase();
            return (
              <button
                key={occasion}
                type="button"
                onClick={() => onChange({ occasion })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  selected
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border bg-background-soft text-foreground-muted hover:border-gold/40 hover:text-foreground",
                )}
              >
                {occasion}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StepInspiration({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="Design inspiration (links / references)"
        hint="Paste links from Pinterest, Instagram, or other apps — one per line."
      >
        <TextArea
          placeholder="https://…&#10;https://…"
          value={data.inspirationLinks}
          onChange={(e) => onChange({ inspirationLinks: e.target.value })}
        />
      </FormField>
      <FormField label="Sketch / change notes" hint="Describe neckline, length, or other alterations.">
        <TextArea
          placeholder="Notes about neckline changes, length adjustments…"
          value={data.sketchNotes}
          onChange={(e) => onChange({ sketchNotes: e.target.value })}
        />
      </FormField>
      <MixOutfitReferences
        notes={data.mixOutfitNotes}
        links={data.mixOutfitLinks}
        images={data.mixOutfitImages}
        onNotesChange={(mixOutfitNotes) => onChange({ mixOutfitNotes })}
        onLinksChange={(mixOutfitLinks) => onChange({ mixOutfitLinks })}
        onImagesChange={(mixOutfitImages) => onChange({ mixOutfitImages })}
      />
    </div>
  );
}

export function StepFabric({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <FormField label="Who supplies the fabric?">
        <SelectInput
          options={[
            { value: "boutique", label: "Boutique sources fabric (with FADEN support)" },
            { value: "customer", label: "I will provide my own material" },
          ]}
          value={data.fabricSource}
          onChange={(e) => onChange({ fabricSource: e.target.value as "customer" | "boutique" })}
        />
      </FormField>

      <FormField
        label={data.fabricSource === "customer" ? "Fabric you are providing" : "Preferred fabric type"}
        hint="Start typing — suggestions appear for silk, georgette, cotton, and more."
      >
        <SuggestTextInput
          value={data.fabricTypes}
          onChange={(fabricTypes) => onChange({ fabricTypes })}
          suggestions={FABRIC_KIND_SUGGESTIONS}
          placeholder="e.g. Silk, Georgette"
        />
      </FormField>

      {data.fabricSource === "boutique" && (
        <>
          <FormField
            label="Preferred fabric colours"
            hint="Start typing — colour suggestions appear as you type. Add multiple separated by commas."
          >
            <SuggestTextInput
              value={data.fabricColors}
              onChange={(fabricColors) => onChange({ fabricColors })}
              suggestions={FABRIC_COLOR_SUGGESTIONS}
              placeholder="e.g. Emerald green, gold accents"
            />
          </FormField>
          <FormField label="How many colours in the outfit?">
            <TextInput
              placeholder="e.g. 2"
              value={data.colorCount}
              onChange={(e) => onChange({ colorCount: e.target.value })}
            />
          </FormField>
          <p className="faden-hint rounded-md border border-gold/20 bg-gold/5 p-3">
            Advance payment: max 40% when boutique supplies material. Otherwise pay only when work
            is complete and you are satisfied.
          </p>
        </>
      )}
    </div>
  );
}

export function StepMeasurements({ data, onChange }: StepProps) {
  return <MeasurementStepFields data={data} onChange={onChange} />;
}

const DESIGN_FIELD_MAP = {
  neck: {
    valueKey: "neckDesign",
    imagesKey: "neckDesignImages",
  },
  sleeve: {
    valueKey: "sleeveDesign",
    imagesKey: "sleeveDesignImages",
  },
  back: {
    valueKey: "backDesign",
    imagesKey: "backDesignImages",
  },
  embroidery: {
    valueKey: "embroideryDetails",
    imagesKey: "embroideryDetailImages",
  },
  special: {
    valueKey: "specialRequests",
    imagesKey: "specialRequestImages",
  },
} as const satisfies Record<
  (typeof DESIGN_DETAIL_FIELDS)[number]["id"],
  { valueKey: keyof CustomizeFormData; imagesKey: keyof CustomizeFormData }
>;

export function StepDesign({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-foreground-muted">
        Describe each design element with suggestions or your own words, and upload reference photos
        for every option so the boutique can see exactly what you want.
      </p>
      {DESIGN_DETAIL_FIELDS.map((field) => {
        const keys = DESIGN_FIELD_MAP[field.id];
        const value = data[keys.valueKey] as string;
        const images = (data[keys.imagesKey] as string[] | undefined) ?? [];

        return (
          <DesignDetailField
            key={field.id}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            suggestions={field.suggestions}
            value={value}
            images={images}
            multi={"multi" in field ? field.multi : false}
            multiline={"multiline" in field ? field.multiline : false}
            onValueChange={(next) => onChange({ [keys.valueKey]: next })}
            onImagesChange={(next) => onChange({ [keys.imagesKey]: next })}
          />
        );
      })}
    </div>
  );
}

export function StepDelivery({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="Delivery date needed by"
        hint="We advise ordering 1–2 days earlier for alterations or last-minute changes."
      >
        <DatePicker
          value={data.deliveryDate}
          onChange={(deliveryDate) => onChange({ deliveryDate })}
          min={todayIsoDate()}
          placeholder="Select delivery date"
        />
      </FormField>
      <FormField label="Budget range">
        <TextInput
          placeholder="e.g. ₹15,000 – ₹25,000"
          value={data.budgetRange}
          onChange={(e) => onChange({ budgetRange: e.target.value })}
        />
      </FormField>
    </div>
  );
}

const DESIGN_REVIEW_IMAGE_KEYS: Partial<Record<keyof CustomizeFormData, keyof CustomizeFormData>> = {
  neckDesign: "neckDesignImages",
  sleeveDesign: "sleeveDesignImages",
  backDesign: "backDesignImages",
  embroideryDetails: "embroideryDetailImages",
  specialRequests: "specialRequestImages",
};

function formatReviewValue(key: string, val: unknown, data: CustomizeFormData): string | null {
  const imageKey = DESIGN_REVIEW_IMAGE_KEYS[key as keyof CustomizeFormData];
  const imageCount = imageKey ? ((data[imageKey] as string[] | undefined)?.length ?? 0) : 0;

  if (val == null || val === "") {
    if (imageCount > 0) return `${imageCount} reference photo(s)`;
    return null;
  }
  if (Array.isArray(val)) {
    return val.length > 0 ? `${val.length} reference photo(s)` : null;
  }
  if (key === "selfMeasurements" && typeof val === "object") {
    const summary = formatSelfMeasurementsSummary(data.selfMeasurements, data.measurementUnit);
    return summary || null;
  }
  if (typeof val === "object") return null;
  const text = String(val);
  if (key === "deliveryDate" || key === "videoSessionDate") {
    return formatDateOnly(text);
  }
  if (key === "outfitAudience") {
    return AUDIENCE_LABELS[text as AudienceCategory] ?? text;
  }
  if (imageCount > 0) return `${text} · ${imageCount} photo(s)`;
  return text;
}

export function StepReview({
  data,
  hasPreselectedBoutique = false,
}: {
  data: CustomizeFormData;
  hasPreselectedBoutique?: boolean;
}) {
  const hiddenKeys = new Set([
    "selfMeasurements",
    "mixOutfitImages",
    "neckDesignImages",
    "sleeveDesignImages",
    "backDesignImages",
    "embroideryDetailImages",
    "specialRequestImages",
    "portfolioOrderSame",
  ]);
  const rows = Object.entries(data).filter(([key]) => !hiddenKeys.has(key) && (key !== "flowOrder" || data.flowOrder));
  return (
    <div className="space-y-3">
      {data.portfolioOrderSame && data.portfolioReferenceTitle && (
        <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Direct order: replicating &ldquo;{data.portfolioReferenceTitle}&rdquo; with the size and lengths from the
          outfit page.
        </p>
      )}
      <p className="text-sm text-foreground-muted">
        {hasPreselectedBoutique
          ? "Review your request before sending it to your chosen boutique."
          : "Review your request, then browse suggested boutiques and pick one before submitting."}
      </p>
      <dl className="premium-surface divide-y divide-border rounded-xl">
        {rows.map(([key, val]) => {
          const display = formatReviewValue(key, val, data);
          if (!display) return null;
          return (
            <div key={key} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <dt className="capitalize text-foreground-muted">{key.replace(/([A-Z])/g, " $1")}</dt>
              <dd className="max-w-[60%] text-right font-medium">{display}</dd>
            </div>
          );
        })}
        {data.measurementMode === "self" && (
          <div className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="capitalize text-foreground-muted">Self measurements</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {formatSelfMeasurementsSummary(data.selfMeasurements, data.measurementUnit) || "—"}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
