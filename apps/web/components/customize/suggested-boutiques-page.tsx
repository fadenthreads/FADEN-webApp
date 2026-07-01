"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Star, MapPin, Check } from "lucide-react";
import { Button } from "@faden/ui";
import { cn } from "@faden/utils";
import { PremiumCard } from "@/components/ui/premium-card";
import type { BoutiqueMatch } from "@/lib/boutique/matching";
import {
  clearCustomizeDraft,
  loadCustomizeDraft,
  saveCustomizeDraft,
  updateDraftSelectedBoutique,
} from "@/lib/customize/draft-storage";
import type { CustomizeFormData } from "@/data/customize-form";
import { authFetch } from "@/lib/supabase/client";
import { getStoredCustomerLocation } from "@/lib/location/customer-location";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import {
  consumePendingCustomizeSubmit,
  setPendingCustomizeSubmit,
} from "@/lib/customize/pending-submit";
import { useUser } from "@/hooks/use-user";

type SubmitMode = "single" | "multi";
type SortMode = "match" | "rating" | "nearby";

const MAX_MULTI = 5;

export function SuggestedBoutiquesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFromUrl = searchParams.get("selected") ?? "";
  const discovery = useDiscoveryOptional();
  const { user } = useUser();

  const [draft, setDraft] = useState<CustomizeFormData | null>(null);
  const [matches, setMatches] = useState<BoutiqueMatch[]>([]);
  const [customerLocation, setCustomerLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(1);
  const [submitMode, setSubmitMode] = useState<SubmitMode>("single");
  const [sortBy, setSortBy] = useState<SortMode>("match");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const selectedSlug = draft?.selectedBoutiqueSlug || selectedFromUrl;
  const selectedMatch = matches.find((match) => match.slug === selectedSlug);

  const sortedMatches = useMemo(() => {
    const list = [...matches];
    if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating || b.score - a.score);
    } else if (sortBy === "nearby") {
      list.sort(
        (a, b) =>
          (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY) ||
          b.rating - a.rating,
      );
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [matches, sortBy]);

  useEffect(() => {
    const stored = loadCustomizeDraft();
    if (!stored?.outfitType || !stored.outfitAudience) {
      router.replace("/customize");
      return;
    }

    let nextDraft = stored;
    if (selectedFromUrl) {
      nextDraft = updateDraftSelectedBoutique(selectedFromUrl) ?? stored;
      setSelectedSlugs([selectedFromUrl]);
    }
    setDraft(nextDraft);

    const customerLoc = discovery?.customerLocation ?? getStoredCustomerLocation();

    fetch("/customize/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outfitAudience: nextDraft.outfitAudience,
        outfitType: nextDraft.outfitType,
        occasion: nextDraft.occasion,
        budgetRange: nextDraft.budgetRange,
        deliveryDate: nextDraft.deliveryDate,
        customerLocation: customerLoc.label,
        customerLat: customerLoc.lat ?? undefined,
        customerLng: customerLoc.lng ?? undefined,
      }),
    })
      .then(async (res) => {
        const payload = (await res.json()) as {
          ok?: boolean;
          error?: string;
          matches?: BoutiqueMatch[];
          customerLocation?: string;
        };
        if (!res.ok || !payload.ok) {
          throw new Error(payload.error ?? "Could not load matches");
        }
        setMatches(payload.matches ?? []);
        setCustomerLocation(payload.customerLocation ?? customerLoc.label);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load matches");
      })
      .finally(() => setLoading(false));
  }, [router, selectedFromUrl, discovery?.customerLocation]);

  function handleSelectSingle(slug: string) {
    const updated = { ...(draft ?? loadCustomizeDraft()!), selectedBoutiqueSlug: slug };
    saveCustomizeDraft(updated);
    setDraft(updated);
    setSelectedSlugs([slug]);
    router.replace(`/customize/matches?selected=${encodeURIComponent(slug)}`, { scroll: false });
  }

  function toggleMultiSelect(slug: string) {
    setSelectedSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= MAX_MULTI) return current;
      return [...current, slug];
    });
    setSubmitError(null);
  }

  function handleSubmit() {
    if (!draft) return;

    const slugs =
      submitMode === "multi"
        ? selectedSlugs
        : selectedSlug
          ? [selectedSlug]
          : [];

    if (!slugs.length) {
      setSubmitError(
        submitMode === "multi"
          ? "Select up to 5 boutiques to request quotations."
          : "Choose one boutique before submitting.",
      );
      return;
    }

    setSubmitError(null);
    startTransition(async () => {
      const payload = {
        ...draft,
        selectedBoutiqueSlug: slugs[0] ?? "",
        selectedBoutiqueSlugs: slugs,
        previewMatches: matches,
      };

      const { res, payload: result } = await authFetch("/customize/submit", payload);

      const nextUrl =
        submitMode === "multi"
          ? "/customize/matches"
          : `/customize/matches?selected=${encodeURIComponent(slugs[0] ?? "")}`;

      if (res.status === 401) {
        setPendingCustomizeSubmit(true);
        router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      if (!res.ok || !result.ok) {
        setSubmitError(result.error ?? "Submission failed. Please try again.");
        return;
      }

      setPendingCustomizeSubmit(false);
      clearCustomizeDraft();
      setSubmittedCount(
        (result as { boutiqueCount?: number }).boutiqueCount ?? slugs.length,
      );
      setSubmitted(true);
    });
  }

  useEffect(() => {
    if (!user || !draft || submitted || pending || loading) return;
    if (!consumePendingCustomizeSubmit()) return;

    const slugs =
      submitMode === "multi"
        ? selectedSlugs
        : selectedSlug
          ? [selectedSlug]
          : [];

    if (!slugs.length) return;

    setSubmitError(null);
    startTransition(async () => {
      const payload = {
        ...draft,
        selectedBoutiqueSlug: slugs[0] ?? "",
        selectedBoutiqueSlugs: slugs,
        previewMatches: matches,
      };

      const { res, payload: result } = await authFetch("/customize/submit", payload);

      if (res.status === 401) {
        setPendingCustomizeSubmit(true);
        router.push(`/login?next=${encodeURIComponent("/customize/matches")}`);
        return;
      }

      if (!res.ok || !result.ok) {
        setSubmitError(result.error ?? "Submission failed. Please try again.");
        return;
      }

      setPendingCustomizeSubmit(false);
      clearCustomizeDraft();
      setSubmittedCount(
        (result as { boutiqueCount?: number }).boutiqueCount ?? slugs.length,
      );
      setSubmitted(true);
    });
  }, [user, draft, submitted, pending, loading, submitMode, selectedSlugs, selectedSlug, matches, router]);

  if (submitted) {
    return (
      <div className="premium-surface-3d mx-auto max-w-lg rounded-2xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/10 text-2xl">
          ✅
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-navy">Request Submitted Successfully</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          Your customization request has been stored and sent to the boutique. You will receive a notification when
          they respond.
        </p>
        <p className="mt-4 text-sm text-foreground-muted">
          {submittedCount > 1
            ? `Your design request was sent to ${submittedCount} boutiques. Compare quotations on your account and choose the one you prefer.`
            : `${selectedMatch?.name ?? "Your boutique"} will review your request and send a quotation.`}
        </p>
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account/quotations">View quotations on account</Link>
        </Button>
      </div>
    );
  }

  if (loading || !draft) {
    return (
      <div className="mx-auto max-w-3xl text-center text-foreground-muted">
        Finding boutiques that make {draft?.outfitType ?? "your outfit"} near you…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.2em] text-gold">YOUR REQUEST</p>
        <h2 className="mt-2 font-display text-xl font-semibold">{draft.outfitType}</h2>
        {draft.outfitAudience && (
          <p className="mt-1 text-sm text-gold">
            For {draft.outfitAudience === "kids" ? "kids" : `${draft.outfitAudience}'s wear`}
          </p>
        )}
        {customerLocation && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground-muted">
            <MapPin className="h-3.5 w-3.5 text-red-accent" aria-hidden />
            Showing boutiques near {customerLocation.split(",")[0]}
          </p>
        )}
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {draft.occasion && (
            <div>
              <dt className="text-foreground-muted">Occasion</dt>
              <dd className="font-medium">{draft.occasion}</dd>
            </div>
          )}
          {draft.budgetRange && (
            <div>
              <dt className="text-foreground-muted">Budget</dt>
              <dd className="font-medium">{draft.budgetRange}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-sm text-foreground-muted">
          Only boutiques that create <strong className="text-foreground">{draft.outfitType}</strong> are
          listed. Pick one boutique, or request quotes from several and compare on your account.
        </p>
        <Button asChild variant="luxury-outline" size="sm" className="mt-4">
          <Link href="/customize">Edit request</Link>
        </Button>
      </PremiumCard>

      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.2em] text-gold">HOW TO PROCEED</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={submitMode === "single" ? "luxury" : "luxury-outline"}
            onClick={() => setSubmitMode("single")}
          >
            Choose one boutique
          </Button>
          <Button
            type="button"
            size="sm"
            variant={submitMode === "multi" ? "luxury" : "luxury-outline"}
            onClick={() => setSubmitMode("multi")}
          >
            Request quotes from multiple
          </Button>
        </div>
        <p className="mt-3 text-sm text-foreground-muted">
          {submitMode === "single"
            ? "Select a single boutique by rating and profile, then submit your request."
            : `Select up to ${MAX_MULTI} boutiques — each will send a quotation you can compare.`}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted">Sort by:</span>
          {(
            [
              ["match", "Best match"],
              ["rating", "Highest rating"],
              ["nearby", "Nearest first"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                sortBy === value
                  ? "bg-gold/20 text-gold"
                  : "bg-background-elevated text-foreground-muted hover:text-gold",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </PremiumCard>

      {error && (
        <p className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      {!error && matches.length === 0 && (
        <PremiumCard hover={false}>
          <p className="text-sm text-foreground-muted">
            No verified boutiques near you currently list {draft.outfitType}. Try another location in
            the header, or{" "}
            <Link href="/" className="text-gold hover:text-gold-light">
              browse all boutiques
            </Link>
            .
          </p>
        </PremiumCard>
      )}

      {sortedMatches.map((match) => {
        const isSingleSelected = submitMode === "single" && match.slug === selectedSlug;
        const isMultiSelected = submitMode === "multi" && selectedSlugs.includes(match.slug);

        return (
          <PremiumCard
            key={match.slug}
            hover={false}
            className={isSingleSelected || isMultiSelected ? "ring-2 ring-gold" : undefined}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{match.name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {match.distanceLabel ? `${match.distanceLabel} · ${match.location}` : match.location}
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-sm text-gold">
                  <Star className="h-4 w-4 fill-gold" aria-hidden />
                  {match.rating.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-gold">Match {match.score}%</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-foreground-muted">{match.experienceSummary}</p>

            <ul className="mt-3 space-y-1 text-sm text-foreground-muted">
              {match.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="luxury-outline" size="sm">
                <Link href={`/boutique/${match.slug}?from=matches`}>View profile</Link>
              </Button>
              {submitMode === "single" ? (
                <Button
                  type="button"
                  variant={isSingleSelected ? "luxury" : "luxury-outline"}
                  size="sm"
                  onClick={() => handleSelectSingle(match.slug)}
                >
                  {isSingleSelected ? "Selected" : "Select boutique"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant={isMultiSelected ? "luxury" : "luxury-outline"}
                  size="sm"
                  onClick={() => toggleMultiSelect(match.slug)}
                >
                  {isMultiSelected ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      Selected
                    </span>
                  ) : (
                    "Add for quote"
                  )}
                </Button>
              )}
            </div>
          </PremiumCard>
        );
      })}

      {matches.length > 0 && (
        <PremiumCard hover={false}>
          {submitError && (
            <p className="mb-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
              {submitError}
            </p>
          )}
          <p className="text-sm text-foreground-muted">
            {submitMode === "single"
              ? selectedMatch
                ? `Ready to send your ${draft.outfitType} request to ${selectedMatch.name}.`
                : "Select one boutique after reviewing their profile."
              : selectedSlugs.length
                ? `${selectedSlugs.length} boutique${selectedSlugs.length === 1 ? "" : "s"} selected for quotations.`
                : "Select boutiques to receive competing quotations."}
          </p>
          <Button
            type="button"
            variant="luxury"
            className="mt-4"
            disabled={
              pending ||
              (submitMode === "single" ? !selectedSlug : selectedSlugs.length === 0)
            }
            onClick={handleSubmit}
          >
            {pending
              ? "Submitting…"
              : submitMode === "multi"
                ? selectedSlugs.length
                  ? `Request quotes from ${selectedSlugs.length} boutique${selectedSlugs.length === 1 ? "" : "s"}`
                  : "Request quotes from boutiques"
                : selectedMatch
                  ? `Submit request to ${selectedMatch.name}`
                  : "Submit request"}
          </Button>
        </PremiumCard>
      )}
    </div>
  );
}
