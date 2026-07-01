"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@faden/utils";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface FilterBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function FilterBottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
  className,
}: FilterBottomSheetProps) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filter panel"
            className="fixed inset-0 z-[70] bg-navy/40 backdrop-blur-[2px]"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[71] flex max-h-[min(85vh,640px)] flex-col rounded-t-[20px] border border-border/60 bg-background-elevated shadow-lg",
              className,
            )}
            initial={reducedMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <h2 id={titleId} className="font-display text-lg font-semibold text-navy">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-navy/5 hover:text-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            {footer ? (
              <div className="border-t border-border/60 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
