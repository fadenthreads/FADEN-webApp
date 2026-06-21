"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { captureRequestMeasurementsAction } from "@/actions/request-measurements";
import { SelfMeasurementFields } from "@/components/measurement/self-measurement-fields";
import {
  EMPTY_SELF_MEASUREMENTS,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";

interface OwnerRequestMeasurementCaptureProps {
  boutiqueId: string;
  requestId: string;
  initialValues?: SelfMeasurements;
  initialUnit?: MeasurementUnit;
  title?: string;
}

export function OwnerRequestMeasurementCapture({
  boutiqueId,
  requestId,
  initialValues,
  initialUnit = "in",
  title = "Record customer measurements",
}: OwnerRequestMeasurementCaptureProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [values, setValues] = useState<SelfMeasurements>({
    ...EMPTY_SELF_MEASUREMENTS,
    ...initialValues,
  });
  const [unit, setUnit] = useState<MeasurementUnit>(initialUnit);

  function handleSave() {
    startTransition(async () => {
      setError(null);
      const result = await captureRequestMeasurementsAction({
        boutiqueId,
        requestId,
        measurements: values as unknown as Record<string, string | undefined>,
        measurementUnit: unit,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to save measurements");
        return;
      }
      setMessage("Measurements saved. The customer can view and save them from their account.");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <SelfMeasurementFields
        values={values}
        unit={unit}
        onValuesChange={setValues}
        onUnitChange={setUnit}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-gold">{message}</p>}
      <Button type="button" variant="luxury-outline" size="sm" disabled={pending} onClick={handleSave}>
        {pending ? "Saving…" : "Save measurements to request"}
      </Button>
    </div>
  );
}
