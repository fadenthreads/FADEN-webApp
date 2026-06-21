"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, SelectInput, TextInput } from "@/components/ui/form-field";
import { formatAuthError } from "@/lib/auth-errors";
import { authFetch, isBrowserSupabaseConfigured, navigateAfterAuth } from "@/lib/supabase/client";
import { signupSchema } from "@faden/validators";

interface SignupFormProps {
  next?: string;
}

export function SignupForm({ next = "/register-boutique" }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isBrowserSupabaseConfigured()) {
      setError("Supabase is not configured. Add credentials to .env.local.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || "customer",
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/auth/signup", {
        ...parsed.data,
        next,
      });

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Sign up failed. Please try again.");
        setPending(false);
        return;
      }

      navigateAfterAuth(payload.redirect ?? "/login?registered=1");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out. Restart the dev server and try again."
          : formatAuthError(err);
      setError(message);
      setPending(false);
    }
  }

  return (
    <PremiumCard className="mx-auto w-full max-w-md" hover={false}>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">JOIN FADEN</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Create Account</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Customers discover boutiques. Boutique owners register their studio after signup.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <FormField label="Full name">
          <TextInput name="fullName" required placeholder="Your name" autoComplete="name" />
        </FormField>
        <FormField label="Email">
          <TextInput name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </FormField>
        <FormField label="Password">
          <TextInput
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="I am joining as">
          <SelectInput
            name="role"
            defaultValue="customer"
            options={[
              { value: "customer", label: "Customer — discover & customize" },
              { value: "boutique_owner", label: "Boutique owner — list my studio" },
            ]}
          />
        </FormField>
        <Button type="submit" variant="luxury" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-gold hover:text-gold-light">
          Sign in
        </Link>
      </p>
    </PremiumCard>
  );
}
