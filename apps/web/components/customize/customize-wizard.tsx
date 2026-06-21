"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@faden/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CUSTOMIZE_STEPS,
  INITIAL_CUSTOMIZE_DATA,
  type CustomizeFormData,
  type CustomizeStepId,
} from "@/data/customize-form";
import { formatPostedAt } from "@/lib/datetime/format";
import { authFetch } from "@/lib/supabase/client";
import { saveCustomizeDraft } from "@/lib/customize/draft-storage";
import { formatDressSpecsForOrderNotes } from "@/lib/boutique/dress-specs";
import { inferOutfitAudienceFromType } from "@/lib/boutique/audiences";
import type { DressLengthDetails } from "@/data/boutique-profiles";
import {
  StepCategory,
  StepDelivery,
  StepDesign,
  StepFabric,
  StepInspiration,
  StepMeasurements,
  StepReview,
  StepStart,
} from "./customize-steps";

function stepContent(step: CustomizeStepId, data: CustomizeFormData, onChange: (p: Partial<CustomizeFormData>) => void) {
  switch (step) {
    case "start":
      return <StepStart data={data} onChange={onChange} />;
    case "category":
      return <StepCategory data={data} onChange={onChange} />;
    case "inspiration":
      return <StepInspiration data={data} onChange={onChange} />;
    case "fabric":
      return <StepFabric data={data} onChange={onChange} />;
    case "measurements":
      return <StepMeasurements data={data} onChange={onChange} />;
    case "design":
      return <StepDesign data={data} onChange={onChange} />;
    case "delivery":
      return <StepDelivery data={data} onChange={onChange} />;
    case "review":
      return <StepReview data={data} hasPreselectedBoutique={Boolean(data.selectedBoutiqueSlug)} />;
    default:
      return null;
  }
}

