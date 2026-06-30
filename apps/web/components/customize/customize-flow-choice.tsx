"use client";

import { Check } from "lucide-react";
import { cn } from "@faden/utils";
import { FLOW_ORDER_OPTIONS, type CustomizeFormData } from "@/data/customize-form";

interface CustomizeFlowChoiceProps {
  flowOrder: CustomizeFormData["flowOrder"];
  onChange?: (flowOrder: CustomizeFormData["flowOrder"]) => void;
  compact?: boolean;
}

export function CustomizeFlowChoice({ flowOrder, onChange, compact = false }: CustomizeFlowChoiceProps) {
  const interactive = Boolean(onChange);

  return (
    <div
      className={cn("space-y-2", compact ? "mb-4" : "mb-6")}
      role={interactive ? "radiogroup" : "group"}
      aria-label="Customization path"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
        {interactive ? "Choose your path" : "Your path"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {FLOW_ORDER_OPTIONS.map((opt) => {
          const selected = flowOrder === opt.value;
          const sharedClass = cn(
            "relative rounded-xl border p-4 text-left transition-all",
            selected
              ? "border-navy bg-navy/10 text-navy shadow-[0_0_0_1px_rgba(10,26,48,0.12)] ring-2 ring-navy/20"
              : interactive
                ? "border-border bg-background-elevated opacity-75 hover:border-gold/40 hover:opacity-100"
                : "border-border/60 bg-background-elevated/50 opacity-50",
          );

          const content = (
            <>
              {selected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
              <p className="text-xs font-semibold text-gold">{opt.number}.</p>
              <h3
                className={cn(
                  "font-display text-base font-semibold",
                  selected ? "text-navy" : "text-foreground-muted",
                )}
              >
                {opt.label}
              </h3>
              {!compact && (
                <p className="mt-1.5 text-sm text-foreground-muted">{opt.desc}</p>
              )}
            </>
          );

          if (interactive) {
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange?.(opt.value)}
                className={sharedClass}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={opt.value}
              aria-current={selected ? "true" : undefined}
              className={sharedClass}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
