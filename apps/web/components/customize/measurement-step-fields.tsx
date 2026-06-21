"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@faden/ui";
import { cn } from "@faden/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { FormField, SelectInput, TextArea } from "@/components/ui/form-field";
import type { CustomizeFormData } from "@/data/customize-form";
import { todayIsoDate } from "@/lib/datetime/format";
import type { AudienceCategory } from "@faden/validators";
import {
  assistantOptionsForAudience,
  normalizeAssistantGenderForAudience,
  preferredAssistantGenderForAudience,
} from "@/lib/measurement/assistant-gender";
import { HomeVisitLocationPicker } from "@/components/measurement/home-visit-location-picker";
import {
  MEASUREMENT_ASSISTANT_OPTIONS,
  type MeasurementAssistantGender,
} from "@/data/measurement-fields";
import {
  SavedSizePicker,
  SelfMeasurementFields,
} from "@/components/measurement/self-measurement-fields";
import type { SavedMeasurementProfile } from "@/lib/measurement/saved-profiles";

interface MeasurementFieldsProps {
  data: CustomizeFormData;
  onChange: (patch: Partial<CustomizeFormData>) => void;
}

function AssistantGenderPicker({
  value,
  onChange,
  audience,
  forHomeVisit = false,
}: {
  value: MeasurementAssistantGender;
  onChange: (value: MeasurementAssistantGender) => void;
  audience?: import("@faden/validators").AudienceCategory | "";
  forHomeVisit?: boolean;
}) {
  const options = forHomeVisit ? assistantOptionsForAudience(audience) : MEASUREMENT_ASSISTANT_OPTIONS;
  const hint =
    audience === "men"
      ? "Men's outfits are matched with a male assistant when available, otherwise whoever is free."
      : audience === "women"
        ? "Women's outfits are matched with a female assistant when available, otherwise whoever is free."
        : "We match assistant gender when possible. Kids' fittings require a parent or guardian present.";

  return (
    <FormField label="Preferred measurement assistant" hint={hint}>
      <div className={cn("grid gap-3", options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-gold bg-gold/10 ring-1 ring-gold/40"
                  : "border-border bg-background-elevated hover:border-gold/30",
              )}
            >
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{option.description}</p>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}

function VideoSessionScheduler({
  date,
  time,
  notes,
  boutiqueSlug,
  onDateChange,
  onTimeChange,
  onNotesChange,
}: {
  date: string;
  time: string;
  notes: string;
  boutiqueSlug?: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-background-elevated p-4 md:p-5">
      <div>
        <p className="text-sm font-medium text-gold">Schedule video measurement</p>
        <p className="mt-1 text-sm text-foreground-muted">
          Book a live video fitting with the boutique tailor. After you confirm a slot, the Cal.com
          video link appears on your account dashboard.
        </p>
      </div>

      {boutiqueSlug ? (
        <Button asChild variant="luxury">
          <Link href={`/appointments/schedule?boutique=${encodeURIComponent(boutiqueSlug)}`}>
            Book video fitting slot
          </Link>
        </Button>
      ) : (
        <p className="text-sm text-foreground-muted">
          After you match with a boutique, return here or open the boutique profile to book a Cal.com
          slot. You can also note preferred times below for coordination.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Preferred date">
          <DatePicker
            value={date}
            onChange={onDateChange}
            min={todayIsoDate()}
            placeholder="Select date"
          />
        </FormField>
        <FormField label="Preferred time">
          <TimePicker value={time} onChange={onTimeChange} placeholder="Select time" />
        </FormField>
      </div>
      <FormField label="Notes for the boutique" hint="Timezone, backup slots, or anything else to coordinate the call.">
        <TextArea
          placeholder="e.g. IST timezone, available 4–6 PM on weekdays…"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </FormField>
    </div>
  );
}

export function MeasurementStepFields({ data, onChange }: MeasurementFieldsProps) {
  const audience = (data.outfitAudience || "") as AudienceCategory | "";

  useEffect(() => {
    if (data.measurementMode !== "home" && data.measurementMode !== "video") return;
    const normalized = normalizeAssistantGenderForAudience(
      audience,
      data.measurementAssistantGender,
    );
    if (normalized !== data.measurementAssistantGender) {
      onChange({ measurementAssistantGender: normalized });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when audience/mode changes
  }, [audience, data.measurementMode]);

  function applySavedProfile(profile: SavedMeasurementProfile | null) {
    if (!profile) {
      onChange({ savedMeasurementProfileId: "" });
      return;
    }
    onChange({
      savedMeasurementProfileId: profile.id,
      selfMeasurements: profile.measurements,
      measurementUnit: profile.measurementUnit,
      savedMeasurementLabel: profile.label,
    });
  }

  return (
    <div className="space-y-6">
      <FormField label="Measurement method">
        <SelectInput
          options={[
            { value: "self", label: "Self-submit measurements" },
            { value: "video", label: "Video measurement session" },
            { value: "home", label: "Home measurement visit" },
          ]}
          value={data.measurementMode}
          onChange={(event) => {
            const measurementMode = event.target.value;
            const patch: Partial<CustomizeFormData> = { measurementMode };
            if (measurementMode === "home" || measurementMode === "video") {
              patch.measurementAssistantGender = preferredAssistantGenderForAudience(audience);
            }
            onChange(patch);
          }}
        />
      </FormField>

      {data.measurementMode === "home" && (
        <>
          <AssistantGenderPicker
            value={data.measurementAssistantGender}
            onChange={(measurementAssistantGender) => onChange({ measurementAssistantGender })}
            audience={audience}
            forHomeVisit
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Preferred visit date">
              <DatePicker
                value={data.homeVisitDate}
                onChange={(homeVisitDate) => onChange({ homeVisitDate })}
                min={todayIsoDate()}
                placeholder="Select date"
              />
            </FormField>
            <FormField label="Preferred visit time">
              <TimePicker
                value={data.homeVisitTime}
                onChange={(homeVisitTime) => onChange({ homeVisitTime })}
                placeholder="Select time"
              />
            </FormField>
          </div>
          <HomeVisitLocationPicker
            locationLabel={data.homeVisitLocationLabel}
            lat={data.homeVisitLat}
            lng={data.homeVisitLng}
            landmarkNotes={data.homeVisitNotes}
            onLocationChange={(patch) => onChange(patch)}
            onLandmarkNotesChange={(homeVisitNotes) => onChange({ homeVisitNotes })}
          />
          <p className="text-xs text-foreground-muted">
            After you submit, the boutique will confirm your slot and assign a team member for the home visit.
          </p>
        </>
      )}

      {data.measurementMode === "video" && (
        <>
          <AssistantGenderPicker
            value={data.measurementAssistantGender}
            onChange={(measurementAssistantGender) => onChange({ measurementAssistantGender })}
            audience={audience}
          />
          <VideoSessionScheduler
            date={data.videoSessionDate}
            time={data.videoSessionTime}
            notes={data.videoSessionNotes}
            boutiqueSlug={data.selectedBoutiqueSlug || undefined}
            onDateChange={(videoSessionDate) => onChange({ videoSessionDate })}
            onTimeChange={(videoSessionTime) => onChange({ videoSessionTime })}
            onNotesChange={(videoSessionNotes) => onChange({ videoSessionNotes })}
          />
        </>
      )}

      {data.measurementMode === "self" && (
        <>
          <SavedSizePicker
            selectedProfileId={data.savedMeasurementProfileId}
            onSelect={applySavedProfile}
            outfitAudience={data.outfitAudience || undefined}
          />
          <SelfMeasurementFields
            values={data.selfMeasurements}
            unit={data.measurementUnit}
            onValuesChange={(selfMeasurements) => onChange({ selfMeasurements })}
            onUnitChange={(measurementUnit) => onChange({ measurementUnit })}
            showSaveOption
            saveToAccount={data.saveMeasurementToAccount}
            onSaveToAccountChange={(saveMeasurementToAccount) => onChange({ saveMeasurementToAccount })}
            savedLabel={data.savedMeasurementLabel}
            onSavedLabelChange={(savedMeasurementLabel) => onChange({ savedMeasurementLabel })}
          />
        </>
      )}
    </div>
  );
}
