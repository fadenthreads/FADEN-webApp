"use client";

import type { AudienceCategory } from "@faden/validators";
import { AUDIENCE_VALUES, parseAudiences } from "@faden/validators";
import { cn } from "@faden/utils";
import { AUDIENCE_LABELS } from "@/lib/boutique/audiences";
import { FormField } from "@/components/ui/form-field";

interface AudienceFormFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function AudienceFormField({ value, onChange }: AudienceFormFieldProps) {
  const selected = parseAudiences(value);

  function toggleAudience(audience: AudienceCategory) {
    const next = selected.includes(audience)
      ? selected.filter((item) => item !== audience)
      : [...selected, audience];
    onChange(next.join(", "));
  }

  return (
    <FormField
      label="Who do you serve?"
      hint="Select all categories your boutique stitches for — Women, Men, and/or Kids."
    >
      <div className="flex flex-wrap gap-3">
        {AUDIENCE_VALUES.map((audience) => {
          const active = selected.includes(audience);
          return (
            <button
              key={audience}
              type="button"
              onClick={() => toggleAudience(audience)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border bg-background-elevated text-foreground-muted hover:border-gold/40",
              )}
            >
              {AUDIENCE_LABELS[audience]}
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
