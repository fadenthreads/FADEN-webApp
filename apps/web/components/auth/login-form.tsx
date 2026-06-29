"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, TextInput } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { formatAuthError } from "@/lib/auth-errors";
import { authFetch, isBrowserSupabaseConfigured, navigateAfterAuth } from "@/lib/supabase/client";
import { loginSchema } from "@faden/validators";

interface LoginFormProps {
  next?: string;
  registered?: boolean;
  authError?: string | null;
}

export function LoginForm({ next = "/", registered = false, authError = null }: LoginFormProps) {
  const t = useTranslations("Auth");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isBrowserSupabaseConfigured()) {
      setError(t("supabaseNotConfigured"));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? t("invalidInput"));
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
        next,
      });

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? formatAuthError(null));
        setPending(false);
        return;
      }

      navigateAfterAuth(payload.redirect ?? next);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? t("requestTimeout")
          : formatAuthError(err);
      setError(message);
      setPending(false);
    }
  }

  return (
    <PremiumCard className="mx-auto w-full max-w-md" hover={false}>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">{t("welcomeBack")}</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{t("signIn")}</h1>
      <p className="mt-2 text-sm text-foreground-muted">{t("loginSubtitle")}</p>

      <div className="mt-6">
        <OAuthButtons next={next} />
      </div>

      {registered && (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-light">
          {t("registeredMessage")}
        </p>
      )}
      {authError && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {t("authCallbackFailed")}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <FormField label={t("email")}>
          <TextInput name="email" type="email" autoComplete="email" required placeholder={t("emailPlaceholder")} />
        </FormField>
        <FormField label={t("password")}>
          <PasswordInput name="password" autoComplete="current-password" required placeholder="••••••••" />
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs text-foreground-muted transition-colors hover:text-gold">
              Forgot password?
            </Link>
          </div>
        </FormField>
        <Button type="submit" variant="luxury" className="w-full" disabled={pending}>
          {pending ? t("signingIn") : t("signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        {t("newToFaden")}{" "}
        <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-gold hover:text-gold-light">
          {t("createAccount")}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-foreground-muted">
        {t("boutiqueOwner")}{" "}
        <Link href={`/signup?next=${encodeURIComponent("/register-boutique")}&role=boutique_owner`} className="text-gold hover:text-gold-light">
          {t("registerBoutique")}
        </Link>
      </p>
    </PremiumCard>
  );
}
