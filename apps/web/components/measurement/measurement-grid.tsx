import {
  SELF_MEASUREMENT_FIELDS,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";

export function MeasurementGrid({
  values,
  unit,
}: {
  values: SelfMeasurements;
  unit: MeasurementUnit;
}) {
  const filled = SELF_MEASUREMENT_FIELDS.filter(({ key }) => values[key]?.trim());
  if (!filled.length) return <p className="text-sm text-foreground-muted">No measurements recorded yet.</p>;

  const unitLabel = unit === "cm" ? "cm" : "in";
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filled.map(({ key, label }) => (
        <div key={key} className="rounded-lg border border-border bg-background-elevated px-3 py-2">
          <dt className="text-xs text-foreground-muted">{label}</dt>
          <dd className="mt-0.5 text-sm font-medium">
            {values[key].trim()} {unitLabel}
          </dd>
        </div>
      ))}
    </dl>
  );
}
