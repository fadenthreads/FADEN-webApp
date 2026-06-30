"use client";

import { cn } from "@faden/utils";
import { FormField, TextArea } from "@/components/ui/form-field";
import { DesignReferenceUpload } from "@/components/customize/design-reference-upload";
import { SuggestTextInput } from "@/components/customize/suggest-text-input";

interface DesignDetailFieldProps {
  label: string;
  hint: string;
  placeholder: string;
  suggestions: readonly string[];
  value: string;
  images: string[];
  onValueChange: (value: string) => void;
  onImagesChange: (images: string[]) => void;
  multi?: boolean;
  multiline?: boolean;
}

export function DesignDetailField({
  label,
  hint,
  placeholder,
  suggestions,
  value,
  images,
  onValueChange,
  onImagesChange,
  multi = false,
  multiline = false,
}: DesignDetailFieldProps) {
  function appendSuggestion(suggestion: string) {
    if (!value.trim()) {
      onValueChange(suggestion);
      return;
    }
    if (value.toLowerCase().includes(suggestion.toLowerCase())) return;
    onValueChange(`${value.trim()}, ${suggestion}`);
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background-elevated p-4 md:p-5">
      <FormField label={label} hint={hint}>
        {multiline ? (
          <TextArea
            placeholder={placeholder}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        ) : (
          <SuggestTextInput
            value={value}
            onChange={onValueChange}
            suggestions={suggestions}
            placeholder={placeholder}
            multi={multi}
          />
        )}
      </FormField>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Design suggestions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const selected = value.toLowerCase().includes(suggestion.toLowerCase());
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => (multiline || multi ? appendSuggestion(suggestion) : onValueChange(suggestion))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  selected
                    ? "border-navy bg-navy/10 text-navy font-medium"
                    : "border-border bg-background-soft text-foreground-muted hover:border-gold/40 hover:text-foreground",
                )}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>

      <DesignReferenceUpload images={images} onImagesChange={onImagesChange} />
    </div>
  );
}
