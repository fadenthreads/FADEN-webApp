"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { BoutiqueProfile } from "@/components/boutique/boutique-profile";
import type { BoutiqueDesign, BoutiqueProfileData, CreativePiece } from "@/data/boutique-profiles";
import { AddWhatTheyMakeForm } from "@/components/dashboard/add-what-they-make-form";
import {
  CreativeDispatchForm,
  creativePieceToFormValues,
  EMPTY_CREATIVE_DISPATCH_FORM,
  type CreativeDispatchFormValues,
} from "@/components/dashboard/creative-dispatch-form";
import {
  EMPTY_PORTFOLIO_FORM,
  PortfolioDressForm,
  type PortfolioDressFormValues,
  type PortfolioOutfitTypeOption,
} from "@/components/dashboard/portfolio-dress-form";
import {
  buildOwnerPreviewProfile,
  designToFormValues,
  type OwnerPortfolioApiItem,
} from "@/lib/boutique/owner-preview-profile";
import { CREATIVE_DISPATCH_SETUP_MESSAGE } from "@/lib/boutique/creative-dispatch-queries";

interface OwnerPortfolioPanelProps {
  profile: BoutiqueProfileData | null;
  boutiqueSlug?: string;
}

function normalizeLengthDetails(
  value: OwnerPortfolioApiItem["length_details"],
): PortfolioDressFormValues["lengthDetails"] {
  return value ? { ...value } : {};
}

function itemToFormValues(item: OwnerPortfolioApiItem): PortfolioDressFormValues {
  return {
    title: item.title ?? "",
    description: item.description ?? "",
    priceHint: item.price_hint ?? "",
    sizeLabel: item.size_label ?? "",
    lengthDetails: normalizeLengthDetails(item.length_details),
    outfitTypeId: item.outfit_type_id ?? "",
    outfitTypeLabel: item.outfit_label && !item.outfit_type_id ? item.outfit_label : "",
    mediaUrl: item.media_url,
  };
}

function resolveOutfitTypeForCategory(
  outfitTypes: PortfolioOutfitTypeOption[],
  categoryLabel?: string,
): Pick<PortfolioDressFormValues, "outfitTypeId" | "outfitTypeLabel"> {
  if (!categoryLabel?.trim()) {
    return { outfitTypeId: "", outfitTypeLabel: "" };
  }
  const match = outfitTypes.find(
    (type) => type.label.toLowerCase() === categoryLabel.trim().toLowerCase(),
  );
  if (match) {
    return { outfitTypeId: match.id, outfitTypeLabel: "" };
  }
  return { outfitTypeId: "", outfitTypeLabel: categoryLabel.trim() };
}

