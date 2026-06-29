"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, TextInput } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Failed to send reset email. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PremiumCard className="mx-auto w-full max-w-md" hover={false}>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">PASSWORD RESET</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Forgot Password?</h1>

      {sent ? (
        <div className="mt-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gold" />
          <p className="mt-4 text-sm text-foreground-muted">
            We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>.
            Check your inbox and follow the link to set a new password.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-gold transition-colors hover:text-gold-light">
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-foreground-muted">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          {error && (
            <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <FormField label="Email address">
              <TextInput name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="your@email.com" />
            </FormField>
            <Button type="submit" variant="luxury" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Remember your password?{" "}
            <Link href="/login" className="text-gold transition-colors hover:text-gold-light">Sign In</Link>
          </p>
        </>
      )}
    </PremiumCard>
  );
}