export function CustomizeWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boutiqueParam = searchParams.get("boutique") ?? "";
  const referenceParam = searchParams.get("reference") ?? "";
  const outfitTypeParam = searchParams.get("outfitType") ?? "";
  const audienceParam = searchParams.get("audience") ?? "";
  const orderSameIntent = searchParams.get("intent") === "order-same";
  const inferredAudience =
    audienceParam === "women" || audienceParam === "men" || audienceParam === "kids"
      ? audienceParam
      : inferOutfitAudienceFromType(outfitTypeParam) ?? "";

  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<CustomizeFormData>({
    ...INITIAL_CUSTOMIZE_DATA,
    selectedBoutiqueSlug: boutiqueParam,
    flowOrder: boutiqueParam ? "boutique-first" : "requirements-first",
    portfolioReferenceId: referenceParam,
    outfitAudience: inferredAudience,
    outfitType: outfitTypeParam,
    portfolioOrderSame: orderSameIntent,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const step = CUSTOMIZE_STEPS[stepIndex];
  const onChange = (patch: Partial<CustomizeFormData>) => setData((d) => ({ ...d, ...patch }));
  const hasBoutique = Boolean(data.selectedBoutiqueSlug?.trim() || boutiqueParam);

  useEffect(() => {
    if (!referenceParam || !boutiqueParam) return;

    const params = new URLSearchParams({ slug: boutiqueParam, id: referenceParam });
    fetch(`/api/boutique/dress?${params}`)
      .then((res) => res.json())
      .then((payload: {
        design?: {
          id: string;
          title: string;
          outfitLabel?: string;
          description?: string;
          imageUrl?: string;
          material?: string;
          price?: string;
          sizeLabel?: string | null;
          lengthDetails?: DressLengthDetails | null;
        };
      }) => {
        if (!payload.design) return;
        const dress = payload.design;
        const referenceLink =
          typeof window !== "undefined"
            ? `${window.location.origin}/boutique/${boutiqueParam}/dress/${dress.id}`
            : `/boutique/${boutiqueParam}/dress/${dress.id}`;

        const orderNotes = formatDressSpecsForOrderNotes({
          title: dress.title,
          description: dress.description ?? undefined,
          material: dress.material ?? "",
          price: dress.price ?? "",
          sizeLabel: dress.sizeLabel,
          lengthDetails: dress.lengthDetails,
        });

        setData((current) => {
          const outfitType = current.outfitType || dress.outfitLabel || outfitTypeParam;
          const outfitAudience =
            current.outfitAudience ||
            (audienceParam === "women" || audienceParam === "men" || audienceParam === "kids"
              ? audienceParam
              : inferOutfitAudienceFromType(outfitType) ?? "");

          return {
            ...current,
            selectedBoutiqueSlug: boutiqueParam,
            flowOrder: "boutique-first",
            outfitAudience,
            outfitType,
          portfolioReferenceId: dress.id,
          portfolioReferenceTitle: dress.title,
          portfolioOrderSame: orderSameIntent,
          outfitDescription: orderSameIntent
            ? current.outfitDescription ||
              `Same as portfolio outfit: ${dress.title}${dress.sizeLabel ? ` (${dress.sizeLabel})` : ""}`
            : current.outfitDescription,
          fabricTypes: orderSameIntent && dress.material ? dress.material : current.fabricTypes,
          budgetRange: orderSameIntent && dress.price ? dress.price : current.budgetRange,
          inspirationLinks: current.inspirationLinks || referenceLink,
          sketchNotes: orderSameIntent
            ? orderNotes
            : current.sketchNotes ||
              `Reference outfit: ${dress.title}${dress.description ? `\n${dress.description}` : ""}`,
          mixOutfitImages: dress.imageUrl
            ? Array.from(new Set([...current.mixOutfitImages, dress.imageUrl])).slice(0, 4)
            : current.mixOutfitImages,
          };
        });
      })
      .catch(() => {
        /* mock/offline */
      });
  }, [referenceParam, boutiqueParam, outfitTypeParam, audienceParam, orderSameIntent]);

  async function handleDirectSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      const { res, payload } = await authFetch("/customize/submit", { ...data });

      if (res.status === 401) {
        const next = `/customize${boutiqueParam ? `?boutique=${boutiqueParam}` : ""}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Submission failed. Please try again.");
        return;
      }

      setRequestId((payload as { requestId?: string }).requestId ?? null);
      setSubmittedAt(new Date().toISOString());
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinueToMatches() {
    if (!data.outfitAudience) {
      setError("Select who this outfit is for (Women, Men, or Kids).");
      return;
    }
    if (!data.outfitType.trim()) {
      setError("Select an outfit type before finding boutiques.");
      return;
    }
    saveCustomizeDraft(data);
    router.push("/customize/matches");
  }

  if (submitted) {
    return (
      <div className="premium-surface-3d mx-auto max-w-lg rounded-xl p-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">Request Submitted</h2>
        <p className="mt-4 text-foreground-muted">
          Your boutique will review your request and reply with a quotation.
        </p>
        {requestId && (
          <p className="mt-3 text-xs tracking-wide text-foreground-muted/80">Reference: {requestId.slice(0, 8)}…</p>
        )}
        {submittedAt && (
          <p className="mt-2 text-xs text-foreground-muted">Submitted {formatPostedAt(submittedAt)}</p>
        )}
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account/requests">View in my account</Link>
        </Button>
        <Button asChild variant="luxury-outline" className="mt-3">
          <Link href="/account">Go to account</Link>
        </Button>
        <p className="mt-4 text-sm text-foreground-muted">
          Next: quotation → payment → production tracking → delivery → review
        </p>
      </div>
    );
  }

  const isLastStep = stepIndex === CUSTOMIZE_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Customize outfit steps">
        {CUSTOMIZE_STEPS.map((s, i) => {
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;

          return (
            <button
              key={s.id}
              type="button"
              aria-current={isActive ? "step" : undefined}
              onClick={() => {
                setError(null);
                setStepIndex(i);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors hover:ring-1 hover:ring-gold/40 ${
                isActive
                  ? "bg-cherry text-gold-light"
                  : isComplete
                    ? "bg-gold/20 text-gold hover:bg-gold/30"
                    : "bg-background-elevated text-foreground-muted hover:bg-background-soft hover:text-foreground"
              }`}
            >
              {i + 1}. {s.title}
            </button>
          );
        })}
      </nav>

      <div className="premium-surface-3d rounded-xl p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold text-gold">{step.title}</h2>
        {error && (
          <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}
        <div className="mt-6">{stepContent(step.id, data, onChange)}</div>

        <div className="mt-8 flex justify-between gap-4">
          <Button
            type="button"
            variant="luxury-outline"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => i - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Back
          </Button>
          {!isLastStep ? (
            <Button type="button" variant="luxury" onClick={() => setStepIndex((i) => i + 1)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          ) : hasBoutique ? (
            <Button type="button" variant="luxury" disabled={submitting} onClick={handleDirectSubmit}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          ) : (
            <Button type="button" variant="luxury" onClick={handleContinueToMatches}>
              View suggested boutiques
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
