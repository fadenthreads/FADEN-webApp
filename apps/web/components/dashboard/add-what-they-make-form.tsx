"use client";

import { Button } from "@faden/ui";

interface AddWhatTheyMakeFormProps {
  suggestions: string[];
  saving: boolean;
  error: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export function AddWhatTheyMakeForm({
  suggestions,
  saving,
  error,
  value,
  onChange,
  onSubmit,
  onCancel,
}: AddWhatTheyMakeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Add what they make</h3>
        <Button type="button" variant="luxury-outline" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>
      <p className="text-sm text-foreground-muted">
        Add an outfit category to your profile — e.g. Lehenga, Saree, or Sherwani. You can then add
        outfits to that collection below.
      </p>
      <label className="block text-sm">
        <span className="text-foreground-muted">Collection name</span>
        <input
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          list="what-they-make-suggestions"
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="Lehenga, Anarkali, Indo-western…"
        />
        <datalist id="what-they-make-suggestions">
          {suggestions.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
      </label>
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground-muted">Suggestions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.slice(0, 14).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  value.toLowerCase() === label.toLowerCase()
                    ? "border-navy bg-navy/10 text-navy font-medium"
                    : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <Button type="submit" variant="luxury" disabled={saving || !value.trim()}>
        {saving ? "Saving…" : "Add collection"}
      </Button>
      {error && <p className="text-sm text-red-accent">{error}</p>}
    </form>
  );
}
