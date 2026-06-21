import type { ReactNode } from "react";
import { cn } from "@faden/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-3 max-w-md text-[15px] text-foreground-muted">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
