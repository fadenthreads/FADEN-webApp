import { cn } from "@faden/utils";
import type { AvailabilityStatus } from "@faden/types";
import {
  boutiqueAvailabilityHint,
  boutiqueAvailabilityLabel,
  isBoutiqueAcceptingOrders,
} from "@/lib/boutique/availability";

interface BoutiqueAvailabilityBadgeProps {
  availability?: AvailabilityStatus | null;
  size?: "sm" | "md";
  className?: string;
}

export function BoutiqueAvailabilityBadge({
  availability,
  size = "md",
  className,
}: BoutiqueAvailabilityBadgeProps) {
  const open = isBoutiqueAcceptingOrders(availability);
  const label = boutiqueAvailabilityLabel(availability);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        open
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-200",
        className,
      )}
      title={boutiqueAvailabilityHint(availability)}
    >
      <span
        className={cn("rounded-full", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", open ? "bg-emerald-400" : "bg-amber-400")}
        aria-hidden
      />
      {label}
    </span>
  );
}

interface BoutiqueAvailabilityNoticeProps {
  availability?: AvailabilityStatus | null;
  message?: string | null;
  className?: string;
}

export function BoutiqueAvailabilityNotice({
  availability,
  message,
  className,
}: BoutiqueAvailabilityNoticeProps) {
  if (isBoutiqueAcceptingOrders(availability)) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100",
        className,
      )}
      role="status"
    >
      <p className="font-medium">This boutique is not accepting new orders right now.</p>
      {message?.trim() && <p className="mt-1 text-amber-100/90">{message.trim()}</p>}
    </div>
  );
}
