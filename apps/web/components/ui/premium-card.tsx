import { cn } from "@faden/utils";
import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({ children, className, hover = true }: PremiumCardProps) {
  return (
    <div className={cn(hover ? "premium-surface-3d" : "premium-surface", "rounded-xl p-6", className)}>
      {children}
    </div>
  );
}
