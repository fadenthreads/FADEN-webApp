"use client";

import { Button } from "@faden/ui";
import type { CreativePiece } from "@/data/boutique-profiles";

export interface CreativeDispatchFormValues {
  title: string;
  tag: string;
  description: string;
  mediaUrl: string;
  gradient: string;
}

export const EMPTY_CREATIVE_DISPATCH_FORM: CreativeDispatchFormValues = {
  title: "",
  tag: "",
  description: "",
  mediaUrl: "",
  gradient: "from-burgundy/60 via-rose-900/40 to-background-soft",
};

export const CREATIVE_GRADIENT_OPTIONS = [
  "from-burgundy/60 via-rose-900/40 to-background-soft",
  "from-amber-900/50 via-burgundy/40 to-background-soft",
  "from-purple-900/40 via-burgundy/30 to-background-soft",
  "from-emerald-900/30 via-burgundy/40 to-background-soft",
  "from-indigo-900/40 via-burgundy/30 to-background-soft",
  "from-pink-900/40 via-rose-900/30 to-background-soft",
] as const;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

interface CreativeDispatchFormProps {
  editingId: string | null;
  values: CreativeDispatchFormValues;
  saving: boolean;
  error: string | null;
  onChange: (values: CreativeDispatchFormValues) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export function creativePieceToFormValues(piece: CreativePiece): CreativeDispatchFormValues {
  return {
    title: piece.title,
    tag: piece.tag === "Showcase" ? "" : piece.tag,
    description: piece.description,
    mediaUrl: piece.imageUrl ?? "",
    gradient: piece.gradient,
  };
}

export function CreativeDispatchForm({
  editingId,
  values,
  saving,
  error,
  onChange,
  onSubmit,
  onCancel,
}: CreativeDispatchFormProps) {
  function patch(partial: Partial<CreativeDispatchFormValues>) {
    onChange({ ...values, ...partial });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ mediaUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">
          {editingId ? "Edit creative dispatch piece" : "Add creative dispatch piece"}
        </h3>
        <Button type="button" variant="luxury-outline" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>
      <p className="text-sm text-foreground-muted">
        Showcase passion projects and artistry — separate from your customer outfit portfolio.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-foreground-muted">Title</span>
          <input
            required
            value={values.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
            placeholder="Heritage zari experiment"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Tag (optional)</span>
          <input
            value={values.tag}
            onChange={(e) => patch({ tag: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
            placeholder="Embroidery, Draping, Concept…"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-foreground-muted">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
          placeholder="What makes this piece special…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Cover gradient</span>
        <select
          value={values.gradient}
          onChange={(e) => patch({ gradient: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
        >
          {CREATIVE_GRADIENT_OPTIONS.map((gradient) => (
            <option key={gradient} value={gradient}>
              {gradient.replace(/from-|via-|to-/g, "").slice(0, 48)}…
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Photo URL (optional)</span>
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
        <div
          className={`h-32 w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br ${values.gradient}`}
          style={
            values.mediaUrl.startsWith("http") || values.mediaUrl.startsWith("data:")
              ? { backgroundImage: `url(${values.mediaUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
      )}
      <Button type="submit" variant="luxury" disabled={saving || !values.title.trim()}>
        {saving ? "Saving…" : editingId ? "Save changes" : "Add to creative dispatch"}
      </Button>
      {error && <p className="text-sm text-red-accent">{error}</p>}
    </form>
  );
}