export function OwnerPortfolioPanel({ profile, boutiqueSlug }: OwnerPortfolioPanelProps) {
  const router = useRouter();
  const outfitFormRef = useRef<HTMLDivElement>(null);
  const collectionFormRef = useRef<HTMLDivElement>(null);
  const creativeFormRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<OwnerPortfolioApiItem[]>([]);
  const [creativePieces, setCreativePieces] = useState<CreativePiece[]>([]);
  const [creativeDispatchAvailable, setCreativeDispatchAvailable] = useState(true);
  const [outfitTypes, setOutfitTypes] = useState<PortfolioOutfitTypeOption[]>([]);
  const [outfitTypeSuggestions, setOutfitTypeSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [savingCreative, setSavingCreative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [creativeError, setCreativeError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [editingCreativeId, setEditingCreativeId] = useState<string | null>(null);
  const [showOutfitForm, setShowOutfitForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showCreativeForm, setShowCreativeForm] = useState(false);
  const [collectionLabel, setCollectionLabel] = useState("");
  const [outfitFormValues, setOutfitFormValues] = useState<PortfolioDressFormValues>(EMPTY_PORTFOLIO_FORM);
  const [creativeFormValues, setCreativeFormValues] =
    useState<CreativeDispatchFormValues>(EMPTY_CREATIVE_DISPATCH_FORM);

  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portfolioRes, creativeRes] = await Promise.all([
        fetch("/api/boutique/portfolio"),
        fetch("/api/boutique/creative-dispatch"),
      ]);

      const portfolioPayload = (await portfolioRes.json()) as {
        ok?: boolean;
        items?: OwnerPortfolioApiItem[];
        outfitTypes?: PortfolioOutfitTypeOption[];
        dressTypeSuggestions?: string[];
        error?: string;
      };
      const creativePayload = (await creativeRes.json()) as {
        ok?: boolean;
        items?: CreativePiece[];
        tableAvailable?: boolean;
        error?: string;
      };

      if (!portfolioRes.ok || !portfolioPayload.ok) {
        throw new Error(portfolioPayload.error ?? "Failed to load portfolio");
      }

      setItems(portfolioPayload.items ?? []);
      setOutfitTypes(portfolioPayload.outfitTypes ?? []);
      setOutfitTypeSuggestions(portfolioPayload.dressTypeSuggestions ?? []);

      if (creativeRes.ok && creativePayload.ok) {
        setCreativePieces(creativePayload.items ?? []);
        setCreativeDispatchAvailable(creativePayload.tableAvailable !== false);
      } else {
        setCreativePieces([]);
        setCreativeDispatchAvailable(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPortfolioData();
  }, [loadPortfolioData]);

  const previewProfile = useMemo(() => {
    if (!profile) return null;
    return buildOwnerPreviewProfile(profile, items, outfitTypes, creativePieces);
  }, [profile, items, outfitTypes, creativePieces]);

  function scrollToOutfitForm() {
    outfitFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToCollectionForm() {
    collectionFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToCreativeForm() {
    creativeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openAddOutfitForm(options?: { categoryLabel?: string }) {
    setEditingOutfitId(null);
    setOutfitFormValues({
      ...EMPTY_PORTFOLIO_FORM,
      ...resolveOutfitTypeForCategory(outfitTypes, options?.categoryLabel),
    });
    setMessage(null);
    setError(null);
    setShowOutfitForm(true);
    scrollToOutfitForm();
  }

  function openEditForm(design: BoutiqueDesign) {
    const item = items.find((entry) => entry.id === design.id);
    setEditingOutfitId(design.id);
    setOutfitFormValues(item ? itemToFormValues(item) : designToFormValues(design, outfitTypes));
    setMessage(null);
    setError(null);
    setShowOutfitForm(true);
    scrollToOutfitForm();
  }

  function closeOutfitForm() {
    setShowOutfitForm(false);
    setEditingOutfitId(null);
    setOutfitFormValues(EMPTY_PORTFOLIO_FORM);
    setError(null);
  }

  function openCollectionForm() {
    setCollectionLabel("");
    setCollectionError(null);
    setMessage(null);
    setShowCollectionForm(true);
    scrollToCollectionForm();
  }

  function closeCollectionForm() {
    setShowCollectionForm(false);
    setCollectionLabel("");
    setCollectionError(null);
  }

  function openAddCreativeForm() {
    if (!creativeDispatchAvailable) {
      setCreativeError(CREATIVE_DISPATCH_SETUP_MESSAGE);
      return;
    }
    setEditingCreativeId(null);
    setCreativeFormValues(EMPTY_CREATIVE_DISPATCH_FORM);
    setCreativeError(null);
    setMessage(null);
    setShowCreativeForm(true);
    scrollToCreativeForm();
  }

  function openEditCreativeForm(piece: CreativePiece) {
    setEditingCreativeId(piece.id);
    setCreativeFormValues(creativePieceToFormValues(piece));
    setCreativeError(null);
    setMessage(null);
    setShowCreativeForm(true);
    scrollToCreativeForm();
  }

  function closeCreativeForm() {
    setShowCreativeForm(false);
    setEditingCreativeId(null);
    setCreativeFormValues(EMPTY_CREATIVE_DISPATCH_FORM);
    setCreativeError(null);
  }

  async function handleOutfitSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingOutfit(true);
    setError(null);
    setMessage(null);

    const payload = {
      title: outfitFormValues.title,
      description: outfitFormValues.description,
      priceHint: outfitFormValues.priceHint,
      sizeLabel: outfitFormValues.sizeLabel,
      lengthDetails: outfitFormValues.lengthDetails,
      outfitTypeId: outfitFormValues.outfitTypeId || null,
      outfitTypeLabel: outfitFormValues.outfitTypeLabel.trim() || undefined,
      mediaUrl: outfitFormValues.mediaUrl,
    };

    try {
      const res = await fetch("/api/boutique/portfolio", {
        method: editingOutfitId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingOutfitId ? { id: editingOutfitId, ...payload } : payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? (editingOutfitId ? "Failed to update outfit" : "Failed to upload outfit"));
      }

      const wasEditing = Boolean(editingOutfitId);
      closeOutfitForm();
      setMessage(
        wasEditing ? "Portfolio updated — preview refreshed below." : "Outfit added to your public portfolio.",
      );
      await loadPortfolioData();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save portfolio item");
    } finally {
      setSavingOutfit(false);
    }
  }

  async function handleAddCollection(event: React.FormEvent) {
    event.preventDefault();
    setSavingCollection(true);
    setCollectionError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/boutique/outfit-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: collectionLabel.trim() }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? "Failed to add collection");
      }

      closeCollectionForm();
      setMessage(`"${collectionLabel.trim()}" added to What They Make. Select it below to add outfits.`);
      await loadPortfolioData();
      router.refresh();
    } catch (err) {
      setCollectionError(err instanceof Error ? err.message : "Failed to add collection");
    } finally {
      setSavingCollection(false);
    }
  }

  async function handleCreativeSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingCreative(true);
    setCreativeError(null);
    setMessage(null);

    const payload = {
      title: creativeFormValues.title,
      tag: creativeFormValues.tag,
      description: creativeFormValues.description,
      mediaUrl: creativeFormValues.mediaUrl,
      gradient: creativeFormValues.gradient,
    };

    try {
      const res = await fetch("/api/boutique/creative-dispatch", {
        method: editingCreativeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCreativeId ? { id: editingCreativeId, ...payload } : payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? (editingCreativeId ? "Failed to update piece" : "Failed to add piece"));
      }

      closeCreativeForm();
      setMessage(
        editingCreativeId
          ? "Creative dispatch updated."
          : "Showcase piece added to Creative Dispatch.",
      );
      await loadPortfolioData();
      router.refresh();
    } catch (err) {
      setCreativeError(err instanceof Error ? err.message : "Failed to save creative dispatch piece");
    } finally {
      setSavingCreative(false);
    }
  }

  async function handleDeleteOutfit(designId: string) {
    if (!window.confirm("Remove this outfit from your public portfolio?")) return;
    setError(null);
    const res = await fetch(`/api/boutique/portfolio?id=${encodeURIComponent(designId)}`, {
      method: "DELETE",
    });
    const payload = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !payload.ok) {
      setError(payload.error ?? "Failed to delete item");
      return;
    }
    if (editingOutfitId === designId) closeOutfitForm();
    setMessage("Outfit removed from your public portfolio.");
    await loadPortfolioData();
    router.refresh();
  }

  async function handleDeleteCreative(pieceId: string) {
    if (!window.confirm("Remove this creative dispatch piece?")) return;
    setCreativeError(null);
    const res = await fetch(`/api/boutique/creative-dispatch?id=${encodeURIComponent(pieceId)}`, {
      method: "DELETE",
    });
    const payload = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !payload.ok) {
      setCreativeError(payload.error ?? "Failed to delete piece");
      return;
    }
    if (editingCreativeId === pieceId) closeCreativeForm();
    setMessage("Creative dispatch piece removed.");
    await loadPortfolioData();
    router.refresh();
  }

  const slug = boutiqueSlug ?? profile?.slug;

  return (
    <div className="space-y-6">
      <PremiumCard hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold">PUBLIC PORTFOLIO</p>
            <h2 className="mt-2 font-display text-xl font-semibold">Customer preview & edit</h2>
            <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
              Edit outfits and creative dispatch here. Select a collection under What They Make, then
              use Edit on any piece — or add new ones with the buttons below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="luxury-outline" size="sm" onClick={openCollectionForm}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add what they make
            </Button>
            <Button type="button" variant="luxury" size="sm" onClick={() => openAddOutfitForm()}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add outfit
            </Button>
            <Button
              type="button"
              variant="luxury-outline"
              size="sm"
              onClick={openAddCreativeForm}
              disabled={!creativeDispatchAvailable}
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add creative piece
            </Button>
            {slug && (
              <Button asChild variant="luxury-outline" size="sm">
                <Link href={`/boutique/${slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
                  Open live profile
                </Link>
              </Button>
            )}
          </div>
        </div>
        {message && <p className="mt-4 text-sm text-gold">{message}</p>}
        {!loading && items.length > 0 && (
          <p className="mt-2 text-xs text-foreground-muted">
            {items.length} outfit{items.length === 1 ? "" : "s"} loaded — scroll down to edit in the preview.
          </p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="mt-2 text-xs text-foreground-muted">
            No outfits in your portfolio yet. Use Add outfit to upload your first piece.
          </p>
        )}
        {error && !showOutfitForm && !showCollectionForm && !showCreativeForm && (
          <p className="mt-4 text-sm text-red-accent">{error}</p>
        )}
        {creativeError && !showCreativeForm && (
          <p className="mt-4 text-sm text-red-accent">{creativeError}</p>
        )}
        {!creativeDispatchAvailable && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground-muted">
            {CREATIVE_DISPATCH_SETUP_MESSAGE}
          </p>
        )}
      </PremiumCard>

      {showCollectionForm && (
        <div ref={collectionFormRef}>
          <PremiumCard hover={false} className="border-gold/30">
            <AddWhatTheyMakeForm
              suggestions={outfitTypeSuggestions}
              saving={savingCollection}
              error={collectionError}
              value={collectionLabel}
              onChange={setCollectionLabel}
              onSubmit={handleAddCollection}
              onCancel={closeCollectionForm}
            />
          </PremiumCard>
        </div>
      )}

      {showOutfitForm && (
        <div ref={outfitFormRef}>
          <PremiumCard hover={false} className="border-gold/30">
            <PortfolioDressForm
              editingId={editingOutfitId}
              values={outfitFormValues}
              outfitTypes={outfitTypes}
              outfitTypeSuggestions={outfitTypeSuggestions}
              saving={savingOutfit}
              error={error}
              message={null}
              onChange={setOutfitFormValues}
              onSubmit={handleOutfitSubmit}
              onCancel={closeOutfitForm}
            />
          </PremiumCard>
        </div>
      )}

      {showCreativeForm && (
        <div ref={creativeFormRef}>
          <PremiumCard hover={false} className="border-gold/30">
            <CreativeDispatchForm
              editingId={editingCreativeId}
              values={creativeFormValues}
              saving={savingCreative}
              error={creativeError}
              onChange={setCreativeFormValues}
              onSubmit={handleCreativeSubmit}
              onCancel={closeCreativeForm}
            />
          </PremiumCard>
        </div>
      )}

      {loading && !previewProfile ? (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">Loading your public portfolio preview…</p>
        </PremiumCard>
      ) : previewProfile ? (
        <PremiumCard hover={false} className="overflow-hidden p-0">
          <div className="border-b border-gold/20 bg-gold/5 px-4 py-3 lg:px-6">
            <p className="flex items-center gap-2 text-xs font-medium text-gold">
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Owner preview — Edit on any outfit or creative dispatch piece below
            </p>
          </div>
          <div className="bg-background">
            <BoutiqueProfile
              profile={previewProfile}
              ownerMode
              onEditDesign={openEditForm}
              onDeleteDesign={handleDeleteOutfit}
              onAddDesign={openAddOutfitForm}
              onAddWhatTheyMake={openCollectionForm}
              onAddCreativePiece={openAddCreativeForm}
              onEditCreativePiece={openEditCreativeForm}
              onDeleteCreativePiece={handleDeleteCreative}
            />
          </div>
        </PremiumCard>
      ) : (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">
            Your public profile preview is not available yet. Add a collection under What They Make,
            then add outfits — they appear here the same way customers see them.
          </p>
        </PremiumCard>
      )}
    </div>
  );
}
