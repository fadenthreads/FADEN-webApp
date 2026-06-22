"use client";

import type { CustomizeFormData } from "@/data/customize-form";
import { FLOW_ORDER_LABELS } from "@/data/customize-form";
import { CustomizeFlowChoice } from "@/components/customize/customize-flow-choice";

interface CustomizeFlowBannerProps {
  data: CustomizeFormData;
  onChange?: (flowOrder: CustomizeFormData["flowOrder"]) => void;
}

export function CustomizeFlowBanner({ data, onChange }: CustomizeFlowBannerProps) {
  const isBoutiqueFirst = data.flowOrder === "boutique-first";

  return (
    <div aria-label="Your customization path">
      <CustomizeFlowChoice flowOrder={data.flowOrder} onChange={onChange} compact={Boolean(!onChange)} />
      {isBoutiqueFirst && data.selectedBoutiqueSlug && (
        <p className="-mt-1 mb-4 text-sm text-foreground-muted">
          Selected boutique:{" "}
          <span className="font-medium text-foreground">{data.selectedBoutiqueSlug}</span>
        </p>
      )}
      {!isBoutiqueFirst && (
        <p className="-mt-1 mb-4 text-sm text-foreground-muted">
          You chose <span className="font-medium text-foreground">{FLOW_ORDER_LABELS[data.flowOrder]}</span> — describe your outfit, then pick a matched boutique.
        </p>
      )}
    </div>
  );
}
