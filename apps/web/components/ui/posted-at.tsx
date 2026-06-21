import { formatPostedAt } from "@/lib/datetime/format";

interface PostedAtProps {
  value: string | null | undefined;
  prefix?: string;
  className?: string;
}

/** Shows when something was posted — date and time, for any user role. */
export function PostedAt({ value, prefix = "Posted", className }: PostedAtProps) {
  if (!value) return null;
  return (
    <p className={className ?? "text-xs text-foreground-muted"}>
      {prefix} {formatPostedAt(value)}
    </p>
  );
}
