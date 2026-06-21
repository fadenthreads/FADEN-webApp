"use client";

import Link from "next/link";
import { Button } from "@faden/ui";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">Something Went Wrong</h1>
      <p className="mt-4 max-w-md text-foreground-muted">
        We encountered an unexpected error. Please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
