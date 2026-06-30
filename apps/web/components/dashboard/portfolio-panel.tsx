"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { DressImage } from "@/components/boutique/dress-image";
import type { BoutiqueDesign, DressLengthDetails } from "@/data/boutique-profiles";
import { DRESS_LENGTH_FIELDS } from "@/lib/boutique/dress-specs";
import { MAX_MEDIA_BYTES, uploadMediaFile } from "@/lib/storage/client-upload";

interface PortfolioItem {
  id: string;
  title: string | null;
  description: string | null;
  price_hint: string | null;
  size_label: string | null;
  length_details: DressLengthDetails | null;
  media_url: string;
  outfit_type_id: string | null;
  outfit_label: string | null;
}

interface OutfitTypeOption {
  id: string;
  label: string;
}

const MAX_IMAGE_BYTES = MAX_MEDIA_BYTES;
const EMPTY_LENGTH_DETAILS: DressLengthDetails = {};

function normalizeLengthDetails(value: DressLengthDetails | null | undefined): DressLengthDetails {
  return value ? { ...value } : { ...EMPTY_LENGTH_DETAILS };
}

export function PortfolioPanel({ boutiqueSlug }: { boutiqueSlug?: string }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [outfitTypes, setOutfitTypes] = useState<OutfitTypeOption[]>([]);
  const [dressTypeSuggestions, setDressTypeSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceHint, setPriceHint] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [lengthDetails, setLengthDetails] = useState<DressLengthDetails>({});
  const [outfitTypeId, setOutfitTypeId] = useState("");
  const [outfitTypeLabel, setOutfitTypeLabel] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const suggestionOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const type of outfitTypes) labels.add(type.label);
    for (const label of dressTypeSuggestions) labels.add(label);
    return [...labels].sort((a, b) => a.localeCompare(b));
  }, [dressTypeSuggestions, outfitTypes]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPriceHint("");
    setSizeLabel("");
    setLengthDetails({});
    setOutfitTypeId("");
    setOutfitTypeLabel("");
    setMediaUrl("");
  }

  function applyOutfitSelection(label: string) {
    const match = outfitTypes.find((type) => type.label.toLowerCase() === label.toLowerCase());
    if (match) {
      setOutfitTypeId(match.id);
      setOutfitTypeLabel("");
    } else {
      setOutfitTypeId("");
      setOutfitTypeLabel(label);
    }
  }

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/boutique/portfolio");
      const payload = (await res.json()) as {
        ok?: boolean;
        items?: PortfolioItem[];
        outfitTypes?: OutfitTypeOption[];
        dressTypeSuggestions?: string[];
        error?: string;
      };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to load portfolio");
      }
      setItems(payload.items ?? []);
      setOutfitTypes(payload.outfitTypes ?? []);
      setDressTypeSuggestions(payload.dressTypeSuggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Image must be under ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`);
      return;
    }

    try {
      const uploaded = await uploadMediaFile(file, "portfolio");
      setMediaUrl(uploaded.url);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function startEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setTitle(item.title ?? "");
    setDescription(item.description ?? "");
    setPriceHint(item.price_hint ?? "");
    setSizeLabel(item.size_label ?? "");
    setLengthDetails(normalizeLengthDetails(item.length_details));
    setOutfitTypeId(item.outfit_type_id ?? "");
    setOutfitTypeLabel(item.outfit_label && !item.outfit_type_id ? item.outfit_label : "");
    setMediaUrl(item.media_url);
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      title,
      description,
      priceHint,
      sizeLabel,
      lengthDetails,
      outfitTypeId: outfitTypeId || null,
      outfitTypeLabel: outfitTypeLabel.trim() || undefined,
      mediaUrl,
    };

    try {
      const res = await fetch("/api/boutique/portfolio", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? (editingId ? "Failed to update outfit" : "Failed to upload outfit photo"));
      }

      const wasEditing = Boolean(editingId);
      resetForm();
      setMessage(wasEditing ? "Portfolio outfit updated." : "Outfit photo added to your portfolio.");
      await loadPortfolio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save portfolio item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    setError(null);
    const res = await fetch(`/api/boutique/portfolio?id=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    const payload = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !payload.ok) {
      setError(payload.error ?? "Failed to delete item");
      return;
    }
    if (editingId === itemId) resetForm();
    await loadPortfolio();
  }

  const selectedOutfitLabel =
    outfitTypes.find((type) => type.id === outfitTypeId)?.label ?? outfitTypeLabel;

  return (
    <div className="space-y-6">
      <PremiumCard hover={false}>
        <h2 className="font-display text-xl font-semibold">Portfolio — past outfits</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Upload photos of outfits you have stitched. Tag them by outfit type so customers can browse
          your work, read reviews, and use an outfit as a customize reference.
        </p>
        {boutiqueSlug && (
          <p className="mt-2 text-xs text-gold">
            Live profile: /boutique/{boutiqueSlug}
          </p>
        )}
      </PremiumCard>

      <PremiumCard hover={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">{editingId ? "Edit outfit" : "Add outfit photo"}</h3>
            {editingId && (
              <Button type="button" variant="luxury-outline" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-foreground-muted">Outfit title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
          {dressTypeSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground-muted">Suggested outfit types</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dressTypeSuggestions.slice(0, 12).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => applyOutfitSelection(label)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedOutfitLabel.toLowerCase() === label.toLowerCase()
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
          {outfitTypes.length > 0 && (
            <label className="block text-sm">
              <span className="text-foreground-muted">Or pick from your boutique types</span>
              <select
                value={outfitTypeId}
                onChange={(e) => {
                  setOutfitTypeId(e.target.value);
                  const match = outfitTypes.find((type) => type.id === e.target.value);
                  setOutfitTypeLabel(match?.label ?? "");
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder="Fabric, embellishment, occasion, fit notes…"
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Price hint (optional)</span>
            <input
              value={priceHint}
              onChange={(e) => setPriceHint(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder="From ₹12,000"
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Size (for re-orders, optional)</span>
            <input
              value={sizeLabel}
              onChange={(e) => setSizeLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder='e.g. M (Bust 36" · Waist 30")'
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {DRESS_LENGTH_FIELDS.map(({ key, label }) => (
              <label key={key} className="block text-sm">
                <span className="text-foreground-muted">{label}</span>
                <input
                  value={lengthDetails[key] ?? ""}
                  onChange={(e) =>
                    setLengthDetails((current) => ({ ...current, [key]: e.target.value }))
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
              value={lengthDetails.notes ?? ""}
              onChange={(e) => setLengthDetails((current) => ({ ...current, notes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder="Any extra sizing context for customers ordering the same piece…"
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Photo URL</span>
            <input
              value={mediaUrl.startsWith("data:") ? "" : mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2"
              placeholder="https://…"
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Or upload image (max 2 MB)</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm" />
          </label>
          {mediaUrl && (
            <div className="h-40 w-32 overflow-hidden rounded-lg border border-border">
              <DressImage
                design={{
                  title,
                  imageUrl: mediaUrl,
                  gradient: "from-burgundy/40 to-background-soft",
                }}
              />
            </div>
          )}
          <Button type="submit" variant="luxury" disabled={saving || !title.trim() || !mediaUrl.trim()}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add to portfolio"}
          </Button>
          {error && <p className="text-sm text-red-accent">{error}</p>}
          {message && <p className="text-sm text-gold">{message}</p>}
        </form>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h3 className="font-semibold">Your uploaded outfits</h3>
        {loading ? (
          <p className="mt-4 text-sm text-foreground-muted">Loading portfolio…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-muted">No outfit photos yet. Add your first piece above.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const preview: BoutiqueDesign = {
                id: item.id,
                title: item.title ?? "Untitled",
                categoryId: "custom",
                rating: 5,
                review: "",
                customerName: "",
                turnaround: "",
                madeAgo: "",
                material: "",
                price: item.price_hint ?? "",
                fitting: "",
                gradient: "from-burgundy/40 to-background-soft",
                imageUrl: item.media_url,
              };
              return (
                <article key={item.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="aspect-[4/5]">
                    <DressImage design={preview} />
                  </div>
                  <div className="p-3">
                    <p className="font-medium">{item.title ?? "Untitled"}</p>
                    <p className="text-xs text-foreground-muted">{item.outfit_label ?? "Untagged"}</p>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">{item.description}</p>
                    )}
                    {item.size_label && (
                      <p className="mt-1 text-xs text-foreground-muted">Size: {item.size_label}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="luxury-outline"
                        size="sm"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="luxury-outline"
                        size="sm"
                        onClick={() => void handleDelete(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
