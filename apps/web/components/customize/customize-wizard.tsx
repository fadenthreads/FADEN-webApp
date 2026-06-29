"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { CustomizeFlowBanner } from "./customize-flow-banner";

export function CustomizeWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Customize");
  const tc = useTranslations("Common");
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

  function goToStep(stepId: CustomizeStepId) {
    const index = CUSTOMIZE_STEPS.findIndex((s) => s.id === stepId);
    if (index >= 0) {
      setError(null);
      setStepIndex(index);
    }
  }

  function renderStepContent(stepId: CustomizeStepId) {
    switch (stepId) {
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
        return (
          <StepReview
            data={data}
            hasPreselectedBoutique={Boolean(data.selectedBoutiqueSlug)}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  }

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
            : current.outfitDescription ||
              dress.description ||
              `Based on: ${dress.title}${dress.sizeLabel ? ` (${dress.sizeLabel})` : ""}`,
          fabricTypes: dress.material ? dress.material : current.fabricTypes,
          budgetRange: dress.price ? dress.price : current.budgetRange,
          inspirationLinks: current.inspirationLinks || referenceLink,
          sketchNotes: orderSameIntent
            ? orderNotes
            : current.sketchNotes ||
              `Reference outfit: ${dress.title}${dress.description ? `\n${dress.description}` : ""}${dress.material ? `\nFabric: ${dress.material}` : ""}${dress.price ? `\nPrice reference: ${dress.price}` : ""}`,
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
        setError(payload.error ?? t("submitFailed"));
        return;
      }

      setRequestId((payload as { requestId?: string }).requestId ?? null);
      setSubmittedAt(new Date().toISOString());
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinueToMatches() {
    if (!data.outfitAudience) {
      setError(t("selectAudience"));
      return;
    }
    if (!data.outfitType.trim()) {
      setError(t("selectOutfitType"));
      return;
    }
    saveCustomizeDraft(data);
    router.push("/customize/matches");
  }

  if (submitted) {
    return (
      <div className="premium-surface-3d mx-auto max-w-lg rounded-xl p-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-gold">{t("submittedTitle")}</h2>
        <p className="mt-4 text-foreground-muted">{t("submittedBody")}</p>
        {requestId && (
          <p className="mt-3 text-xs tracking-wide text-foreground-muted/80">
            {t("reference")}: {requestId.slice(0, 8)}…
          </p>
        )}
        {submittedAt && (
          <p className="mt-2 text-xs text-foreground-muted">
            {t("submittedAt", { date: formatPostedAt(submittedAt) })}
          </p>
        )}
        <Button asChild variant="luxury" className="mt-6">
          <Link href="/account/requests">{t("viewInAccount")}</Link>
        </Button>
        <Button asChild variant="luxury-outline" className="mt-3">
          <Link href="/account">{t("goToAccount")}</Link>
        </Button>
        <p className="mt-4 text-sm text-foreground-muted">{t("nextSteps")}</p>
      </div>
    );
  }

  const isLastStep = stepIndex === CUSTOMIZE_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-8 flex flex-wrap gap-2" aria-label={t("navAria")}>
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
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors hover:ring-1 hover:ring-navy/25 ${
                isActive
                  ? "bg-gold text-navy"
                  : isComplete
                    ? "bg-navy/10 text-navy hover:bg-navy/15"
                    : "bg-background-elevated text-foreground-muted hover:bg-background-soft hover:text-foreground"
              }`}
            >
              {i + 1}. {t(`steps.${s.id}`)}
            </button>
          );
        })}
      </nav>

      <div className="premium-surface-3d rounded-xl p-6 md:p-8">
        <CustomizeFlowBanner
          data={data}
          onChange={stepIndex === 0 ? (flowOrder) => onChange({ flowOrder }) : undefined}
        />
        <h2 className="font-display text-xl font-semibold text-gold">{t(`steps.${step.id}`)}</h2>
        {error && (
          <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}
        <div className="mt-6">{renderStepContent(step.id)}</div>

        <div className="mt-8 flex justify-between gap-4">
          <Button
            type="button"
            variant="luxury-outline"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => i - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            {tc("back")}
          </Button>
          {!isLastStep ? (
            <Button type="button" variant="luxury" onClick={() => setStepIndex((i) => i + 1)}>
              {tc("next")}
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          ) : hasBoutique ? (
            <Button type="button" variant="luxury" disabled={submitting} onClick={handleDirectSubmit}>
              {submitting ? tc("submitting") : t("submitRequest")}
            </Button>
          ) : (
            <Button type="button" variant="luxury" onClick={handleContinueToMatches}>
              {t("viewSuggestedBoutiques")}
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
