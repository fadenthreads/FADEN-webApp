"use client";

import { useState } from "react";
import { Button } from "@faden/ui";
import { createBrowserClient, isBrowserSupabaseConfigured } from "@/lib/supabase/client";

interface OAuthButtonsProps {
  next?: string;
  role?: "customer" | "boutique_owner";
}

export function OAuthButtons({ next = "/", role = "customer" }: OAuthButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "apple" | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setError(null);

    if (!isBrowserSupabaseConfigured()) {
      setError("Supabase is not configured.");
      return;
    }

    setPending(provider);
    try {
      const supabase = createBrowserClient({ fresh: true });
      const roleParam = role === "boutique_owner" ? "&role=boutique_owner" : "";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${roleParam}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setPending(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="luxury-outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => signInWith("google")}
        >
          {pending === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>
        <Button
          type="button"
          variant="luxury-outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => signInWith("apple")}
        >
          {pending === "apple" ? "Redirecting…" : "Continue with Apple"}
        </Button>
      </div>
      <p className="text-center text-xs text-foreground-muted">or continue with email</p>
    </div>
  );
}
