"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@faden/ui";
import { useUser } from "@/hooks/use-user";

export function CustomizeAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  if (loading) {
    return (
      <div className="premium-surface-3d rounded-xl p-10 text-center text-sm text-foreground-muted">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="premium-surface-3d mx-auto max-w-lg rounded-xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy">Account required</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-navy">Sign up to customize</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          Create a free FADEN account to submit customization requests and receive updates when boutiques respond.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild variant="luxury">
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create account</Link>
          </Button>
          <Button asChild variant="luxury-outline">
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
