"use client";

import { useState } from "react";
import { loginSchema } from "@faden/validators";
import { authFetch, isBrowserSupabaseConfigured, navigateAfterAuth } from "@/lib/supabase/client";

function formatAuthError(error: unknown): string {
  if (!error || typeof error !== "object") return "Authentication failed.";
  const authError = error as { message?: string; msg?: string };
  return authError.message || authError.msg || "Authentication failed.";
}

interface AdminLoginFormProps {
  forbidden?: boolean;
}

export function AdminLoginForm({ forbidden = false }: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isBrowserSupabaseConfigured()) {
      setError("Supabase is not configured.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? formatAuthError(null));
        setPending(false);
        return;
      }

      navigateAfterAuth(payload.redirect ?? "/");
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
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-background-elevated p-8">
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">FADEN ADMIN</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Sign In</h1>
      <p className="mt-2 text-sm text-foreground-muted">Admin accounts only.</p>

      {forbidden && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          This account does not have admin access.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-foreground-muted">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-foreground-muted">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-foreground-muted">
        Use a profile with role <code className="text-gold">admin</code> in Supabase.
      </p>
    </div>
  );
}
