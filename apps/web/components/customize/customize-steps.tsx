"use client";

import { cn } from "@faden/utils";
import { useTranslations } from "next-intl";
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
import { FLOW_ORDER_LABELS, OCCASION_SUGGESTIONS, type CustomizeFormData, type CustomizeStepId } from "@/data/customize-form";
import { getCustomizeReviewWarnings } from "@/lib/customize/review-warnings";
import { AUDIENCE_LABELS, OUTFIT_TYPES_BY_AUDIENCE } from "@/lib/boutique/audiences";
import { preferredAssistantGenderForAudience } from "@/lib/measurement/assistant-gender";
import type { AudienceCategory } from "@faden/validators";
import { AUDIENCE_VALUES } from "@faden/validators";

interface StepProps {
  data: CustomizeFormData;
  onChange: (patch: Partial<CustomizeFormData>) => void;
}

export function StepStart({ data, onChange }: StepProps) {
  const t = useTranslations("Customize.start");
  return (
    <div className="space-y-6">
      {data.flowOrder === "requirements-first" && (
        <p className="text-sm text-foreground-muted">{t("requirementsHint")}</p>
      )}
      {data.flowOrder === "boutique-first" && (
        <FormField label={t("chooseBoutique")} hint={t("chooseBoutiqueHint")}>
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
  const t = useTranslations("Customize.category");
  const activeAudience = (data.outfitAudience || "women") as AudienceCategory;
  const outfitTypes = OUTFIT_TYPES_BY_AUDIENCE[activeAudience] ?? OUTFIT_TYPES_BY_AUDIENCE.women;

  return (
    <div className="space-y-6">
      <FormField label={t("whoFor")} hint={t("whoForHint")}>
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
      <FormField label={t("outfitType")}>
        <SelectInput
          options={[
            { value: "", label: t("selectType") },
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
      <FormField label={t("describeOutfit")} hint={t("describeOutfitHint")}>
        <TextArea
          placeholder={t("describePlaceholder")}
          value={data.outfitDescription}
          onChange={(e) => onChange({ outfitDescription: e.target.value })}
        />
      </FormField>
      <FormField label={t("occasion")} hint={t("occasionHint")}>
        <SuggestTextInput
          value={data.occasion}
          onChange={(occasion) => onChange({ occasion })}
          suggestions={OCCASION_SUGGESTIONS}
          placeholder={t("occasionPlaceholder")}
          multi={false}
        />
      </FormField>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          {t("popularOccasions")}
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
  const t = useTranslations("Customize.inspiration");
  return (
    <div className="space-y-6">
      <FormField label={t("linksLabel")} hint={t("linksHint")}>
        <TextArea
          placeholder="https://…&#10;https://…"
          value={data.inspirationLinks}
          onChange={(e) => onChange({ inspirationLinks: e.target.value })}
        />
      </FormField>
      <FormField label={t("sketchLabel")} hint={t("sketchHint")}>
        <TextArea
          placeholder={t("sketchPlaceholder")}
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
  const t = useTranslations("Customize.fabric");
  return (
    <div className="space-y-6">
      <FormField label={t("whoSupplies")}>
        <SelectInput
          options={[
            { value: "boutique", label: t("boutiqueSources") },
            { value: "customer", label: t("customerProvides") },
          ]}
          value={data.fabricSource}
          onChange={(e) => onChange({ fabricSource: e.target.value as "customer" | "boutique" })}
        />
      </FormField>

      <FormField
        label={data.fabricSource === "customer" ? t("fabricProviding") : t("fabricPreferred")}
        hint={t("fabricHint")}
      >
        <SuggestTextInput
          value={data.fabricTypes}
          onChange={(fabricTypes) => onChange({ fabricTypes })}
          suggestions={FABRIC_KIND_SUGGESTIONS}
          placeholder={t("fabricPlaceholder")}
        />
      </FormField>

      {data.fabricSource === "boutique" && (
        <>
          <FormField label={t("coloursLabel")} hint={t("coloursHint")}>
            <SuggestTextInput
              value={data.fabricColors}
              onChange={(fabricColors) => onChange({ fabricColors })}
              suggestions={FABRIC_COLOR_SUGGESTIONS}
              placeholder={t("coloursPlaceholder")}
            />
          </FormField>
          <FormField label={t("colourCount")}>
            <TextInput
              placeholder="e.g. 2"
              value={data.colorCount}
              onChange={(e) => onChange({ colorCount: e.target.value })}
            />
          </FormField>
          <p className="faden-hint rounded-md border border-gold/20 bg-gold/5 p-3">{t("advanceNote")}</p>
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
  const t = useTranslations("Customize.design");
  return (
    <div className="space-y-6">
      <p className="text-sm text-foreground-muted">{t("intro")}</p>
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
  const t = useTranslations("Customize.delivery");
  return (
    <div className="space-y-6">
      <FormField label={t("dateLabel")} hint={t("dateHint")}>
        <DatePicker
          value={data.deliveryDate}
          onChange={(deliveryDate) => onChange({ deliveryDate })}
          min={todayIsoDate()}
          placeholder={t("datePlaceholder")}
        />
      </FormField>
      <FormField label={t("budgetLabel")}>
        <TextInput
          placeholder={t("budgetPlaceholder")}
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

function formatReviewValue(
  key: string,
  val: unknown,
  data: CustomizeFormData,
  tr: (key: string, values?: Record<string, string | number>) => string,
): string | null {
  const imageKey = DESIGN_REVIEW_IMAGE_KEYS[key as keyof CustomizeFormData];
  const imageCount = imageKey ? ((data[imageKey] as string[] | undefined)?.length ?? 0) : 0;

  if (val == null || val === "") {
    if (imageCount > 0) return tr("review.referencePhotos", { count: imageCount });
    return null;
  }
  if (Array.isArray(val)) {
    return val.length > 0 ? tr("review.referencePhotos", { count: val.length }) : null;
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
  if (key === "flowOrder") {
    return FLOW_ORDER_LABELS[text as CustomizeFormData["flowOrder"]] ?? text;
  }
  if (key === "fabricSource") {
    return text === "customer" ? tr("review.provideFabric") : tr("review.boutiqueSuppliesFabric");
  }
  if (key === "selectedBoutiqueSlug" && !text) return null;
  if (imageCount > 0) return `${text} · ${tr("review.referencePhotos", { count: imageCount })}`;
  return text;
}

export function StepReview({
  data,
  hasPreselectedBoutique = false,
  onGoToStep,
}: {
  data: CustomizeFormData;
  hasPreselectedBoutique?: boolean;
  onGoToStep?: (stepId: CustomizeStepId) => void;
}) {
  const t = useTranslations("Customize");
  const warnings = getCustomizeReviewWarnings(data);
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
  const priorityKeys = ["flowOrder", "selectedBoutiqueSlug", "outfitAudience", "outfitType"] as const;
  const rows = Object.entries(data).filter(([key]) => !hiddenKeys.has(key));
  const sortedRows = [
    ...priorityKeys
      .filter((key) => key in data)
      .map((key) => [key, data[key as keyof CustomizeFormData]] as const),
    ...rows.filter(([key]) => !priorityKeys.includes(key as (typeof priorityKeys)[number])),
  ];
  return (
    <div className="space-y-3">
      {data.portfolioOrderSame && data.portfolioReferenceTitle && (
        <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {t("review.directOrder", { title: data.portfolioReferenceTitle })}
        </p>
      )}
      <p className="text-sm text-foreground-muted">
        {hasPreselectedBoutique ? t("review.withBoutique") : t("review.withoutBoutique")}
      </p>
      {warnings.length > 0 && (
        <ul className="space-y-2">
          {warnings.map((warning) => (
            <li key={warning.id}>
              <button
                type="button"
                onClick={() => onGoToStep?.(warning.stepId)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:ring-1 hover:ring-gold/40",
                  warning.severity === "error"
                    ? "border-red-accent/40 bg-red-accent/10 text-red-accent"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-200",
                )}
              >
                {warning.message}
                {onGoToStep && (
                  <span className="mt-1 block text-xs opacity-80">{t("review.tapToFix")}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <dl className="premium-surface divide-y divide-border rounded-xl">
        {sortedRows.map(([key, val]) => {
          const display = formatReviewValue(key, val, data, t);
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
            <dt className="capitalize text-foreground-muted">{t("review.selfMeasurements")}</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {formatSelfMeasurementsSummary(data.selfMeasurements, data.measurementUnit) || "—"}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
