"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">Something Went Wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred in the admin console.
        {error.digest ? (
          <span className="ml-1 font-mono text-xs opacity-60">({error.digest})</span>
        ) : null}
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try Again
        </button>
        <Link href="/" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
